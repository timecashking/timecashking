import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// CORS for Netlify site
const allowedOrigin = process.env.NETLIFY_SITE_URL || 'https://timecashking.netlify.app';
app.use(cors({ origin: allowedOrigin, credentials: false }));

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

function authMiddleware(req, res, next) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
	const token = auth.substring(7);
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

		// Optional redirect back to frontend with token
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

app.listen(port, () => {
	console.log('server listening on port ' + port);
});
