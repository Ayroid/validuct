import { Router } from 'express';
import { IdeaController } from '../controllers/ideaController.js';
import { UserController } from '../controllers/userController.js';
import { validate } from '../middleware/validator.js';
import { createIdeaSchema, updateIdeaSchema } from '../utils/validation.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { createIdeaLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Admin routes (must come before parameterized routes)
router.get('/admin/all', protect, requireAdmin, IdeaController.getAllIdeasAdmin);
router.delete('/:id/admin', protect, requireAdmin, IdeaController.adminDeleteIdea);
router.patch('/:id/admin/status', protect, requireAdmin, IdeaController.adminUpdateIdeaStatus);

// Public routes (with optional authentication for userVote)
router.get('/', optionalProtect, IdeaController.getIdeas);
router.get('/:id', optionalProtect, IdeaController.getIdeaById);

// Protected routes
router.post('/', protect, createIdeaLimiter, validate(createIdeaSchema), IdeaController.createIdea);
router.patch('/:id', protect, validate(updateIdeaSchema), IdeaController.updateIdea);
router.delete('/:id', protect, IdeaController.deleteIdea);

// Pin/Unpin routes
router.post('/:id/pin', protect, UserController.pinIdea);
router.delete('/:id/pin', protect, UserController.unpinIdea);

export default router;
