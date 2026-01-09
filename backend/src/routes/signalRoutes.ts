import { Router } from 'express';
import { SignalController } from '../controllers/signalController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { toggleSignalSchema } from '../utils/validation.js';
import { commentLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Toggle a signal on an idea (protected)
router.post(
  '/ideas/:id/signals',
  protect,
  commentLimiter,
  validate(toggleSignalSchema),
  SignalController.toggleSignal
);

// Get all signals for an idea (public, but includes user signals if authenticated)
router.get('/ideas/:id/signals', optionalProtect, SignalController.getIdeaSignals);

export default router;
