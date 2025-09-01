const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Mock Prisma
const mockPrisma = {
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
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock the app
const app = require('../../index');

describe('Transactions Controller', () => {
  let authToken;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = testUtils.createMockUser();
    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET);
  });

  describe('GET /transactions', () => {
    it('should return paginated transactions', async () => {
      const mockTransactions = [
        testUtils.createMockTransaction(),
        testUtils.createMockTransaction(),
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/transactions?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter transactions by type', async () => {
      const mockTransactions = [testUtils.createMockTransaction()];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/transactions?type=EXPENSE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            type: 'EXPENSE',
          }),
        })
      );
    });

    it('should filter transactions by date range', async () => {
      const mockTransactions = [testUtils.createMockTransaction()];
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const response = await request(app)
        .get(`/transactions?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            date: expect.objectContaining({
              gte: new Date(startDate),
              lte: new Date(endDate),
            }),
          }),
        })
      );
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/transactions')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /transactions', () => {
    it('should create a new transaction', async () => {
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

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(transactionData.type);
      expect(response.body.amount).toBe(transactionData.amount);
      expect(response.body.description).toBe(transactionData.description);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Test transaction',
        // Missing type and amount
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        type: 'EXPENSE',
        amount: -100.00,
        description: 'Test transaction',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({ type: 'EXPENSE', amount: 100 })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /transactions/:id', () => {
    it('should update an existing transaction', async () => {
      const transactionId = 'test-transaction-id';
      const updateData = {
        description: 'Updated description',
        amount: 150.00,
      };

      const mockTransaction = {
        ...testUtils.createMockTransaction(),
        ...updateData,
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.update.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
      expect(response.body.amount).toBe(updateData.amount);
    });

    it('should return 404 for non-existent transaction', async () => {
      const transactionId = 'non-existent-id';

      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for transaction not owned by user', async () => {
      const transactionId = 'other-user-transaction';
      const otherUserTransaction = {
        ...testUtils.createMockTransaction(),
        userId: 'other-user-id',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(otherUserTransaction);

      const response = await request(app)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated' })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should delete an existing transaction', async () => {
      const transactionId = 'test-transaction-id';
      const mockTransaction = testUtils.createMockTransaction();

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.delete.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Transaction deleted successfully');
    });

    it('should return 404 for non-existent transaction', async () => {
      const transactionId = 'non-existent-id';

      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for transaction not owned by user', async () => {
      const transactionId = 'other-user-transaction';
      const otherUserTransaction = {
        ...testUtils.createMockTransaction(),
        userId: 'other-user-id',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(otherUserTransaction);

      const response = await request(app)
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });
});
