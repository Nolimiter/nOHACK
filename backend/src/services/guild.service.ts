import { User, Guild, GuildMember, GuildRole, Prisma } from '@prisma/client';
import prisma from '../config/database';

export interface CreateGuildInput {
  name: string;
  tag: string;
  description?: string;
  leaderId: string;
}

export interface UpdateGuildInput {
  name?: string;
  tag?: string;
  description?: string;
  isRecruiting?: boolean;
}

export class GuildService {
  /**
   * Create a new guild
   */
  static async createGuild(input: CreateGuildInput): Promise<Guild> {
    // Check if guild name or tag already exists
    const existingGuild = await prisma.guild.findFirst({
      where: {
        OR: [
          { name: input.name },
          { tag: input.tag },
        ],
      },
    });

    if (existingGuild) {
      throw new Error('Guild with this name or tag already exists');
    }

    // Check if leader exists and doesn't already have a guild
    const leader = await prisma.user.findUnique({
      where: { id: input.leaderId },
    });

    if (!leader) {
      throw new Error('Leader not found');
    }

    if (leader.guildId) {
      throw new Error('User already belongs to a guild');
    }

    // Create the guild
    const guild = await prisma.guild.create({
      data: {
        name: input.name,
        tag: input.tag,
        description: input.description,
        leaderId: input.leaderId,
      },
    });

    // Create the guild membership for the leader
    await prisma.guildMember.create({
      data: {
        userId: input.leaderId,
        guildId: guild.id,
        role: GuildRole.LEADER,
      },
    });

    // Update the leader's guildId
    await prisma.user.update({
      where: { id: input.leaderId },
      data: { guildId: guild.id },
    });

    // Return the created guild
    const createdGuild = await prisma.guild.findUnique({
      where: { id: guild.id },
    });
    
    if (!createdGuild) {
      throw new Error('Failed to retrieve created guild');
    }
    
    return createdGuild;
  }

  /**
   * Get a guild by ID
   */
  static async getGuildById(guildId: string): Promise<Guild | null> {
    return prisma.guild.findUnique({
      where: { id: guildId },
      include: {
        guildMembers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                level: true,
                avatar: true,
              },
            },
          },
          orderBy: { role: 'asc' },
        },
      },
    });
  }

  /**
   * Get a guild by name
   */
  static async getGuildByName(guildName: string): Promise<Guild | null> {
    return prisma.guild.findUnique({
      where: { name: guildName },
      include: {
        guildMembers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                level: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
 }

  /**
   * Update guild information
   */
  static async updateGuild(guildId: string, userId: string, input: UpdateGuildInput): Promise<Guild | null> {
    // Check if user is the guild leader
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new Error('Guild not found');
    }

    if (guild.leaderId !== userId) {
      throw new Error('Only the guild leader can update guild information');
    }

    // Update the guild
    return prisma.guild.update({
      where: { id: guildId },
      data: {
        name: input.name,
        tag: input.tag,
        description: input.description,
        isRecruiting: input.isRecruiting,
      },
    });
  }

  /**
   * Delete a guild
   */
  static async deleteGuild(guildId: string, userId: string): Promise<void> {
    // Check if user is the guild leader
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new Error('Guild not found');
    }

    if (guild.leaderId !== userId) {
      throw new Error('Only the guild leader can delete the guild');
    }

    // Remove guild reference from all members
    await prisma.user.updateMany({
      where: { guildId },
      data: { guildId: null },
    });

    // Delete the guild
    await prisma.guild.delete({
      where: { id: guildId },
    });
  }

 /**
   * Invite a user to the guild
   */
  static async inviteUserToGuild(guildId: string, inviterId: string, targetUserId: string): Promise<void> {
    // Check if inviter has permission (leader or officer)
    const inviterMember = await prisma.guildMember.findUnique({
      where: {
        userId_guildId: {
          userId: inviterId,
          guildId,
        },
      },
    });

    if (!inviterMember || (inviterMember.role !== 'LEADER' && inviterMember.role !== 'OFFICER')) {
      throw new Error('Insufficient permissions to invite users');
    }

    // Check if target user already belongs to a guild
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    if (targetUser.guildId) {
      throw new Error('Target user already belongs to a guild');
    }

    // Check if guild is full
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new Error('Guild not found');
    }

    const memberCount = await prisma.guildMember.count({
      where: { guildId },
    });

    if (memberCount >= guild.maxMembers) {
      throw new Error('Guild is full');
    }

    // In a real implementation, you would create an invitation record
    // For now, we'll just add the user directly (in a real app, you'd have an invite/accept flow)
    await prisma.guildMember.create({
      data: {
        userId: targetUserId,
        guildId,
        role: 'MEMBER', // New members start as regular members
      },
    });

    // Update the user's guildId
    await prisma.user.update({
      where: { id: targetUserId },
      data: { guildId },
    });
  }

  /**
   * Remove a user from the guild
   */
  static async removeUserFromGuild(guildId: string, removerId: string, targetUserId: string): Promise<void> {
    // Check if remover has permission (leader or officer, and can't remove leader)
    const removerMember = await prisma.guildMember.findUnique({
      where: {
        userId_guildId: {
          userId: removerId,
          guildId,
        },
      },
    });

    const targetMember = await prisma.guildMember.findUnique({
      where: {
        userId_guildId: {
          userId: targetUserId,
          guildId,
        },
      },
    });

    if (!removerMember || !targetMember) {
      throw new Error('User not found in guild');
    }

    // Only leader can remove anyone, officers can only remove members/recruits
    if (removerMember.role === 'OFFICER' && 
        (targetMember.role === 'LEADER' || targetMember.role === 'OFFICER')) {
      throw new Error('Insufficient permissions to remove this user');
    }

    // Leader cannot be removed (they must transfer leadership first)
    if (targetMember.role === 'LEADER') {
      throw new Error('Leader cannot be removed from guild');
    }

    // Remove the user from the guild
    await prisma.guildMember.delete({
      where: {
        userId_guildId: {
          userId: targetUserId,
          guildId,
        },
      },
    });

    // Update the user's guildId
    await prisma.user.update({
      where: { id: targetUserId },
      data: { guildId: null },
    });
  }

 /**
   * Transfer guild leadership
   */
  static async transferLeadership(guildId: string, currentLeaderId: string, newLeaderId: string): Promise<void> {
    // Check if the current user is the leader
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild || guild.leaderId !== currentLeaderId) {
      throw new Error('Only the guild leader can transfer leadership');
    }

    // Check if the new leader is a member of the guild
    const newLeaderMember = await prisma.guildMember.findUnique({
      where: {
        userId_guildId: {
          userId: newLeaderId,
          guildId,
        },
      },
    });

    if (!newLeaderMember) {
      throw new Error('New leader must be a member of the guild');
    }

    // Update the guild's leader and the member roles
    await prisma.$transaction([
      prisma.guild.update({
        where: { id: guildId },
        data: { leaderId: newLeaderId },
      }),
      prisma.guildMember.update({
        where: {
          userId_guildId: {
            userId: currentLeaderId,
            guildId,
          },
        },
        data: { role: 'OFFICER' }, // Former leader becomes an officer
      }),
      prisma.guildMember.update({
        where: {
          userId_guildId: {
            userId: newLeaderId,
            guildId,
          },
        },
        data: { role: 'LEADER' },
      }),
    ]);
  }

  /**
   * Get all recruiting guilds
   */
  static async getRecruitingGuilds(page: number, limit: number): Promise<{ guilds: Guild[]; total: number }> {
    const skip = (page - 1) * limit;

    const [guilds, total] = await Promise.all([
      prisma.guild.findMany({
        where: { isRecruiting: true },
        include: {
          guildMembers: {
            select: { id: true },
            take: 1, // Just to count members efficiently
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.guild.count({
        where: { isRecruiting: true },
      }),
    ]);

    // Add member count to each guild
    const guildsWithMemberCount = guilds.map(guild => ({
      ...guild,
      memberCount: guild.guildMembers.length,
    }));

    return { guilds: guildsWithMemberCount, total };
  }
}