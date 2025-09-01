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
import nodemailer from 'nodemailer';
import webPush from 'web-push';
import cron from 'node-cron';
import axios from 'axios';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { body, query, validationResult } from 'express-validator';
import compression from 'compression';
import morgan from 'morgan';
const { PrismaClient } = pkg;

const app = express();
const port = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'TimeCash King API',
			version: '1.0.0',
			description: 'API completa para o sistema de gestão financeira TimeCash King',
			contact: {
				name: 'TimeCash King Support',
				email: 'support@timecashking.com',
			},
		},
		servers: [
			{
				url: 'https://timecashking-api.onrender.com',
				description: 'Production server',
			},
			{
				url: 'http://localhost:3000',
				description: 'Development server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ['./server.js'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

// External API services
class ExternalAPIService {
	static async getCurrencyRates() {
		try {
			const response = await axios.get('https://api.exchangerate-api.com/v4/latest/BRL');
			return response.data;
		} catch (error) {
			console.error('Currency API error:', error);
			return null;
		}
	}
	
	static async getCryptoRates() {
		try {
			const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=brl,usd');
			return response.data;
		} catch (error) {
			console.error('Crypto API error:', error);
			return null;
		}
	}
	
	static async getStockPrice(symbol) {
		try {
			const response = await axios.get(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`);
			return response.data;
		} catch (error) {
			console.error('Stock API error:', error);
			return null;
		}
	}
	
	static async getWeatherData(city) {
		try {
			const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
			return response.data;
		} catch (error) {
			console.error('Weather API error:', error);
			return null;
		}
	}
}

app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Enhanced middleware
app.use(compression());
app.use(morgan('combined'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Enhanced rate limiting
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: 'Too many authentication attempts, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/auth/', authLimiter);

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

// Email configuration
const emailTransporter = nodemailer.createTransporter({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// Push notification configuration
webPush.setVapidDetails(
	`mailto:${process.env.EMAIL_USER}`,
	process.env.VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY
);

// Notification service
class NotificationService {
	static async sendEmail(to, subject, html) {
		try {
			const mailOptions = {
				from: process.env.EMAIL_USER,
				to,
				subject,
				html,
			};
			
			const result = await emailTransporter.sendMail(mailOptions);
			console.log('Email sent:', result.messageId);
			return result;
		} catch (error) {
			console.error('Email send error:', error);
			throw error;
		}
	}
	
	static async sendPushNotification(subscription, payload) {
		try {
			const result = await webPush.sendNotification(subscription, JSON.stringify(payload));
			console.log('Push notification sent:', result);
			return result;
		} catch (error) {
			console.error('Push notification error:', error);
			throw error;
		}
	}
	
	static async createNotification(userId, type, category, title, message, metadata = null) {
		try {
			const notification = await prisma.notification.create({
				data: {
					userId,
					type,
					category,
					title,
					message,
					metadata,
				},
			});
			
			// Get user preferences
			const preferences = await prisma.notificationPreference.findUnique({
				where: { userId },
			});
			
			if (!preferences) {
				// Create default preferences
				await prisma.notificationPreference.create({
					data: { userId },
				});
			}
			
			// Send notification based on type and preferences
			if (type === 'EMAIL' || type === 'BOTH') {
				if (preferences?.emailEnabled !== false) {
					await this.sendEmailNotification(userId, title, message);
				}
			}
			
			if (type === 'PUSH' || type === 'BOTH') {
				if (preferences?.pushEnabled !== false) {
					await this.sendPushNotificationToUser(userId, title, message);
				}
			}
			
			// Update notification status
			await prisma.notification.update({
				where: { id: notification.id },
				data: { status: 'SENT', sentAt: new Date() },
			});
			
			return notification;
		} catch (error) {
			console.error('Create notification error:', error);
			throw error;
		}
	}
	
	static async sendEmailNotification(userId, title, message) {
		try {
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user?.email) return;
			
			const html = `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<title>${title}</title>
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { background: #10b981; color: white; padding: 20px; text-align: center; }
						.content { padding: 20px; background: #f8fafc; }
						.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>TimeCash King</h1>
						</div>
						<div class="content">
							<h2>${title}</h2>
							<p>${message}</p>
						</div>
						<div class="footer">
							<p>© 2024 TimeCash King. Todos os direitos reservados.</p>
						</div>
					</div>
				</body>
				</html>
			`;
			
			await this.sendEmail(user.email, title, html);
		} catch (error) {
			console.error('Send email notification error:', error);
		}
	}
	
	static async sendPushNotificationToUser(userId, title, message) {
		try {
			// In a real implementation, you would store push subscriptions
			// For now, we'll just log the attempt
			console.log(`Push notification for user ${userId}: ${title} - ${message}`);
		} catch (error) {
			console.error('Send push notification error:', error);
		}
	}
}

// Scheduled notifications
cron.schedule('0 9 * * 1', async () => {
	// Weekly reminder every Monday at 9 AM
	try {
		const users = await prisma.user.findMany({
			include: { notificationPreferences: true },
		});
		
		for (const user of users) {
			if (user.notificationPreferences?.reminderEnabled !== false) {
				await NotificationService.createNotification(
					user.id,
					'EMAIL',
					'REMINDER',
					'Lembrete Semanal - TimeCash King',
					'Lembre-se de registrar suas transações da semana! Mantenha seu controle financeiro em dia.',
					{ frequency: 'weekly' }
				);
			}
		}
	} catch (error) {
		console.error('Weekly reminder error:', error);
	}
});

cron.schedule('0 10 1 * *', async () => {
	// Monthly report on the 1st of each month at 10 AM
	try {
		const users = await prisma.user.findMany({
			include: { notificationPreferences: true },
		});
		
		for (const user of users) {
			if (user.notificationPreferences?.reportEnabled !== false) {
				// Get monthly summary
				const startDate = new Date();
				startDate.setMonth(startDate.getMonth() - 1);
				startDate.setDate(1);
				
				const endDate = new Date();
				endDate.setDate(0); // Last day of previous month
				
				const transactions = await prisma.transaction.findMany({
					where: {
						userId: user.id,
						date: { gte: startDate, lte: endDate },
					},
				});
				
				const totalIncome = transactions
					.filter(t => t.type === 'INCOME')
					.reduce((sum, t) => sum + Number(t.amount), 0);
					
				const totalExpense = transactions
					.filter(t => t.type === 'EXPENSE')
					.reduce((sum, t) => sum + Number(t.amount), 0);
				
				await NotificationService.createNotification(
					user.id,
					'EMAIL',
					'REPORT',
					'Relatório Mensal - TimeCash King',
					`Seu relatório mensal está pronto!\n\nReceitas: R$ ${totalIncome.toFixed(2)}\nDespesas: R$ ${totalExpense.toFixed(2)}\nSaldo: R$ ${(totalIncome - totalExpense).toFixed(2)}`,
					{ 
						period: 'monthly',
						totalIncome,
						totalExpense,
						balance: totalIncome - totalExpense
					}
				);
			}
		}
	} catch (error) {
		console.error('Monthly report error:', error);
	}
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



/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 1234567
 */
app.get('/api/health', (req, res) => {
	res.json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		version: '1.0.0',
		environment: process.env.NODE_ENV || 'development',
	});
});

/**
 * @swagger
 * /api/currency/rates:
 *   get:
 *     summary: Get currency exchange rates
 *     description: Returns current exchange rates for BRL
 *     tags: [External APIs]
 *     responses:
 *       200:
 *         description: Currency rates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 base:
 *                   type: string
 *                   example: "BRL"
 *                 rates:
 *                   type: object
 *                   example: {"USD": 0.21, "EUR": 0.19}
 *       500:
 *         description: External API error
 */
app.get('/api/currency/rates', async (req, res) => {
	try {
		const rates = await ExternalAPIService.getCurrencyRates();
		if (rates) {
			res.json(rates);
		} else {
			res.status(500).json({ error: 'Failed to fetch currency rates' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Currency API error', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/crypto/rates:
 *   get:
 *     summary: Get cryptocurrency rates
 *     description: Returns current rates for Bitcoin and Ethereum
 *     tags: [External APIs]
 *     responses:
 *       200:
 *         description: Crypto rates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bitcoin:
 *                   type: object
 *                   properties:
 *                     brl:
 *                       type: number
 *                       example: 250000
 *                     usd:
 *                       type: number
 *                       example: 50000
 *       500:
 *         description: External API error
 */
app.get('/api/crypto/rates', async (req, res) => {
	try {
		const rates = await ExternalAPIService.getCryptoRates();
		if (rates) {
			res.json(rates);
		} else {
			res.status(500).json({ error: 'Failed to fetch crypto rates' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Crypto API error', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/stock/{symbol}:
 *   get:
 *     summary: Get stock price
 *     description: Returns current stock price for a given symbol
 *     tags: [External APIs]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., AAPL, GOOGL)
 *     responses:
 *       200:
 *         description: Stock price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 price:
 *                   type: string
 *                   example: "150.25"
 *       500:
 *         description: External API error
 */
app.get('/api/stock/:symbol', async (req, res) => {
	try {
		const { symbol } = req.params;
		const price = await ExternalAPIService.getStockPrice(symbol);
		if (price) {
			res.json(price);
		} else {
			res.status(500).json({ error: 'Failed to fetch stock price' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Stock API error', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/weather/{city}:
 *   get:
 *     summary: Get weather data
 *     description: Returns current weather data for a given city
 *     tags: [External APIs]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City name (e.g., São Paulo, Rio de Janeiro)
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "São Paulo"
 *                 main:
 *                   type: object
 *                   properties:
 *                     temp:
 *                       type: number
 *                       example: 25.5
 *                     humidity:
 *                       type: number
 *                       example: 65
 *       500:
 *         description: External API error
 */
app.get('/api/weather/:city', async (req, res) => {
	try {
		const { city } = req.params;
		const weather = await ExternalAPIService.getWeatherData(city);
		if (weather) {
			res.json(weather);
		} else {
			res.status(500).json({ error: 'Failed to fetch weather data' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Weather API error', detail: String(error) });
	}
});

// Webhook endpoints for external integrations
/**
 * @swagger
 * /api/webhooks/bank-integration:
 *   post:
 *     summary: Bank integration webhook
 *     description: Receives webhooks from bank integration services
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "transaction.created"
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook data
 */
app.post('/api/webhooks/bank-integration', express.raw({ type: 'application/json' }), async (req, res) => {
	try {
		const signature = req.headers['x-webhook-signature'];
		
		// Verify webhook signature (implement based on your bank's requirements)
		if (!signature) {
			return res.status(400).json({ error: 'Missing webhook signature' });
		}
		
		const payload = JSON.parse(req.body);
		console.log('Bank webhook received:', payload);
		
		// Process the webhook based on event type
		switch (payload.event) {
			case 'transaction.created':
				// Handle new transaction
				break;
			case 'account.updated':
				// Handle account update
				break;
			default:
				console.log('Unknown webhook event:', payload.event);
		}
		
		res.json({ received: true });
	} catch (error) {
		console.error('Webhook processing error:', error);
		res.status(500).json({ error: 'Webhook processing failed' });
	}
});

/**
 * @swagger
 * /api/webhooks/accounting:
 *   post:
 *     summary: Accounting software webhook
 *     description: Receives webhooks from accounting software integrations
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "invoice.paid"
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook data
 */
app.post('/api/webhooks/accounting', express.raw({ type: 'application/json' }), async (req, res) => {
	try {
		const payload = JSON.parse(req.body);
		console.log('Accounting webhook received:', payload);
		
		// Process accounting webhook
		switch (payload.event) {
			case 'invoice.paid':
				// Handle invoice payment
				break;
			case 'expense.created':
				// Handle new expense
				break;
			default:
				console.log('Unknown accounting event:', payload.event);
		}
		
		res.json({ received: true });
	} catch (error) {
		console.error('Accounting webhook error:', error);
		res.status(500).json({ error: 'Webhook processing failed' });
	}
});

/**
 * @swagger
 * /api/currency/rates:
 *   get:
 *     summary: Get currency exchange rates
 *     description: Returns current exchange rates for BRL
 *     tags: [External APIs]
 *     responses:
 *       200:
 *         description: Currency rates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 base:
 *                   type: string
 *                   example: "BRL"
 *                 rates:
 *                   type: object
 *                   example: {"USD": 0.21, "EUR": 0.19}
 *       500:
 *         description: External API error
 */
app.get('/api/currency/rates', async (req, res) => {
	try {
		const rates = await ExternalAPIService.getCurrencyRates();
		if (rates) {
			res.json(rates);
		} else {
			res.status(500).json({ error: 'Failed to fetch currency rates' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Currency API error', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/crypto/rates:
 *   get:
 *     summary: Get cryptocurrency rates
 *     description: Returns current rates for Bitcoin and Ethereum
 *     tags: [External APIs]
 *     responses:
 *       200:
 *         description: Crypto rates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bitcoin:
 *                   type: object
 *                   properties:
 *                     brl:
 *                       type: number
 *                       example: 250000
 *                     usd:
 *                       type: number
 *                       example: 50000
 *       500:
 *         description: External API error
 */
app.get('/api/crypto/rates', async (req, res) => {
	try {
		const rates = await ExternalAPIService.getCryptoRates();
		if (rates) {
			res.json(rates);
		} else {
			res.status(500).json({ error: 'Failed to fetch crypto rates' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Crypto API error', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/stock/{symbol}:
 *   get:
 *     summary: Get stock price
 *     description: Returns current stock price for a given symbol
 *     tags: [External APIs]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., AAPL, GOOGL)
 *     responses:
 *       200:
 *         description: Stock price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   example: "AAPL"
 *                 price:
 *                   type: string
 *                   example: "150.25"
 *       500:
 *         description: External API error
 */
app.get('/api/stock/:symbol', async (req, res) => {
	try {
		const { symbol } = req.params;
		const price = await ExternalAPIService.getStockPrice(symbol);
		if (price) {
			res.json(price);
		} else {
			res.status(500).json({ error: 'Failed to fetch stock price' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Stock API error', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/weather/{city}:
 *   get:
 *     summary: Get weather data
 *     description: Returns current weather data for a given city
 *     tags: [External APIs]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City name (e.g., São Paulo, Rio de Janeiro)
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "São Paulo"
 *                 main:
 *                   type: object
 *                   properties:
 *                     temp:
 *                       type: number
 *                       example: 25.5
 *                     humidity:
 *                       type: number
 *                       example: 65
 *       500:
 *         description: External API error
 */
app.get('/api/weather/:city', async (req, res) => {
	try {
		const { city } = req.params;
		const weather = await ExternalAPIService.getWeatherData(city);
		if (weather) {
			res.json(weather);
		} else {
			res.status(500).json({ error: 'Failed to fetch weather data' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Weather API error', detail: String(error) });
	}
});

// Webhook endpoints for external integrations
/**
 * @swagger
 * /api/webhooks/bank-integration:
 *   post:
 *     summary: Bank integration webhook
 *     description: Receives webhooks from bank integration services
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "transaction.created"
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook data
 */
app.post('/api/webhooks/bank-integration', express.raw({ type: 'application/json' }), async (req, res) => {
	try {
		const signature = req.headers['x-webhook-signature'];
		
		// Verify webhook signature (implement based on your bank's requirements)
		if (!signature) {
			return res.status(400).json({ error: 'Missing webhook signature' });
		}
		
		const payload = JSON.parse(req.body);
		console.log('Bank webhook received:', payload);
		
		// Process the webhook based on event type
		switch (payload.event) {
			case 'transaction.created':
				// Handle new transaction
				break;
			case 'account.updated':
				// Handle account update
				break;
			default:
				console.log('Unknown webhook event:', payload.event);
		}
		
		res.json({ received: true });
	} catch (error) {
		console.error('Webhook processing error:', error);
		res.status(500).json({ error: 'Webhook processing failed' });
	}
});

/**
 * @swagger
 * /api/webhooks/accounting:
 *   post:
 *     summary: Accounting software webhook
 *     description: Receives webhooks from accounting software integrations
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "invoice.paid"
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook data
 */
app.post('/api/webhooks/accounting', express.raw({ type: 'application/json' }), async (req, res) => {
	try {
		const payload = JSON.parse(req.body);
		console.log('Accounting webhook received:', payload);
		
		// Process accounting webhook
		switch (payload.event) {
			case 'invoice.paid':
				// Handle invoice payment
				break;
			case 'expense.created':
				// Handle new expense
				break;
			default:
				console.log('Unknown accounting event:', payload.event);
		}
		
		res.json({ received: true });
	} catch (error) {
		console.error('Accounting webhook error:', error);
		res.status(500).json({ error: 'Webhook processing failed' });
	}
});

// Enhanced API endpoints with validation
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions
 *     description: Returns paginated list of user transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by transaction type
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.get('/api/transactions', authMiddleware, [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
	query('type').optional().isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
	query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
	query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	try {
		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.pageSize) || 20;
		const skip = (page - 1) * pageSize;
		
		const where = { userId: req.user.userId };
		
		if (req.query.type) where.type = req.query.type;
		if (req.query.categoryId) where.categoryId = req.query.categoryId;
		if (req.query.startDate || req.query.endDate) {
			where.date = {};
			if (req.query.startDate) where.date.gte = new Date(req.query.startDate);
			if (req.query.endDate) where.date.lte = new Date(req.query.endDate);
		}
		
		const [transactions, total] = await Promise.all([
			prisma.transaction.findMany({
				where,
				include: { category: true },
				orderBy: { date: 'desc' },
				skip,
				take: pageSize,
			}),
			prisma.transaction.count({ where }),
		]);
		
		res.json({
			transactions,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch transactions', detail: String(error) });
	}
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create new transaction
 *     description: Creates a new transaction for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 description: Transaction type
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transaction amount
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Transaction description
 *               categoryId:
 *                 type: string
 *                 description: Category ID (optional)
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Transaction date (defaults to today)
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.post('/api/transactions', authMiddleware, [
	body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
	body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
	body('description').isLength({ min: 1, max: 255 }).withMessage('Description must be between 1 and 255 characters'),
	body('categoryId').optional().isString().withMessage('Category ID must be a string'),
	body('date').optional().isISO8601().withMessage('Date must be a valid date'),
], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	try {
		const { type, amount, description, categoryId, date } = req.body;
		
		// Verify category belongs to user if provided
		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: { id: categoryId, userId: req.user.userId },
			});
			if (!category) {
				return res.status(400).json({ error: 'Category not found or does not belong to user' });
			}
		}
		
		const transaction = await prisma.transaction.create({
			data: {
				userId: req.user.userId,
				type,
				amount,
				description,
				categoryId,
				date: date ? new Date(date) : new Date(),
			},
			include: { category: true },
		});
		
		res.status(201).json(transaction);
	} catch (error) {
		res.status(500).json({ error: 'Failed to create transaction', detail: String(error) });
	}
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

// Notification endpoints
app.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const skip = (page - 1) * pageSize;
        
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: req.user.userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.notification.count({
                where: { userId: req.user.userId },
            }),
        ]);
        
        return res.json({
            notifications,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to fetch notifications', detail: String(e) });
    }
});

app.get('/notifications/unread', authMiddleware, async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: { 
                userId: req.user.userId,
                status: { not: 'READ' }
            },
        });
        
        return res.json({ unreadCount: count });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to fetch unread count', detail: String(e) });
    }
});

app.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await prisma.notification.findFirst({
            where: { 
                id,
                userId: req.user.userId 
            },
        });
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        await prisma.notification.update({
            where: { id },
            data: { 
                status: 'READ',
                readAt: new Date()
            },
        });
        
        return res.json({ message: 'Notification marked as read' });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to mark notification as read', detail: String(e) });
    }
});

app.patch('/notifications/read-all', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { 
                userId: req.user.userId,
                status: { not: 'READ' }
            },
            data: { 
                status: 'READ',
                readAt: new Date()
            },
        });
        
        return res.json({ message: 'All notifications marked as read' });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to mark all notifications as read', detail: String(e) });
    }
});

app.delete('/notifications/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await prisma.notification.findFirst({
            where: { 
                id,
                userId: req.user.userId 
            },
        });
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        await prisma.notification.delete({
            where: { id },
        });
        
        return res.json({ message: 'Notification deleted' });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to delete notification', detail: String(e) });
    }
});

// Notification preferences
app.get('/notifications/preferences', authMiddleware, async (req, res) => {
    try {
        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId: req.user.userId },
        });
        
        if (!preferences) {
            // Create default preferences
            preferences = await prisma.notificationPreference.create({
                data: { userId: req.user.userId },
            });
        }
        
        return res.json(preferences);
    } catch (e) {
        return res.status(500).json({ error: 'Failed to fetch preferences', detail: String(e) });
    }
});

app.patch('/notifications/preferences', authMiddleware, async (req, res) => {
    try {
        const {
            emailEnabled,
            pushEnabled,
            reminderEnabled,
            alertEnabled,
            reportEnabled,
            paymentEnabled,
            systemEnabled,
            reminderFrequency,
            reportFrequency,
        } = req.body;
        
        const preferences = await prisma.notificationPreference.upsert({
            where: { userId: req.user.userId },
            update: {
                emailEnabled,
                pushEnabled,
                reminderEnabled,
                alertEnabled,
                reportEnabled,
                paymentEnabled,
                systemEnabled,
                reminderFrequency,
                reportFrequency,
            },
            create: {
                userId: req.user.userId,
                emailEnabled,
                pushEnabled,
                reminderEnabled,
                alertEnabled,
                reportEnabled,
                paymentEnabled,
                systemEnabled,
                reminderFrequency,
                reportFrequency,
            },
        });
        
        return res.json(preferences);
    } catch (e) {
        return res.status(500).json({ error: 'Failed to update preferences', detail: String(e) });
    }
});

// Push notification subscription
app.post('/notifications/push-subscription', authMiddleware, async (req, res) => {
    try {
        const { subscription } = req.body;
        
        // In a real implementation, you would store the push subscription
        // For now, we'll just log it
        console.log('Push subscription for user:', req.user.userId, subscription);
        
        return res.json({ message: 'Push subscription saved' });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to save push subscription', detail: String(e) });
    }
});

// Test notification endpoint
app.post('/notifications/test', authMiddleware, async (req, res) => {
    try {
        const { type = 'EMAIL', category = 'SYSTEM' } = req.body;
        
        const notification = await NotificationService.createNotification(
            req.user.userId,
            type,
            category,
            'Notificação de Teste',
            'Esta é uma notificação de teste do TimeCash King!',
            { test: true }
        );
        
        return res.json({ message: 'Test notification sent', notification });
    } catch (e) {
        return res.status(500).json({ error: 'Failed to send test notification', detail: String(e) });
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
