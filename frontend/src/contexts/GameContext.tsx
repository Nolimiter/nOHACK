import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface GameContextType {
  socket: Socket | null;
  connected: boolean;
  gameData: any;
  operations: any[];
  startOperation: (type: string, targetId: string) => void;
  cancelOperation: (operationId: string) => void;
  joinChatChannel: (channel: string) => void;
  leaveChatChannel: (channel: string) => void;
  sendMessage: (channel: string, message: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameData, setGameData] = useState<any>({});
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize WebSocket connection
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000', {
        auth: {
          token,
        },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setConnected(true);
        console.log('Connected to game server');
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        console.log('Disconnected from game server');
      });

      // Listen for game state updates
      newSocket.on('game:state:update', (data) => {
        setGameData(data);
      });

      // Listen for operation progress
      newSocket.on('operation:progress', (data) => {
        setOperations(prev => 
          prev.map(op => 
            op.id === data.operationId ? { ...op, progress: data.progress } : op
          )
        );
      });

      // Listen for operation completion
      newSocket.on('operation:complete', (data) => {
        setOperations(prev => 
          prev.map(op => 
            op.id === data.operationId ? { ...op, status: 'completed', result: data.result } : op
          )
        );
      });

      // Listen for incoming attacks
      newSocket.on('attack:incoming', (data) => {
        // Show notification about incoming attack
        console.log('Incoming attack:', data);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, token]);

  const startOperation = (type: string, targetId: string) => {
    if (socket) {
      socket.emit('operation:start', { type, targetId });
    }
  };

  const cancelOperation = (operationId: string) => {
    if (socket) {
      socket.emit('operation:cancel', { operationId });
    }
 };

  const joinChatChannel = (channel: string) => {
    if (socket) {
      socket.emit('chat:join', { channel });
    }
  };

  const leaveChatChannel = (channel: string) => {
    if (socket) {
      socket.emit('chat:leave', { channel });
    }
  };

  const sendMessage = (channel: string, message: string) => {
    if (socket) {
      socket.emit('chat:message', { channel, message });
    }
  };

  const value = {
    socket,
    connected,
    gameData,
    operations,
    startOperation,
    cancelOperation,
    joinChatChannel,
    leaveChatChannel,
    sendMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}