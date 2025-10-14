import { Request, Response } from 'express';
import { GuildService } from '../services/guild.service';

export class GuildController {
  // Create a new guild
 static async createGuild(req: Request, res: Response): Promise<void> {
    try {
      const { name, tag, description } = req.body;
      const userId = (req as any).user.userId;

      const guild = await GuildService.createGuild({
        name,
        tag,
        description,
        leaderId: userId,
      });

      res.status(201).json({
        message: 'Guild created successfully',
        guild,
      });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }
      
      if (error.message.includes('not found') || error.message.includes('already belongs')) {
        res.status(400).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get a guild by ID
  static async getGuildById(req: Request, res: Response): Promise<void> {
    try {
      const { guildId } = req.params;

      const guild = await GuildService.getGuildById(guildId);

      if (!guild) {
        res.status(404).json({ error: 'Guild not found' });
        return;
      }

      res.status(200).json({ guild });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get a guild by name
 static async getGuildByName(req: Request, res: Response): Promise<void> {
    try {
      const { guildName } = req.params;

      const guild = await GuildService.getGuildByName(guildName);

      if (!guild) {
        res.status(404).json({ error: 'Guild not found' });
        return;
      }

      res.status(200).json({ guild });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update guild information
  static async updateGuild(req: Request, res: Response): Promise<void> {
    try {
      const { guildId } = req.params;
      const userId = (req as any).user.userId;
      const { name, tag, description, isRecruiting } = req.body;

      const updatedGuild = await GuildService.updateGuild(guildId, userId, {
        name,
        tag,
        description,
        isRecruiting,
      });

      if (!updatedGuild) {
        res.status(404).json({ error: 'Guild not found' });
        return;
      }

      res.status(200).json({
        message: 'Guild updated successfully',
        guild: updatedGuild,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message.includes('permissions')) {
        res.status(403).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete a guild
  static async deleteGuild(req: Request, res: Response): Promise<void> {
    try {
      const { guildId } = req.params;
      const userId = (req as any).user.userId;

      await GuildService.deleteGuild(guildId, userId);

      res.status(200).json({ message: 'Guild deleted successfully' });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message.includes('permissions')) {
        res.status(403).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Invite a user to the guild
  static async inviteUserToGuild(req: Request, res: Response): Promise<void> {
    try {
      const { guildId } = req.params;
      const userId = (req as any).user.userId; // The inviter
      const { targetUserId } = req.body;

      await GuildService.inviteUserToGuild(guildId, userId, targetUserId);

      res.status(200).json({ message: 'User invited to guild successfully' });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message.includes('permissions') || error.message.includes('already belongs') || error.message.includes('full')) {
        res.status(400).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Remove a user from the guild
  static async removeUserFromGuild(req: Request, res: Response): Promise<void> {
    try {
      const { guildId } = req.params;
      const userId = (req as any).user.userId; // The remover
      const { targetUserId } = req.body;

      await GuildService.removeUserFromGuild(guildId, userId, targetUserId);

      res.status(200).json({ message: 'User removed from guild successfully' });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message.includes('permissions') || error.message.includes('cannot be removed')) {
        res.status(403).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Transfer guild leadership
  static async transferLeadership(req: Request, res: Response): Promise<void> {
    try {
      const { guildId } = req.params;
      const currentLeaderId = (req as any).user.userId;
      const { newLeaderId } = req.body;

      await GuildService.transferLeadership(guildId, currentLeaderId, newLeaderId);

      res.status(200).json({ message: 'Guild leadership transferred successfully' });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message.includes('permissions') || error.message.includes('must be a member')) {
        res.status(403).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all recruiting guilds
  static async getRecruitingGuilds(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 10) {
        res.status(40).json({ error: 'Invalid pagination parameters' });
        return;
      }

      const { guilds, total } = await GuildService.getRecruitingGuilds(page, limit);

      res.status(200).json({
        guilds,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}