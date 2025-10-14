import { GuildService } from '../services/guild.service';
import { prisma } from '../config/database';
import { GuildRole } from '@prisma/client';

// Mock the database
jest.mock('../config/database', () => ({
  prisma: {
    guild: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    guildMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('GuildService', () => {
  const mockGuild = {
    id: 'guild-1',
    name: 'Test Guild',
    tag: 'TG',
    description: 'A test guild',
    leaderId: 'user-1',
    isRecruiting: true,
    maxMembers: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

 const mockUser = {
    id: 'user-1',
    username: 'testuser',
    guildId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGuild', () => {
    it('should create a new guild successfully', async () => {
      const createInput = {
        name: 'Test Guild',
        tag: 'TG',
        description: 'A test guild',
        leaderId: 'user-1',
      };

      (prisma.guild.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.guild.create as jest.Mock).mockResolvedValue(mockGuild);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        guildId: 'guild-1',
      });

      const result = await GuildService.createGuild(createInput);

      expect(result).toEqual(mockGuild);
      expect(prisma.guild.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: 'Test Guild' },
            { tag: 'TG' },
          ],
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { guildId: 'guild-1' },
      });
    });

    it('should throw an error if guild name or tag already exists', async () => {
      (prisma.guild.findFirst as jest.Mock).mockResolvedValue(mockGuild);

      await expect(
        GuildService.createGuild({
          name: 'Test Guild',
          tag: 'TG',
          description: 'A test guild',
          leaderId: 'user-1',
        })
      ).rejects.toThrow('Guild with this name or tag already exists');
    });

    it('should throw an error if leader does not exist', async () => {
      (prisma.guild.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        GuildService.createGuild({
          name: 'Test Guild',
          tag: 'TG',
          description: 'A test guild',
          leaderId: 'user-1',
        })
      ).rejects.toThrow('Leader not found');
    });

    it('should throw an error if user already belongs to a guild', async () => {
      (prisma.guild.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        guildId: 'existing-guild',
      });

      await expect(
        GuildService.createGuild({
          name: 'Test Guild',
          tag: 'TG',
          description: 'A test guild',
          leaderId: 'user-1',
        })
      ).rejects.toThrow('User already belongs to a guild');
    });
 });

  describe('getGuildById', () => {
    it('should return guild with members', async () => {
      const mockGuildWithMembers = {
        ...mockGuild,
        members: [
          {
            id: 'member-1',
            userId: 'user-1',
            role: GuildRole.LEADER,
            user: {
              id: 'user-1',
              username: 'testuser',
              level: 10,
              avatar: 'avatar-url',
            },
          },
        ],
      };

      (prisma.guild.findUnique as jest.Mock).mockResolvedValue(mockGuildWithMembers);

      const result = await GuildService.getGuildById('guild-1');

      expect(result).toEqual(mockGuildWithMembers);
      expect(prisma.guild.findUnique).toHaveBeenCalledWith({
        where: { id: 'guild-1' },
        include: {
          members: {
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
    });
  });

  describe('getGuildByName', () => {
    it('should return guild by name with members', async () => {
      const mockGuildWithMembers = {
        ...mockGuild,
        members: [
          {
            id: 'member-1',
            userId: 'user-1',
            role: GuildRole.LEADER,
            user: {
              id: 'user-1',
              username: 'testuser',
              level: 10,
              avatar: 'avatar-url',
            },
          },
        ],
      };

      (prisma.guild.findUnique as jest.Mock).mockResolvedValue(mockGuildWithMembers);

      const result = await GuildService.getGuildByName('Test Guild');

      expect(result).toEqual(mockGuildWithMembers);
      expect(prisma.guild.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Guild' },
        include: {
          members: {
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
    });
  });

  describe('updateGuild', () => {
    it('should update guild if user is leader', async () => {
      (prisma.guild.findUnique as jest.Mock).mockResolvedValue(mockGuild);
      (prisma.guild.update as jest.Mock).mockResolvedValue({
        ...mockGuild,
        name: 'Updated Guild',
      });

      const result = await GuildService.updateGuild('guild-1', 'user-1', {
        name: 'Updated Guild',
      });

      expect(result).toEqual({
        ...mockGuild,
        name: 'Updated Guild',
      });
      expect(prisma.guild.update).toHaveBeenCalledWith({
        where: { id: 'guild-1' },
        data: {
          name: 'Updated Guild',
          tag: undefined,
          description: undefined,
          isRecruiting: undefined,
        },
      });
    });

    it('should throw an error if user is not the leader', async () => {
      const guildWithDifferentLeader = {
        ...mockGuild,
        leaderId: 'user-2',
      };

      (prisma.guild.findUnique as jest.Mock).mockResolvedValue(guildWithDifferentLeader);

      await expect(
        GuildService.updateGuild('guild-1', 'user-1', {
          name: 'Updated Guild',
        })
      ).rejects.toThrow('Only the guild leader can update guild information');
    });
 });

  describe('deleteGuild', () => {
    it('should delete guild if user is leader', async () => {
      (prisma.guild.findUnique as jest.Mock).mockResolvedValue(mockGuild);
      (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.guild.delete as jest.Mock).mockResolvedValue(mockGuild);

      await GuildService.deleteGuild('guild-1', 'user-1');

      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { guildId: 'guild-1' },
        data: { guildId: null },
      });
      expect(prisma.guild.delete).toHaveBeenCalledWith({
        where: { id: 'guild-1' },
      });
    });

    it('should throw an error if user is not the leader', async () => {
      const guildWithDifferentLeader = {
        ...mockGuild,
        leaderId: 'user-2',
      };

      (prisma.guild.findUnique as jest.Mock).mockResolvedValue(guildWithDifferentLeader);

      await expect(
        GuildService.deleteGuild('guild-1', 'user-1')
      ).rejects.toThrow('Only the guild leader can delete the guild');
    });
  });

 describe('getRecruitingGuilds', () => {
    it('should return recruiting guilds with pagination', async () => {
      const mockGuilds = [mockGuild];
      (prisma.guild.findMany as jest.Mock).mockResolvedValue(mockGuilds);
      (prisma.guild.count as jest.Mock).mockResolvedValue(1);
      (prisma.guildMember.count as jest.Mock).mockResolvedValue(5);

      const result = await GuildService.getRecruitingGuilds(1, 10);

      expect(result).toEqual({
        guilds: [{ ...mockGuild, memberCount: 5 }],
        total: 1,
      });
      expect(prisma.guild.findMany).toHaveBeenCalledWith({
        where: { isRecruiting: true },
        include: {
          members: {
            select: { id: true },
            take: 1,
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});