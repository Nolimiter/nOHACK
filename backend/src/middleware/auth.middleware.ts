import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await AuthService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid token.' });
      return;
    }

    // Add user info to request object
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(50).json({ error: 'Internal server error' });
  }
};

export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = await AuthService.verifyToken(token);

      if (decoded) {
        // Add user info to request object only if token is valid
        (req as any).user = decoded;
      }
    }

    next();
  } catch (error) {
    // If there's an error verifying the token, continue without authentication
    next();
  }
};