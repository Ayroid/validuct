import apiClient from './client';
import { ApiResponse } from '@/types';

export interface VoteResponse {
  vote: {
    vote_type: 'upvote' | 'downvote' | null;
  };
  upvotes_count: number;
  downvotes_count: number;
}

export const votesApi = {
  // Vote on an idea (upvote or downvote)
  async voteOnIdea(ideaId: string, voteType: 'upvote' | 'downvote'): Promise<VoteResponse> {
    const { data } = await apiClient.post<ApiResponse<VoteResponse>>(
      `/ideas/${ideaId}/vote`,
      { vote_type: voteType }
    );
    return data.data!;
  },
};
