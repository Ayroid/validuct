import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service class for managing user-related operations
 */
export class UserService {
  /**
   * Retrieve a user's profile by username
   *
   * @param username - The username of the user to retrieve
   * @returns Object containing user profile data, ideas count, and pinned ideas, or null if not found
   *
   * @remarks
   * Returns user information along with:
   * - Total count of ideas created by the user
   * - List of pinned ideas (up to 5) ordered by pin order
   */
  static async getUserByUsername(username: string) {
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

    return {
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      ideasCount: user._count.ideas,
      pinnedIdeas: pinnedIdeas.map((pin) => pin.idea),
    };
  }

  /**
   * Update a user's profile information
   *
   * @param userId - The ID of the user to update
   * @param data - Object containing optional username, bio, and profilePicture fields
   * @returns The updated user profile
   * @throws {Error} If the new username is already taken by another user
   *
   * @remarks
   * Only provided fields will be updated
   * Username uniqueness is validated before updating
   */
  static async updateUserProfile(
    userId: string,
    data: {
      username?: string;
      bio?: string;
      profilePicture?: string;
    }
  ) {
    // If username is being updated, check if it's already taken
    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username already taken');
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
   *
   * @param username - The username of the user whose ideas to retrieve
   * @param page - The page number (default: 1)
   * @param limit - Number of ideas per page (default: 20)
   * @param sort - Sort order: 'newest', 'oldest', or 'popular' (default: 'newest')
   * @returns Object containing paginated ideas and pagination metadata, or null if user not found
   *
   * @remarks
   * Sort options:
   * - 'newest': Most recently created first
   * - 'oldest': Oldest ideas first
   * - 'popular': Most upvoted first
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
        take: limit,
      }),
      prisma.idea.count({
        where: { userId: user.id },
      }),
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
   * Pin an idea to a user's profile
   *
   * @param userId - The ID of the user pinning the idea
   * @param ideaId - The ID of the idea to pin
   * @returns Object with pinned status
   * @throws {Error} If the idea is not found
   * @throws {Error} If the user already has 5 pinned ideas (maximum limit)
   * @throws {Error} If the idea is already pinned
   *
   * @remarks
   * Users can pin up to 5 ideas on their profile
   * Pinned ideas are ordered by pinOrder (1-5)
   */
  static async pinIdea(userId: string, ideaId: string) {
    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Check if user already has 5 pinned ideas
    const pinnedCount = await prisma.pinnedIdea.count({
      where: { userId },
    });

    if (pinnedCount >= 5) {
      throw new Error('Maximum 5 ideas can be pinned');
    }

    // Check if already pinned
    const existingPin = await prisma.pinnedIdea.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (existingPin) {
      throw new Error('Idea already pinned');
    }

    // Get the next pin order
    const maxPinOrder = await prisma.pinnedIdea.findFirst({
      where: { userId },
      orderBy: { pinOrder: 'desc' },
      select: { pinOrder: true },
    });

    const pinOrder = maxPinOrder ? maxPinOrder.pinOrder + 1 : 1;

    // Create the pin
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
   *
   * @param userId - The ID of the user unpinning the idea
   * @param ideaId - The ID of the idea to unpin
   * @returns Object with pinned status
   * @throws {Error} If the idea is not currently pinned
   *
   * @remarks
   * After unpinning, remaining pinned ideas are automatically reordered
   * to maintain sequential pinOrder values (1, 2, 3, etc.)
   */
  static async unpinIdea(userId: string, ideaId: string) {
    // Check if the pin exists
    const pin = await prisma.pinnedIdea.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (!pin) {
      throw new Error('Idea is not pinned');
    }

    // Delete the pin
    await prisma.pinnedIdea.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    // Reorder remaining pins
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
   *
   * @param userId - The ID of the user whose pinned ideas to retrieve
   * @returns Array of pinned ideas ordered by pinOrder
   *
   * @remarks
   * Returns ideas with full user information
   * Ideas are sorted by pinOrder in ascending order
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
