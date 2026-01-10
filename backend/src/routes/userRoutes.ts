import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { updateUserSchema } from '../utils/validation.js';

const router = Router();

// Protected routes - must come before parameterized routes
router.patch('/me', protect, validate(updateUserSchema), UserController.updateProfile);
router.get('/me/pinned', protect, UserController.getPinnedIdeas);

// Public routes with parameters
router.get('/:username', UserController.getUserProfile);
router.get('/:username/ideas', UserController.getUserIdeas);
router.get('/:username/validation-summary', UserController.getValidationSummary);
router.get('/:username/ideas-with-signals', UserController.getUserIdeasWithSignals);

export default router;
