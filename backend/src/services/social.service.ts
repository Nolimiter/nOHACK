import { User, Message, Friendship, FriendshipStatus } from '@prisma/client';
import prisma from '../config/database';

export interface CreateMessageInput {
  senderId: string;
  receiverId: string;
  subject?: string;
  body: string;
  attachments?: any; // In a real app, this would be more structured
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

export class SocialService {
  /**
   * Send a message to another user
   */
 static async sendMessage(input: CreateMessageInput): Promise<SendMessageResponse> {
    try {
      // Verify sender and receiver exist
      const [sender, receiver] = await Promise.all([
        prisma.user.findUnique({ where: { id: input.senderId } }),
        prisma.user.findUnique({ where: { id: input.receiverId } }),
      ]);

      if (!sender || !receiver) {
        return {
          success: false,
          error: 'Sender or receiver not found',
        };
      }

      // Check if users are friends (optional - depending on game rules)
      // For now, we'll allow messaging between any users
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userFromId: input.senderId, userToId: input.receiverId },
            { userFromId: input.receiverId, userToId: input.senderId },
          ],
        },
      });

      // In a real implementation, you might only allow messaging between friends
      // or implement a reputation/muting system
      const message = await prisma.message.create({
        data: {
          senderId: input.senderId,
          receiverId: input.receiverId,
          subject: input.subject,
          body: input.body,
          attachments: input.attachments,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
 }

  /**
   * Get user's inbox
   */
  static async getInbox(userId: string, page: number, limit: number): Promise<{
    messages: Message[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { receiverId: userId },
      }),
    ]);

    return { messages, total };
  }

  /**
   * Get user's sent messages
   */
 static async getSentMessages(userId: string, page: number, limit: number): Promise<{
    messages: Message[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { senderId: userId },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { senderId: userId },
      }),
    ]);

    return { messages, total };
  }

  /**
   * Mark a message as read
   */
  static async markAsRead(messageId: string, userId: string): Promise<boolean> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return false;
      }

      // Ensure the user is the receiver
      if (message.receiverId !== userId) {
        return false;
      }

      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date() },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return false;
      }

      // Ensure the user is either the sender or receiver
      if (message.senderId !== userId && message.receiverId !== userId) {
        return false;
      }

      await prisma.message.delete({
        where: { id: messageId },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send a friend request
   */
  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<{
    success: boolean;
    friendship?: Friendship;
    error?: string;
  }> {
    try {
      // Verify both users exist
      const [userFrom, userTo] = await Promise.all([
        prisma.user.findUnique({ where: { id: fromUserId } }),
        prisma.user.findUnique({ where: { id: toUserId } }),
      ]);

      if (!userFrom || !userTo) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check if users are trying to add themselves
      if (fromUserId === toUserId) {
        return {
          success: false,
          error: 'Cannot add yourself as a friend',
        };
      }

      // Check if a friendship record already exists
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userFromId: fromUserId, userToId: toUserId },
            { userFromId: toUserId, userToId: fromUserId },
          ],
        },
      });

      if (existingFriendship) {
        // If there's already a friendship, return appropriate message
        if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
          return {
            success: false,
            error: 'Users are already friends',
          };
        } else if (existingFriendship.status === FriendshipStatus.PENDING) {
          // If it's the same user sending again, inform them
          if (existingFriendship.userFromId === fromUserId) {
            return {
              success: false,
              error: 'Friend request already sent',
            };
          } else {
            // If the other user already sent a request, accept it
            const updatedFriendship = await prisma.friendship.update({
              where: { id: existingFriendship.id },
              data: {
                status: FriendshipStatus.ACCEPTED,
                acceptedAt: new Date(),
              },
              include: {
                userFrom: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
                userTo: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            });

            return {
              success: true,
              friendship: updatedFriendship,
            };
          }
        } else if (existingFriendship.status === FriendshipStatus.BLOCKED) {
          return {
            success: false,
            error: 'Cannot send friend request to blocked user',
          };
        }
      }

      // Create the friendship request
      const friendship = await prisma.friendship.create({
        data: {
          userFromId: fromUserId,
          userToId: toUserId,
          status: FriendshipStatus.PENDING,
        },
        include: {
          userFrom: {
            select: {
              id: true,
              username: true,
            },
          },
          userTo: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        friendship,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send friend request',
      };
    }
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(friendshipId: string, userId: string): Promise<{
    success: boolean;
    friendship?: Friendship;
    error?: string;
  }> {
    try {
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        return {
          success: false,
          error: 'Friendship request not found',
        };
      }

      // Ensure the user is the one receiving the request
      if (friendship.userToId !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      if (friendship.status !== FriendshipStatus.PENDING) {
        return {
          success: false,
          error: 'Friendship request already processed',
        };
      }

      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: {
          status: FriendshipStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        include: {
          userFrom: {
            select: {
              id: true,
              username: true,
            },
          },
          userTo: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return {
        success: true,
        friendship: updatedFriendship,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to accept friend request',
      };
    }
  }

  /**
   * Reject a friend request
   */
  static async rejectFriendRequest(friendshipId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        return {
          success: false,
          error: 'Friendship request not found',
        };
      }

      // Ensure the user is the one receiving the request
      if (friendship.userToId !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      if (friendship.status !== FriendshipStatus.PENDING) {
        return {
          success: false,
          error: 'Friendship request already processed',
        };
      }

      await prisma.friendship.update({
        where: { id: friendshipId },
        data: {
          status: FriendshipStatus.BLOCKED, // We'll mark as blocked to prevent future requests
        },
      });

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to reject friend request',
      };
    }
  }

 /**
   * Get user's friends
   */
  static async getFriends(userId: string): Promise<Array<{ id: string; username: string; level: number; avatar: string | null }>> {
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { userFromId: userId },
              { userToId: userId },
            ],
          },
          { status: FriendshipStatus.ACCEPTED },
        ],
      },
      include: {
        userFrom: {
          select: {
            id: true,
            username: true,
            level: true,
            avatar: true,
          },
        },
        userTo: {
          select: {
            id: true,
            username: true,
            level: true,
            avatar: true,
          },
        },
      },
    });

    // Return the friends (not the user themselves)
    return friendships.map(f => 
      f.userFrom.id === userId ? f.userTo : f.userFrom
    );
  }

  /**
   * Get pending friend requests for a user
   */
  static async getPendingFriendRequests(userId: string): Promise<Friendship[]> {
    return prisma.friendship.findMany({
      where: {
        userToId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        userFrom: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Block a user
   */
  static async blockUser(userId: string, targetUserId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if there's an existing friendship
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userFromId: userId, userToId: targetUserId },
            { userFromId: targetUserId, userToId: userId },
          ],
        },
      });

      if (existingFriendship) {
        // Update the existing friendship to blocked
        await prisma.friendship.update({
          where: { id: existingFriendship.id },
          data: {
            status: FriendshipStatus.BLOCKED,
          },
        });
      } else {
        // Create a new blocked relationship
        await prisma.friendship.create({
          data: {
            userFromId: userId,
            userToId: targetUserId,
            status: FriendshipStatus.BLOCKED,
          },
        });
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to block user',
      };
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: string, targetUserId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const friendship = await prisma.friendship.findFirst({
        where: {
          AND: [
            {
              OR: [
                { userFromId: userId, userToId: targetUserId },
                { userFromId: targetUserId, userToId: userId },
              ],
            },
            { status: FriendshipStatus.BLOCKED },
          ],
        },
      });

      if (!friendship) {
        return {
          success: false,
          error: 'No blocked relationship found',
        };
      }

      // Delete the blocked relationship
      await prisma.friendship.delete({
        where: { id: friendship.id },
      });

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to unblock user',
      };
    }
  }
}