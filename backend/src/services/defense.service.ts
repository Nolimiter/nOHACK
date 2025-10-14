import { User, Defense, SecurityLog, Severity } from '@prisma/client';
import prisma from '../config/database';
import { calculateAttackDetection, updateDefenseStats } from '../utils/gameLogic';

export class DefenseService {
  /**
   * Get user's defense settings
   */
  static async getDefenseSettings(userId: string): Promise<Defense | null> {
    return prisma.defense.findUnique({
      where: { userId },
    });
  }

  /**
   * Update user's defense settings
   */
  static async updateDefenseSettings(
    userId: string,
    firewallLevel: number,
    idsLevel: number,
    honeypotActive: boolean,
    backupFrequency: string
  ): Promise<Defense> {
    // Validate inputs
    if (firewallLevel < 1 || firewallLevel > 10) {
      throw new Error('Firewall level must be between 1 and 10');
    }

    if (idsLevel < 0 || idsLevel > 10) {
      throw new Error('IDS level must be between 0 and 10');
    }

    // Get user to check if they have enough resources
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate upgrade costs
    const firewallUpgradeCost = (firewallLevel - user.level) * 50; // Example cost calculation
    const idsUpgradeCost = (idsLevel - user.level) * 75; // Example cost calculation

    const totalCost = Math.max(0, firewallUpgradeCost) + Math.max(0, idsUpgradeCost);

    if (user.bitcoins < totalCost) {
      throw new Error('Insufficient funds to upgrade defense systems');
    }

    // Deduct costs
    if (totalCost > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { bitcoins: { decrement: totalCost } },
      });
    }

    // Create or update defense settings
    let defense = await prisma.defense.findUnique({
      where: { userId },
    });

    if (defense) {
      defense = await prisma.defense.update({
        where: { userId },
        data: {
          firewallLevel,
          idsLevel,
          honeypotActive,
          backupFrequency,
        },
      });
    } else {
      defense = await prisma.defense.create({
        data: {
          userId,
          firewallLevel,
          idsLevel,
          honeypotActive,
          backupFrequency,
        },
      });
    }

    // Update user's defense-related stats
    await updateDefenseStats(userId, firewallLevel, idsLevel);

    return defense;
  }

  /**
   * Detect an incoming attack
   */
  static async detectAttack(
    userId: string,
    attackerId: string,
    attackType: string
  ): Promise<boolean> {
    // Get user's defense settings
    const defense = await this.getDefenseSettings(userId);
    if (!defense) {
      // If no defense settings exist, create default ones
      await prisma.defense.create({
        data: {
          userId,
          firewallLevel: 1,
          idsLevel: 0,
          honeypotActive: false,
          backupFrequency: 'daily',
        },
      });
      
      return false; // Default defense won't detect the attack
    }

    // Get user and attacker data
    const [user, attacker] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: attackerId } }),
    ]);

    if (!user || !attacker) {
      throw new Error('User or attacker not found');
    }

    // Calculate detection probability based on defense levels and other factors
    const detectionProbability = calculateAttackDetection(
      defense,
      user,
      attacker,
      attackType
    );

    // Determine if attack is detected
    const isDetected = Math.random() * 100 <= detectionProbability;

    // Log the detection event
    await prisma.securityLog.create({
      data: {
        userId,
        eventType: isDetected ? 'attack_detected' : 'attack_attempt',
        severity: isDetected ? Severity.WARNING : Severity.INFO,
        message: isDetected 
          ? `Attack from user ${attacker.username} was detected` 
          : `Attack from user ${attacker.username} was not detected`,
        metadata: {
          attackerId,
          attackType,
          detectionProbability,
          isDetected,
        },
      },
    });

    return isDetected;
  }

 /**
   * Get user's security logs
   */
  static async getSecurityLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SecurityLog[]> {
    return prisma.securityLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get user's security status summary
   */
  static async getSecurityStatus(userId: string): Promise<{
    firewallLevel: number;
    idsLevel: number;
    honeypotActive: boolean;
    lastAttack: Date | null;
    attackDetectionRate: number;
    securityScore: number;
  }> {
    // Get defense settings
    const defense = await this.getDefenseSettings(userId);
    if (!defense) {
      return {
        firewallLevel: 1,
        idsLevel: 0,
        honeypotActive: false,
        lastAttack: null,
        attackDetectionRate: 0,
        securityScore: 0,
      };
    }

    // Get last attack from logs
    const lastAttack = await prisma.securityLog.findFirst({
      where: {
        userId,
        eventType: { contains: 'attack' },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Calculate attack detection rate (simplified)
    const allAttacks = await prisma.securityLog.count({
      where: {
        userId,
        eventType: { contains: 'attack' },
      },
    });

    const detectedAttacks = await prisma.securityLog.count({
      where: {
        userId,
        eventType: 'attack_detected',
      },
    });

    const attackDetectionRate = allAttacks > 0 
      ? (detectedAttacks / allAttacks) * 100 
      : 0;

    // Calculate security score based on defense levels and detection rate
    const securityScore = Math.min(100, 
      (defense.firewallLevel * 10) + 
      (defense.idsLevel * 15) + 
      (attackDetectionRate * 0.2) +
      (defense.honeypotActive ? 10 : 0)
    );

    return {
      firewallLevel: defense.firewallLevel,
      idsLevel: defense.idsLevel,
      honeypotActive: defense.honeypotActive,
      lastAttack: lastAttack?.timestamp || null,
      attackDetectionRate,
      securityScore: Math.round(securityScore),
    };
  }

  /**
   * Respond to an attack
   */
  static async respondToAttack(
    userId: string,
    attackId: string,
    responseAction: 'block' | 'trace' | 'counter_attack' | 'ignore'
  ): Promise<void> {
    // In a real implementation, this would contain logic for responding to attacks
    // For now, we'll just log the response action
    
    await prisma.securityLog.create({
      data: {
        userId,
        eventType: 'incident_response',
        severity: Severity.INFO,
        message: `Response to attack ${attackId} was: ${responseAction}`,
        metadata: {
          attackId,
          responseAction,
        },
      },
    });

    // Additional response logic would go here
    switch (responseAction) {
      case 'block':
        // Implement IP blocking logic
        break;
      case 'trace':
        // Implement attack tracing logic
        break;
      case 'counter_attack':
        // Implement authorized counter-attack logic (if game allows it)
        break;
      case 'ignore':
        // Sometimes ignoring is the right response
        break;
    }
  }
}