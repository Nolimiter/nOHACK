import { User, OperationType, Item, Attack, Defense } from '@prisma/client';
import prisma from '../config/database';

/**
 * Calculate the success rate of an operation based on attacker and target stats
 */
export function calculateSuccessRate(
  attacker: User,
  target: User,
  operationType: OperationType
): number {
  // Base success rate varies by operation type
  let baseRate: number;
 switch (operationType) {
    case OperationType.DDOS:
      baseRate = 70;
      break;
    case OperationType.SQL_INJECTION:
      baseRate = 60;
      break;
    case OperationType.RANSOMWARE:
      baseRate = 40;
      break;
    case OperationType.BRUTE_FORCE:
      baseRate = 50;
      break;
    case OperationType.SOCIAL_ENGINEERING:
      baseRate = 55;
      break;
    case OperationType.PORT_SCAN:
      baseRate = 90;
      break;
    case OperationType.DATA_THEFT:
      baseRate = 45;
      break;
    case OperationType.ZERO_DAY:
      baseRate = 80; // Zero day has high success rate since it's unknown
      break;
    default:
      baseRate = 50;
  }

 // Calculate attacker skill factor (based on level and experience)
  const attackerSkillFactor = (attacker.level * 2) + (attacker.experience / 1000);

  // Calculate target defense factor
 const targetDefense = target.level * 2;
  
  // Get target's defense settings if they exist
  const targetDefenseSettings = prisma.defense.findUnique({
    where: { userId: target.id },
  });

  // For now, we'll calculate it separately since we can't await in this function
  // In a real implementation, this function would be async
  const defenseFactor = target.level * 1.5;

  // Calculate success rate with factors
  let successRate = baseRate + (attackerSkillFactor * 0.5) - (defenseFactor * 0.3);

  // Ensure success rate is between 10% and 90%
  successRate = Math.max(10, Math.min(90, successRate));

  return successRate;
}

/**
 * Calculate the loot obtained from a successful operation
 */
export function calculateLoot(operationType: OperationType, targetId: string): any {
  // In a real implementation, this would fetch the target's data and calculate
  // loot based on their resources, but for now we'll return a mock value
  const loot: any = {
    bitcoins: 0,
    items: [],
    data: {},
  };

  switch (operationType) {
    case OperationType.DDOS:
      // DDoS typically doesn't yield direct loot but might affect target's resources
      loot.bitcoins = Math.floor(Math.random() * 10) + 5; // Small reward for disruption
      break;
    case OperationType.SQL_INJECTION:
      loot.bitcoins = Math.floor(Math.random() * 100) + 50;
      loot.data = { 
        credentials: Math.random() > 0.5 ? true : false,
        personalInfo: Math.random() > 0.3 ? true : false 
      };
      break;
    case OperationType.RANSOMWARE:
      loot.bitcoins = Math.floor(Math.random() * 500) + 200; // Higher reward but riskier
      break;
    case OperationType.BRUTE_FORCE:
      loot.bitcoins = Math.floor(Math.random() * 75) + 25;
      loot.items = Math.random() > 0.7 ? [{ id: 'password-db', name: 'Password Database', value: 100 }] : [];
      break;
    case OperationType.DATA_THEFT:
      loot.bitcoins = Math.floor(Math.random() * 200) + 100;
      loot.data = { 
        sensitiveData: Math.random() > 0.6 ? true : false,
        financialInfo: Math.random() > 0.4 ? true : false 
      };
      break;
    case OperationType.PORT_SCAN:
      // Port scans don't yield loot but provide information
      loot.data = { 
        openPorts: [22, 80, 443], // Mock open ports
        services: ['SSH', 'HTTP', 'HTTPS']
      };
      break;
    case OperationType.ZERO_DAY:
      loot.bitcoins = Math.floor(Math.random() * 1000) + 500; // High reward for zero day
      loot.data = {
        zeroDayExploit: true,
        systemAccess: Math.random() > 0.8 ? true : false,
        sensitiveFiles: Math.floor(Math.random() * 5) + 1
      };
      break;
    default:
      loot.bitcoins = Math.floor(Math.random() * 50) + 10;
  }

  return loot;
}

/**
 * Update player stats after a successful operation
 */
export async function updatePlayerStats(
  userId: string,
  operationType: OperationType,
  success: boolean,
  loot?: any
): Promise<void> {
  if (!success) {
    // For failed operations, we might decrease reputation or apply other penalties
    await prisma.user.update({
      where: { id: userId },
      data: {
        reputation: { decrement: 1 }, // Small reputation penalty for failed attempts
      },
    });
    return;
  }

  // For successful operations, update stats
  const xpGain = getExperienceGain(operationType);
  const repGain = getReputationGain(operationType);

  await prisma.user.update({
    where: { id: userId },
    data: {
      experience: { increment: xpGain },
      reputation: { increment: repGain },
      bitcoins: loot?.bitcoins ? { increment: loot.bitcoins } : undefined,
    },
  });

  // Check if user leveled up
  await checkLevelUp(userId);
}

/**
 * Check if a user has leveled up and update accordingly
 */
async function checkLevelUp(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, experience: true },
  });

  if (!user) return;

  // Calculate required XP for next level (simplified formula)
  const requiredXpForNextLevel = user.level * 100;

  if (user.experience >= requiredXpForNextLevel) {
    // Level up the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        level: { increment: 1 },
        experience: { decrement: requiredXpForNextLevel },
      },
    });

    // Potentially award bonus items or skills for leveling up
  }
}

/**
 * Get experience gain for an operation type
 */
function getExperienceGain(operationType: OperationType): number {
  const xpMap: Record<OperationType, number> = {
    DDOS: 10,
    SQL_INJECTION: 25,
    RANSOMWARE: 50,
    BRUTE_FORCE: 15,
    SOCIAL_ENGINEERING: 30,
    PORT_SCAN: 5,
    MINING: 20,
    DATA_THEFT: 40,
    ZERO_DAY: 100, // Zero day gives high XP
  };

  return xpMap[operationType] || 10;
}

/**
 * Get reputation gain for an operation type
 */
function getReputationGain(operationType: OperationType): number {
  const repMap: Record<OperationType, number> = {
    DDOS: 2,
    SQL_INJECTION: 5,
    RANSOMWARE: 8,
    BRUTE_FORCE: 3,
    SOCIAL_ENGINEERING: 6,
    PORT_SCAN: 1,
    MINING: 4,
    DATA_THEFT: 7,
    ZERO_DAY: 15, // Zero day gives high reputation
  };

  return repMap[operationType] || 2;
}

/**
 * Calculate attack detection probability
 */
export function calculateAttackDetection(
  defense: Defense,
  user: User,
  attacker: User,
  attackType: string
): number {
  // Base detection rate based on defense levels
  let detectionRate = (defense.firewallLevel * 5) + (defense.idsLevel * 7);

  // Adjust based on the type of attack
  switch (attackType) {
    case 'DDOS':
      detectionRate += defense.firewallLevel * 10; // Firewalls are very effective against DDoS
      break;
    case 'SQL_INJECTION':
      detectionRate += defense.idsLevel * 15; // IDS is very effective against SQL injection
      break;
    case 'BRUTE_FORCE':
      detectionRate += defense.firewallLevel * 8; // Firewalls help with blocking brute force
      break;
    default:
      detectionRate += defense.idsLevel * 5;
  }

  // Adjust based on user's level vs attacker's level
  // Higher level attackers are harder to detect
  detectionRate -= (attacker.level - user.level) * 2;

  // Ensure detection rate is between 0% and 95%
  detectionRate = Math.max(0, Math.min(95, detectionRate));

  return detectionRate;
}

/**
 * Update defense-related stats
 */
export async function updateDefenseStats(
  userId: string,
  firewallLevel: number,
  idsLevel: number
): Promise<void> {
  // In a real implementation, we might track additional defense metrics
  // For now, we'll just update the defense levels in the user record if needed
  await prisma.user.update({
    where: { id: userId },
    data: {
      // We could store additional defense metrics here if needed
      // For example, a composite defense score
    },
  });
}

/**
 * Update market statistics
 */
export async function updateMarketStats(
  itemId: string,
  action: 'listing_created' | 'item_sold',
  value: number
): Promise<void> {
  // In a real implementation, we would update market statistics
  // This could include tracking price trends, volume, etc.
  // For now, we'll just log the action
 console.log(`Market action: ${action} for item ${itemId} with value ${value}`);
}

/**
 * Calculate market price for an item based on supply, demand, and other factors
 */
export function calculateMarketPrice(itemId: string, basePrice: number, quantityAvailable: number, recentSales: number): number {
  // Base price is affected by supply and demand
  let price = basePrice;
  
  // If there's low supply (few items available), increase price
  if (quantityAvailable < 5) {
    price *= 1.5; // 50% increase for low supply
  } else if (quantityAvailable < 10) {
    price *= 1.2; // 20% increase for medium-low supply
  } else if (quantityAvailable > 50) {
    price *= 0.9; // 10% decrease for high supply
  }
  
  // If there have been many recent sales, price might be trending up
  if (recentSales > 20) {
    price *= 1.1; // 10% increase for high demand
  } else if (recentSales > 10) {
    price *= 1.05; // 5% increase for moderate demand
  } else if (recentSales < 3) {
    price *= 0.85; // 15% decrease for low demand
  }
  
  // Ensure price doesn't become too low
  return Math.max(basePrice * 0.1, price);
}