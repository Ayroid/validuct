import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlistController.js';
import { validate } from '../middleware/validator.js';
import { waitlistSchema } from '../utils/validation.js';
import { waitlistLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Public route to join the waitlist
router.post('/join', waitlistLimiter, validate(waitlistSchema), WaitlistController.joinWaitlist);

// Admin routes
router.get('/admin/main',              protect, requireAdmin, WaitlistController.getMainWaitlistAdmin);
router.get('/admin/ideas',             protect, requireAdmin, WaitlistController.getAllIdeaWaitlistsAdmin);
router.delete('/admin/main/:id',       protect, requireAdmin, WaitlistController.removeFromMainWaitlist);
router.delete('/admin/ideas/:id',      protect, requireAdmin, WaitlistController.removeFromIdeaWaitlist);

export default router;
