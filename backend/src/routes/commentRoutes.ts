import { Router } from 'express';
import { CommentController } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  createCommentSchema,
  updateCommentSchema,
} from '../utils/validation.js';
import { commentLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Create a comment on an idea (protected)
router.post(
  '/ideas/:id/comments',
  protect,
  commentLimiter,
  validate(createCommentSchema),
  CommentController.createComment
);

// Get all comments for an idea (public)
router.get('/ideas/:id/comments', CommentController.getIdeaComments);

// Get a single comment (public)
router.get('/comments/:id', CommentController.getComment);

// Update a comment (protected)
router.patch(
  '/comments/:id',
  protect,
  validate(updateCommentSchema),
  CommentController.updateComment
);

// Delete a comment (protected)
router.delete('/comments/:id', protect, CommentController.deleteComment);

export default router;
