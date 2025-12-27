import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
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
