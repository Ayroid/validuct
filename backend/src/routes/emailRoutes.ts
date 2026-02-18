import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/all',          EmailController.getAllEmailQueue);
router.get('/stats',        EmailController.getEmailQueueStats);
router.post('/:id/retry',   EmailController.retryEmail);
router.delete('/:id',       EmailController.deleteEmailQueueEntry);

export default router;
