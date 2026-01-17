import { prisma } from '../config/database.js';
import { NotificationService } from './notificationService.js';
import { notificationEmailTemplate } from '../templates/notificationEmailTemplate.js';

export class DailySummaryService {
  private static isProcessing = false;

  // Generate and send daily summary emails for all opted-in users
  static async sendDailySummaries() {
    if (this.isProcessing) {
      console.log('[DailySummary] Already processing, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log('[DailySummary] Starting daily summary generation...');

    try {
      // Get all users who have daily summary enabled
      const usersWithSummaryEnabled = await prisma.notificationPreferences.findMany({
        where: { emailDailySummary: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      console.log(`[DailySummary] Found ${usersWithSummaryEnabled.length} users with daily summary enabled`);

      // Calculate the date range for yesterday (or today's activity up to now)
      const now = new Date();
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);

      const endOfYesterday = new Date(now);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);

      const dateString = startOfYesterday.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      for (const prefs of usersWithSummaryEnabled) {
        try {
          await this.generateSummaryForUser(
            prefs.user.id,
            prefs.user.email,
            prefs.user.username,
            startOfYesterday,
            endOfYesterday,
            dateString
          );
        } catch (error) {
          console.error(`[DailySummary] Error processing user ${prefs.user.id}:`, error);
        }
      }

      console.log('[DailySummary] Daily summary generation completed');
    } catch (error) {
      console.error('[DailySummary] Error in daily summary generation:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private static async generateSummaryForUser(
    userId: string,
    userEmail: string,
    username: string,
    startDate: Date,
    endDate: Date,
    dateString: string
  ) {
    // Get user's ideas
    const userIdeas = await prisma.idea.findMany({
      where: { userId },
      select: {
        id: true,
        heading: true,
        upvotesCount: true,
      },
    });

    if (userIdeas.length === 0) {
      // User has no ideas, skip
      return;
    }

    const ideaIds = userIdeas.map((i) => i.id);

    // Get votes received in the time period
    const votes = await prisma.vote.groupBy({
      by: ['ideaId'],
      where: {
        ideaId: { in: ideaIds },
        voteType: 'UPVOTE',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
    });

    // Get comments received in the time period (only top-level comments, not by the idea owner)
    const comments = await prisma.comment.groupBy({
      by: ['ideaId'],
      where: {
        ideaId: { in: ideaIds },
        userId: { not: userId }, // Exclude own comments
        parentCommentId: null, // Only top-level comments
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
    });

    // Get waitlist signups in the time period
    const waitlistSignups = await prisma.ideaWaitlist.groupBy({
      by: ['ideaId'],
      where: {
        ideaId: { in: ideaIds },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { id: true },
    });

    // Build maps for easy lookup
    const votesMap = new Map(votes.map((v) => [v.ideaId, v._count.id]));
    const commentsMap = new Map(comments.map((c) => [c.ideaId, c._count.id]));
    const waitlistMap = new Map(waitlistSignups.map((w) => [w.ideaId, w._count.id]));

    // Calculate totals
    let totalUpvotes = 0;
    let totalComments = 0;
    let totalWaitlist = 0;

    const ideasWithActivity: Array<{
      heading: string;
      upvotes: number;
      comments: number;
      waitlist: number;
      url: string;
    }> = [];

    for (const idea of userIdeas) {
      const upvotes = votesMap.get(idea.id) || 0;
      const ideaComments = commentsMap.get(idea.id) || 0;
      const waitlist = waitlistMap.get(idea.id) || 0;

      totalUpvotes += upvotes;
      totalComments += ideaComments;
      totalWaitlist += waitlist;

      // Only include ideas that had activity
      if (upvotes > 0 || ideaComments > 0 || waitlist > 0) {
        ideasWithActivity.push({
          heading: idea.heading,
          upvotes,
          comments: ideaComments,
          waitlist,
          url: `${process.env.APP_URL}/idea/${idea.id}`,
        });
      }
    }

    // Only send email if there was any activity
    if (totalUpvotes === 0 && totalComments === 0 && totalWaitlist === 0) {
      console.log(`[DailySummary] No activity for user ${username}, skipping email`);
      return;
    }

    // Sort ideas by total activity (most active first)
    ideasWithActivity.sort((a, b) => {
      const activityA = a.upvotes + a.comments + a.waitlist;
      const activityB = b.upvotes + b.comments + b.waitlist;
      return activityB - activityA;
    });

    // Queue the email
    await NotificationService.queueEmail({
      userId,
      type: 'MILESTONE', // Using MILESTONE as closest type, could be extended
      recipientEmail: userEmail,
      subject: `📊 Your daily summary for ${dateString}`,
      htmlBody: notificationEmailTemplate({
        type: 'daily_summary',
        actionUrl: `${process.env.APP_URL}/profile/${username}`,
        dailySummary: {
          date: dateString,
          totalUpvotes,
          totalComments,
          totalWaitlist,
          ideas: ideasWithActivity.slice(0, 5), // Top 5 ideas
        },
      }),
      priority: 'LOW', // Daily summaries are lower priority
    });

    console.log(`[DailySummary] Queued summary for ${username}: ${totalUpvotes} upvotes, ${totalComments} comments, ${totalWaitlist} waitlist`);
  }

  // Manual trigger for testing
  static async triggerForUser(userId: string) {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!prefs) {
      throw new Error('User preferences not found');
    }

    const now = new Date();
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(now);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    const dateString = startOfYesterday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await this.generateSummaryForUser(
      prefs.user.id,
      prefs.user.email,
      prefs.user.username,
      startOfYesterday,
      endOfYesterday,
      dateString
    );
  }
}
