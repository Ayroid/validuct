import apiClient from "./client";
import {
	ApiResponse,
	IdeaWaitlistStats,
	IdeaWaitlistData,
	IdeaWaitlistExport,
} from "@/types";

interface JoinWaitlistResponse {
	id: string;
	joined: boolean;
}

interface GetWaitlistParams {
	page?: number;
	limit?: number;
}

export const ideaWaitlistApi = {
	/**
	 * Join the waitlist for an idea
	 */
	joinWaitlist: async (
		ideaId: string,
		email: string
	): Promise<JoinWaitlistResponse> => {
		const response = await apiClient.post<ApiResponse<JoinWaitlistResponse>>(
			`/ideas/${ideaId}/waitlist`,
			{ email }
		);
		return response.data.data!;
	},

	/**
	 * Get waitlist stats for an idea (count + access token for owner)
	 */
	getWaitlistStats: async (ideaId: string): Promise<IdeaWaitlistStats> => {
		const response = await apiClient.get<ApiResponse<IdeaWaitlistStats>>(
			`/ideas/${ideaId}/waitlist`
		);
		return response.data.data!;
	},

	/**
	 * Get paginated waitlist data by access token (owner only)
	 */
	getWaitlistByToken: async (
		ideaId: string,
		accessToken: string,
		params: GetWaitlistParams = {}
	): Promise<IdeaWaitlistData> => {
		const { page = 1, limit = 20 } = params;
		const response = await apiClient.get<ApiResponse<IdeaWaitlistData>>(
			`/ideas/${ideaId}/waitlist/${accessToken}`,
			{ params: { page, limit } }
		);
		return response.data.data!;
	},

	/**
	 * Get all waitlist emails for export (owner only)
	 */
	getAllWaitlistEmails: async (
		ideaId: string,
		accessToken: string
	): Promise<IdeaWaitlistExport> => {
		const response = await apiClient.get<ApiResponse<IdeaWaitlistExport>>(
			`/ideas/${ideaId}/waitlist/${accessToken}/export`
		);
		return response.data.data!;
	},
};
