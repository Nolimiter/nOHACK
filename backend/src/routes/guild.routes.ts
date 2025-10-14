import { Router } from 'express';
import { GuildController } from '../controllers/guild.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/recruiting', GuildController.getRecruitingGuilds);
router.get('/:guildId', GuildController.getGuildById);
router.get('/name/:guildName', GuildController.getGuildByName);

// Protected routes
router.post('/', authenticate, GuildController.createGuild);
router.put('/:guildId', authenticate, GuildController.updateGuild);
router.delete('/:guildId', authenticate, GuildController.deleteGuild);
router.post('/:guildId/invite', authenticate, GuildController.inviteUserToGuild);
router.post('/:guildId/remove', authenticate, GuildController.removeUserFromGuild);
router.post('/:guildId/transfer', authenticate, GuildController.transferLeadership);

export default router;