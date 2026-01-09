import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Signal types for idea validation
 */
type SignalType = 'PROBLEM_REAL' | 'WOULD_PAY' | 'READY_TO_BUILD' | 'NEEDS_CLARITY';

/**
 * Service class for managing idea validation signals
 */
export class SignalService {
  /**
   * Toggle a validation signal on an idea
   *
   * @param ideaId - The ID of the idea
   * @param userId - The ID of the user giving the signal
   * @param signalType - The type of signal
   * @returns Object with the new signal state
   * @throws {AppError} If the idea is not found (404)
   */
  static async toggleSignal(
    ideaId: string,
    userId: string,
    signalType: SignalType
  ) {
    // Verify idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // Check if user already gave this signal
    const existingSignal = await prisma.ideaSignal.findUnique({
      where: {
        userId_ideaId_signalType: {
          userId,
          ideaId,
          signalType,
        },
      },
    });

    if (existingSignal) {
      // Remove the signal
      await prisma.ideaSignal.delete({
        where: { id: existingSignal.id },
      });

      return {
        hasSignal: false,
        signalType,
      };
    } else {
      // Add the signal
      await prisma.ideaSignal.create({
        data: {
          userId,
          ideaId,
          signalType,
        },
      });

      return {
        hasSignal: true,
        signalType,
      };
    }
  }

  /**
   * Get all signals for an idea with counts
   *
   * @param ideaId - The ID of the idea
   * @param userId - Optional user ID to include their signal status
   * @returns Object with signal counts and user's signals
   * @throws {AppError} If the idea is not found (404)
   */
  static async getIdeaSignals(ideaId: string, userId?: string) {
    // Verify idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // Get signal counts grouped by type
    const signalCounts = await prisma.ideaSignal.groupBy({
      by: ['signalType'],
      where: { ideaId },
      _count: true,
    });

    // Convert to a more usable format
    const counts: Record<SignalType, number> = {
      PROBLEM_REAL: 0,
      WOULD_PAY: 0,
      READY_TO_BUILD: 0,
      NEEDS_CLARITY: 0,
    };

    for (const item of signalCounts) {
      counts[item.signalType as SignalType] = item._count;
    }

    // Get user's signals if userId provided
    let userSignals: SignalType[] = [];
    if (userId) {
      const signals = await prisma.ideaSignal.findMany({
        where: { ideaId, userId },
        select: { signalType: true },
      });
      userSignals = signals.map((s) => s.signalType as SignalType);
    }

    return {
      counts,
      userSignals,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  }
}
