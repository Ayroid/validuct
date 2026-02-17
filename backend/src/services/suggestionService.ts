import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

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
    const skip = (page - 1) * limit;

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
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
      prisma.suggestion.count({
        where: { status: 'APPROVED' },
      }),
    ]);

    return {
      suggestions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserSuggestions(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
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
      prisma.suggestion.count({
        where: { userId },
      }),
    ]);

    return {
      suggestions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  static async getAllSuggestions(page: number = 1, limit: number = 10, status?: SuggestionStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
      prisma.suggestion.count({ where }),
    ]);

    return {
      suggestions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
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
