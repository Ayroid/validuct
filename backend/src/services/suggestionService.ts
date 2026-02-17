import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, buildPaginationMeta } from '../utils/pagination.js';

type SuggestionType = 'FEATURE_REQUEST' | 'BUG_REPORT' | 'IMPROVEMENT' | 'OTHER';
type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface CreateSuggestionData {
  type: SuggestionType;
  suggestion: string;
}

export class SuggestionService {
  static async createSuggestion(userId: string, data: CreateSuggestionData) {

    const autoTitle = data.suggestion.length > 80 ? data.suggestion.slice(0, 80).trim() + "..." : data.suggestion.trim();

    const suggestion = await prisma.suggestion.create({
      data: {
        userId,
        type: data.type,
        title: autoTitle, // Auto-generate title from the suggestion content
        description: data.suggestion,
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

    return suggestion;
  }

  static async getApprovedSuggestions(page: number = 1, limit: number = 10) {
    const { skip, take } = paginate(page, limit);

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.suggestion.count({
        where: { status: 'APPROVED' },
      }),
    ]);

    return {
      suggestions,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static async getUserSuggestions(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = paginate(page, limit);

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.suggestion.count({
        where: { userId },
      }),
    ]);

    return {
      suggestions,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static async getAllSuggestions(page: number = 1, limit: number = 10, status?: SuggestionStatus) {
    const { skip, take } = paginate(page, limit);
    const where = status ? { status } : {};

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
        },
      }),
      prisma.suggestion.count({ where }),
    ]);

    return {
      suggestions,
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static async updateSuggestionStatus(suggestionId: string, status: SuggestionStatus) {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new AppError('Suggestion not found', 404);
    }

    const updated = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    return updated;
  }
}
