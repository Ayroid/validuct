import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlistController.js';
import { validate } from '../middleware/validator.js';
import { waitlistSchema } from '../utils/validation.js';
import { waitlistLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public route to join the waitlist
router.post('/join', waitlistLimiter, validate(waitlistSchema), WaitlistController.joinWaitlist);

export default router;
