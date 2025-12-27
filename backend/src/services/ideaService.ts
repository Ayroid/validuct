import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { IdeaStatus } from '@prisma/client';

interface CreateIdeaData {
  heading: string;
  description: string;
  status?: IdeaStatus;
  launchedLink?: string;
}

interface UpdateIdeaData {
  heading?: string;
  description?: string;
  status?: IdeaStatus;
  launchedLink?: string;
}

interface GetIdeasParams {
  timeline: 'hot' | 'new' | 'trending';
  page?: number;
  limit?: number;
  userId?: string;
}

interface GetUserIdeasParams {
  username: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

export class IdeaService {
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

  static async getIdeas(params: GetIdeasParams) {
    const { timeline, page = 1, limit = 20, userId } = params;
    const skip = (page - 1) * limit;

    let orderBy: any = {};
    let where: any = {};

    switch (timeline) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'trending':
        orderBy = { upvotesCount: 'desc' };
        break;
      case 'hot':
        // Ideas with most upvotes in last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        where = {
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        };
        orderBy = { upvotesCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
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
