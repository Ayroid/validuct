import { Router } from 'express';
import { IdeaController } from '../controllers/ideaController.js';

const router = Router();

// Get user's ideas
router.get('/:username/ideas', IdeaController.getUserIdeas);

export default router;
