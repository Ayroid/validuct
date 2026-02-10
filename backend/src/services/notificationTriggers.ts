import { prisma } from '../config/database.js';
import { NotificationService } from './notificationService.js';
import { notificationEmailTemplate } from '../templates/notificationEmailTemplate.js';

export class NotificationTriggers {
  // Check if this is the first feedback (comment or signal) on an idea
  private static async checkAndSendFirstFeedback(
    ideaId: string,
    ideaUserId: string,
    ideaUserEmail: string,
    ideaHeading: string,
    feedbackType: 'comment' | 'signal',
    triggeredByUsername: string
  ) {
    // Count existing comments and signals on the idea (excluding this one)
    const [commentsCount, signalsCount] = await Promise.all([
      prisma.comment.count({ where: { ideaId } }),
      prisma.ideaSignal.count({ where: { ideaId } }),
    ]);

    // If this is the first feedback (total is 1, meaning just this one)
    const totalFeedback = commentsCount + signalsCount;
    if (totalFeedback === 1) {
      const prefs = await NotificationService.getOrCreatePreferences(ideaUserId);
      if (prefs.emailFirstFeedback) {
        await NotificationService.queueEmail({
          userId: ideaUserId,
          type: feedbackType === 'comment' ? 'COMMENT' : 'SIGNAL',
          recipientEmail: ideaUserEmail,
          subject: `🎉 Your first feedback on "${ideaHeading}"!`,
          htmlBody: notificationEmailTemplate({
            type: 'first_feedback',
            ideaTitle: ideaHeading,
            feedbackType,
            triggeredByUsername,
            actionUrl: `${process.env.APP_URL}/idea/${ideaId}`,
          }),
          priority: 'HIGH',
        });
      }
    }
  }

  // When someone upvotes an idea
  static async onIdeaUpvote(ideaId: string, upvotedByUserId: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: { user: { select: { id: true, email: true, username: true } } },
    });

    if (!idea) return;

    // Create in-app notification
    await NotificationService.createNotification({
      userId: idea.userId,
      type: 'UPVOTE',
      title: 'New upvote!',
      message: `upvoted your "${idea.heading}"`,
      actionUrl: `/idea/${ideaId}`,
      ideaId,
      triggeredById: upvotedByUserId,
    });

    // Check for milestones
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    if (milestones.includes(idea.upvotesCount)) {
      await this.onMilestoneReached(idea, idea.upvotesCount);
    }
  }

  // When someone adds a validation signal
  static async onValidationSignal(
    ideaId: string,
    signalType: string,
    signaledByUserId: string
  ) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: { user: { select: { id: true, email: true, username: true } } },
    });

    if (!idea) return;

    const signalNames: Record<string, string> = {
      PROBLEM_REAL: 'Problem is Real',
      WOULD_PAY: 'Would Pay',
      READY_TO_BUILD: 'Ready to Build',
      NEEDS_CLARITY: 'Needs Clarity',
    };

    const triggeredBy = await prisma.user.findUnique({
      where: { id: signaledByUserId },
      select: { username: true },
    });

    // Create in-app notification
    await NotificationService.createNotification({
      userId: idea.userId,
      type: 'SIGNAL',
      title: `New "${signalNames[signalType] || signalType}" signal!`,
      message: `signaled "${signalNames[signalType] || signalType}" on your "${idea.heading}"`,
      actionUrl: `/idea/${ideaId}`,
      ideaId,
      triggeredById: signaledByUserId,
      priority: 'HIGH', // Signals are important
    });

    // Check for first feedback email
    await this.checkAndSendFirstFeedback(
      ideaId,
      idea.userId,
      idea.user.email,
      idea.heading,
      'signal',
      triggeredBy?.username || 'Someone'
    );

    // Queue regular email notification (skip if first feedback was sent)
    const prefs = await NotificationService.getOrCreatePreferences(idea.userId);
    if (NotificationService.shouldSendEmail('SIGNAL', prefs)) {
      await NotificationService.queueEmail({
        userId: idea.userId,
        type: 'SIGNAL',
        recipientEmail: idea.user.email,
        subject: `🎯 New validation signal on "${idea.heading}"`,
        htmlBody: notificationEmailTemplate({
          type: 'signal',
          ideaTitle: idea.heading,
          signalType: signalNames[signalType] || signalType,
          triggeredByUsername: triggeredBy?.username,
          actionUrl: `${process.env.APP_URL}/idea/${ideaId}`,
        }),
        priority: 'HIGH',
      });
    }
  }

  // When someone comments on an idea
  static async onComment(commentId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        idea: {
          include: { user: { select: { id: true, email: true, username: true } } },
        },
        user: { select: { id: true, username: true } },
      },
    });

    if (!comment) return;

    // Notify idea owner
    await NotificationService.createNotification({
      userId: comment.idea.userId,
      type: 'COMMENT',
      title: 'New comment!',
      message: `commented on your "${comment.idea.heading}"`,
      actionUrl: `/idea/${comment.ideaId}`,
      ideaId: comment.ideaId,
      commentId: comment.id,
      triggeredById: comment.userId,
    });

    // Check for first feedback email
    await this.checkAndSendFirstFeedback(
      comment.ideaId,
      comment.idea.userId,
      comment.idea.user.email,
      comment.idea.heading,
      'comment',
      comment.user.username
    );

    // Queue regular email (skip if first feedback was sent)
    const prefs = await NotificationService.getOrCreatePreferences(comment.idea.userId);
    if (NotificationService.shouldSendEmail('COMMENT', prefs)) {
      await NotificationService.queueEmail({
        userId: comment.idea.userId,
        type: 'COMMENT',
        recipientEmail: comment.idea.user.email,
        subject: `💬 New comment on "${comment.idea.heading}"`,
        htmlBody: notificationEmailTemplate({
          type: 'comment',
          ideaTitle: comment.idea.heading,
          commentPreview: comment.content.substring(0, 150),
          triggeredByUsername: comment.user.username,
          actionUrl: `${process.env.APP_URL}/idea/${comment.ideaId}`,
        }),
      });
    }
  }

  // When someone replies to a comment
  static async onReply(replyId: string) {
    const reply = await prisma.comment.findUnique({
      where: { id: replyId },
      include: {
        parentComment: {
          include: { user: { select: { id: true, email: true, username: true } } },
        },
        idea: { select: { id: true, heading: true } },
        user: { select: { id: true, username: true } },
      },
    });

    if (!reply?.parentComment) return;

    // Notify parent comment author
    await NotificationService.createNotification({
      userId: reply.parentComment.userId,
      type: 'REPLY',
      title: 'New reply!',
      message: `replied to your comment on "${reply.idea.heading}"`,
      actionUrl: `/idea/${reply.ideaId}`,
      ideaId: reply.ideaId,
      commentId: reply.id,
      triggeredById: reply.userId,
    });

    // Queue email
    const prefs = await NotificationService.getOrCreatePreferences(reply.parentComment.userId);
    if (NotificationService.shouldSendEmail('REPLY', prefs)) {
      await NotificationService.queueEmail({
        userId: reply.parentComment.userId,
        type: 'REPLY',
        recipientEmail: reply.parentComment.user.email,
        subject: `↩️ New reply to your comment`,
        htmlBody: notificationEmailTemplate({
          type: 'reply',
          ideaTitle: reply.idea.heading,
          commentPreview: reply.content.substring(0, 150),
          triggeredByUsername: reply.user.username,
          actionUrl: `${process.env.APP_URL}/idea/${reply.ideaId}`,
        }),
      });
    }
  }

  // When idea reaches a milestone
  private static async onMilestoneReached(idea: any, count: number) {
    await NotificationService.createNotification({
      userId: idea.userId,
      type: 'MILESTONE',
      title: `${count} upvotes!`,
      message: `Your "${idea.heading}" reached ${count} upvotes!`,
      actionUrl: `/idea/${idea.id}`,
      ideaId: idea.id,
      priority: 'HIGH',
    });

    // Queue celebratory email
    const prefs = await NotificationService.getOrCreatePreferences(idea.userId);
    if (NotificationService.shouldSendEmail('MILESTONE', prefs)) {
      await NotificationService.queueEmail({
        userId: idea.userId,
        type: 'MILESTONE',
        recipientEmail: idea.user.email,
        subject: `🎉 "${idea.heading}" hit ${count} upvotes!`,
        htmlBody: notificationEmailTemplate({
          type: 'milestone',
          ideaTitle: idea.heading,
          milestoneCount: count,
          actionUrl: `${process.env.APP_URL}/idea/${idea.id}`,
        }),
        priority: 'HIGH',
      });
    }
  }
}
