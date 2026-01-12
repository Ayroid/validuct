import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { IdeaStatus } from '@prisma/client';

/**
 * Data required to create a new idea
 */
interface CreateIdeaData {
  heading: string;
  description: string;
  status?: IdeaStatus;
  launchedLink?: string;
}

/**
 * Data that can be updated on an existing idea
 */
interface UpdateIdeaData {
  heading?: string;
  description?: string;
  status?: IdeaStatus;
  launchedLink?: string;
}

/**
 * Parameters for retrieving ideas by timeline
 */
interface GetIdeasParams {
  timeline: 'new' | 'trending' | 'top';
  page?: number;
  limit?: number;
  userId?: string;
}

/**
 * Parameters for retrieving a specific user's ideas
 */
interface GetUserIdeasParams {
  username: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

/**
 * Service class for managing idea-related operations
 */
export class IdeaService {
  /**
   * Create a new idea
   *
   * @param userId - The ID of the user creating the idea
   * @param data - The idea data including heading, description, status, and launched link
   * @returns The newly created idea with user information
   *
   * @remarks
   * If no status is provided, defaults to IdeaStatus.DRAFT
   * Returns idea with user's username and profile picture
   */
  static async createIdea(userId: string, data: CreateIdeaData) {
    const idea = await prisma.idea.create({
      data: {
        userId,
        heading: data.heading,
        description: data.description,
        status: data.status || IdeaStatus.DRAFT,
        launchedLink: data.launchedLink || null,
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    return idea;
  }

  /**
   * Retrieve a single idea by its ID
   *
   * @param ideaId - The ID of the idea to retrieve
   * @param userId - Optional user ID to include their vote status
   * @returns The idea with user information and user's vote (if authenticated)
   * @throws {AppError} If the idea is not found (404)
   *
   * @remarks
   * If userId is provided, includes the user's vote status (upvote/downvote/null)
   */
  static async getIdeaById(ideaId: string, userId?: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // If user is authenticated, get their vote
    let userVote = null;
    if (userId) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_ideaId: {
            userId,
            ideaId,
          },
        },
      });
      userVote = vote ? vote.voteType.toLowerCase() : null;
    }

    return {
      ...idea,
      userVote,
    };
  }

  /**
   * Retrieve ideas with pagination and filtering by timeline
   *
   * @param params - Parameters including timeline, page, limit, and optional userId
   * @returns Object containing paginated ideas and pagination metadata
   *
   * @remarks
   * Timeline options:
   * - 'new': Most recently created ideas
   * - 'trending': Ideas that received the most upvotes in the last 24 hours (regardless of creation date)
   * - 'top': Ideas with most upvotes (all time)
   *
   * If userId is provided, includes user's vote status for each idea
   * Default pagination: page 1, limit 20
   */
  static async getIdeas(params: GetIdeasParams) {
    const { timeline, page = 1, limit = 20, userId } = params;
    const skip = (page - 1) * limit;

    // Special handling for trending - count votes received in last 24 hours
    if (timeline === 'trending') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Group votes by idea and count upvotes from last 24 hours
      const recentVotes = await prisma.vote.groupBy({
        by: ['ideaId'],
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          voteType: 'UPVOTE',
        },
        _count: { ideaId: true },
      });

      // Sort by recent upvote count descending
      recentVotes.sort((a, b) => b._count.ideaId - a._count.ideaId);

      const total = recentVotes.length;

      // Apply pagination to the vote counts
      const paginatedVotes = recentVotes.slice(skip, skip + limit);
      const trendingIdeaIds = paginatedVotes.map((v) => v.ideaId);

      // If no trending ideas, return early
      if (trendingIdeaIds.length === 0) {
        return {
          ideas: [],
          pagination: {
            page,
            limit,
            total: 0,
            total_pages: 0,
          },
        };
      }

      // Fetch the trending ideas
      const ideas = await prisma.idea.findMany({
        where: { id: { in: trendingIdeaIds } },
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      });

      // Restore correct order (findMany with 'in' doesn't preserve order)
      const ideaMap = new Map(ideas.map((idea) => [idea.id, idea]));
      const orderedIdeas = trendingIdeaIds
        .map((id) => ideaMap.get(id))
        .filter((idea): idea is NonNullable<typeof idea> => idea !== undefined);

      // Add user votes if authenticated
      let ideasWithVotes = orderedIdeas;
      if (userId) {
        const votes = await prisma.vote.findMany({
          where: {
            userId,
            ideaId: { in: trendingIdeaIds },
          },
        });

        const voteMap = new Map(votes.map((vote) => [vote.ideaId, vote.voteType.toLowerCase()]));

        ideasWithVotes = orderedIdeas.map((idea) => ({
          ...idea,
          userVote: voteMap.get(idea.id) || null,
        }));
      } else {
        ideasWithVotes = orderedIdeas.map((idea) => ({
          ...idea,
          userVote: null,
        }));
      }

      return {
        ideas: ideasWithVotes,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      };
    }

    // Regular handling for 'new' and 'top' timelines
    let orderBy: any = {};
    let where: any = {};

    switch (timeline) {
      case 'new':
        orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
        break;
      case 'top':
        // Secondary sort by id ensures stable ordering when upvotesCount is the same
        orderBy = [{ upvotesCount: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }];
        break;
      default:
        orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.idea.count({ where }),
    ]);

    // If user is authenticated, get their votes for these ideas
    let ideasWithVotes = ideas;
    if (userId) {
      const ideaIds = ideas.map((idea) => idea.id);
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          ideaId: { in: ideaIds },
        },
      });

      const voteMap = new Map(votes.map((vote) => [vote.ideaId, vote.voteType.toLowerCase()]));

      ideasWithVotes = ideas.map((idea) => ({
        ...idea,
        userVote: voteMap.get(idea.id) || null,
      }));
    } else {
      ideasWithVotes = ideas.map((idea) => ({
        ...idea,
        userVote: null,
      }));
    }

    return {
      ideas: ideasWithVotes,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve all ideas created by a specific user
   *
   * @param params - Parameters including username, page, limit, and sort order
   * @returns Object containing user's paginated ideas and pagination metadata
   * @throws {AppError} If the user is not found (404)
   *
   * @remarks
   * Sort options:
   * - 'newest': Most recently created first
   * - 'oldest': Oldest ideas first
   * - 'popular': Most upvoted first
   *
   * Default values: page 1, limit 20, sort 'newest'
   */
  static async getUserIdeas(params: GetUserIdeasParams) {
    const { username, page = 1, limit = 20, sort = 'newest' } = params;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const skip = (page - 1) * limit;

    let orderBy: any = {};
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        orderBy = { upvotesCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where: { userId: user.id },
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.idea.count({ where: { userId: user.id } }),
    ]);

    return {
      ideas,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an existing idea
   *
   * @param ideaId - The ID of the idea to update
   * @param userId - The ID of the user attempting to update the idea
   * @param data - The data to update (heading, description, status, launchedLink)
   * @returns The updated idea with user information
   * @throws {AppError} If the idea is not found (404)
   * @throws {AppError} If the user is not authorized to update the idea (403)
   *
   * @remarks
   * Only the owner of the idea can update it
   * Only provided fields will be updated
   */
  static async updateIdea(ideaId: string, userId: string, data: UpdateIdeaData) {
    // Check if idea exists and belongs to user
    const existingIdea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!existingIdea) {
      throw new AppError('Idea not found', 404);
    }

    if (existingIdea.userId !== userId) {
      throw new AppError('Not authorized to update this idea', 403);
    }

    const idea = await prisma.idea.update({
      where: { id: ideaId },
      data: {
        ...(data.heading && { heading: data.heading }),
        ...(data.description && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.launchedLink !== undefined && { launchedLink: data.launchedLink }),
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    return idea;
  }

  /**
   * Delete an idea
   *
   * @param ideaId - The ID of the idea to delete
   * @param userId - The ID of the user attempting to delete the idea
   * @returns Promise that resolves when the idea is deleted
   * @throws {AppError} If the idea is not found (404)
   * @throws {AppError} If the user is not authorized to delete the idea (403)
   *
   * @remarks
   * Only the owner of the idea can delete it
   * This will cascade delete all associated votes and comments
   */
  static async deleteIdea(ideaId: string, userId: string) {
    // Check if idea exists and belongs to user
    const existingIdea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!existingIdea) {
      throw new AppError('Idea not found', 404);
    }

    if (existingIdea.userId !== userId) {
      throw new AppError('Not authorized to delete this idea', 403);
    }

    await prisma.idea.delete({
      where: { id: ideaId },
    });
  }
}
