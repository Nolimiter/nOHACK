import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './middleware/error.middleware';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';
import { authenticate } from './middleware/auth.middleware';
import { validateEnv } from './utils/validators';

// Import routes
import authRoutes from './routes/auth.routes';
import guildRoutes from './routes/guild.routes';
import socialRoutes from './routes/social.routes';

// Validate environment variables
validateEnv();

const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = initializeSocket(server);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression()); // Compression
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guild', guildRoutes);
app.use('/api/social', socialRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test authentication middleware
app.get('/api/test-auth', authenticate, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Authentication successful', user: (req as any).user });
});

// Error handling middleware (should be last)
app.use(errorMiddleware);

// Connect to Redis and start server
const PORT = process.env.PORT || 4000;

connectRedis().then(() => {
  server.listen(PORT, () => {
    console.log(`HackEX server is running on port ${PORT}`);
    console.log(`Backend URL: http://localhost:${PORT}`);
    console.log(`WebSocket URL: ws://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to connect to Redis:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
 console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});