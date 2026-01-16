import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { updatePreferencesSchema } from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/mark-all-read', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

// Preferences
router.get('/preferences', NotificationController.getPreferences);
router.patch('/preferences', validate(updatePreferencesSchema), NotificationController.updatePreferences);

export default router;
