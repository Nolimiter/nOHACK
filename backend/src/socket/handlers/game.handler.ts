import { Server, Socket } from 'socket.io';
import { HackingService } from '../../services/hacking.service';
import { OperationType } from '@prisma/client';

export const handleGameEvents = (io: Server, socket: Socket) => {
  // Handle starting an operation
  socket.on('operation:start', async (data) => {
    try {
      const userId = (socket as any).user.userId;
      
      // Map frontend operation types to backend enum values
      const operationTypeMap: Record<string, string> = {
        'zero_day': 'ZERO_DAY',
        'ddos': 'DDOS',
        'sql_injection': 'SQL_INJECTION',
        'ransomware': 'RANSOMWARE'
      };
      
      const operationType = operationTypeMap[data.type] || data.type;
      
      // Validate operation type
      if (!Object.values(OperationType).includes(operationType as OperationType)) {
        socket.emit('error', 'Invalid operation type');
        return;
      }
      
      // Start the operation
      // For IP addresses, we'll specify 'ip' as the target type
      const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(data.targetId);
      const targetType = isIpAddress ? 'ip' : 'player';
      
      const operation = await HackingService.startOperation(
        userId,
        operationType as OperationType,
        data.targetId,
        targetType
      );
      
      // Emit success event
      socket.emit('operation:started', {
        success: true,
        operationId: operation.id,
        message: 'Operation started successfully'
      });
      
      // In a real implementation, you would also emit events to update progress
      // This would happen as the operation progresses in the background
    } catch (error: any) {
      socket.emit('error', error.message || 'Failed to start operation');
    }
  });
  
  // Handle canceling an operation
  socket.on('operation:cancel', async (data) => {
    try {
      const userId = (socket as any).user.userId;
      
      // Cancel the operation
      const operation = await HackingService.cancelOperation(data.operationId, userId);
      
      // Emit success event
      socket.emit('operation:cancelled', {
        success: true,
        operationId: operation.id,
        message: 'Operation cancelled successfully'
      });
    } catch (error: any) {
      socket.emit('error', error.message || 'Failed to cancel operation');
    }
 });
  
  // Handle requesting game state
 socket.on('game:state:request', async () => {
    try {
      const userId = (socket as any).user.userId;
      
      // Get user's operations
      const operations = await HackingService.getUserOperations(userId);
      
      // Emit game state
      socket.emit('game:state:update', {
        userId,
        operations,
        timestamp: new Date()
      });
    } catch (error: any) {
      socket.emit('error', error.message || 'Failed to get game state');
    }
  });
};