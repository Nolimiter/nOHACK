import { Request, Response } from 'express';
import { SocialService } from '../services/social.service';

export class SocialController {
  // Send a message to another user
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { receiverId, subject, body, attachments } = req.body;
      const senderId = (req as any).user.userId;

      const result = await SocialService.sendMessage({
        senderId,
        receiverId,
        subject,
        body,
        attachments,
      });

      if (result.success) {
        res.status(201).json({
          message: 'Message sent successfully',
          messageData: result.message,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's inbox
  static async getInbox(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 50) {
        res.status(40).json({ error: 'Invalid pagination parameters' });
        return;
      }

      const { messages, total } = await SocialService.getInbox(userId, page, limit);

      res.status(200).json({
        messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's sent messages
 static async getSentMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 50) {
        res.status(40).json({ error: 'Invalid pagination parameters' });
        return;
      }

      const { messages, total } = await SocialService.getSentMessages(userId, page, limit);

      res.status(200).json({
        messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Mark a message as read
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = (req as any).user.userId;

      const success = await SocialService.markAsRead(messageId, userId);

      if (success) {
        res.status(200).json({ message: 'Message marked as read' });
      } else {
        res.status(404).json({ error: 'Message not found or unauthorized' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete a message
  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = (req as any).user.userId;

      const success = await SocialService.deleteMessage(messageId, userId);

      if (success) {
        res.status(200).json({ message: 'Message deleted successfully' });
      } else {
        res.status(404).json({ error: 'Message not found or unauthorized' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send a friend request
 static async sendFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const { toUserId } = req.body;
      const fromUserId = (req as any).user.userId;

      const result = await SocialService.sendFriendRequest(fromUserId, toUserId);

      if (result.success) {
        res.status(201).json({
          message: 'Friend request sent successfully',
          friendship: result.friendship,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Accept a friend request
 static async acceptFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const { friendshipId } = req.params;
      const userId = (req as any).user.userId;

      const result = await SocialService.acceptFriendRequest(friendshipId, userId);

      if (result.success) {
        res.status(200).json({
          message: 'Friend request accepted successfully',
          friendship: result.friendship,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject a friend request
 static async rejectFriendRequest(req: Request, res: Response): Promise<void> {
    try {
      const { friendshipId } = req.params;
      const userId = (req as any).user.userId;

      const result = await SocialService.rejectFriendRequest(friendshipId, userId);

      if (result.success) {
        res.status(20).json({ message: 'Friend request rejected successfully' });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's friends
  static async getFriends(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const friends = await SocialService.getFriends(userId);

      res.status(20).json({ friends });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get pending friend requests for a user
  static async getPendingFriendRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const requests = await SocialService.getPendingFriendRequests(userId);

      res.status(200).json({ requests });
    } catch (error) {
      res.status(50).json({ error: 'Internal server error' });
    }
  }

  // Block a user
  static async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const { targetUserId } = req.body;
      const userId = (req as any).user.userId;

      const result = await SocialService.blockUser(userId, targetUserId);

      if (result.success) {
        res.status(20).json({ message: 'User blocked successfully' });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Unblock a user
  static async unblockUser(req: Request, res: Response): Promise<void> {
    try {
      const { targetUserId } = req.body;
      const userId = (req as any).user.userId;

      const result = await SocialService.unblockUser(userId, targetUserId);

      if (result.success) {
        res.status(200).json({ message: 'User unblocked successfully' });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}