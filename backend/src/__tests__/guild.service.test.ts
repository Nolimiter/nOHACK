// Mock the database module BEFORE any imports
jest.mock('../config/database');

import { GuildService } from '../services/guild.service';
import { GuildRole } from '@prisma/client';
import { prisma } from '../config/database';

// Get mocked prisma
const mockPrisma = prisma as any;

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

      mockPrisma.guild.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.guild.create.mockResolvedValue(mockGuild);
      mockPrisma.guildMember.create.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        guildId: 'guild-1',
      });
      mockPrisma.guild.findUnique.mockResolvedValue(mockGuild);

      const result = await GuildService.createGuild(createInput);

      expect(result).toEqual(mockGuild);
      expect(mockPrisma.guild.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: 'Test Guild' },
            { tag: 'TG' },
          ],
        },
      });
     expect(mockPrisma.guildMember.create).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { guildId: 'guild-1' },
      });
    });

    it('should throw an error if guild name or tag already exists', async () => {
      mockPrisma.guild.findFirst.mockResolvedValue(mockGuild);

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
      mockPrisma.guild.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

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
      mockPrisma.guild.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
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

      mockPrisma.guild.findUnique.mockResolvedValue(mockGuildWithMembers);

      const result = await GuildService.getGuildById('guild-1');

      expect(result).toEqual(mockGuildWithMembers);
      expect(mockPrisma.guild.findUnique).toHaveBeenCalledWith({
        where: { id: 'guild-1' },
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

      mockPrisma.guild.findUnique.mockResolvedValue(mockGuildWithMembers);

      const result = await GuildService.getGuildByName('Test Guild');

      expect(result).toEqual(mockGuildWithMembers);
      expect(mockPrisma.guild.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Guild' },
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
    });
  });

  describe('updateGuild', () => {
    it('should update guild if user is leader', async () => {
      mockPrisma.guild.findUnique.mockResolvedValue(mockGuild);
      mockPrisma.guild.update.mockResolvedValue({
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
      expect(mockPrisma.guild.update).toHaveBeenCalledWith({
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

      mockPrisma.guild.findUnique.mockResolvedValue(guildWithDifferentLeader);

      await expect(
        GuildService.updateGuild('guild-1', 'user-1', {
          name: 'Updated Guild',
        })
      ).rejects.toThrow('Only the guild leader can update guild information');
    });
 });

  describe('deleteGuild', () => {
    it('should delete guild if user is leader', async () => {
      mockPrisma.guild.findUnique.mockResolvedValue(mockGuild);
      mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.guild.delete.mockResolvedValue(mockGuild);

      await GuildService.deleteGuild('guild-1', 'user-1');

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { guildId: 'guild-1' },
        data: { guildId: null },
      });
      expect(mockPrisma.guild.delete).toHaveBeenCalledWith({
        where: { id: 'guild-1' },
      });
    });

    it('should throw an error if user is not the leader', async () => {
      const guildWithDifferentLeader = {
        ...mockGuild,
        leaderId: 'user-2',
      };

      mockPrisma.guild.findUnique.mockResolvedValue(guildWithDifferentLeader);

      await expect(
        GuildService.deleteGuild('guild-1', 'user-1')
      ).rejects.toThrow('Only the guild leader can delete the guild');
    });
  });

 describe('getRecruitingGuilds', () => {
    it('should return recruiting guilds with pagination', async () => {
      const mockGuildsWithMembers = [{ ...mockGuild, guildMembers: [{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}, {id: '5'}] }];
      mockPrisma.guild.findMany.mockResolvedValue(mockGuildsWithMembers);
      mockPrisma.guild.count.mockResolvedValue(1);

      const result = await GuildService.getRecruitingGuilds(1, 10);

      expect(result).toEqual({
        guilds: [{ ...mockGuild, guildMembers: [{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}, {id: '5'}], memberCount: 5 }],
        total: 1,
      });
      expect(mockPrisma.guild.findMany).toHaveBeenCalledWith({
        where: { isRecruiting: true },
        include: {
          guildMembers: {
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