import { Router } from 'express';
import { SuggestionController } from '../controllers/suggestionController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validator.js';
import { createSuggestionSchema, updateSuggestionStatusSchema } from '../utils/validation.js';
import { suggestionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Submit a suggestion (protected)
router.post(
  '/',
  protect,
  suggestionLimiter,
  validate(createSuggestionSchema),
  SuggestionController.create
);

// Get approved suggestions (public)
router.get('/', optionalProtect, SuggestionController.getApproved);

// Get current user's suggestions (protected)
router.get('/mine', protect, SuggestionController.getMine);

// Admin: Get all suggestions (paginated, filterable by status)
router.get('/all', protect, requireAdmin, SuggestionController.getAll);

// Admin: Approve/reject a suggestion
router.patch(
  '/:id/status',
  protect,
  requireAdmin,
  validate(updateSuggestionStatusSchema),
  SuggestionController.updateStatus
);

export default router;
