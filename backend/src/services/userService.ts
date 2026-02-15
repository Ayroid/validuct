import { prisma } from '../config/database.js';
import {
  SignalStrength,
  ValidationState,
  ValidationSummary,
  NextActionRecommendation,
  IdeaWithSignals,
  IdeaSignalCounts,
  PaginationMeta,
  ProfileSortMode,
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

  // ============================================================================
  // Validation Dashboard Methods
  // ============================================================================

  /**
   * Calculate signal strength based on counts relative to total ideas
   * Requires minimum 5 signals before calculating meaningful strength
   */
  private static calculateStrength(
    ideasWithSignal: number,
    totalIdeas: number,
    totalSignals: number
  ): SignalStrength {
    const MIN_SIGNALS_REQUIRED = 5;

    if (totalIdeas === 0) return 'NONE';
    if (totalSignals < MIN_SIGNALS_REQUIRED) return 'EARLY';

    const ratio = ideasWithSignal / totalIdeas;
    if (ratio >= 0.6) return 'STRONG';
    if (ratio >= 0.3) return 'MIXED';
    if (ratio > 0) return 'WEAK';
    return 'NONE';
  }

  /**
   * Determine the validation state of an idea based on its signals
   */
  private static getIdeaValidationState(signals: IdeaSignalCounts): ValidationState {
    const { problemReal, wouldPay, readyToBuild, needsClarity } = signals;

    // High clarity concerns = needs action
    if (needsClarity >= 3 || (needsClarity > 0 && needsClarity >= problemReal)) {
      return 'NEEDS_ACTION';
    }

    // Strong across all positive signals = validated
    if (problemReal >= 3 && wouldPay >= 2 && readyToBuild >= 2) {
      return 'VALIDATED';
    }

    // Good problem + WTP + ready signals = ready to build
    if (problemReal >= 2 && wouldPay >= 1 && readyToBuild >= 2) {
      return 'READY_TO_BUILD';
    }

    // Some signals but not enough = needs action
    if (problemReal > 0 || wouldPay > 0 || readyToBuild > 0) {
      return 'NEEDS_ACTION';
    }

    return 'NEUTRAL';
  }

  /**
   * Determine the next recommended action based on signal patterns
   */
  private static
  determineNextAction(
    ideas: Array<{
      id: string;
      heading: string;
      signals: IdeaSignalCounts;
      validationState: ValidationState;
    }>,
    totalIdeas: number
  ): NextActionRecommendation {
    if (totalIdeas === 0) {
      return {
        action: 'ADD_FIRST_IDEA',
        message: 'Share your first idea to start gathering validation signals',
        priority: 'HIGH',
      };
    }

    // Find ideas that need clarity the most
    const needsClarityIdeas = ideas
      .filter((i) => i.signals.needsClarity > 0)
      .sort((a, b) => b.signals.needsClarity - a.signals.needsClarity);

    if (needsClarityIdeas.length > 0) {
      const target = needsClarityIdeas[0];
      return {
        action: 'CLARIFY_PROBLEM',
        message: `"${target.heading}" needs more clarity - refine the problem statement`,
        priority: 'HIGH',
        targetIdeaId: target.id,
        targetIdeaHeading: target.heading,
      };
    }

    // Find ideas with problem validation but no WTP signals
    const needsPricingTest = ideas
      .filter((i) => i.signals.problemReal >= 2 && i.signals.wouldPay === 0)
      .sort((a, b) => b.signals.problemReal - a.signals.problemReal);

    if (needsPricingTest.length > 0) {
      const target = needsPricingTest[0];
      return {
        action: 'TEST_PRICING',
        message: `"${target.heading}" has validated problem - test willingness to pay`,
        priority: 'MEDIUM',
        targetIdeaId: target.id,
        targetIdeaHeading: target.heading,
      };
    }

    // Find ideas ready to build
    const readyToBuild = ideas
      .filter((i) => i.validationState === 'READY_TO_BUILD' || i.validationState === 'VALIDATED')
      .sort((a, b) => b.signals.readyToBuild - a.signals.readyToBuild);

    if (readyToBuild.length > 0) {
      const target = readyToBuild[0];
      return {
        action: 'READY_TO_BUILD',
        message: `"${target.heading}" is validated and ready to build!`,
        priority: 'LOW',
        targetIdeaId: target.id,
        targetIdeaHeading: target.heading,
      };
    }

    // Default: gather more feedback
    const mostEngaged = [...ideas].sort(
      (a, b) =>
        b.signals.problemReal + b.signals.wouldPay - (a.signals.problemReal + a.signals.wouldPay)
    )[0];

    return {
      action: 'GATHER_FEEDBACK',
      message: mostEngaged
        ? `Share "${mostEngaged.heading}" to gather more validation signals`
        : 'Share your ideas to gather validation signals',
      priority: 'MEDIUM',
      targetIdeaId: mostEngaged?.id,
      targetIdeaHeading: mostEngaged?.heading,
    };
  }

  /**
   * Get validation summary for a user's ideas
   *
   * @param username - The username of the user
   * @returns ValidationSummary object with aggregated signals and next action, or null if user not found
   */
  static async getValidationSummary(username: string): Promise<ValidationSummary | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    // Get all ideas with their signal counts
    const ideas = await prisma.idea.findMany({
      where: { userId: user.id },
      include: {
        signals: {
          select: {
            signalType: true,
          },
        },
      },
    });

    const totalIdeas = ideas.length;

    // Process each idea's signals
    const ideasWithSignals = ideas.map((idea) => {
      const signalCounts: IdeaSignalCounts = {
        problemReal: idea.signals.filter((s) => s.signalType === 'PROBLEM_REAL').length,
        wouldPay: idea.signals.filter((s) => s.signalType === 'WOULD_PAY').length,
        readyToBuild: idea.signals.filter((s) => s.signalType === 'READY_TO_BUILD').length,
        needsClarity: idea.signals.filter((s) => s.signalType === 'NEEDS_CLARITY').length,
      };

      return {
        id: idea.id,
        heading: idea.heading,
        signals: signalCounts,
        validationState: this.getIdeaValidationState(signalCounts),
      };
    });

    // Aggregate signal counts
    const aggregated = {
      problemReal: { total: 0, ideasWith: 0 },
      wouldPay: { total: 0, ideasWith: 0 },
      readyToBuild: { total: 0, ideasWith: 0 },
      needsClarity: { total: 0, ideasWith: 0 },
    };

    ideasWithSignals.forEach((idea) => {
      if (idea.signals.problemReal > 0) {
        aggregated.problemReal.total += idea.signals.problemReal;
        aggregated.problemReal.ideasWith++;
      }
      if (idea.signals.wouldPay > 0) {
        aggregated.wouldPay.total += idea.signals.wouldPay;
        aggregated.wouldPay.ideasWith++;
      }
      if (idea.signals.readyToBuild > 0) {
        aggregated.readyToBuild.total += idea.signals.readyToBuild;
        aggregated.readyToBuild.ideasWith++;
      }
      if (idea.signals.needsClarity > 0) {
        aggregated.needsClarity.total += idea.signals.needsClarity;
        aggregated.needsClarity.ideasWith++;
      }
    });

    // Count ideas by validation state
    const ideasByValidationState = {
      needsAction: ideasWithSignals.filter((i) => i.validationState === 'NEEDS_ACTION').length,
      readyToBuild: ideasWithSignals.filter((i) => i.validationState === 'READY_TO_BUILD').length,
      validated: ideasWithSignals.filter((i) => i.validationState === 'VALIDATED').length,
    };

    return {
      totalIdeas,
      problem: {
        signalType: 'PROBLEM_REAL',
        totalCount: aggregated.problemReal.total,
        ideasWithSignal: aggregated.problemReal.ideasWith,
        strength: this.calculateStrength(
          aggregated.problemReal.ideasWith,
          totalIdeas,
          aggregated.problemReal.total
        ),
      },
      willingness: {
        signalType: 'WOULD_PAY',
        totalCount: aggregated.wouldPay.total,
        ideasWithSignal: aggregated.wouldPay.ideasWith,
        strength: this.calculateStrength(
          aggregated.wouldPay.ideasWith,
          totalIdeas,
          aggregated.wouldPay.total
        ),
      },
      execution: {
        signalType: 'READY_TO_BUILD',
        totalCount: aggregated.readyToBuild.total,
        ideasWithSignal: aggregated.readyToBuild.ideasWith,
        strength: this.calculateStrength(
          aggregated.readyToBuild.ideasWith,
          totalIdeas,
          aggregated.readyToBuild.total
        ),
      },
      clarity: {
        signalType: 'NEEDS_CLARITY',
        totalCount: aggregated.needsClarity.total,
        ideasWithSignal: aggregated.needsClarity.ideasWith,
        strength: this.calculateStrength(
          aggregated.needsClarity.ideasWith,
          totalIdeas,
          aggregated.needsClarity.total
        ),
      },
      nextAction: this.determineNextAction(ideasWithSignals, totalIdeas),
      ideasByValidationState,
    };
  }

  /**
   * Get user ideas with signal snapshots and validation state
   *
   * @param username - The username of the user
   * @param page - The page number (default: 1)
   * @param limit - Number of ideas per page (default: 20)
   * @param sort - Sort mode: 'needs_action', 'ready_to_build', 'newest', 'oldest', 'all'
   * @returns Object containing ideas with signals and pagination metadata, or null if user not found
   */
  static async getUserIdeasWithSignals(
    username: string,
    page: number = 1,
    limit: number = 20,
    sort: ProfileSortMode = 'newest'
  ): Promise<{ ideas: IdeaWithSignals[]; pagination: PaginationMeta } | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    // Get all ideas with signals for sorting
    const allIdeas = await prisma.idea.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
        signals: {
          select: {
            signalType: true,
          },
        },
      },
    });

    // Transform and calculate validation states
    const ideasWithSignals: IdeaWithSignals[] = allIdeas.map((idea) => {
      const signals: IdeaSignalCounts = {
        problemReal: idea.signals.filter((s) => s.signalType === 'PROBLEM_REAL').length,
        wouldPay: idea.signals.filter((s) => s.signalType === 'WOULD_PAY').length,
        readyToBuild: idea.signals.filter((s) => s.signalType === 'READY_TO_BUILD').length,
        needsClarity: idea.signals.filter((s) => s.signalType === 'NEEDS_CLARITY').length,
      };

      return {
        id: idea.id,
        userId: idea.userId,
        heading: idea.heading,
        description: idea.description,
        status: idea.status as 'VALIDATED' | 'WIP' | 'LAUNCHED' | 'DRAFT',
        launchedLink: idea.launchedLink,
        commentsCount: idea.commentsCount,
        createdAt: idea.createdAt.toISOString(),
        updatedAt: idea.updatedAt.toISOString(),
        user: idea.user,
        signals,
        validationState: this.getIdeaValidationState(signals),
      };
    });

    // Sort based on the requested mode
    let sortedIdeas: IdeaWithSignals[];
    switch (sort) {
      case 'needs_action':
        sortedIdeas = ideasWithSignals
          .filter((i) => i.validationState === 'NEEDS_ACTION' || i.validationState === 'NEUTRAL')
          .sort((a, b) => {
            // Prioritize by needsClarity, then by lack of signals
            const aScore =
              a.signals.needsClarity * 10 - (a.signals.problemReal + a.signals.wouldPay);
            const bScore =
              b.signals.needsClarity * 10 - (b.signals.problemReal + b.signals.wouldPay);
            return bScore - aScore;
          });
        break;
      case 'ready_to_build':
        sortedIdeas = ideasWithSignals
          .filter(
            (i) => i.validationState === 'READY_TO_BUILD' || i.validationState === 'VALIDATED'
          )
          .sort((a, b) => {
            const aScore = a.signals.readyToBuild + a.signals.problemReal + a.signals.wouldPay;
            const bScore = b.signals.readyToBuild + b.signals.problemReal + b.signals.wouldPay;
            return bScore - aScore;
          });
        break;
      case 'oldest':
        sortedIdeas = [...ideasWithSignals].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'newest':
      case 'all':
      default:
        sortedIdeas = [...ideasWithSignals].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // Paginate
    const total = sortedIdeas.length;
    const skip = (page - 1) * limit;
    const paginatedIdeas = sortedIdeas.slice(skip, skip + limit);

    return {
      ideas: paginatedIdeas,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================================
  // Idea Portfolio & Scorecard Methods
  // ============================================================================

  private static countSignals(signals: Array<{ signalType: string }>): IdeaSignalCounts {
    return signals.reduce(
      (acc, s) => {
        switch (s.signalType) {
          case 'PROBLEM_REAL':
            acc.problemReal++;
            break;
          case 'WOULD_PAY':
            acc.wouldPay++;
            break;
          case 'READY_TO_BUILD':
            acc.readyToBuild++;
            break;
          case 'NEEDS_CLARITY':
            acc.needsClarity++;
            break;
        }
        return acc;
      },
      { problemReal: 0, wouldPay: 0, readyToBuild: 0, needsClarity: 0 }
    );
  }

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
   * Get idea portfolio for a user — lightweight overview of all ideas
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
      const signals = this.countSignals(idea.signals);
      const healthDots = this.calculateHealthDots(signals);
      const validationState = this.getIdeaValidationState(signals);
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
   * Get full scorecard for a single idea — heavy endpoint with comments and next steps
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

    const signals = this.countSignals(idea.signals);
    const healthDots = this.calculateHealthDots(signals);
    const validationState = this.getIdeaValidationState(signals);

    // Group comments by category
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

    // Top 3 comments by helpfulCount
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

  // ============================================================================
  // Analytics Dashboard Methods
  // ============================================================================

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
   * For 24h: hourly buckets. For 7d/30d/all: daily buckets.
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
      // Hourly buckets for last 24 hours
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        d.setMinutes(0, 0, 0);
        const key = d.toISOString().slice(0, 13); // "2026-02-15T14"
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
      // Daily buckets
      let numDays: number;
      if (range === '7d') {
        numDays = 7;
      } else if (range === '30d') {
        numDays = 30;
      } else {
        // 'all' — from earliest date to now
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

    // Compute lifetime aggregates
    let totalSignals = 0;
    let totalUpvotes = 0;
    let totalComments = 0;
    let totalWaitlistSignups = 0;
    const ideasByStatus = { DRAFT: 0, WIP: 0, VALIDATED: 0, LAUNCHED: 0 };
    const ideasByValidationState = { NEEDS_ACTION: 0, READY_TO_BUILD: 0, VALIDATED: 0, NEUTRAL: 0 };
    const signalDistribution: IdeaSignalCounts = { problemReal: 0, wouldPay: 0, readyToBuild: 0, needsClarity: 0 };

    const topIdeas: TopIdeaAnalytics[] = ideas.map((idea) => {
      const signals = this.countSignals(idea.signals);
      const ideaTotalSignals = signals.problemReal + signals.wouldPay + signals.readyToBuild + signals.needsClarity;

      totalSignals += ideaTotalSignals;
      totalUpvotes += idea.upvotesCount;
      totalComments += idea.commentsCount;
      totalWaitlistSignups += idea._count.waitlist;

      const status = idea.status as keyof typeof ideasByStatus;
      if (status in ideasByStatus) ideasByStatus[status]++;

      const vState = this.getIdeaValidationState(signals);
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

    // Fetch activity records for the selected range
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

    // For 'all' range, find earliest idea date
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
   * Get analytics data for a single idea, including comments.
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

    const signals = this.countSignals(idea.signals);
    const totalSignals = signals.problemReal + signals.wouldPay + signals.readyToBuild + signals.needsClarity;
    const validationState = this.getIdeaValidationState(signals);

    // Map comments
    const commentsList: ScorecardComment[] = idea.comments.map((c) => ({
      id: c.id,
      content: c.content,
      category: c.category as CommentCategoryType,
      helpfulCount: c.helpfulCount,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    }));

    // Fetch activity records for the selected range
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

    // Build commentsByCategory for next steps computation
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
