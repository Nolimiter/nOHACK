// Mock the database module BEFORE any imports
jest.mock('../config/database');

import { SocialService } from '../services/social.service';
import { prisma } from '../config/database';

// Get mocked prisma
const mockPrisma = prisma as any;

describe('SocialService', () => {
  const mockUser1 = {
    id: 'user-1',
    username: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser2 = {
    id: 'user-2',
    username: 'user2',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'message-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    subject: 'Test Subject',
    body: 'Test message body',
    isRead: false,
    sentAt: new Date(),
    readAt: null,
    sender: mockUser1,
    receiver: mockUser2,
  };

  const mockFriendship = {
    id: 'friendship-1',
    userFromId: 'user-1',
    userToId: 'user-2',
    status: 'PENDING',
    createdAt: new Date(),
    acceptedAt: null,
    userFrom: mockUser1,
    userTo: mockUser2,
  };

 beforeEach(() => {
    jest.clearAllMocks();
  });

 describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser1); // sender
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser2); // receiver
      mockPrisma.message.create.mockResolvedValue(mockMessage);

      const result = await SocialService.sendMessage({
        senderId: 'user-1',
        receiverId: 'user-2',
        subject: 'Test Subject',
        body: 'Test message body',
      });

      expect(result.success).toBe(true);
      expect(result.message).toEqual(mockMessage);
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          senderId: 'user-1',
          receiverId: 'user-2',
          subject: 'Test Subject',
          body: 'Test message body',
          attachments: undefined,
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
    });

    it('should fail to send message if sender or receiver does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // sender not found

      const result = await SocialService.sendMessage({
        senderId: 'user-1',
        receiverId: 'user-2',
        subject: 'Test Subject',
        body: 'Test message body',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sender or receiver not found');
    });
  });

  describe('getInbox', () => {
    it('should return user\'s inbox messages', async () => {
      const mockMessages = [mockMessage];
      mockPrisma.message.findMany.mockResolvedValue(mockMessages);
      mockPrisma.message.count.mockResolvedValue(1);

      const result = await SocialService.getInbox('user-2', 1, 10);

      expect(result.messages).toEqual(mockMessages);
      expect(result.total).toBe(1);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { receiverId: 'user-2' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getSentMessages', () => {
    it('should return user\'s sent messages', async () => {
      const mockMessages = [mockMessage];
      mockPrisma.message.findMany.mockResolvedValue(mockMessages);
      mockPrisma.message.count.mockResolvedValue(1);

      const result = await SocialService.getSentMessages('user-1', 1, 10);

      expect(result.messages).toEqual(mockMessages);
      expect(result.total).toBe(1);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { senderId: 'user-1' },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);
      mockPrisma.message.update.mockResolvedValue({
        ...mockMessage,
        isRead: true,
        readAt: new Date(),
      });

      const result = await SocialService.markAsRead('message-1', 'user-2');

      expect(result).toBe(true);
      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: 'message-1' },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });

    it('should return false if message does not exist', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      const result = await SocialService.markAsRead('message-1', 'user-2');

      expect(result).toBe(false);
    });

    it('should return false if user is not the receiver', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        ...mockMessage,
        receiverId: 'different-user',
      });

      const result = await SocialService.markAsRead('message-1', 'user-2');

      expect(result).toBe(false);
    });
 });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);
      mockPrisma.message.delete.mockResolvedValue(mockMessage);

      const result = await SocialService.deleteMessage('message-1', 'user-2');

      expect(result).toBe(true);
      expect(mockPrisma.message.delete).toHaveBeenCalledWith({
        where: { id: 'message-1' },
      });
    });

    it('should return false if message does not exist', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      const result = await SocialService.deleteMessage('message-1', 'user-2');

      expect(result).toBe(false);
    });

    it('should return false if user is neither sender nor receiver', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        ...mockMessage,
        senderId: 'different-user',
        receiverId: 'another-user',
      });

      const result = await SocialService.deleteMessage('message-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser1); // from user
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser2); // to user
      mockPrisma.friendship.findFirst.mockResolvedValue(null); // no existing friendship
      mockPrisma.friendship.create.mockResolvedValue(mockFriendship);

      const result = await SocialService.sendFriendRequest('user-1', 'user-2');

      expect(result.success).toBe(true);
      expect(result.friendship).toEqual(mockFriendship);
      expect(mockPrisma.friendship.create).toHaveBeenCalledWith({
        data: {
          userFromId: 'user-1',
          userToId: 'user-2',
          status: 'PENDING',
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
    });

    it('should accept existing request if users have sent requests to each other', async () => {
      const existingFriendship = {
        id: 'friendship-1',
        userFromId: 'user-2',
        userToId: 'user-1',
        status: 'PENDING',
        createdAt: new Date(),
        acceptedAt: null,
      };
      
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser1);
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser2);
      mockPrisma.friendship.findFirst.mockResolvedValue(existingFriendship);
      mockPrisma.friendship.update.mockResolvedValue({
        ...existingFriendship,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      });

      const result = await SocialService.sendFriendRequest('user-1', 'user-2');

      expect(result.success).toBe(true);
      expect(mockPrisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'friendship-1' },
        data: {
          status: 'ACCEPTED',
          acceptedAt: expect.any(Date),
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
    });

    it('should fail if user tries to add themselves', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser1);
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser1);

      const result = await SocialService.sendFriendRequest('user-1', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot add yourself as a friend');
    });
  });

 describe('getFriends', () => {
    it('should return user\'s friends', async () => {
      const mockFriendships = [
        {
          ...mockFriendship,
          status: 'ACCEPTED',
          userFrom: mockUser1,
          userTo: mockUser2,
        }
      ];
      
      mockPrisma.friendship.findMany.mockResolvedValue(mockFriendships);

      const result = await SocialService.getFriends('user-1');

      expect(result).toEqual([mockUser2]);
      expect(mockPrisma.friendship.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { userFromId: 'user-1' },
                { userToId: 'user-1' },
              ],
            },
            { status: 'ACCEPTED' },
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
    });
  });
});