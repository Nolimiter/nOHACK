import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { authenticate } from '../middleware/auth.middleware';
import { handleGameEvents } from './handlers/game.handler';
import { handleChatEvents } from './handlers/chat.handler';
import { handleMarketEvents } from './handlers/market.handler';

export interface ServerToClientEvents {
  // General events
  error: (error: string) => void;
  
  // Game events
  'game:state:update': (data: any) => void;
  'operation:progress': (data: { operationId: string; progress: number }) => void;
  'operation:complete': (data: any) => void;
  'attack:incoming': (data: { attackerId: string; type: string }) => void;
  'attack:detect': (data: { attackType: string; detected: boolean }) => void;
  
  // Chat events
  'chat:message': (data: { userId: string; username: string; message: string; timestamp: Date }) => void;
  'chat:onlineUsers': (data: { users: Array<{ id: string; username: string }> }) => void;
  
  // Market events
  'market:price:update': (data: { itemId: string; newPrice: number }) => void;
  'market:new:listing': (data: { listingId: string; item: string; price: number }) => void;
}

export interface ClientToServerEvents {
  // Game events
  'operation:start': (data: { type: string; targetId: string }) => void;
  'operation:cancel': (data: { operationId: string }) => void;
  
  // Chat events
  'chat:join': (data: { channel: string }) => void;
  'chat:leave': (data: { channel: string }) => void;
  'chat:message': (data: { channel: string; message: string }) => void;
  
  // Market events
  'market:watch': (data: { itemId: string }) => void;
  'market:unwatch': (data: { itemId: string }) => void;
}

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      // Extract token from handshake auth or headers
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token (this would use your AuthService)
      // For now, we'll simulate a successful authentication
      // In a real implementation, you would verify the JWT token
      const decoded = { userId: 'temp-user-id', username: 'temp-username' }; // Replace with actual verification
      
      // Add user info to socket object
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Add the socket to a global user lookup (in a real app, use Redis or similar)
    const userId = (socket as any).user.userId;
    socket.join(`user-${userId}`);
    
    // Handle game events
    handleGameEvents(io, socket);
    
    // Handle chat events
    handleChatEvents(io, socket);
    
    // Handle market events
    handleMarketEvents(io, socket);
    
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
};