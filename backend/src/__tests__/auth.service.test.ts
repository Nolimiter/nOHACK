import { AuthService } from '../services/auth.service';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtConstants } from '../config/jwt';

// Mock the database
jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
 },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerInput = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await AuthService.register(registerInput);

      expect(result).toEqual({
        user: mockUser,
        token: 'test-token',
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'testuser' },
            { email: 'test@example.com' },
          ],
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('TestPass123!', 12);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '1', username: 'testuser' },
        jwtConstants.secret,
        jwtConstants.options
      );
    });

    it('should throw an error if username already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        username: 'testuser',
      });

      await expect(
        AuthService.register({
          username: 'testuser',
          email: 'newemail@example.com',
          password: 'TestPass123!',
          confirmPassword: 'TestPass123!',
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should throw an error if email already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: 'test@example.com',
      });

      await expect(
        AuthService.register({
          username: 'newuser',
          email: 'test@example.com',
          password: 'TestPass123!',
          confirmPassword: 'TestPass123!',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

 describe('login', () => {
    it('should login user successfully', async () => {
      const loginInput = {
        username: 'testuser',
        password: 'TestPass123!',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await AuthService.login(loginInput);

      expect(result).toEqual({
        user: mockUser,
        token: 'test-token',
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'testuser' },
            { email: 'testuser' },
          ],
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('TestPass123!', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '1', username: 'testuser' },
        jwtConstants.secret,
        jwtConstants.options
      );
    });

    it('should throw an error for invalid credentials', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login({
          username: 'nonexistent',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error for incorrect password', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const mockDecoded = { userId: '1', username: 'testuser' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = await AuthService.verifyToken('valid-token');

      expect(result).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', jwtConstants.secret);
    });

    it('should return null for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await AuthService.verifyToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});