import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { EmailStatus } from '../../prisma/client/client.js';
import { paginate, buildPaginationMeta } from '../utils/pagination.js';

export class EmailQueueService {
  static async getAllEmailQueue(page: number = 1, limit: number = 20, status?: EmailStatus) {
    const { skip, take } = paginate(page, limit);
    const where = status ? { status } : {};

    const [entries, total] = await Promise.all([
      prisma.emailQueue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { username: true, email: true } },
        },
      }),
      prisma.emailQueue.count({ where }),
    ]);

    return {
      entries,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static async getEmailQueueStats() {
    const [pending, sent, failed] = await Promise.all([
      prisma.emailQueue.count({ where: { status: 'PENDING' } }),
      prisma.emailQueue.count({ where: { status: 'SENT' } }),
      prisma.emailQueue.count({ where: { status: 'FAILED' } }),
    ]);
    return { pending, sent, failed, total: pending + sent + failed };
  }

  static async retryEmailQueueEntry(id: string) {
    const entry = await prisma.emailQueue.findUnique({ where: { id } });
    if (!entry) throw new AppError('Email queue entry not found', 404);
    if (entry.status !== 'FAILED') throw new AppError('Only FAILED emails can be retried', 400);

    return prisma.emailQueue.update({
      where: { id },
      data: {
        status: 'PENDING',
        retryCount: 0,
        nextRetryAt: null,
        errorMessage: null,
        failedAt: null,
      },
      include: { user: { select: { username: true, email: true } } },
    });
  }

  static async deleteEmailQueueEntry(id: string) {
    const entry = await prisma.emailQueue.findUnique({ where: { id } });
    if (!entry) throw new AppError('Email queue entry not found', 404);
    await prisma.emailQueue.delete({ where: { id } });
  }
}
