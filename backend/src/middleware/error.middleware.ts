import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  console.error(`Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);

  // Handle different types of errors
 if (error.name === 'ValidationError') {
    // Handle validation errors (e.g., from Prisma)
    res.status(400).json({
      error: 'Validation Error',
      details: error.message,
    });
    return;
  }

  if (error.name === 'UnauthorizedError' || error.name === 'JsonWebTokenError') {
    // Handle JWT errors
    res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid or expired token',
    });
    return;
  }

  if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    // Handle multer errors
    res.status(400).json({
      error: 'File Upload Error',
      details: error.message,
    });
    return;
  }

 // Handle Prisma errors
  if (error.code === 'P2002') {
    // Unique constraint violation
    res.status(409).json({
      error: 'Conflict',
      details: 'A record with this value already exists',
    });
    return;
 }

  if (error.code === 'P2025') {
    // Record not found
    res.status(404).json({
      error: 'Not Found',
      details: 'The requested resource was not found',
    });
    return;
  }

  // Default error handling
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
  });
};