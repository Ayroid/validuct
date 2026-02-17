import { prisma } from '../config/database.js';
import { NotificationType, NotificationPriority, NotificationPreferences } from '../../prisma/client/client.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/pagination.js';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  ideaId?: string;
  commentId?: string;
  triggeredById?: string;
  priority?: NotificationPriority;
}

export class NotificationService {
  // Create in-app notification + queue email (FAST - just DB writes)
  static async createNotification(params: CreateNotificationParams) {
    const { userId, type, triggeredById } = params;

    // Don't notify yourself
    if (userId === triggeredById) return null;

    // Get user preferences (creates defaults if not exists)
    const prefs = await this.getOrCreatePreferences(userId);

    // Check if user wants this type of in-app notification
    if (!this.shouldSendInApp(type, prefs)) return null;

    // Create the in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        priority: params.priority || 'MEDIUM',
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        ideaId: params.ideaId,
        commentId: params.commentId,
        triggeredById: params.triggeredById,
      },
      include: {
        triggeredBy: {
          select: { id: true, username: true, profilePicture: true },
        },
      },
    });

    return notification;
  }

  // TODO: Send mails for only important occassions
  // Queue an email for background sending
  static async queueEmail(params: {
    userId: string;
    type: NotificationType;
    recipientEmail: string;
    subject: string;
    htmlBody: string;
    priority?: NotificationPriority;
  }) {
    return prisma.emailQueue.create({
      data: {
        userId: params.userId,
        type: params.type,
        priority: params.priority || 'MEDIUM',
        recipientEmail: params.recipientEmail,
        subject: params.subject,
        htmlBody: params.htmlBody,
      },
    });
  }

  // Get user's notifications with pagination
  static async getUserNotifications(userId: string, page = 1, limit = 20) {
    const { skip } = paginate(page, limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          triggeredBy: {
            select: { id: true, username: true, profilePicture: true },
          },
          idea: {
            select: { id: true, heading: true },
          },
        },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get unread count (for the badge)
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  // Mark single notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Not authorized', 403);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  // Mark all as read
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Not authorized', 403);
    }

    return prisma.notification.delete({ where: { id: notificationId } });
  }

  // Get or create user preferences with defaults
  static async getOrCreatePreferences(userId: string) {
    let prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return prefs;
  }

  // Update preferences
  static async updatePreferences(userId: string, data: Partial<{
    emailFirstFeedback: boolean;
    emailDailySummary: boolean;
    emailSignals: boolean;
    emailComments: boolean;
    emailReplies: boolean;
    emailMilestones: boolean;
    inAppUpVotes: boolean;
    inAppUpSignals: boolean;
    inAppUpComments: boolean;
    inAppUpReplies: boolean;
  }>) {
    return prisma.notificationPreferences.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // Check if user wants in-app notification for this type
  private static shouldSendInApp(type: NotificationType, prefs: NotificationPreferences): boolean {
    switch (type) {
      case 'UPVOTE': return prefs.inAppUpVotes;
      case 'SIGNAL': return prefs.inAppUpSignals;
      case 'COMMENT': return prefs.inAppUpComments;
      case 'REPLY': return prefs.inAppUpReplies;
      case 'MILESTONE': return true; // Always show milestones
      default: return true;
    }
  }

  // Check if user wants email for this type
  static shouldSendEmail(type: NotificationType, prefs: NotificationPreferences): boolean {
    switch (type) {
      case 'UPVOTE': return false; // Don't email for upvotes (too spammy)
      case 'SIGNAL': return prefs.emailSignals;
      case 'COMMENT': return prefs.emailComments;
      case 'REPLY': return prefs.emailReplies;
      case 'MILESTONE': return prefs.emailMilestones;
      default: return false;
    }
  }
}
