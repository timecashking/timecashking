const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
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
    count: jest.fn(),
  },
  notificationPreference: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock the app
const app = require('../../index');

describe('API Integration Tests', () => {
  let authToken;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = testUtils.createMockUser();
    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Google OAuth
      const mockUser = testUtils.createMockUser();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const authResponse = await request(app)
        .post('/auth/google')
        .send({ credential: 'valid-google-token' })
        .expect(200);

      expect(authResponse.body).toHaveProperty('user');
      expect(authResponse.body).toHaveProperty('token');

      const token = authResponse.body.token;

      // Step 2: Get user profile
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const profileResponse = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('id', mockUser.id);
      expect(profileResponse.body).toHaveProperty('email', mockUser.email);
    });
  });

  describe('Transaction Management Flow', () => {
    it('should complete full transaction CRUD flow', async () => {
      // Step 1: Create transaction
      const transactionData = {
        type: 'EXPENSE',
        amount: 100.00,
        description: 'Test transaction',
        categoryId: 'test-category-id',
        date: '2024-01-15',
      };

      const mockTransaction = {
        ...testUtils.createMockTransaction(),
        ...transactionData,
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const createResponse = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      const transactionId = createResponse.body.id;

      // Step 2: Get transactions list
      const mockTransactions = [mockTransaction];
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const listResponse = await request(app)
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body.transactions).toHaveLength(1);
      expect(listResponse.body.transactions[0].id).toBe(transactionId);

      // Step 3: Update transaction
      const updateData = {
        description: 'Updated description',
        amount: 150.00,
      };

      const updatedTransaction = {
        ...mockTransaction,
        ...updateData,
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(updatedTransaction);
      mockPrisma.transaction.update.mockResolvedValue(updatedTransaction);

      const updateResponse = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.description).toBe(updateData.description);
      expect(updateResponse.body.amount).toBe(updateData.amount);

      // Step 4: Delete transaction
      mockPrisma.transaction.findUnique.mockResolvedValue(updatedTransaction);
      mockPrisma.transaction.delete.mockResolvedValue(updatedTransaction);

      const deleteResponse = await request(app)
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('message', 'Transaction deleted successfully');
    });
  });

  describe('Category Management Flow', () => {
    it('should complete full category CRUD flow', async () => {
      // Step 1: Create category
      const categoryData = {
        name: 'Test Category',
      };

      const mockCategory = {
        ...testUtils.createMockCategory(),
        ...categoryData,
      };

      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const createResponse = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      const categoryId = createResponse.body.id;

      // Step 2: Get categories list
      const mockCategories = [mockCategory];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const listResponse = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].id).toBe(categoryId);

      // Step 3: Update category
      const updateData = {
        name: 'Updated Category',
      };

      const updatedCategory = {
        ...mockCategory,
        ...updateData,
      };

      mockPrisma.category.findUnique.mockResolvedValue(updatedCategory);
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const updateResponse = await request(app)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateData.name);

      // Step 4: Delete category
      mockPrisma.category.findUnique.mockResolvedValue(updatedCategory);
      mockPrisma.category.delete.mockResolvedValue(updatedCategory);

      const deleteResponse = await request(app)
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('message', 'Category deleted successfully');
    });
  });

  describe('Summary and Analytics', () => {
    it('should return financial summary', async () => {
      const mockTransactions = [
        { ...testUtils.createMockTransaction(), type: 'INCOME', amount: 1000 },
        { ...testUtils.createMockTransaction(), type: 'EXPENSE', amount: 300 },
        { ...testUtils.createMockTransaction(), type: 'EXPENSE', amount: 200 },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get('/summary?period=month')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalIncome');
      expect(response.body).toHaveProperty('totalExpense');
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('transactions');
      expect(response.body.totalIncome).toBe(1000);
      expect(response.body.totalExpense).toBe(500);
      expect(response.body.balance).toBe(500);
    });
  });

  describe('Notification System', () => {
    it('should handle notification preferences and sending', async () => {
      // Step 1: Get notification preferences
      const mockPreferences = {
        id: 'pref-id',
        userId: mockUser.id,
        emailEnabled: true,
        pushEnabled: true,
        reminderEnabled: true,
        alertEnabled: true,
        reportEnabled: true,
        paymentEnabled: true,
        systemEnabled: true,
        reminderFrequency: 'daily',
        reportFrequency: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.notificationPreference.findUnique.mockResolvedValue(mockPreferences);

      const prefsResponse = await request(app)
        .get('/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(prefsResponse.body.emailEnabled).toBe(true);
      expect(prefsResponse.body.pushEnabled).toBe(true);

      // Step 2: Update preferences
      const updateData = {
        emailEnabled: false,
        reminderFrequency: 'weekly',
      };

      const updatedPreferences = {
        ...mockPreferences,
        ...updateData,
      };

      mockPrisma.notificationPreference.update.mockResolvedValue(updatedPreferences);

      const updateResponse = await request(app)
        .patch('/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.emailEnabled).toBe(false);
      expect(updateResponse.body.reminderFrequency).toBe('weekly');

      // Step 3: Get notifications list
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: mockUser.id,
          type: 'EMAIL',
          category: 'REMINDER',
          title: 'Test Notification',
          message: 'This is a test notification',
          status: 'PENDING',
          createdAt: new Date(),
        },
      ];

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrisma.notification.count.mockResolvedValue(1);

      const notificationsResponse = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(notificationsResponse.body.notifications).toHaveLength(1);
      expect(notificationsResponse.body.notifications[0].title).toBe('Test Notification');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.transaction.findMany.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Internal server error');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        type: 'INVALID_TYPE',
        amount: 'not-a-number',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid token');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting', async () => {
      // Make multiple requests quickly
      const requests = Array(105).fill().map(() =>
        request(app)
          .get('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
