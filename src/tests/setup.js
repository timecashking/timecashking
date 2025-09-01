// Jest setup file
const { PrismaClient } = require('@prisma/client');

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    notificationPreference: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_test';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.GMAIL_USER = 'test@gmail.com';
process.env.GMAIL_PASS = 'test-password';
process.env.VAPID_PUBLIC_KEY = 'test-vapid-public-key';
process.env.VAPID_PRIVATE_KEY = 'test-vapid-private-key';
process.env.TWELVE_DATA_API_KEY = 'test-twelve-data-key';
process.env.OPENWEATHER_API_KEY = 'test-openweather-key';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      cancel: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock web-push
jest.mock('web-push', () => ({
  sendNotification: jest.fn().mockResolvedValue({ statusCode: 200 }),
  setVapidDetails: jest.fn(),
  generateVAPIDKeys: jest.fn().mockReturnValue({
    publicKey: 'test-public-key',
    privateKey: 'test-private-key',
  }),
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
}));

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        sub: 'test-google-id',
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://test.com/avatar.jpg',
      }),
    }),
  })),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    googleId: 'test-google-id',
    email: 'test@gmail.com',
    name: 'Test User',
    avatarUrl: 'https://test.com/avatar.jpg',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockTransaction: () => ({
    id: 'test-transaction-id',
    userId: 'test-user-id',
    categoryId: 'test-category-id',
    type: 'EXPENSE',
    amount: 100.00,
    description: 'Test transaction',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockCategory: () => ({
    id: 'test-category-id',
    userId: 'test-user-id',
    name: 'Test Category',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockSubscription: () => ({
    id: 'test-subscription-id',
    userId: 'test-user-id',
    stripeCustomerId: 'cus_test',
    stripeSubscriptionId: 'sub_test',
    planId: 'plan_test',
    planName: 'Premium',
    planPrice: 29.99,
    status: 'ACTIVE',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};
