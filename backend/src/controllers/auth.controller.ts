import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);
      
      // Register user
      const { user, token } = await AuthService.register(validatedData);
      
      // Return success response
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error: any) {
      if (error.message.includes('Username already exists') || error.message.includes('Email already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      
      if (error.errors) {
        // Zod validation error
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);
      
      // Login user
      const { user, token } = await AuthService.login(validatedData);
      
      // Return success response
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          level: user.level,
          bitcoins: user.bitcoins,
          reputation: user.reputation,
        },
        token,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
        return;
      }
      
      if (error.errors) {
        // Zod validation error
        res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async profile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      // Get user from database
      const user = await AuthService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Return user profile
      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          level: user.level,
          experience: user.experience,
          reputation: user.reputation,
          bitcoins: user.bitcoins,
          darkTokens: user.darkTokens,
          avatar: user.avatar,
          bio: user.bio,
          country: user.country,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    // In a real application, you might want to add the token to a blacklist
    // For now, we just send a success response
    res.status(200).json({ message: 'Logout successful' });
  }
}