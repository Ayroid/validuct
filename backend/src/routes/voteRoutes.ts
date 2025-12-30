import { Router } from 'express';
import { VoteController } from '../controllers/voteController.js';
import { validate } from '../middleware/validator.js';
import { voteSchema } from '../utils/validation.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All vote routes are protected
router.post('/ideas/:id/vote', protect, validate(voteSchema), VoteController.voteOnIdea);

export default router;
