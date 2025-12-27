import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validator.js';
import { registerSchema, loginSchema, oauthSchema } from '../utils/validation.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/oauth', validate(oauthSchema), AuthController.oauth);

// Protected routes
router.get('/me', protect, AuthController.getCurrentUser);

export default router;
