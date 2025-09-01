const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock the app
const app = require('../../index');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/google', () => {
    it('should authenticate user with valid Google token', async () => {
      const mockUser = testUtils.createMockUser();
      const mockToken = 'valid-google-token';

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/google')
        .send({ credential: mockToken })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.user.name).toBe(mockUser.name);
    });

    it('should create new user if not exists', async () => {
      const mockUser = testUtils.createMockUser();
      const mockToken = 'valid-google-token';

      // Mock Prisma responses
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/google')
        .send({ credential: mockToken })
        .expect(200);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/auth/google')
        .send({ credential: 'invalid-token' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing credential', async () => {
      const response = await request(app)
        .post('/auth/google')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user data for valid token', async () => {
      const mockUser = testUtils.createMockUser();
      const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET);

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', mockUser.id);
      expect(response.body).toHaveProperty('email', mockUser.email);
      expect(response.body).toHaveProperty('name', mockUser.name);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent user', async () => {
      const token = jwt.sign({ userId: 'non-existent' }, process.env.JWT_SECRET);

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });
});
