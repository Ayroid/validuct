import { Router } from 'express';
import { IdeaController } from '../controllers/ideaController.js';
import { validate } from '../middleware/validator.js';
import { createIdeaSchema, updateIdeaSchema } from '../utils/validation.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = Router();

// Public routes (with optional authentication for userVote)
router.get('/', optionalProtect, IdeaController.getIdeas);
router.get('/:id', optionalProtect, IdeaController.getIdeaById);

// Protected routes
router.post('/', protect, validate(createIdeaSchema), IdeaController.createIdea);
router.patch('/:id', protect, validate(updateIdeaSchema), IdeaController.updateIdea);
router.delete('/:id', protect, IdeaController.deleteIdea);

export default router;
