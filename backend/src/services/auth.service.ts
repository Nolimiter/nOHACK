import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { jwtConstants } from '../config/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    const { username, email, password } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      throw new Error(existingUser.username === username ? 'Username already exists' : 'Email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtConstants.secret,
      jwtConstants.options
    );

    return { user, token };
  }

  static async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const { username, password } = input;

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      jwtConstants.secret,
      jwtConstants.options
    );

    return { user, token };
  }

  static async verifyToken(token: string): Promise<{ userId: string; username: string } | null> {
    try {
      const decoded = jwt.verify(token, jwtConstants.secret) as { userId: string; username: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }
}