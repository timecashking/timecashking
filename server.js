import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// CORS for Netlify site (handle preflight explicitly) + allow local dev
const allowedOrigin = process.env.NETLIFY_SITE_URL || 'https://timecashking.netlify.app';
const extraOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5500',
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // non-browser / curl
        const isNetlify = /https?:\/\/([a-z0-9-]+)\.netlify\.app$/i.test(origin);
        if (origin === allowedOrigin || extraOrigins.includes(origin) || isNetlify) return callback(null, true);
        return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const prisma = new PrismaClient();

// Google OAuth basic setup
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://timecashking-api.onrender.com/integrations/google/callback';

const oauth2Client = new OAuth2Client({
	clientId: googleClientId,
	clientSecret: googleClientSecret,
	redirectUri: googleRedirectUri,
});

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

function signJwt(payload) {
	return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}

function getTokenFromRequest(req) {
	// 1) Authorization header
	const auth = req.headers.authorization || '';
	if (auth.startsWith('Bearer ')) return auth.substring(7);
	// 2) Cookie
	const cookieHeader = req.headers.cookie || '';
	const cookieMap = Object.fromEntries(
		cookieHeader.split(';').map(v => v.trim()).filter(Boolean).map(v => {
			const idx = v.indexOf('=');
			return idx >= 0 ? [v.slice(0, idx), decodeURIComponent(v.slice(idx + 1))] : [v, ''];
		})
	);
	return cookieMap['tck_jwt'];
}

function authMiddleware(req, res, next) {
	const token = getTokenFromRequest(req);
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const decoded = jwt.verify(token, jwtSecret);
		req.user = decoded;
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

app.get('/health', (req, res) => {
	res.status(200).send('ok');
});

app.get('/', (req, res) => {
	res.json({ status: 'up', service: 'timecashking-api' });
});

app.get('/integrations/google/auth', (req, res) => {
	if (!googleClientId || !googleClientSecret) {
		return res.status(500).json({ error: 'Google OAuth not configured' });
	}
	const scopes = [
		'openid',
		'email',
		'profile',
	];
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
		prompt: 'consent',
	});
	res.redirect(url);
});

app.get('/integrations/google/callback', async (req, res) => {
	try {
		const code = req.query.code;
		if (!code) return res.status(400).json({ error: 'Missing code' });
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// Get user info from id_token
		const idToken = tokens.id_token;
		if (!idToken) return res.status(500).json({ error: 'Missing id_token' });
		const ticket = await oauth2Client.verifyIdToken({ idToken, audience: googleClientId });
		const payload = ticket.getPayload();
		const googleId = payload.sub;
		const email = payload.email;
		const name = payload.name;
		const avatarUrl = payload.picture;

		// Upsert user
		const user = await prisma.user.upsert({
			where: { email },
			update: { googleId, name, avatarUrl },
			create: { googleId, email, name, avatarUrl },
		});

		const appToken = signJwt({ userId: user.id, email: user.email, name: user.name });

		// Set HttpOnly cookie (cross-site)
		res.cookie('tck_jwt', appToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		// Optional redirect back to frontend with token (for legacy flow)
		const frontendUrl = process.env.FRONTEND_URL || process.env.NETLIFY_SITE_URL;
		if (frontendUrl) {
			const redirectTo = new URL(frontendUrl.replace(/\/$/, '') + '/auth/callback');
			redirectTo.searchParams.set('token', appToken);
			return res.redirect(302, redirectTo.toString());
		}

		return res.json({
			ok: true,
			user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
			jwt: appToken,
		});
	} catch (err) {
		return res.status(500).json({ error: 'OAuth callback failed', detail: String(err) });
	}
});

app.get('/me', authMiddleware, async (req, res) => {
	const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
	if (!user) return res.status(404).json({ error: 'Not found' });
	return res.json({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
});

// Logout: clear cookie
app.post('/auth/logout', (req, res) => {
	res.cookie('tck_jwt', '', {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		path: '/',
		maxAge: 0,
	});
	return res.json({ ok: true });
});

// Categories
app.post('/categories', authMiddleware, async (req, res) => {
	try {
		const name = ((req.body && req.body.name) || req.query.name || '').toString().trim();
		if (!name) return res.status(400).json({ error: 'Name is required' });
		const cat = await prisma.category.create({ data: { name, userId: req.user.userId } });
		return res.json(cat);
	} catch (e) {
		return res.status(500).json({ error: 'Create category failed', detail: String(e) });
	}
});

app.get('/categories', authMiddleware, async (req, res) => {
	try {
		const paginate = String(req.query.paginate || '').toLowerCase() === 'true';
		if (!paginate) {
			const list = await prisma.category.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' } });
			return res.json(list);
		}
		const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
		const pageSize = Math.max(1, Math.min(100, parseInt(String(req.query.pageSize || '10'), 10) || 10));
		const where = { userId: req.user.userId };
		const [total, data] = await Promise.all([
			prisma.category.count({ where }),
			prisma.category.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
		]);
		return res.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
	} catch (e) {
		console.error('GET /categories failed', e);
		return res.status(500).json({ error: 'Categories failed', detail: String(e) });
	}
});

app.patch('/categories/:id', authMiddleware, async (req, res) => {
    try {
        const id = String(req.params.id);
        const name = ((req.body && req.body.name) || req.query.name || '').toString().trim();
        if (!name) return res.status(400).json({ error: 'Name is required' });
        // ensure ownership
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
        const updated = await prisma.category.update({ where: { id }, data: { name } });
        return res.json(updated);
    } catch (e) {
        return res.status(500).json({ error: 'Update category failed', detail: String(e) });
    }
});

app.delete('/categories/:id', authMiddleware, async (req, res) => {
    try {
        const id = String(req.params.id);
        // ensure ownership
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
        await prisma.category.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: 'Delete category failed', detail: String(e) });
    }
});

// Transactions
app.post('/transactions', authMiddleware, async (req, res) => {
	try {
		const type = ((req.body && req.body.type) || req.query.type || '').toString().toUpperCase();
		const amount = Number((req.body && req.body.amount) ?? req.query.amount ?? '0');
		const categoryId = (req.body && req.body.categoryId) ? String(req.body.categoryId) : (req.query.categoryId ? String(req.query.categoryId) : undefined);
		const description = (req.body && req.body.description) ? String(req.body.description) : (req.query.description ? String(req.query.description) : undefined);
		if (!['INCOME', 'EXPENSE'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
		if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Invalid amount' });
		const tx = await prisma.transaction.create({
			data: { type, amount, userId: req.user.userId, categoryId, description },
		});
		return res.json(tx);
	} catch (e) {
		return res.status(500).json({ error: 'Create transaction failed', detail: String(e) });
	}
});

app.get('/transactions', authMiddleware, async (req, res) => {
	try {
		const paginate = String(req.query.paginate || '').toLowerCase() === 'true';
		const where = { userId: req.user.userId };
		// optional filters
		if (req.query.start || req.query.end) {
			where.date = {};
			if (req.query.start) where.date.gte = new Date(String(req.query.start));
			if (req.query.end) where.date.lte = new Date(String(req.query.end));
		}
		if (req.query.type) {
			const t = String(req.query.type).toUpperCase();
			if (t === 'INCOME' || t === 'EXPENSE') where.type = t;
		}
		if (req.query.categoryId) {
			where.categoryId = String(req.query.categoryId);
		}
		const baseQuery = {
			where,
			orderBy: { date: 'desc' },
			include: { category: true },
		};
		if (!paginate) {
			const list = await prisma.transaction.findMany(baseQuery);
			return res.json(list);
		}
		const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
		const pageSize = Math.max(1, Math.min(100, parseInt(String(req.query.pageSize || '10'), 10) || 10));
		const [total, data] = await Promise.all([
			prisma.transaction.count({ where: baseQuery.where }),
			prisma.transaction.findMany({ ...baseQuery, skip: (page - 1) * pageSize, take: pageSize }),
		]);
		return res.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
	} catch (e) {
		console.error('GET /transactions failed', e);
		return res.status(500).json({ error: 'Transactions failed', detail: String(e) });
	}
});

app.patch('/transactions/:id', authMiddleware, async (req, res) => {
    try {
        const id = String(req.params.id);
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });

        const typeRaw = (req.body && req.body.type) || req.query.type;
        const type = typeRaw ? String(typeRaw).toUpperCase() : undefined;
        if (type && !['INCOME', 'EXPENSE'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

        const amountRaw = (req.body && req.body.amount) ?? req.query.amount;
        const amount = amountRaw !== undefined ? Number(amountRaw) : undefined;
        if (amountRaw !== undefined && (isNaN(amount) || !amount)) return res.status(400).json({ error: 'Invalid amount' });

        const categoryIdRaw = (req.body && req.body.categoryId) ?? req.query.categoryId;
        const categoryId = categoryIdRaw !== undefined && categoryIdRaw !== '' ? String(categoryIdRaw) : null;

        const descriptionRaw = (req.body && req.body.description) ?? req.query.description;
        const description = descriptionRaw !== undefined ? String(descriptionRaw) : undefined;

        const data = {};
        if (type) data.type = type;
        if (amount !== undefined) data.amount = amount;
        if (categoryId !== undefined) data.categoryId = categoryId; // can be null to clear
        if (description !== undefined) data.description = description;

        const updated = await prisma.transaction.update({ where: { id }, data });
        return res.json(updated);
    } catch (e) {
        return res.status(500).json({ error: 'Update transaction failed', detail: String(e) });
    }
});

app.delete('/transactions/:id', authMiddleware, async (req, res) => {
    try {
        const id = String(req.params.id);
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
        await prisma.transaction.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: 'Delete transaction failed', detail: String(e) });
    }
});

// Export transactions as CSV for a date range
app.get('/transactions/csv', authMiddleware, async (req, res) => {
    try {
        const start = req.query.start ? new Date(String(req.query.start)) : new Date(0);
        const end = req.query.end ? new Date(String(req.query.end)) : new Date();
        const list = await prisma.transaction.findMany({
            where: { userId: req.user.userId, date: { gte: start, lte: end } },
            orderBy: { date: 'desc' },
            include: { category: true },
        });
        const rows = [
            ['date', 'type', 'amount', 'category', 'description'],
            ...list.map(t => [
                t.date.toISOString(),
                t.type,
                String(t.amount),
                t.category ? t.category.name : '',
                t.description || '',
            ]),
        ];
        const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        return res.send(csv);
    } catch (e) {
        console.error('GET /transactions/csv failed', e);
        return res.status(500).json({ error: 'Transactions CSV failed', detail: String(e) });
    }
});

// Summary: totals by type and by category within a date range
app.get('/summary', authMiddleware, async (req, res) => {
    const start = req.query.start ? new Date(String(req.query.start)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();
    try {
        const where = { userId: req.user.userId, date: { gte: start, lte: end } };

        const [income, expense, byCategory] = await Promise.all([
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...where, type: 'INCOME' } }),
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...where, type: 'EXPENSE' } }),
            prisma.transaction.groupBy({ by: ['categoryId'], _sum: { amount: true }, where, orderBy: { _sum: { amount: 'desc' } } }),
        ]);

        const catIds = byCategory.map(b => b.categoryId).filter(Boolean);
        const cats = await prisma.category.findMany({ where: { id: { in: catIds } } });
        const idToName = Object.fromEntries(cats.map(c => [c.id, c.name]));

        return res.json({
            period: { start, end },
            totals: {
                income: Number(income._sum.amount || 0),
                expense: Number(expense._sum.amount || 0),
                balance: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
            },
            byCategory: byCategory.map(b => ({ categoryId: b.categoryId, category: idToName[b.categoryId] || '(Sem categoria)', amount: Number(b._sum.amount || 0) })),
        });
    } catch (e) {
        return res.status(500).json({ error: 'Summary failed', detail: String(e) });
    }
});

app.listen(port, () => {
	console.log('server listening on port ' + port);
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// 500 handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error('Unhandled error', err);
	res.status(500).json({ error: 'Internal server error' });
});
