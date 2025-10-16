import { User, Operation, OperationType, OperationStatus, Attack } from '@prisma/client';
import prisma from '../config/database';
import { calculateSuccessRate, calculateLoot, updatePlayerStats } from '../utils/gameLogic';
import SocketManager from '../socket/socket.manager';

export class HackingService {
  /**
   * Start a new hacking operation
   */
  static async startOperation(
    userId: string,
    type: OperationType,
    targetId: string,
    targetType: string = 'player'
  ): Promise<Operation> {
    // Get user data
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // For the hack page, we're targeting IP addresses which don't exist in our database
    // In a real implementation, you would validate the IP address and check if it's a valid target
    // For now, we'll simulate the target data since we're targeting IP addresses rather than users
    let target;
    if (targetType === 'player') {
      target = await prisma.user.findUnique({ where: { id: targetId } });
    } else if (targetType === 'npc') {
      target = await prisma.user.findFirst({ where: { username: targetId } }); // For NPC targets
    } else {
      // For IP addresses, we'll simulate a target since real IPs aren't users in the database
      // In a real game, you would have a different system for IP targets
      target = {
        id: `ip_${targetId}`, // Simulated ID for IP target
        bitcoins: Math.floor(Math.random() * 100) + 10, // Simulate some bitcoins on the target
        reputation: Math.floor(Math.random() * 100), // Simulate reputation
        // Add other properties as needed for success rate calculation
      } as any; // Cast as any since we're simulating
    }

    if (!user) {
      throw new Error('User not found');
    }

    if (!target) {
      throw new Error('Target not found');
    }

    // Check if user has enough resources for the operation
    const operationCost = this.getOperationCost(type);
    if (user.bitcoins < operationCost) {
      throw new Error('Insufficient funds to start operation');
    }

    // Calculate success rate
    // Note: For IP targets, we're using simulated target data which may affect success calculations
    const successRate = calculateSuccessRate(user, target, type);

    // Create operation record
    const operation = await prisma.operation.create({
      data: {
        userId,
        type,
        targetId,
        targetType,
        status: OperationStatus.IN_PROGRESS,
        progress: 0,
        startedAt: new Date(),
      },
    });

    // Deduct operation cost from user
    await prisma.user.update({
      where: { id: userId },
      data: { bitcoins: { decrement: operationCost } },
    });

    // Process the operation (this would typically be done in a background job)
    this.processOperation(operation.id, successRate, userId);

    return operation;
  }

  /**
   * Process an operation in the background
   */
  private static async processOperation(operationId: string, successRate: number, userId: string): Promise<void> {
    try {
      // Simulate operation progress over time
      const operation = await prisma.operation.findUnique({
        where: { id: operationId },
      });

      if (!operation) {
        throw new Error('Operation not found');
      }

      // Simulate progress updates
      const totalSteps = 10;
      const delay = 2000; // 2 seconds per step

      for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const progress = (i / totalSteps) * 100;
        
        await prisma.operation.update({
          where: { id: operationId },
          data: { progress },
        });

        // Emit progress update to the user via WebSocket
        SocketManager.emitToUser(userId, 'operation:progress', {
          operationId: operation.id,
          progress: progress
        });
      }

      // Determine if operation was successful based on success rate
      const isSuccessful = Math.random() * 100 <= successRate;

      // Calculate results
      let result: any = { success: isSuccessful };
      
      if (isSuccessful) {
        // Calculate loot based on target and operation type
        const loot = calculateLoot(operation.type, operation.targetId!);
        result.loot = loot;

        // Update user stats based on successful operation
        await updatePlayerStats(operation.userId, operation.type, true, loot);
      } else {
        // Update user stats for failed operation
        await updatePlayerStats(operation.userId, operation.type, false);
      }

      // Update operation status
      await prisma.operation.update({
        where: { id: operationId },
        data: {
          status: isSuccessful ? OperationStatus.COMPLETED : OperationStatus.FAILED,
          completedAt: new Date(),
          result,
        },
      });

      // Emit completion event to the user
      SocketManager.emitToUser(userId, 'operation:complete', {
        operationId: operation.id,
        success: isSuccessful,
        result: result
      });

      // If successful, create an attack record
      if (isSuccessful && operation.targetId) {
        await prisma.attack.create({
          data: {
            attackerId: operation.userId,
            defenderId: operation.targetId,
            type: operation.type,
            success: true,
            damage: this.calculateDamage(operation.type),
            loot: result.loot,
            timestamp: new Date(),
          },
        });
      }

    } catch (error) {
      console.error(`Error processing operation ${operationId}:`, error);
      
      // Update operation status to failed
      await prisma.operation.update({
        where: { id: operationId },
        data: {
          status: OperationStatus.FAILED,
          completedAt: new Date(),
          result: { 
            success: false, 
            error: (error instanceof Error) ? error.message : 'Unknown error occurred' 
          },
        },
      });

      // Emit completion event to the user even if the operation failed
      SocketManager.emitToUser(userId, 'operation:complete', {
        operationId: operationId,
        success: false,
        result: { 
          success: false, 
          error: (error instanceof Error) ? error.message : 'Unknown error occurred' 
        }
      });
    }
  }

 /**
   * Get the cost of an operation
   */
 private static getOperationCost(type: OperationType): number {
    const costMap: Record<OperationType, number> = {
      DDOS: 50,
      SQL_INJECTION: 30,
      RANSOMWARE: 100,
      BRUTE_FORCE: 20,
      SOCIAL_ENGINEERING: 25,
      PORT_SCAN: 5,
      MINING: 0, // Mining doesn't cost anything to start
      DATA_THEFT: 40,
      ZERO_DAY: 200, // Zero day is expensive
    };

    return costMap[type] || 10; // Default cost
  }

 /**
   * Calculate damage based on operation type
   */
  private static calculateDamage(type: OperationType): number {
    const damageMap: Record<OperationType, number> = {
      DDOS: 10,
      SQL_INJECTION: 15,
      RANSOMWARE: 25,
      BRUTE_FORCE: 5,
      SOCIAL_ENGINEERING: 12,
      PORT_SCAN: 1, // Port scan doesn't cause damage
      MINING: 0,
      DATA_THEFT: 20,
      ZERO_DAY: 30, // Zero day causes significant damage
    };

    return damageMap[type] || 5; // Default damage
  }

  /**
   * Get all operations for a user
   */
  static async getUserOperations(userId: string): Promise<Operation[]> {
    return prisma.operation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

 /**
   * Get an operation by ID
   */
  static async getOperationById(operationId: string): Promise<Operation | null> {
    return prisma.operation.findUnique({
      where: { id: operationId },
    });
  }

  /**
   * Cancel an operation (if still in progress)
   */
  static async cancelOperation(operationId: string, userId: string): Promise<Operation> {
    const operation = await prisma.operation.findUnique({
      where: { id: operationId },
    });

    if (!operation) {
      throw new Error('Operation not found');
    }

    if (operation.userId !== userId) {
      throw new Error('Unauthorized: Cannot cancel another user\'s operation');
    }

    if (operation.status !== OperationStatus.IN_PROGRESS) {
      throw new Error('Cannot cancel operation that is not in progress');
    }

    // Refund partial cost based on progress
    const refundAmount = this.getOperationCost(operation.type) * (1 - (operation.progress / 100));
    
    await prisma.user.update({
      where: { id: userId },
      data: { bitcoins: { increment: refundAmount } },
    });

    // Update operation status
    const updatedOperation = await prisma.operation.update({
      where: { id: operationId },
      data: {
        status: OperationStatus.CANCELLED,
        completedAt: new Date(),
        result: { success: false, cancelled: true },
      },
    });
    
    // Emit completion event to the user
    SocketManager.emitToUser(userId, 'operation:complete', {
      operationId: updatedOperation.id,
      success: false,
      result: { success: false, cancelled: true }
    });
    
    return updatedOperation;
  }
}