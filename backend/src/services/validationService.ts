import { prisma } from '../config/database.js';
import { paginate, buildPaginationMeta } from '../utils/pagination.js';
import {
  SignalStrength,
  ValidationState,
  ValidationSummary,
  NextActionRecommendation,
  IdeaWithSignals,
  IdeaSignalCounts,
  PaginationMeta,
  ProfileSortMode,
} from '../types/index.js';

/**
 * Service class for validation dashboard operations.
 * Shared signal helpers (countSignals, getIdeaValidationState) are also
 * exported here so that AnalyticsService can reuse them.
 */
export class ValidationService {
  /**
   * Count signals by type from a raw signal array.
   */
  static countSignals(signals: Array<{ signalType: string }>): IdeaSignalCounts {
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

  /**
   * Determine the validation state of an idea based on its signals.
   */
  static getIdeaValidationState(signals: IdeaSignalCounts): ValidationState {
    const { problemReal, wouldPay, readyToBuild, needsClarity } = signals;

    if (needsClarity >= 3 || (needsClarity > 0 && needsClarity >= problemReal)) {
      return 'NEEDS_ACTION';
    }

    if (problemReal >= 3 && wouldPay >= 2 && readyToBuild >= 2) {
      return 'VALIDATED';
    }

    if (problemReal >= 2 && wouldPay >= 1 && readyToBuild >= 2) {
      return 'READY_TO_BUILD';
    }

    if (problemReal > 0 || wouldPay > 0 || readyToBuild > 0) {
      return 'NEEDS_ACTION';
    }

    return 'NEUTRAL';
  }

  /**
   * Calculate signal strength based on counts relative to total ideas.
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
   * Determine the next recommended action based on signal patterns.
   */
  private static determineNextAction(
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
   * Get validation summary for a user's ideas.
   */
  static async getValidationSummary(username: string): Promise<ValidationSummary | null> {
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
          select: {
            signalType: true,
          },
        },
      },
    });

    const totalIdeas = ideas.length;

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
   * Get user ideas with signal snapshots and validation state.
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

    let sortedIdeas: IdeaWithSignals[];
    switch (sort) {
      case 'needs_action':
        sortedIdeas = ideasWithSignals
          .filter((i) => i.validationState === 'NEEDS_ACTION' || i.validationState === 'NEUTRAL')
          .sort((a, b) => {
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

    const total = sortedIdeas.length;
    const { skip, take } = paginate(page, limit);
    const paginatedIdeas = sortedIdeas.slice(skip, skip + take);

    return {
      ideas: paginatedIdeas,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }
}
