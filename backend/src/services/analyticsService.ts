import { prisma } from '../config/database.js';
import { ValidationService } from './validationService.js';
import {
  IdeaSignalCounts,
  ValidationHealthLevel,
  ValidationHealthDots,
  PortfolioIdea,
  IdeaPortfolio,
  IdeaScorecard,
  ScorecardComment,
  CommentCategoryGroup,
  CommentCategoryType,
  ScorecardNextStep,
  DailyActivity,
  ActivityRange,
  AnalyticsDashboardData,
  TopIdeaAnalytics,
  IdeaAnalyticsData,
} from '../types/index.js';

/**
 * Service class for analytics, portfolio, and scorecard operations.
 */
export class AnalyticsService {
  private static calculateHealthDots(signals: IdeaSignalCounts): ValidationHealthDots {
    const dotLevel = (positive: number, strongThreshold: number, someThreshold: number): ValidationHealthLevel => {
      if (positive >= strongThreshold) return 'green';
      if (positive >= someThreshold) return 'amber';
      return 'gray';
    };

    return {
      problem: dotLevel(signals.problemReal, 3, 1),
      pay: dotLevel(signals.wouldPay, 2, 1),
      buildable: dotLevel(signals.readyToBuild, 2, 1),
    };
  }

  private static determinePrimaryGap(
    signals: IdeaSignalCounts,
    commentsCount: number,
    waitlistCount: number
  ): string {
    if (signals.needsClarity >= 2) return 'Clarity concerns from community';
    if (signals.needsClarity >= 1 && signals.problemReal === 0) return 'Needs clarity before validation';

    const totalPositive = signals.problemReal + signals.wouldPay + signals.readyToBuild;
    if (totalPositive === 0) return 'No validation signals yet';
    if (signals.wouldPay === 0 && signals.problemReal >= 1) return 'No payment signals';
    if (signals.readyToBuild === 0 && signals.wouldPay >= 1) return 'No buildability signals';
    if (commentsCount === 0) return 'No community feedback';
    if (waitlistCount === 0) return 'No waitlist signups';

    if (signals.problemReal >= 3 && signals.wouldPay >= 2 && signals.readyToBuild >= 2) {
      return 'Validated — ready to build';
    }

    return 'Gathering validation';
  }

  private static computeNextSteps(
    signals: IdeaSignalCounts,
    commentsByCategory: CommentCategoryGroup[],
    waitlistCount: number
  ): ScorecardNextStep[] {
    const steps: ScorecardNextStep[] = [];

    if (signals.needsClarity >= 2) {
      steps.push({
        message: 'Address clarity concerns — refine problem statement based on feedback',
        priority: 'HIGH',
        type: 'CLARIFY',
      });
    }

    if (signals.problemReal === 0 && signals.needsClarity < 2) {
      steps.push({
        message: 'Share your idea to gather initial validation signals',
        priority: 'HIGH',
        type: 'GATHER_SIGNALS',
      });
    }

    if (signals.problemReal >= 2 && signals.wouldPay === 0) {
      steps.push({
        message: 'Problem is validated — test willingness to pay',
        priority: 'MEDIUM',
        type: 'TEST_PRICING',
      });
    }

    if (waitlistCount === 0 && signals.problemReal >= 1) {
      steps.push({
        message: 'Enable waitlist to capture early demand',
        priority: 'MEDIUM',
        type: 'BUILD_WAITLIST',
      });
    }

    const clarityComments = commentsByCategory.find((c) => c.category === 'PROBLEM_CLARITY');
    if (clarityComments && clarityComments.count >= 2 && signals.needsClarity < 2) {
      steps.push({
        message: 'Multiple clarity comments — review and update your description',
        priority: 'MEDIUM',
        type: 'ADDRESS_FEEDBACK',
      });
    }

    if (
      signals.problemReal >= 3 &&
      signals.wouldPay >= 2 &&
      signals.readyToBuild >= 2 &&
      signals.needsClarity < 2
    ) {
      steps.push({
        message: 'Strong validation across all dimensions — ready to start building',
        priority: 'LOW',
        type: 'READY',
      });
    }

    return steps.slice(0, 3);
  }

  /**
   * Get the date cutoff for a given activity range.
   */
  private static getRangeCutoff(range: ActivityRange): Date | null {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
      }
      case '30d': {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return d;
      }
      case 'all':
        return null;
    }
  }

  /**
   * Build a time series from signal, vote, and comment records.
   */
  private static buildTimeSeries(
    signals: Array<{ createdAt: Date }>,
    votes: Array<{ createdAt: Date }>,
    comments: Array<{ createdAt: Date }>,
    range: ActivityRange,
    earliestDate?: Date,
    waitlistSignups: Array<{ createdAt: Date }> = []
  ): DailyActivity[] {
    const entries: DailyActivity[] = [];
    const dateMap = new Map<string, DailyActivity>();
    const now = new Date();

    if (range === '24h') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        d.setMinutes(0, 0, 0);
        const key = d.toISOString().slice(0, 13);
        if (!dateMap.has(key)) {
          const entry: DailyActivity = { date: key + ':00', signals: 0, upvotes: 0, comments: 0, waitlist: 0 };
          dateMap.set(key, entry);
          entries.push(entry);
        }
      }

      for (const s of signals) {
        const key = s.createdAt.toISOString().slice(0, 13);
        const entry = dateMap.get(key);
        if (entry) entry.signals++;
      }
      for (const v of votes) {
        const key = v.createdAt.toISOString().slice(0, 13);
        const entry = dateMap.get(key);
        if (entry) entry.upvotes++;
      }
      for (const c of comments) {
        const key = c.createdAt.toISOString().slice(0, 13);
        const entry = dateMap.get(key);
        if (entry) entry.comments++;
      }
      for (const w of waitlistSignups) {
        const key = w.createdAt.toISOString().slice(0, 13);
        const entry = dateMap.get(key);
        if (entry) entry.waitlist++;
      }
    } else {
      let numDays: number;
      if (range === '7d') {
        numDays = 7;
      } else if (range === '30d') {
        numDays = 30;
      } else {
        const start = earliestDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        numDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);
      }

      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (!dateMap.has(key)) {
          const entry: DailyActivity = { date: key, signals: 0, upvotes: 0, comments: 0, waitlist: 0 };
          dateMap.set(key, entry);
          entries.push(entry);
        }
      }

      for (const s of signals) {
        const key = s.createdAt.toISOString().slice(0, 10);
        const entry = dateMap.get(key);
        if (entry) entry.signals++;
      }
      for (const v of votes) {
        const key = v.createdAt.toISOString().slice(0, 10);
        const entry = dateMap.get(key);
        if (entry) entry.upvotes++;
      }
      for (const c of comments) {
        const key = c.createdAt.toISOString().slice(0, 10);
        const entry = dateMap.get(key);
        if (entry) entry.comments++;
      }
      for (const w of waitlistSignups) {
        const key = w.createdAt.toISOString().slice(0, 10);
        const entry = dateMap.get(key);
        if (entry) entry.waitlist++;
      }
    }

    return entries;
  }

  /**
   * Get idea portfolio for a user — lightweight overview of all ideas.
   */
  static async getIdeaPortfolio(username: string): Promise<IdeaPortfolio | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const ideas = await prisma.idea.findMany({
      where: { userId: user.id },
      include: {
        signals: {
          select: { signalType: true },
        },
        _count: {
          select: { waitlist: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const portfolioIdeas: PortfolioIdea[] = ideas.map((idea) => {
      const signals = ValidationService.countSignals(idea.signals);
      const healthDots = this.calculateHealthDots(signals);
      const validationState = ValidationService.getIdeaValidationState(signals);
      const primaryGap = this.determinePrimaryGap(signals, idea.commentsCount, idea._count.waitlist);

      return {
        id: idea.id,
        heading: idea.heading,
        status: idea.status as PortfolioIdea['status'],
        validationState,
        signals,
        commentsCount: idea.commentsCount,
        waitlistCount: idea._count.waitlist,
        healthDots,
        primaryGap,
        createdAt: idea.createdAt.toISOString(),
      };
    });

    return {
      ideas: portfolioIdeas,
      totalIdeas: ideas.length,
    };
  }

  /**
   * Get full scorecard for a single idea.
   */
  static async getIdeaScorecard(username: string, ideaId: string): Promise<IdeaScorecard | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const idea = await prisma.idea.findFirst({
      where: { id: ideaId, userId: user.id },
      include: {
        signals: {
          select: { signalType: true },
        },
        comments: {
          where: { parentCommentId: null },
          include: {
            user: {
              select: {
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { helpfulCount: 'desc' },
        },
        _count: {
          select: { waitlist: true },
        },
      },
    });

    if (!idea) {
      return null;
    }

    const signals = ValidationService.countSignals(idea.signals);
    const healthDots = this.calculateHealthDots(signals);
    const validationState = ValidationService.getIdeaValidationState(signals);

    const categoryMap = new Map<CommentCategoryType, ScorecardComment[]>();
    const allComments: ScorecardComment[] = [];

    for (const comment of idea.comments) {
      const sc: ScorecardComment = {
        id: comment.id,
        content: comment.content,
        category: comment.category as CommentCategoryType,
        helpfulCount: comment.helpfulCount,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user,
      };

      allComments.push(sc);

      const existing = categoryMap.get(sc.category);
      if (existing) {
        existing.push(sc);
      } else {
        categoryMap.set(sc.category, [sc]);
      }
    }

    const commentsByCategory: CommentCategoryGroup[] = Array.from(categoryMap.entries()).map(
      ([category, comments]) => ({
        category,
        count: comments.length,
        comments,
      })
    );

    const topComments = [...allComments]
      .sort((a, b) => b.helpfulCount - a.helpfulCount)
      .slice(0, 3);

    const nextSteps = this.computeNextSteps(
      signals,
      commentsByCategory,
      idea._count.waitlist
    );

    return {
      id: idea.id,
      heading: idea.heading,
      description: idea.description,
      status: idea.status as IdeaScorecard['status'],
      validationState,
      signals,
      healthDots,
      commentsByCategory,
      topComments,
      nextSteps,
      waitlistCount: idea._count.waitlist,
      commentsCount: idea.commentsCount,
      createdAt: idea.createdAt.toISOString(),
    };
  }

  /**
   * Get analytics dashboard data for a user.
   */
  static async getAnalyticsDashboard(username: string, range: ActivityRange = '30d'): Promise<AnalyticsDashboardData | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;

    const ideas = await prisma.idea.findMany({
      where: { userId: user.id },
      include: {
        signals: { select: { signalType: true } },
        _count: { select: { waitlist: true } },
      },
    });

    let totalSignals = 0;
    let totalUpvotes = 0;
    let totalComments = 0;
    let totalWaitlistSignups = 0;
    const ideasByStatus = { DRAFT: 0, WIP: 0, VALIDATED: 0, LAUNCHED: 0 };
    const ideasByValidationState = { NEEDS_ACTION: 0, READY_TO_BUILD: 0, VALIDATED: 0, NEUTRAL: 0 };
    const signalDistribution: IdeaSignalCounts = { problemReal: 0, wouldPay: 0, readyToBuild: 0, needsClarity: 0 };

    const topIdeas: TopIdeaAnalytics[] = ideas.map((idea) => {
      const signals = ValidationService.countSignals(idea.signals);
      const ideaTotalSignals = signals.problemReal + signals.wouldPay + signals.readyToBuild + signals.needsClarity;

      totalSignals += ideaTotalSignals;
      totalUpvotes += idea.upvotesCount;
      totalComments += idea.commentsCount;
      totalWaitlistSignups += idea._count.waitlist;

      const status = idea.status as keyof typeof ideasByStatus;
      if (status in ideasByStatus) ideasByStatus[status]++;

      const vState = ValidationService.getIdeaValidationState(signals);
      ideasByValidationState[vState]++;

      signalDistribution.problemReal += signals.problemReal;
      signalDistribution.wouldPay += signals.wouldPay;
      signalDistribution.readyToBuild += signals.readyToBuild;
      signalDistribution.needsClarity += signals.needsClarity;

      return {
        id: idea.id,
        heading: idea.heading,
        status: idea.status as TopIdeaAnalytics['status'],
        upvotesCount: idea.upvotesCount,
        totalSignals: ideaTotalSignals,
        signals,
        commentsCount: idea.commentsCount,
        waitlistCount: idea._count.waitlist,
      };
    });

    topIdeas.sort((a, b) => b.totalSignals - a.totalSignals);

    const cutoff = this.getRangeCutoff(range);
    const ideaIds = ideas.map((i) => i.id);
    const dateFilter = cutoff ? { gte: cutoff } : undefined;

    const [recentSignals, recentVotes, recentComments, recentWaitlist] = await Promise.all([
      ideaIds.length > 0
        ? prisma.ideaSignal.findMany({
            where: { ideaId: { in: ideaIds }, ...(dateFilter && { createdAt: dateFilter }) },
            select: { createdAt: true },
          })
        : [],
      ideaIds.length > 0
        ? prisma.vote.findMany({
            where: { ideaId: { in: ideaIds }, voteType: 'UPVOTE', ...(dateFilter && { createdAt: dateFilter }) },
            select: { createdAt: true },
          })
        : [],
      ideaIds.length > 0
        ? prisma.comment.findMany({
            where: { ideaId: { in: ideaIds }, ...(dateFilter && { createdAt: dateFilter }) },
            select: { createdAt: true },
          })
        : [],
      ideaIds.length > 0
        ? prisma.ideaWaitlist.findMany({
            where: { ideaId: { in: ideaIds }, ...(dateFilter && { createdAt: dateFilter }) },
            select: { createdAt: true },
          })
        : [],
    ]);

    const earliestDate = ideas.length > 0
      ? ideas.reduce((min, i) => (i.createdAt < min ? i.createdAt : min), ideas[0].createdAt)
      : undefined;

    const dailyActivity = this.buildTimeSeries(recentSignals, recentVotes, recentComments, range, earliestDate, recentWaitlist);

    return {
      totalIdeas: ideas.length,
      totalSignals,
      totalUpvotes,
      totalComments,
      totalWaitlistSignups,
      ideasByStatus,
      ideasByValidationState,
      signalDistribution,
      dailyActivity,
      topIdeas,
    };
  }

  /**
   * Get analytics data for a single idea.
   */
  static async getIdeaAnalytics(username: string, ideaId: string, range: ActivityRange = '30d'): Promise<IdeaAnalyticsData | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;

    const idea = await prisma.idea.findFirst({
      where: { id: ideaId, userId: user.id },
      include: {
        signals: { select: { signalType: true } },
        _count: { select: { waitlist: true } },
        comments: {
          where: { parentCommentId: null },
          include: {
            user: { select: { username: true, profilePicture: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!idea) return null;

    const signals = ValidationService.countSignals(idea.signals);
    const totalSignals = signals.problemReal + signals.wouldPay + signals.readyToBuild + signals.needsClarity;
    const validationState = ValidationService.getIdeaValidationState(signals);

    const commentsList: ScorecardComment[] = idea.comments.map((c) => ({
      id: c.id,
      content: c.content,
      category: c.category as CommentCategoryType,
      helpfulCount: c.helpfulCount,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    }));

    const cutoff = this.getRangeCutoff(range);
    const dateFilter = cutoff ? { gte: cutoff } : undefined;

    const [recentSignals, recentVotes, recentComments, recentWaitlist] = await Promise.all([
      prisma.ideaSignal.findMany({
        where: { ideaId, ...(dateFilter && { createdAt: dateFilter }) },
        select: { createdAt: true },
      }),
      prisma.vote.findMany({
        where: { ideaId, voteType: 'UPVOTE', ...(dateFilter && { createdAt: dateFilter }) },
        select: { createdAt: true },
      }),
      prisma.comment.findMany({
        where: { ideaId, ...(dateFilter && { createdAt: dateFilter }) },
        select: { createdAt: true },
      }),
      prisma.ideaWaitlist.findMany({
        where: { ideaId, ...(dateFilter && { createdAt: dateFilter }) },
        select: { createdAt: true },
      }),
    ]);

    const dailyActivity = this.buildTimeSeries(recentSignals, recentVotes, recentComments, range, idea.createdAt, recentWaitlist);

    const categoryMap = new Map<string, { count: number; comments: ScorecardComment[] }>();
    for (const c of commentsList) {
      const existing = categoryMap.get(c.category);
      if (existing) {
        existing.count++;
        existing.comments.push(c);
      } else {
        categoryMap.set(c.category, { count: 1, comments: [c] });
      }
    }
    const commentsByCategory: CommentCategoryGroup[] = Array.from(categoryMap.entries()).map(
      ([category, { count, comments }]) => ({ category: category as CommentCategoryType, count, comments })
    );

    const nextSteps = this.computeNextSteps(signals, commentsByCategory, idea._count.waitlist);

    return {
      id: idea.id,
      heading: idea.heading,
      description: idea.description,
      status: idea.status as IdeaAnalyticsData['status'],
      isPinned: idea.isPinned,
      createdAt: idea.createdAt.toISOString(),
      upvotesCount: idea.upvotesCount,
      downvotesCount: idea.downvotesCount,
      totalSignals,
      signals,
      commentsCount: idea.commentsCount,
      waitlistCount: idea._count.waitlist,
      validationState,
      nextSteps,
      dailyActivity,
      comments: commentsList,
    };
  }
}
