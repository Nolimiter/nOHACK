// Setup tests

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-for-development';
process.env.BCRYPT_ROUNDS = '12';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';