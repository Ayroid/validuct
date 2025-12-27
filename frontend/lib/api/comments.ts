import apiClient from './client';
import { ApiResponse, PaginationMeta } from '@/types';

export interface Comment {
  id: string;
  userId: string;
  ideaId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
  replies?: Comment[];
}

export interface GetCommentsParams {
  ideaId: string;
  page?: number;
  limit?: number;
}

export interface GetCommentsResponse {
  comments: Comment[];
  pagination: PaginationMeta;
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export const commentsApi = {
  // Get comments for an idea
  async getIdeaComments(params: GetCommentsParams): Promise<GetCommentsResponse> {
    const { ideaId, ...queryParams } = params;
    const { data } = await apiClient.get<ApiResponse<GetCommentsResponse>>(
      `/ideas/${ideaId}/comments`,
      { params: queryParams }
    );
    return data.data!;
  },

  // Create a comment on an idea
  async createComment(ideaId: string, commentData: CreateCommentData): Promise<Comment> {
    const { data } = await apiClient.post<ApiResponse<{ comment: Comment }>>(
      `/ideas/${ideaId}/comments`,
      commentData
    );
    return data.data!.comment;
  },

  // Get a single comment
  async getCommentById(commentId: string): Promise<Comment> {
    const { data } = await apiClient.get<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}`
    );
    return data.data!.comment;
  },

  // Update a comment
  async updateComment(commentId: string, commentData: UpdateCommentData): Promise<Comment> {
    const { data } = await apiClient.patch<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}`,
      commentData
    );
    return data.data!.comment;
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
