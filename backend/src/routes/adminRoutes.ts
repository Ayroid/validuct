import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { AdminDashboardController } from '../controllers/adminDashboardController.js';

const router = Router();

router.get('/stats', protect, requireAdmin, AdminDashboardController.getAdminStats);

export default router;
