import { User, Operation, OperationType, OperationStatus, Attack } from '@prisma/client';
import prisma from '../config/database';
import { calculateSuccessRate, calculateLoot, updatePlayerStats } from '../utils/gameLogic';

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
    // Get user and target data
    const [user, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      targetType === 'player' 
        ? prisma.user.findUnique({ where: { id: targetId } }) 
        : prisma.user.findFirst({ where: { username: targetId } }) // For NPC targets
    ]);

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
    this.processOperation(operation.id, successRate);

    return operation;
  }

  /**
   * Process an operation in the background
   */
  private static async processOperation(operationId: string, successRate: number): Promise<void> {
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

        // In a real implementation, you would emit progress updates via WebSocket here
      }

      // Determine if operation was successful based on success rate
      const isSuccessful = Math.random() * 100 <= successRate;

      // Calculate results
      let result: any = { success: isSuccessful };
      
      if (isSuccessful) {
        // Calculate loot based on target and operation type
        const loot = calculateLoot(operation.type, operation.targetId);
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

      // If successful, create an attack record
      if (isSuccessful) {
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
          result: { success: false, error: error.message },
        },
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
    return prisma.operation.update({
      where: { id: operationId },
      data: {
        status: OperationStatus.CANCELLED,
        completedAt: new Date(),
        result: { success: false, cancelled: true },
      },
    });
  }
}