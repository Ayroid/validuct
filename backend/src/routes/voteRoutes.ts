import { Router } from 'express';
import { VoteController } from '../controllers/voteController.js';
import { validate } from '../middleware/validator.js';
import { voteSchema } from '../utils/validation.js';
import { protect } from '../middleware/auth.js';
import { voteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All vote routes are protected
router.post(
  '/ideas/:id/vote',
  protect,
  voteLimiter,
  validate(voteSchema),
  VoteController.voteOnIdea
);

export default router;
