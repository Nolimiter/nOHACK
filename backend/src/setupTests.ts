// Setup tests
import { jest } from '@jest/globals';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    guild: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Add other models as needed
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock Redis
jest.mock('redis', () => {
  return {
    createClient: jest.fn(() => ({
      connect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      subscribe: jest.fn(),
      publish: jest.fn(),
    })),
  };
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-for-development';
process.env.BCRYPT_ROUNDS = '12';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Global setup
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};