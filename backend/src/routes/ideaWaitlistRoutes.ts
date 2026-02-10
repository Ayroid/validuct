import { Router } from 'express';
import { IdeaWaitlistController } from '../controllers/ideaWaitlistController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { ideaWaitlistSchema } from '../utils/validation.js';
import { ideaWaitlistLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Join waitlist for an idea (public, rate limited)
router.post(
  '/ideas/:ideaId/waitlist',
  ideaWaitlistLimiter,
  validate(ideaWaitlistSchema),
  IdeaWaitlistController.joinWaitlist
);

// Get waitlist stats for an idea (public, includes access token for owner)
router.get('/ideas/:ideaId/waitlist', optionalProtect, IdeaWaitlistController.getWaitlistStats);

// Get paginated waitlist entries (session-auth, owner only)
router.get('/ideas/:ideaId/waitlist/entries', protect, IdeaWaitlistController.getWaitlistEntries);

// Export all waitlist emails (session-auth, owner only)
router.get('/ideas/:ideaId/waitlist/export', protect, IdeaWaitlistController.exportWaitlistEmails);

// Get paginated waitlist by access token (protected, owner only)
router.get(
  '/ideas/:ideaId/waitlist/:accessToken',
  protect,
  IdeaWaitlistController.getWaitlistByToken
);

// Get all waitlist emails for export (protected, owner only)
router.get(
  '/ideas/:ideaId/waitlist/:accessToken/export',
  protect,
  IdeaWaitlistController.getAllWaitlistEmails
);

export default router;
