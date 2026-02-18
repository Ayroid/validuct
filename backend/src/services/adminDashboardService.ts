import { prisma } from '../config/database.js';

export type AdminDashboardRange = '7d' | '30d' | '90d';

export interface DailyAdminActivity {
  date: string;
  signals: number;
  upvotes: number;
  comments: number;
  waitlist: number;
  newUsers: number;
}

export interface TopAdminIdea {
  id: string;
  heading: string;
  status: string;
  upvotesCount: number;
  commentsCount: number;
  signalsCount: number;
  waitlistCount: number;
  username: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  realUsers: number;
  dummyUsers: number;
  newUsersInRange: number;
  totalIdeas: number;
  ideasByStatus: { DRAFT: number; WIP: number; VALIDATED: number; LAUNCHED: number };
  newIdeasInRange: number;
  totalSignals: number;
  totalUpvotes: number;
  totalComments: number;
  totalMainWaitlist: number;
  totalIdeaWaitlist: number;
  emailStats: { pending: number; sent: number; failed: number; total: number };
  dailyActivity: DailyAdminActivity[];
  topIdeas: TopAdminIdea[];
}

export class AdminDashboardService {
  private static getCutoff(range: AdminDashboardRange): Date {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  private static buildTimeSeries(
    range: AdminDashboardRange,
    signals: Date[],
    votes: Date[],
    comments: Date[],
    waitlist: Date[],
    newUsers: Date[]
  ): DailyAdminActivity[] {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const now = new Date();
    const entries: DailyAdminActivity[] = [];
    const dateMap = new Map<string, DailyAdminActivity>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry: DailyAdminActivity = { date: key, signals: 0, upvotes: 0, comments: 0, waitlist: 0, newUsers: 0 };
      dateMap.set(key, entry);
      entries.push(entry);
    }

    for (const d of signals)  { const e = dateMap.get(d.toISOString().slice(0, 10)); if (e) e.signals++;  }
    for (const d of votes)    { const e = dateMap.get(d.toISOString().slice(0, 10)); if (e) e.upvotes++;  }
    for (const d of comments) { const e = dateMap.get(d.toISOString().slice(0, 10)); if (e) e.comments++; }
    for (const d of waitlist) { const e = dateMap.get(d.toISOString().slice(0, 10)); if (e) e.waitlist++; }
    for (const d of newUsers) { const e = dateMap.get(d.toISOString().slice(0, 10)); if (e) e.newUsers++; }

    return entries;
  }

  static async getAdminStats(range: AdminDashboardRange = '30d'): Promise<AdminDashboardStats> {
    const cutoff = this.getCutoff(range);
    const dateFilter = { gte: cutoff };

    const dummyWhere = {
      OR: [
        { email: { endsWith: '@example.com' } },
        { email: { endsWith: '@validuct.com' } },
      ],
    };
    const realWhere = {
      AND: [
        { email: { not: { endsWith: '@example.com' } } },
        { email: { not: { endsWith: '@validuct.com' } } },
      ],
    };

    const [
      totalUsers, realUsers, dummyUsers, newUsersInRange,
      totalIdeas, newIdeasInRange,
      totalSignals, totalUpvotes, totalComments,
      totalMainWaitlist, totalIdeaWaitlist,
      ideasGrouped, emailGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: realWhere }),
      prisma.user.count({ where: dummyWhere }),
      prisma.user.count({ where: { createdAt: dateFilter } }),
      prisma.idea.count(),
      prisma.idea.count({ where: { createdAt: dateFilter } }),
      prisma.ideaSignal.count(),
      prisma.vote.count({ where: { voteType: 'UPVOTE' } }),
      prisma.comment.count(),
      prisma.waitlist.count(),
      prisma.ideaWaitlist.count(),
      prisma.idea.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.emailQueue.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    const ideasByStatus = { DRAFT: 0, WIP: 0, VALIDATED: 0, LAUNCHED: 0 };
    for (const g of ideasGrouped) {
      const key = g.status as keyof typeof ideasByStatus;
      if (key in ideasByStatus) ideasByStatus[key] = g._count.id;
    }

    const emailStats = { pending: 0, sent: 0, failed: 0, total: 0 };
    for (const g of emailGroups) {
      const count = g._count.id;
      emailStats.total += count;
      if (g.status === 'PENDING')      emailStats.pending = count;
      else if (g.status === 'SENT')    emailStats.sent    = count;
      else if (g.status === 'FAILED')  emailStats.failed  = count;
    }

    const [recentSignals, recentVotes, recentComments, recentWaitlist, recentUsers] = await Promise.all([
      prisma.ideaSignal.findMany({ where: { createdAt: dateFilter }, select: { createdAt: true } }),
      prisma.vote.findMany({ where: { voteType: 'UPVOTE', createdAt: dateFilter }, select: { createdAt: true } }),
      prisma.comment.findMany({ where: { createdAt: dateFilter }, select: { createdAt: true } }),
      prisma.ideaWaitlist.findMany({ where: { createdAt: dateFilter }, select: { createdAt: true } }),
      prisma.user.findMany({ where: { createdAt: dateFilter }, select: { createdAt: true } }),
    ]);

    const dailyActivity = this.buildTimeSeries(
      range,
      recentSignals.map((s) => s.createdAt),
      recentVotes.map((v) => v.createdAt),
      recentComments.map((c) => c.createdAt),
      recentWaitlist.map((w) => w.createdAt),
      recentUsers.map((u) => u.createdAt)
    );

    const topIdeasRaw = await prisma.idea.findMany({
      orderBy: { upvotesCount: 'desc' },
      take: 5,
      include: {
        user: { select: { username: true } },
        _count: { select: { waitlist: true, signals: true } },
      },
    });

    const topIdeas: TopAdminIdea[] = topIdeasRaw.map((idea) => ({
      id: idea.id,
      heading: idea.heading,
      status: idea.status,
      upvotesCount: idea.upvotesCount,
      commentsCount: idea.commentsCount,
      signalsCount: idea._count.signals,
      waitlistCount: idea._count.waitlist,
      username: idea.user.username,
    }));

    return {
      totalUsers, realUsers, dummyUsers, newUsersInRange,
      totalIdeas, ideasByStatus, newIdeasInRange,
      totalSignals, totalUpvotes, totalComments,
      totalMainWaitlist, totalIdeaWaitlist,
      emailStats, dailyActivity, topIdeas,
    };
  }
}
