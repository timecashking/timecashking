import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { body, query, validationResult } from 'express-validator';
import compression from 'compression';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const { PrismaClient } = pkg;

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Google Calendar API
const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
	origin: [
		'https://timecashking.netlify.app',
		'http://localhost:5173',
		'http://localhost:3000'
	],
	credentials: true
}));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger configuration
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'TimeCash King API',
			version: '1.0.0',
			description: 'API completa para o sistema TimeCash King',
		},
		servers: [
			{ url: 'https://timecashking-api.onrender.com' },
			{ url: 'http://localhost:3000' }
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
	},
	apis: ['./server.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'Token não fornecido' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			include: {
				companyUsers: {
					include: { company: true }
				}
			}
		});

		if (!user) {
			return res.status(401).json({ error: 'Usuário não encontrado' });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(403).json({ error: 'Token inválido' });
	}
};

// Role-based authorization
const requireRole = (roles) => {
	return (req, res, next) => {
		const userCompanies = req.user.companyUsers;
		const hasRole = userCompanies.some(cu => roles.includes(cu.role));
		
		if (!hasRole) {
			return res.status(403).json({ error: 'Acesso negado' });
		}
		next();
	};
};

// Helper functions
const normalizeAmount = (amount) => {
	if (typeof amount === 'string') {
		return parseFloat(amount.replace(',', '.'));
	}
	return amount;
};

const getCurrentCompany = async (userId) => {
	const companyUser = await prisma.companyUser.findFirst({
		where: { userId, active: true },
		include: { company: true }
	});
	return companyUser?.company;
};

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Google OAuth
app.get('/auth/google', (req, res) => {
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
	});
	res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
	const { code } = req.query;
	try {
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);
		
		// Get user info from Google
		const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
		const { data } = await oauth2.userinfo.get();
		
		// Create or update user
		let user = await prisma.user.findUnique({
			where: { googleId: data.id }
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					googleId: data.id,
					email: data.email,
					name: data.name,
					avatarUrl: data.picture
				}
			});

			// Create default company for personal use
			const company = await prisma.company.create({
				data: {
					name: 'Pessoal',
					description: 'Uso pessoal'
				}
			});

			await prisma.companyUser.create({
				data: {
					companyId: company.id,
					userId: user.id,
					role: 'OWNER'
				}
			});
		}

		const token = jwt.sign(
			{ userId: user.id },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		);

		res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
	} catch (error) {
		console.error('Google OAuth error:', error);
		res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
	}
});

// User profile
app.get('/me', authenticateToken, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			include: {
				companyUsers: {
					include: { company: true }
				},
				notificationPreferences: true
			}
		});
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Companies
app.get('/companies', authenticateToken, async (req, res) => {
	try {
		const companies = await prisma.company.findMany({
			where: {
				users: {
					some: { userId: req.user.id }
				}
			},
			include: {
				_count: {
					select: {
						transactions: true,
						products: true,
						events: true
					}
				}
			}
		});
		res.json(companies);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/companies', authenticateToken, requireRole(['OWNER', 'ADMIN']), [
	body('name').isLength({ min: 1, max: 100 }),
	body('description').optional().isLength({ max: 500 })
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const company = await prisma.company.create({
			data: {
				name: req.body.name,
				description: req.body.description
			}
		});

		await prisma.companyUser.create({
			data: {
				companyId: company.id,
				userId: req.user.id,
				role: 'OWNER'
			}
		});

		res.status(201).json(company);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Accounts
app.get('/accounts', authenticateToken, async (req, res) => {
	try {
		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const accounts = await prisma.account.findMany({
			where: { companyId: company.id },
			orderBy: { name: 'asc' }
		});
		res.json(accounts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/accounts', authenticateToken, [
	body('name').isLength({ min: 1, max: 100 }),
	body('type').isIn(['CASH', 'BANK', 'CREDIT_CARD']),
	body('balance').isNumeric(),
	body('billingDay').optional().isInt({ min: 1, max: 31 }),
	body('dueDay').optional().isInt({ min: 1, max: 31 })
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const account = await prisma.account.create({
			data: {
				companyId: company.id,
				name: req.body.name,
				type: req.body.type,
				balance: normalizeAmount(req.body.balance),
				billingDay: req.body.billingDay,
				dueDay: req.body.dueDay
			}
		});

		res.status(201).json(account);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Categories
app.get('/categories', authenticateToken, async (req, res) => {
	try {
		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const categories = await prisma.category.findMany({
			where: { companyId: company.id },
			orderBy: { name: 'asc' }
		});
		res.json(categories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/categories', authenticateToken, [
	body('name').isLength({ min: 1, max: 100 }),
	body('type').isIn(['INCOME', 'EXPENSE'])
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const category = await prisma.category.create({
			data: {
				companyId: company.id,
				name: req.body.name,
				type: req.body.type
			}
		});

		res.status(201).json(category);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Transactions
app.get('/transactions', authenticateToken, async (req, res) => {
	try {
		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const { page = 1, limit = 20, type, categoryId, startDate, endDate } = req.query;
		const skip = (page - 1) * limit;

		const where = { companyId: company.id };
		if (type) where.type = type;
		if (categoryId) where.categoryId = categoryId;
		if (startDate && endDate) {
			where.date = {
				gte: new Date(startDate),
				lte: new Date(endDate)
			};
		}

		const [transactions, total] = await Promise.all([
			prisma.transaction.findMany({
				where,
				include: {
					category: true,
					account: true
				},
				orderBy: { date: 'desc' },
				skip: parseInt(skip),
				take: parseInt(limit)
			}),
			prisma.transaction.count({ where })
		]);

		res.json({
			transactions,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/transactions', authenticateToken, [
	body('accountId').isUUID(),
	body('type').isIn(['INCOME', 'EXPENSE', 'TRANSFER']),
	body('amount').isNumeric(),
	body('description').optional().isLength({ max: 500 }),
	body('date').isISO8601(),
	body('categoryId').optional().isUUID(),
	body('isPaid').optional().isBoolean(),
	body('dueDate').optional().isISO8601()
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const amount = normalizeAmount(req.body.amount);
		if (amount <= 0) {
			return res.status(400).json({ error: 'Valor deve ser maior que zero' });
		}

		const transaction = await prisma.transaction.create({
			data: {
				companyId: company.id,
				accountId: req.body.accountId,
				categoryId: req.body.categoryId,
				type: req.body.type,
				amount,
				description: req.body.description,
				date: new Date(req.body.date),
				isPaid: req.body.isPaid ?? true,
				dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
			},
			include: {
				category: true,
				account: true
			}
		});

		// Update account balance
		await prisma.account.update({
			where: { id: req.body.accountId },
			data: {
				balance: {
					increment: req.body.type === 'INCOME' ? amount : -amount
				}
			}
		});

		// Create bill if not paid
		if (!req.body.isPaid && req.body.dueDate) {
			await prisma.bill.create({
				data: {
					companyId: company.id,
					accountId: req.body.accountId,
					transactionId: transaction.id,
					type: req.body.type === 'INCOME' ? 'RECEIVABLE' : 'PAYABLE',
					amount,
					description: req.body.description,
					dueDate: new Date(req.body.dueDate)
				}
			});
		}

		res.status(201).json(transaction);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Products
app.get('/products', authenticateToken, async (req, res) => {
	try {
		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const products = await prisma.product.findMany({
			where: { companyId: company.id },
			orderBy: { name: 'asc' }
		});
		res.json(products);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/products', authenticateToken, [
	body('sku').isLength({ min: 1, max: 50 }),
	body('name').isLength({ min: 1, max: 200 }),
	body('cost').isNumeric(),
	body('salePrice').isNumeric(),
	body('stock').isInt({ min: 0 }),
	body('minStock').isInt({ min: 0 }),
	body('category').optional().isLength({ max: 100 })
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const product = await prisma.product.create({
			data: {
				companyId: company.id,
				sku: req.body.sku,
				name: req.body.name,
				description: req.body.description,
				cost: normalizeAmount(req.body.cost),
				salePrice: normalizeAmount(req.body.salePrice),
				stock: parseInt(req.body.stock),
				minStock: parseInt(req.body.minStock),
				category: req.body.category
			}
		});

		res.status(201).json(product);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Sales Orders
app.get('/sales', authenticateToken, async (req, res) => {
	try {
		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const orders = await prisma.salesOrder.findMany({
			where: { companyId: company.id },
			include: {
				items: {
					include: { product: true }
				}
			},
			orderBy: { orderDate: 'desc' }
		});
		res.json(orders);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/sales', authenticateToken, [
	body('customerName').isLength({ min: 1, max: 200 }),
	body('items').isArray({ min: 1 }),
	body('items.*.productId').isUUID(),
	body('items.*.quantity').isInt({ min: 1 }),
	body('paymentMethod').isIn(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER'])
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const { customerName, customerEmail, customerPhone, items, discount = 0, paymentMethod, notes } = req.body;

		// Calculate total
		let total = 0;
		for (const item of items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId }
			});
			if (!product) {
				return res.status(400).json({ error: `Produto ${item.productId} não encontrado` });
			}
			if (product.stock < item.quantity) {
				return res.status(400).json({ error: `Estoque insuficiente para ${product.name}` });
			}
			total += product.salePrice * item.quantity;
		}
		total -= normalizeAmount(discount);

		const order = await prisma.salesOrder.create({
			data: {
				companyId: company.id,
				customerName,
				customerEmail,
				customerPhone,
				total,
				discount: normalizeAmount(discount),
				paymentMethod,
				notes
			}
		});

		// Create order items and update stock
		for (const item of items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId }
			});

			await prisma.salesOrderItem.create({
				data: {
					salesOrderId: order.id,
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: product.salePrice,
					totalPrice: product.salePrice * item.quantity
				}
			});

			// Update stock
			await prisma.product.update({
				where: { id: item.productId },
				data: { stock: { decrement: item.quantity } }
			});

			// Create stock movement
			await prisma.stockMovement.create({
				data: {
					companyId: company.id,
					productId: item.productId,
					type: 'EXIT',
					reason: 'SALE',
					quantity: item.quantity,
					unitCost: product.cost,
					totalCost: product.cost * item.quantity,
					description: `Venda - Pedido #${order.id}`
				}
			});
		}

		// Create income transaction
		const cashAccount = await prisma.account.findFirst({
			where: { companyId: company.id, type: 'CASH' }
		});

		if (cashAccount) {
			await prisma.transaction.create({
				data: {
					companyId: company.id,
					accountId: cashAccount.id,
					type: 'INCOME',
					amount: total,
					description: `Venda - ${customerName}`,
					date: new Date()
				}
			});

			await prisma.account.update({
				where: { id: cashAccount.id },
				data: { balance: { increment: total } }
			});
		}

		res.status(201).json(order);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Dashboard summary
app.get('/summary', authenticateToken, async (req, res) => {
	try {
		const company = await getCurrentCompany(req.user.id);
		if (!company) {
			return res.status(400).json({ error: 'Nenhuma empresa selecionada' });
		}

		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		const [
			monthlyIncome,
			monthlyExpense,
			totalBalance,
			pendingBills,
			lowStockProducts,
			todayEvents,
			recentTransactions
		] = await Promise.all([
			// Monthly income
			prisma.transaction.aggregate({
				where: {
					companyId: company.id,
					type: 'INCOME',
					date: { gte: startOfMonth, lte: endOfMonth }
				},
				_sum: { amount: true }
			}),
			// Monthly expense
			prisma.transaction.aggregate({
				where: {
					companyId: company.id,
					type: 'EXPENSE',
					date: { gte: startOfMonth, lte: endOfMonth }
				},
				_sum: { amount: true }
			}),
			// Total balance
			prisma.account.aggregate({
				where: { companyId: company.id },
				_sum: { balance: true }
			}),
			// Pending bills
			prisma.bill.count({
				where: {
					companyId: company.id,
					status: 'PENDING',
					dueDate: { lte: new Date() }
				}
			}),
			// Low stock products
			prisma.product.count({
				where: {
					companyId: company.id,
					stock: { lte: prisma.product.fields.minStock }
				}
			}),
			// Today events
			prisma.event.findMany({
				where: {
					companyId: company.id,
					startDate: {
						gte: new Date(now.setHours(0, 0, 0, 0)),
						lt: new Date(now.setHours(23, 59, 59, 999))
					}
				},
				orderBy: { startDate: 'asc' }
			}),
			// Recent transactions
			prisma.transaction.findMany({
				where: { companyId: company.id },
				include: { category: true, account: true },
				orderBy: { date: 'desc' },
				take: 5
			})
		]);

		res.json({
			monthlyIncome: monthlyIncome._sum.amount || 0,
			monthlyExpense: monthlyExpense._sum.amount || 0,
			totalBalance: totalBalance._sum.balance || 0,
			pendingBills,
			lowStockProducts,
			todayEvents,
			recentTransactions
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Telegram Bot Commands
bot.command('start', (ctx) => {
	ctx.reply('Bem-vindo ao TimeCash King! Use /vincular para conectar sua conta.');
});

bot.command('vincular', async (ctx) => {
	const chatId = ctx.chat.id;
	const userId = ctx.message.text.split(' ')[1];
	
	if (!userId) {
		ctx.reply('Use: /vincular SEU_USER_ID');
		return;
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			ctx.reply('Usuário não encontrado. Verifique o ID.');
			return;
		}

		await prisma.user.update({
			where: { id: userId },
			data: { telegramChatId: chatId.toString() }
		});

		ctx.reply('Conta vinculada com sucesso! Agora você pode usar comandos como:\n\n' +
			'• "Hoje gastei R$70 no mercado"\n' +
			'• "Recebi R$300 de um ensaio"\n' +
			'• "Marcar reunião dia 25 às 14h"');
	} catch (error) {
		ctx.reply('Erro ao vincular conta. Tente novamente.');
	}
});

// Process text messages
bot.on(message('text'), async (ctx) => {
	const text = ctx.message.text.toLowerCase();
	const chatId = ctx.chat.id;

	try {
		const user = await prisma.user.findUnique({
			where: { telegramChatId: chatId.toString() }
		});

		if (!user) {
			ctx.reply('Use /vincular para conectar sua conta primeiro.');
			return;
		}

		const company = await getCurrentCompany(user.id);
		if (!company) {
			ctx.reply('Nenhuma empresa configurada.');
			return;
		}

		// Parse expense
		const expenseMatch = text.match(/gastei r?\$?(\d+(?:[.,]\d{2})?) (?:no|em|com) (.+)/i);
		if (expenseMatch) {
			const amount = normalizeAmount(expenseMatch[1]);
			const description = expenseMatch[2];

			const cashAccount = await prisma.account.findFirst({
				where: { companyId: company.id, type: 'CASH' }
			});

			if (!cashAccount) {
				ctx.reply('Nenhuma conta de caixa configurada.');
				return;
			}

			const transaction = await prisma.transaction.create({
				data: {
					companyId: company.id,
					accountId: cashAccount.id,
					type: 'EXPENSE',
					amount,
					description: `Telegram: ${description}`,
					date: new Date()
				}
			});

			await prisma.account.update({
				where: { id: cashAccount.id },
				data: { balance: { decrement: amount } }
			});

			ctx.reply(`✅ Despesa registrada: R$ ${amount.toFixed(2)} - ${description}`);
			return;
		}

		// Parse income
		const incomeMatch = text.match(/recebi r?\$?(\d+(?:[.,]\d{2})?) (?:de|por) (.+)/i);
		if (incomeMatch) {
			const amount = normalizeAmount(incomeMatch[1]);
			const description = incomeMatch[2];

			const cashAccount = await prisma.account.findFirst({
				where: { companyId: company.id, type: 'CASH' }
			});

			if (!cashAccount) {
				ctx.reply('Nenhuma conta de caixa configurada.');
				return;
			}

			const transaction = await prisma.transaction.create({
				data: {
					companyId: company.id,
					accountId: cashAccount.id,
					type: 'INCOME',
					amount,
					description: `Telegram: ${description}`,
					date: new Date()
				}
			});

			await prisma.account.update({
				where: { id: cashAccount.id },
				data: { balance: { increment: amount } }
			});

			ctx.reply(`✅ Receita registrada: R$ ${amount.toFixed(2)} - ${description}`);
			return;
		}

		// Parse meeting
		const meetingMatch = text.match(/marcar reunião (?:dia )?(\d{1,2}) às (\d{1,2})h/i);
		if (meetingMatch) {
			const day = parseInt(meetingMatch[1]);
			const hour = parseInt(meetingMatch[2]);
			
			const eventDate = new Date();
			eventDate.setDate(day);
			eventDate.setHours(hour, 0, 0, 0);

			const event = await prisma.event.create({
				data: {
					companyId: company.id,
					title: 'Reunião',
					type: 'MEETING',
					startDate: eventDate,
					endDate: new Date(eventDate.getTime() + 60 * 60 * 1000) // +1 hour
				}
			});

			ctx.reply(`✅ Reunião marcada para dia ${day} às ${hour}h`);
			return;
		}

		ctx.reply('Comando não reconhecido. Use:\n' +
			'• "Hoje gastei R$70 no mercado"\n' +
			'• "Recebi R$300 de um ensaio"\n' +
			'• "Marcar reunião dia 25 às 14h"');

	} catch (error) {
		console.error('Telegram bot error:', error);
		ctx.reply('Erro ao processar comando. Tente novamente.');
	}
});

// Start bot
if (process.env.TELEGRAM_BOT_TOKEN) {
	bot.launch();
	console.log('Telegram bot started');
}

// Scheduled tasks
cron.schedule('0 8 * * *', async () => {
	// Daily reminders at 8 AM
	try {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const reminders = await prisma.reminder.findMany({
			where: {
				dueDate: {
					gte: today,
					lt: tomorrow
				},
				sent: false
			},
			include: {
				company: {
					include: {
						users: {
							include: { user: true }
						}
					}
				}
			}
		});

		for (const reminder of reminders) {
			for (const companyUser of reminder.company.users) {
				if (companyUser.user.telegramChatId) {
					try {
						await bot.telegram.sendMessage(
							companyUser.user.telegramChatId,
							`🔔 Lembrete: ${reminder.title}\n${reminder.message}`
						);
					} catch (error) {
						console.error('Failed to send Telegram reminder:', error);
					}
				}
			}

			await prisma.reminder.update({
				where: { id: reminder.id },
				data: { sent: true, sentAt: new Date() }
			});
		}
	} catch (error) {
		console.error('Reminder cron error:', error);
	}
});

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use('*', (req, res) => {
	res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Start server
app.listen(port, () => {
	console.log(`TimeCash King API running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('SIGTERM received, shutting down gracefully');
	await prisma.$disconnect();
	process.exit(0);
});
