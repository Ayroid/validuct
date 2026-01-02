import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validator.js';
import { oauthSchema } from '../utils/validation.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.post('/oauth', authLimiter, validate(oauthSchema), AuthController.oauth);

// Protected routes
router.get('/me', protect, AuthController.getCurrentUser);

export default router;
