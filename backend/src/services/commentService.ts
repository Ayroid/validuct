import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Data required to create a new comment
 */
interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

/**
 * Data that can be updated on an existing comment
 */
interface UpdateCommentData {
  content: string;
}

/**
 * Parameters for retrieving comments for an idea
 */
interface GetCommentsParams {
  ideaId: string;
  page?: number;
  limit?: number;
}

/**
 * Service class for managing comment-related operations
 */
export class CommentService {
  /**
   * Create a new comment on an idea or as a reply to another comment
   *
   * @param userId - The ID of the user creating the comment
   * @param ideaId - The ID of the idea being commented on
   * @param data - Comment data including content and optional parent comment ID
   * @returns The newly created comment with user information
   * @throws {AppError} If the idea is not found (404)
   * @throws {AppError} If the parent comment is not found (404)
   * @throws {AppError} If the parent comment doesn't belong to the idea (400)
   *
   * @remarks
   * - For top-level comments: omit parentCommentId
   * - For replies: provide parentCommentId
   * - Automatically increments the idea's comment count
   */
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

  /**
   * Recursively build a nested comment tree structure
   *
   * @param comments - Flat array of all comments
   * @param parentId - The parent comment ID to filter by (null for top-level)
   * @returns Nested array of comments with their replies
   *
   * @remarks
   * This is a private helper method that recursively builds a tree structure
   * from a flat list of comments, organizing them by parent-child relationships
   */
  private static buildCommentTree(
    comments: any[],
    parentId: string | null = null
  ): any[] {
    return comments
      .filter((comment) => comment.parentCommentId === parentId)
      .map((comment) => ({
        ...comment,
        replies: this.buildCommentTree(comments, comment.id),
      }));
  }

  /**
   * Retrieve all comments for an idea with nested replies structure
   *
   * @param params - Parameters including ideaId, page, and limit
   * @returns Object containing nested comment tree and pagination metadata
   * @throws {AppError} If the idea is not found (404)
   *
   * @remarks
   * - Fetches all comments for the idea and builds a nested tree structure
   * - Pagination applies only to top-level comments
   * - All replies to paginated comments are included
   * - Top-level comments are sorted by creation date (newest first)
   * - Default pagination: page 1, limit 50
   */
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

    // Fetch ALL comments for this idea (we'll build the tree structure in memory)
    const allComments = await prisma.comment.findMany({
      where: {
        ideaId,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Build nested comment tree recursively
    const commentTree = this.buildCommentTree(allComments, null);

    // Apply pagination to top-level comments only
    const paginatedComments = commentTree
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(skip, skip + limit);

    // Get total count of top-level comments
    const total = allComments.filter((c) => c.parentCommentId === null).length;

    return {
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve a single comment by its ID with direct replies
   *
   * @param commentId - The ID of the comment to retrieve
   * @returns The comment with user information and direct replies
   * @throws {AppError} If the comment is not found (404)
   *
   * @remarks
   * Returns the comment with only its direct replies (not deeply nested)
   * Replies are sorted by creation date (oldest first)
   */
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

  /**
   * Update the content of an existing comment
   *
   * @param commentId - The ID of the comment to update
   * @param userId - The ID of the user attempting to update the comment
   * @param data - Object containing the new comment content
   * @returns The updated comment with user information
   * @throws {AppError} If the comment is not found (404)
   * @throws {AppError} If the user is not authorized to update the comment (403)
   *
   * @remarks
   * Only the owner of the comment can update it
   */
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

  /**
   * Delete a comment and all its nested replies
   *
   * @param commentId - The ID of the comment to delete
   * @param userId - The ID of the user attempting to delete the comment
   * @returns Object with success message
   * @throws {AppError} If the comment is not found (404)
   * @throws {AppError} If the user is not authorized to delete the comment (403)
   *
   * @remarks
   * - Only the owner of the comment can delete it
   * - Deletes the comment and all nested replies (cascade delete)
   * - Automatically decrements the idea's comment count by the total deleted
   */
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

  /**
   * Recursively count all comments in a comment tree
   *
   * @param commentId - The ID of the root comment to count from
   * @returns Total count of the comment and all its nested replies
   *
   * @remarks
   * This is a private helper method used when deleting comments to determine
   * how much to decrement the idea's comment count
   */
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
