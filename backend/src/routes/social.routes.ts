import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Messaging routes (protected)
router.post('/message', authenticate, SocialController.sendMessage);
router.get('/inbox', authenticate, SocialController.getInbox);
router.get('/sent', authenticate, SocialController.getSentMessages);
router.put('/message/:messageId/read', authenticate, SocialController.markAsRead);
router.delete('/message/:messageId', authenticate, SocialController.deleteMessage);

// Friend system routes (protected)
router.post('/friend/request', authenticate, SocialController.sendFriendRequest);
router.put('/friend/request/:friendshipId/accept', authenticate, SocialController.acceptFriendRequest);
router.put('/friend/request/:friendshipId/reject', authenticate, SocialController.rejectFriendRequest);
router.get('/friends', authenticate, SocialController.getFriends);
router.get('/friend-requests', authenticate, SocialController.getPendingFriendRequests);
router.post('/friend/block', authenticate, SocialController.blockUser);
router.post('/friend/unblock', authenticate, SocialController.unblockUser);

export default router;