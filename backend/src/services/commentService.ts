import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

interface UpdateCommentData {
  content: string;
}

interface GetCommentsParams {
  ideaId: string;
  page?: number;
  limit?: number;
}

export class CommentService {
  // Create a new comment
  static async createComment(
    userId: string,
    ideaId: string,
    data: CreateCommentData
  ) {
    // Verify idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // If parentCommentId is provided, verify it exists and belongs to the same idea
    if (data.parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentCommentId },
      });

      if (!parentComment) {
        throw new AppError('Parent comment not found', 404);
      }

      if (parentComment.ideaId !== ideaId) {
        throw new AppError('Parent comment does not belong to this idea', 400);
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        ideaId,
        content: data.content,
        parentCommentId: data.parentCommentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    // Increment comment count on idea
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    return comment;
  }

  // Get comments for an idea (with nested structure)
  static async getIdeaComments(params: GetCommentsParams) {
    const { ideaId, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    // Verify idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new AppError('Idea not found', 404);
    }

    // Get top-level comments (those without a parent)
    const topLevelComments = await prisma.comment.findMany({
      where: {
        ideaId,
        parentCommentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count of top-level comments
    const total = await prisma.comment.count({
      where: {
        ideaId,
        parentCommentId: null,
      },
    });

    return {
      comments: topLevelComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get a single comment by ID
  static async getCommentById(commentId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    return comment;
  }

  // Update a comment
  static async updateComment(
    commentId: string,
    userId: string,
    data: UpdateCommentData
  ) {
    // Find comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Verify ownership
    if (comment.userId !== userId) {
      throw new AppError('You are not authorized to update this comment', 403);
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    return updatedComment;
  }

  // Delete a comment
  static async deleteComment(commentId: string, userId: string) {
    // Find comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: true,
      },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Verify ownership
    if (comment.userId !== userId) {
      throw new AppError('You are not authorized to delete this comment', 403);
    }

    // Count total comments to delete (including nested replies)
    const commentsToDelete = await this.countCommentTree(commentId);

    // Delete comment (cascade will handle replies)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Decrement comment count on idea
    await prisma.idea.update({
      where: { id: comment.ideaId },
      data: {
        commentsCount: {
          decrement: commentsToDelete,
        },
      },
    });

    return { message: 'Comment deleted successfully' };
  }

  // Helper method to count all comments in a tree
  private static async countCommentTree(commentId: string): Promise<number> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: true,
      },
    });

    if (!comment) {
      return 0;
    }

    let count = 1; // Count the comment itself

    // Recursively count replies
    for (const reply of comment.replies) {
      count += await this.countCommentTree(reply.id);
    }

    return count;
  }
}
