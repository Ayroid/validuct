import apiClient from './client';
import { ApiResponse, Idea, PaginationMeta } from '@/types';

export interface GetIdeasParams {
  timeline: 'hot' | 'new' | 'trending';
  page?: number;
  limit?: number;
}

export interface GetIdeasResponse {
  ideas: Idea[];
  pagination: PaginationMeta;
}

export interface CreateIdeaData {
  heading: string;
  description: string;
  status?: 'DRAFT' | 'VALIDATED' | 'WIP' | 'LAUNCHED';
  launchedLink?: string;
}

export interface UpdateIdeaData {
  heading?: string;
  description?: string;
  status?: 'DRAFT' | 'VALIDATED' | 'WIP' | 'LAUNCHED';
  launchedLink?: string;
}

export const ideasApi = {
  // Get ideas with timeline filtering
  async getIdeas(params: GetIdeasParams): Promise<GetIdeasResponse> {
    const { data } = await apiClient.get<ApiResponse<GetIdeasResponse>>('/ideas', {
      params,
    });
    return data.data!;
  },

  // Get single idea by ID
  async getIdeaById(ideaId: string): Promise<Idea> {
    const { data } = await apiClient.get<ApiResponse<{ idea: Idea }>>(`/ideas/${ideaId}`);
    return data.data!.idea;
  },

  // Create new idea
  async createIdea(ideaData: CreateIdeaData): Promise<Idea> {
    const { data } = await apiClient.post<ApiResponse<{ idea: Idea }>>('/ideas', ideaData);
    return data.data!.idea;
  },

  // Update idea
  async updateIdea(ideaId: string, ideaData: UpdateIdeaData): Promise<Idea> {
    const { data } = await apiClient.patch<ApiResponse<{ idea: Idea }>>(
      `/ideas/${ideaId}`,
      ideaData
    );
    return data.data!.idea;
  },

  // Delete idea
  async deleteIdea(ideaId: string): Promise<void> {
    await apiClient.delete(`/ideas/${ideaId}`);
  },

  // Get user's ideas
  async getUserIdeas(
    username: string,
    params?: { page?: number; limit?: number; sort?: 'newest' | 'oldest' | 'popular' }
  ): Promise<GetIdeasResponse> {
    const { data } = await apiClient.get<ApiResponse<GetIdeasResponse>>(
      `/users/${username}/ideas`,
      { params }
    );
    return data.data!;
  },
};
