import { prisma } from '../config/database.js';
import { Prisma } from '../../prisma/client/client.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, buildPaginationMeta } from '../utils/pagination.js';

type UserType = 'REAL' | 'DUMMY';
type UserSort = 'newest' | 'oldest' | 'most_ideas' | 'least_ideas';

/**
 * Service class for managing user profile operations.
 */
export class UserService {
  /**
   * Retrieve a user's profile by username
   */
  static async getUserByUsername(username: string, viewerUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            ideas: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Get pinned ideas
    const pinnedIdeas = await prisma.pinnedIdea.findMany({
      where: { userId: user.id },
      include: {
        idea: {
          include: {
            user: {
              select: {
                username: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: { pinOrder: 'asc' },
    });

    const ideas = pinnedIdeas.map((pin) => pin.idea);

    // Look up viewer's votes for pinned ideas
    let pinnedIdeasWithVotes;
    if (viewerUserId && ideas.length > 0) {
      const votes = await prisma.vote.findMany({
        where: {
          userId: viewerUserId,
          ideaId: { in: ideas.map((idea) => idea.id) },
        },
      });
      const voteMap = new Map(votes.map((vote) => [vote.ideaId, vote.voteType.toLowerCase()]));
      pinnedIdeasWithVotes = ideas.map((idea) => ({
        ...idea,
        userVote: voteMap.get(idea.id) || null,
      }));
    } else {
      pinnedIdeasWithVotes = ideas.map((idea) => ({
        ...idea,
        userVote: null,
      }));
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      ideasCount: user._count.ideas,
      pinnedIdeas: pinnedIdeasWithVotes,
    };
  }

  /**
   * Retrieve paginated list of all users (admin only)
   */
  static async getAllUsers(page: number = 1, limit: number = 10, userType?: UserType, sort: UserSort = 'newest') {
    const { skip, take } = paginate(page, limit);
    const where = userType
      ? userType === 'DUMMY'
        ? {
            OR: [
              { email: { endsWith: '@example.com' } },
              { email: { endsWith: '@validuct.com' } },
            ],
          }
        : {
            AND: [
              { email: { not: { endsWith: '@example.com' } } },
              { email: { not: { endsWith: '@validuct.com' } } },
            ],
          }
      : {};

    let orderBy: Prisma.UserOrderByWithRelationInput;
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'most_ideas':
        orderBy = { ideas: { _count: 'desc' } };
        break;
      case 'least_ideas':
        orderBy = { ideas: { _count: 'asc' } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          ideas: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const usersWithIdeaCounts = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
      ideasCount: user.ideas.length,
    }));

    return {
      users: usersWithIdeaCounts,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Update a user's profile information
   */
  static async updateUserProfile(
    userId: string,
    data: {
      username?: string;
      bio?: string;
      profilePicture?: string;
    }
  ) {
    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Username already taken', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.profilePicture !== undefined && {
          profilePicture: data.profilePicture,
        }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Retrieve paginated ideas for a specific user
   */
  static async getUserIdeas(
    username: string,
    page: number = 1,
    limit: number = 20,
    sort: 'newest' | 'oldest' | 'popular' = 'newest'
  ) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const { skip, take } = paginate(page, limit);

    let orderBy: Prisma.IdeaOrderByWithRelationInput = {};
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
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where: { userId: user.id },
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.idea.count({
        where: { userId: user.id },
      }),
    ]);

    return {
      ideas,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Pin an idea to a user's profile
   */
  static async pinIdea(userId: string, ideaId: string) {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    const pinnedCount = await prisma.pinnedIdea.count({
      where: { userId },
    });

    if (pinnedCount >= 5) {
      throw new AppError('Maximum 5 ideas can be pinned', 400);
    }

    const existingPin = await prisma.pinnedIdea.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (existingPin) {
      throw new AppError('Idea already pinned', 400);
    }

    const maxPinOrder = await prisma.pinnedIdea.findFirst({
      where: { userId },
      orderBy: { pinOrder: 'desc' },
      select: { pinOrder: true },
    });

    const pinOrder = maxPinOrder ? maxPinOrder.pinOrder + 1 : 1;

    await prisma.pinnedIdea.create({
      data: {
        userId,
        ideaId,
        pinOrder,
      },
    });

    return { pinned: true };
  }

  /**
   * Unpin an idea from a user's profile
   */
  static async unpinIdea(userId: string, ideaId: string) {
    const pin = await prisma.pinnedIdea.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (!pin) {
      throw new AppError('Idea is not pinned', 400);
    }

    await prisma.pinnedIdea.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    await prisma.$transaction(async (tx) => {
      const remainingPins = await tx.pinnedIdea.findMany({
        where: { userId },
        orderBy: { pinOrder: 'asc' },
      });

      for (let i = 0; i < remainingPins.length; i++) {
        await tx.pinnedIdea.update({
          where: { id: remainingPins[i].id },
          data: { pinOrder: i + 1 },
        });
      }
    });

    return { pinned: false };
  }

  /**
   * Retrieve all pinned ideas for a user
   */
  static async getPinnedIdeas(userId: string) {
    const pinnedIdeas = await prisma.pinnedIdea.findMany({
      where: { userId },
      include: {
        idea: {
          include: {
            user: {
              select: {
                username: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: { pinOrder: 'asc' },
    });

    return pinnedIdeas.map((pin) => pin.idea);
  }
}
