import { randomUUID } from 'crypto';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, buildPaginationMeta } from '../utils/pagination.js';

/**
 * Service class for managing idea waitlists
 */
export class IdeaWaitlistService {
  /**
   * Join the waitlist for an idea
   *
   * @param ideaId - The ID of the idea
   * @param email - The email to add to the waitlist
   * @returns Object with the waitlist entry ID and success status
   * @throws {AppError} If the idea is not found (404) or email already registered (400)
   */
  static async joinWaitlist(ideaId: string, email: string) {
    // Verify idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // Check if email already registered for this idea
    const existingEntry = await prisma.ideaWaitlist.findUnique({
      where: {
        ideaId_email: {
          ideaId,
          email,
        },
      },
    });

    if (existingEntry) {
      throw new AppError('Email already registered for this waitlist', 400);
    }

    // Create waitlist entry
    const entry = await prisma.ideaWaitlist.create({
      data: {
        ideaId,
        email,
      },
    });

    // Generate waitlist access token for idea if not exists
    if (!idea.waitlistAccessToken) {
      await prisma.idea.update({
        where: { id: ideaId },
        data: { waitlistAccessToken: randomUUID() },
      });
    }

    return {
      id: entry.id,
      joined: true,
    };
  }

  /**
   * Get waitlist statistics for an idea
   *
   * @param ideaId - The ID of the idea
   * @param userId - Optional user ID to check ownership
   * @returns Object with count and access token (for owner only)
   * @throws {AppError} If the idea is not found (404)
   */
  static async getWaitlistStats(ideaId: string, userId?: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        userId: true,
        waitlistAccessToken: true,
      },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    const count = await prisma.ideaWaitlist.count({
      where: { ideaId },
    });

    const isOwner = userId ? idea.userId === userId : false;

    return {
      count,
      // Only return access token to owner
      accessToken: isOwner ? idea.waitlistAccessToken : null,
      isOwner,
    };
  }

  /**
   * Verify idea ownership and access token
   */
  private static async verifyOwnerAccess(ideaId: string, accessToken: string, userId: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        userId: true,
        heading: true,
        waitlistAccessToken: true,
      },
    });

    if (!idea) {
      throw new AppError('Not found', 404);
    }

    // Verify ownership
    if (idea.userId !== userId) {
      throw new AppError('Not found', 404);
    }

    // Verify access token
    if (idea.waitlistAccessToken !== accessToken) {
      throw new AppError('Not found', 404);
    }

    return idea;
  }

  /**
   * Get paginated waitlist by access token (owner verification)
   *
   * @param ideaId - The ID of the idea
   * @param accessToken - The access token for verification
   * @param userId - The user ID for ownership verification
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Object with paginated waitlist data
   * @throws {AppError} If not found or not authorized (404)
   */
  static async getWaitlistByToken(
    ideaId: string,
    accessToken: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const idea = await this.verifyOwnerAccess(ideaId, accessToken, userId);

    const total = await prisma.ideaWaitlist.count({
      where: { ideaId },
    });

    const { skip, take } = paginate(page, limit);

    const entries = await prisma.ideaWaitlist.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      ideaId: idea.id,
      ideaHeading: idea.heading,
      totalCount: total,
      entries,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get all waitlist emails for export (owner verification)
   *
   * @param ideaId - The ID of the idea
   * @param accessToken - The access token for verification
   * @param userId - The user ID for ownership verification
   * @returns Object with all emails for export
   * @throws {AppError} If not found or not authorized (404)
   */
  static async getAllWaitlistEmails(ideaId: string, accessToken: string, userId: string) {
    const idea = await this.verifyOwnerAccess(ideaId, accessToken, userId);

    const entries = await prisma.ideaWaitlist.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        createdAt: true,
      },
    });

    return {
      ideaId: idea.id,
      ideaHeading: idea.heading,
      totalCount: entries.length,
      entries,
    };
  }

  private static async verifyOwnership(ideaId: string, userId: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: { id: true, userId: true, heading: true },
    });

    if (!idea || idea.userId !== userId) {
      throw new AppError('Not found', 404);
    }

    return idea;
  }

  static async getWaitlistEntries(ideaId: string, userId: string, page: number = 1, limit: number = 20) {
    const idea = await this.verifyOwnership(ideaId, userId);

    const total = await prisma.ideaWaitlist.count({ where: { ideaId } });

    const { skip, take } = paginate(page, limit);

    const entries = await prisma.ideaWaitlist.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: { id: true, email: true, createdAt: true },
    });

    return {
      ideaId: idea.id,
      ideaHeading: idea.heading,
      totalCount: total,
      entries,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static async exportWaitlistEmails(ideaId: string, userId: string) {
    const idea = await this.verifyOwnership(ideaId, userId);

    const entries = await prisma.ideaWaitlist.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'desc' },
      select: { email: true, createdAt: true },
    });

    return {
      ideaId: idea.id,
      ideaHeading: idea.heading,
      totalCount: entries.length,
      entries,
    };
  }
}
