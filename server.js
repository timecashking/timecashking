import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import Stripe from 'stripe';
const { PrismaClient } = pkg;

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// CORS for Netlify site (handle preflight explicitly) + allow local dev
const allowedOrigin = process.env.NETLIFY_SITE_URL || 'https://timecashking.netlify.app';
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
	.split(',')
	.map(s => s.trim())
	.filter(Boolean);
const extraOrigins = [
	'http://localhost:3000',
	'http://localhost:5173',
	'http://127.0.0.1:5500',
	...envOrigins,
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

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
});

// Subscription plans
const SUBSCRIPTION_PLANS = {
	BASIC: {
		id: 'price_basic',
		name: 'Plano Básico',
		price: 19.90,
		features: ['Até 100 transações/mês', 'Relatórios básicos', 'Suporte por email']
	},
	PRO: {
		id: 'price_pro', 
		name: 'Plano Pro',
		price: 39.90,
		features: ['Transações ilimitadas', 'Relatórios avançados', 'Exportação PDF', 'Suporte prioritário']
	},
	ENTERPRISE: {
		id: 'price_enterprise',
		name: 'Plano Enterprise', 
		price: 99.90,
		features: ['Tudo do Pro', 'Múltiplos usuários', 'API personalizada', 'Suporte dedicado']
	}
};

// PDF generation helpers
const pdfTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-between; margin: 20px 0; }
        .card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
        .card.income { background: #d4edda; color: #155724; }
        .card.expense { background: #f8d7da; color: #721c24; }
        .card.balance { background: #d1ecf1; color: #0c5460; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{title}}</h1>
        <p>Período: {{period.start}} a {{period.end}}</p>
        <p>Gerado em: {{generatedAt}}</p>
    </div>
    
    <div class="summary">
        <div class="card income">
            <h3>Receitas</h3>
            <h2>R$ {{totals.income}}</h2>
        </div>
        <div class="card expense">
            <h3>Despesas</h3>
            <h2>R$ {{totals.expense}}</h2>
        </div>
        <div class="card balance">
            <h3>Saldo</h3>
            <h2>R$ {{totals.balance}}</h2>
        </div>
    </div>
    
    <h3>Transações</h3>
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            {{#each transactions}}
            <tr>
                <td>{{date}}</td>
                <td>{{type}}</td>
                <td>{{category}}</td>
                <td>{{description}}</td>
                <td>R$ {{amount}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>
    
    <h3>Resumo por Categoria</h3>
    <table>
        <thead>
            <tr>
                <th>Categoria</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            {{#each byCategory}}
            <tr>
                <td>{{category}}</td>
                <td>R$ {{amount}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>
    
    <div class="footer">
        <p>TimeCash King - Relatório Financeiro</p>
    </div>
</body>
</html>
`;

async function generatePDF(data) {
	const browser = await puppeteer.launch({ 
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	const page = await browser.newPage();
	
	const template = Handlebars.compile(pdfTemplate);
	const html = template(data);
	
	await page.setContent(html);
	const pdf = await page.pdf({ 
		format: 'A4',
		printBackground: true,
		margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
	});
	
	await browser.close();
	return pdf;
}

// Request log middleware (structured JSON)
app.use((req, res, next) => {
	const start = Date.now();
	res.on('finish', () => {
		if (req.method === 'OPTIONS') return;
		const log = {
			level: 'info',
			ts: new Date().toISOString(),
			method: req.method,
			path: req.originalUrl || req.url,
			status: res.statusCode,
			durationMs: Date.now() - start,
		};
		console.log(JSON.stringify(log));
	});
	return next();
});

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

// Helpers: validation & ownership
function badRequest(res, messages) {
	const details = Array.isArray(messages) ? messages : [String(messages)];
	return res.status(400).json({ error: 'ValidationError', details });
}

async function ensureCategoryOwned(categoryId, userId) {
	if (!categoryId) return null;
	const cat = await prisma.category.findUnique({ where: { id: String(categoryId) } });
	if (!cat || cat.userId !== userId) {
		const err = new Error('CATEGORY_NOT_FOUND_OR_NOT_OWNED');
		err.code = 'CATEGORY_NOT_OWNED';
		throw err;
	}
	return cat;
}

function normalizeAmount(input) {
	if (input === undefined || input === null) return undefined;
	let s = String(input).trim().replace(/\s+/g, '');
	// Convert decimal comma to dot
	s = s.replace(/,/g, '.');
	// Remove thousands separators if multiple dots exist
	const parts = s.split('.');
	if (parts.length > 2) {
		const dec = parts.pop();
		s = parts.join('') + '.' + dec;
	}
	const n = Number(s);
	return isNaN(n) ? NaN : n;
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

// Role-based authorization middleware
function requireRole(allowedRoles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
		const userRole = req.user.role || 'USER';
		if (!allowedRoles.includes(userRole)) {
			return res.status(403).json({ error: 'Insufficient permissions' });
		}
		next();
	};
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

		const appToken = signJwt({ 
			userId: user.id, 
			email: user.email, 
			name: user.name,
			role: user.role 
		});

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
			user: { 
				id: user.id, 
				email: user.email, 
				name: user.name, 
				avatarUrl: user.avatarUrl,
				role: user.role 
			},
			jwt: appToken,
		});
	} catch (err) {
		return res.status(500).json({ error: 'OAuth callback failed', detail: String(err) });
	}
});

app.get('/me', authMiddleware, async (req, res) => {
	const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
	if (!user) return res.status(404).json({ error: 'Not found' });
	return res.json({ 
		id: user.id, 
		email: user.email, 
		name: user.name, 
		avatarUrl: user.avatarUrl,
		role: user.role 
	});
});

// Admin-only endpoints for user management
app.get('/admin/users', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				role: true,
				createdAt: true,
				_count: {
					select: {
						categories: true,
						transactions: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return res.json(users);
	} catch (e) {
		return res.status(500).json({ error: 'Failed to fetch users', detail: String(e) });
	}
});

app.patch('/admin/users/:id/role', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
	try {
		const userId = String(req.params.id);
		const role = String(req.body.role || req.query.role).toUpperCase();
		
		if (!['USER', 'ADMIN', 'MANAGER'].includes(role)) {
			return badRequest(res, 'role must be USER, ADMIN, or MANAGER');
		}
		
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return res.status(404).json({ error: 'User not found' });
		
		const updated = await prisma.user.update({
			where: { id: userId },
			data: { role },
		});
		
		return res.json({
			id: updated.id,
			email: updated.email,
			name: updated.name,
			role: updated.role,
		});
	} catch (e) {
		return res.status(500).json({ error: 'Failed to update user role', detail: String(e) });
	}
});

// Manager endpoints for viewing other users' data
app.get('/manager/users/:id/summary', authMiddleware, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
	try {
		const targetUserId = String(req.params.id);
		const start = req.query.start ? new Date(String(req.query.start)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const end = req.query.end ? new Date(String(req.query.end)) : new Date();
		
		// Verify target user exists
		const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
		if (!targetUser) return res.status(404).json({ error: 'User not found' });
		
		const where = { userId: targetUserId, date: { gte: start, lte: end } };
		
		const [income, expense, byCategory] = await Promise.all([
			prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...where, type: 'INCOME' } }),
			prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...where, type: 'EXPENSE' } }),
			prisma.transaction.groupBy({ by: ['categoryId'], _sum: { amount: true }, where, orderBy: { _sum: { amount: 'desc' } } }),
		]);
		
		const catIds = byCategory.map(b => b.categoryId).filter(Boolean);
		const cats = await prisma.category.findMany({ where: { id: { in: catIds } } });
		const idToName = Object.fromEntries(cats.map(c => [c.id, c.name]));
		
		return res.json({
			user: { id: targetUser.id, email: targetUser.email, name: targetUser.name },
			period: { start, end },
			totals: {
				income: Number(income._sum.amount || 0),
				expense: Number(expense._sum.amount || 0),
				balance: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
			},
			byCategory: byCategory.map(b => ({ 
				categoryId: b.categoryId, 
				category: idToName[b.categoryId] || '(Sem categoria)', 
				amount: Number(b._sum.amount || 0) 
			})),
		});
	} catch (e) {
		return res.status(500).json({ error: 'Manager summary failed', detail: String(e) });
	}
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
		const errors = [];
		if (!name) errors.push('name is required');
		if (name && name.length < 2) errors.push('name must be at least 2 chars');
		if (name && name.length > 60) errors.push('name must be <= 60 chars');
		if (errors.length) return badRequest(res, errors);
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
        const errors = [];
        if (!name) errors.push('name is required');
        if (name && name.length < 2) errors.push('name must be at least 2 chars');
        if (name && name.length > 60) errors.push('name must be <= 60 chars');
        if (errors.length) return badRequest(res, errors);
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
		const errors = [];
		const type = ((req.body && req.body.type) || req.query.type || '').toString().toUpperCase();
		if (!['INCOME', 'EXPENSE'].includes(type)) errors.push('type must be INCOME or EXPENSE');
		const amountRaw = (req.body && req.body.amount) ?? req.query.amount;
		const amount = normalizeAmount(amountRaw);
		if (amountRaw === undefined || isNaN(amount) || amount <= 0) errors.push('amount must be a positive number');
		const categoryId = (req.body && req.body.categoryId) ? String(req.body.categoryId) : (req.query.categoryId ? String(req.query.categoryId) : undefined);
		const description = (req.body && req.body.description) ? String(req.body.description) : (req.query.description ? String(req.query.description) : undefined);
		if (description && description.length > 200) errors.push('description must be <= 200 chars');
		if (errors.length) return badRequest(res, errors);
		await ensureCategoryOwned(categoryId, req.user.userId);
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

        const errors = [];
        const typeRaw = (req.body && req.body.type) || req.query.type;
        const type = typeRaw ? String(typeRaw).toUpperCase() : undefined;
        if (type && !['INCOME', 'EXPENSE'].includes(type)) errors.push('type must be INCOME or EXPENSE');

        const amountRaw = (req.body && req.body.amount) ?? req.query.amount;
        const amount = amountRaw !== undefined ? normalizeAmount(amountRaw) : undefined;
        if (amountRaw !== undefined && (isNaN(amount) || amount <= 0)) errors.push('amount must be a positive number');

        const categoryIdRaw = (req.body && req.body.categoryId) ?? req.query.categoryId;
        const categoryId = categoryIdRaw !== undefined && categoryIdRaw !== '' ? String(categoryIdRaw) : null;

        const descriptionRaw = (req.body && req.body.description) ?? req.query.description;
        const description = descriptionRaw !== undefined ? String(descriptionRaw) : undefined;
        if (description !== undefined && description.length > 200) errors.push('description must be <= 200 chars');
        if (errors.length) return badRequest(res, errors);
        await ensureCategoryOwned(categoryId, req.user.userId);

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

// PDF Report generation
app.get('/reports/pdf', authMiddleware, async (req, res) => {
    try {
        const start = req.query.start ? new Date(String(req.query.start)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = req.query.end ? new Date(String(req.query.end)) : new Date();
        const where = { userId: req.user.userId, date: { gte: start, lte: end } };

        const [income, expense, byCategory, transactions] = await Promise.all([
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...where, type: 'INCOME' } }),
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...where, type: 'EXPENSE' } }),
            prisma.transaction.groupBy({ by: ['categoryId'], _sum: { amount: true }, where, orderBy: { _sum: { amount: 'desc' } } }),
            prisma.transaction.findMany({ 
                where, 
                include: { category: true },
                orderBy: { date: 'desc' }
            }),
        ]);

        const catIds = byCategory.map(b => b.categoryId).filter(Boolean);
        const cats = await prisma.category.findMany({ where: { id: { in: catIds } } });
        const idToName = Object.fromEntries(cats.map(c => [c.id, c.name]));

        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        
        const pdfData = {
            title: `Relatório Financeiro - ${user.name}`,
            period: {
                start: start.toLocaleDateString('pt-BR'),
                end: end.toLocaleDateString('pt-BR')
            },
            generatedAt: new Date().toLocaleString('pt-BR'),
            totals: {
                income: Number(income._sum.amount || 0).toFixed(2),
                expense: Number(expense._sum.amount || 0).toFixed(2),
                balance: (Number(income._sum.amount || 0) - Number(expense._sum.amount || 0)).toFixed(2)
            },
            transactions: transactions.map(t => ({
                date: t.date.toLocaleDateString('pt-BR'),
                type: t.type === 'INCOME' ? 'Receita' : 'Despesa',
                category: t.category ? t.category.name : '(Sem categoria)',
                description: t.description || '',
                amount: Number(t.amount).toFixed(2)
            })),
            byCategory: byCategory.map(b => ({
                category: idToName[b.categoryId] || '(Sem categoria)',
                amount: Number(b._sum.amount || 0).toFixed(2)
            }))
        };

        const pdf = await generatePDF(pdfData);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio-financeiro.pdf"');
        return res.send(pdf);
    } catch (e) {
        return res.status(500).json({ error: 'PDF generation failed', detail: String(e) });
    }
});

// Advanced reports with charts data
app.get('/reports/advanced', authMiddleware, async (req, res) => {
    try {
        const start = req.query.start ? new Date(String(req.query.start)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = req.query.end ? new Date(String(req.query.end)) : new Date();
        const groupBy = req.query.groupBy || 'month'; // month, week, day, category
        
        const where = { userId: req.user.userId, date: { gte: start, lte: end } };
        
        let chartData;
        
        if (groupBy === 'category') {
            const byCategory = await prisma.transaction.groupBy({
                by: ['categoryId', 'type'],
                _sum: { amount: true },
                where,
                orderBy: { _sum: { amount: 'desc' } }
            });
            
            const catIds = byCategory.map(b => b.categoryId).filter(Boolean);
            const cats = await prisma.category.findMany({ where: { id: { in: catIds } } });
            const idToName = Object.fromEntries(cats.map(c => [c.id, c.name]));
            
            chartData = byCategory.map(b => ({
                label: idToName[b.categoryId] || '(Sem categoria)',
                type: b.type,
                value: Number(b._sum.amount || 0)
            }));
        } else {
            // Group by time period
            const byPeriod = await prisma.transaction.groupBy({
                by: ['type'],
                _sum: { amount: true },
                where,
                orderBy: { _sum: { amount: 'desc' } }
            });
            
            chartData = byPeriod.map(b => ({
                label: b.type === 'INCOME' ? 'Receitas' : 'Despesas',
                type: b.type,
                value: Number(b._sum.amount || 0)
            }));
        }
        
        // Monthly trend data
        const monthlyTrend = await prisma.transaction.groupBy({
            by: ['type'],
            _sum: { amount: true },
            where,
            orderBy: { _sum: { amount: 'desc' } }
        });
        
        const trendData = monthlyTrend.map(b => ({
            label: b.type === 'INCOME' ? 'Receitas' : 'Despesas',
            value: Number(b._sum.amount || 0)
        }));
        
        return res.json({
            period: { start, end },
            groupBy,
            chartData,
            trendData,
            summary: {
                totalIncome: Number(monthlyTrend.find(b => b.type === 'INCOME')?._sum.amount || 0),
                totalExpense: Number(monthlyTrend.find(b => b.type === 'EXPENSE')?._sum.amount || 0)
            }
        });
    } catch (e) {
        return res.status(500).json({ error: 'Advanced report failed', detail: String(e) });
    }
});

// Subscription and Payment endpoints
app.get('/subscription/plans', authMiddleware, async (req, res) => {
    try {
        return res.json(Object.values(SUBSCRIPTION_PLANS));
    } catch (e) {
        return res.status(500).json({ error: 'Failed to fetch plans', detail: String(e) });
    }
});

app.get('/subscription/current', authMiddleware, async (req, res) => {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user.userId },
            include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } }
        });
        
        if (!subscription) {
            return res.json({ 
                status: 'TRIAL',
                plan: null,
                trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
            });
        }
        
        return res.json({
            status: subscription.status,
            plan: {
                id: subscription.planId,
                name: subscription.planName,
                price: subscription.planPrice
            },
            currentPeriod: {
                start: subscription.currentPeriodStart,
                end: subscription.currentPeriodEnd
            },
            trialEnd: subscription.trialEnd,
            canceledAt: subscription.canceledAt,
            recentPayments: subscription.payments
        });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to fetch subscription', detail: String(e) });
    }
});

app.post('/subscription/create-checkout', authMiddleware, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
        
        if (!plan) {
            return badRequest(res, 'Invalid plan ID');
        }
        
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        
        // Create or get Stripe customer
        let customer;
        const existingSubscription = await prisma.subscription.findUnique({
            where: { userId: req.user.userId }
        });
        
        if (existingSubscription?.stripeCustomerId) {
            customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
        } else {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: req.user.userId }
            });
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [{
                price: planId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL || process.env.NETLIFY_SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || process.env.NETLIFY_SITE_URL}/subscription/cancel`,
            metadata: {
                userId: req.user.userId,
                planId: planId
            }
        });
        
        return res.json({ sessionId: session.id, url: session.url });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to create checkout session', detail: String(e) });
    }
});

app.post('/subscription/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).json({ error: 'Webhook signature verification failed' });
    }
    
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subscription = event.data.object;
                const userId = subscription.metadata?.userId;
                
                if (userId) {
                    await prisma.subscription.upsert({
                        where: { userId },
                        update: {
                            stripeSubscriptionId: subscription.id,
                            stripeCustomerId: subscription.customer,
                            planId: subscription.items.data[0].price.id,
                            planName: SUBSCRIPTION_PLANS[subscription.items.data[0].price.id]?.name || 'Unknown',
                            planPrice: subscription.items.data[0].price.unit_amount / 100,
                            status: subscription.status.toUpperCase(),
                            currentPeriodStart: new Date(subscription.current_period_start * 1000),
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                        },
                        create: {
                            userId,
                            stripeSubscriptionId: subscription.id,
                            stripeCustomerId: subscription.customer,
                            planId: subscription.items.data[0].price.id,
                            planName: SUBSCRIPTION_PLANS[subscription.items.data[0].price.id]?.name || 'Unknown',
                            planPrice: subscription.items.data[0].price.unit_amount / 100,
                            status: subscription.status.toUpperCase(),
                            currentPeriodStart: new Date(subscription.current_period_start * 1000),
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                        }
                    });
                }
                break;
                
            case 'invoice.payment_succeeded':
                const invoice = event.data.object;
                const paymentUserId = invoice.metadata?.userId;
                
                if (paymentUserId) {
                    await prisma.payment.create({
                        data: {
                            userId: paymentUserId,
                            stripePaymentId: invoice.payment_intent,
                            stripeInvoiceId: invoice.id,
                            amount: invoice.amount_paid / 100,
                            currency: invoice.currency.toUpperCase(),
                            status: 'SUCCEEDED',
                            description: `Pagamento da assinatura - ${invoice.subscription ? 'Recorrente' : 'Único'}`,
                            paidAt: new Date(),
                        }
                    });
                }
                break;
                
            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object;
                const deletedUserId = deletedSubscription.metadata?.userId;
                
                if (deletedUserId) {
                    await prisma.subscription.update({
                        where: { userId: deletedUserId },
                        data: {
                            status: 'CANCELED',
                            canceledAt: new Date(),
                        }
                    });
                }
                break;
        }
        
        return res.json({ received: true });
    } catch (e) {
        console.error('Webhook error:', e);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
});

app.post('/subscription/cancel', authMiddleware, async (req, res) => {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user.userId }
        });
        
        if (!subscription?.stripeSubscriptionId) {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
        });
        
        await prisma.subscription.update({
            where: { userId: req.user.userId },
            data: { canceledAt: new Date() }
        });
        
        return res.json({ message: 'Subscription will be canceled at the end of the current period' });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to cancel subscription', detail: String(e) });
    }
});

app.get('/subscription/payments', authMiddleware, async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        
        return res.json(payments);
    } catch (e) {
        return res.status(500).json({ error: 'Failed to fetch payments', detail: String(e) });
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
	try {
		const log = {
			level: 'error',
			ts: new Date().toISOString(),
			message: 'Unhandled error',
			path: req.originalUrl || req.url,
			method: req.method,
			err: String(err && err.stack ? err.stack : err),
		};
		console.error(JSON.stringify(log));
	} catch (_) {}
	res.status(500).json({ error: 'Internal server error' });
});
