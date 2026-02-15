import apiClient from "./client";
import {
	Idea,
	ValidationSummary,
	IdeaWithSignals,
	PaginationMeta,
	ProfileSortMode,
	IdeaPortfolio,
	IdeaScorecard,
	AnalyticsDashboardData,
	IdeaAnalyticsData,
	ActivityRange,
} from "@/types";

export interface User {
	id: string;
	username: string;
	email?: string;
	profilePicture?: string | null;
	bio?: string | null;
	createdAt: string;
	updatedAt?: string;
}

export interface UserProfile {
	user: User;
	ideasCount: number;
	pinnedIdeas: Idea[];
}

export interface UpdateProfileData {
	username?: string;
	bio?: string;
	profilePicture?: string;
}

export const userApi = {
	// Get user profile by username
	getUserProfile: async (username: string): Promise<UserProfile> => {
		const response = await apiClient.get(`/users/${username}`);
		return response.data.data;
	},

	// Get user's ideas
	getUserIdeas: async (
		username: string,
		page: number = 1,
		limit: number = 20,
		sort: "newest" | "oldest" | "popular" = "newest"
	) => {
		const response = await apiClient.get(`/users/${username}/ideas`, {
			params: { page, limit, sort },
		});
		return response.data.data;
	},

	// Update current user profile
	updateProfile: async (data: UpdateProfileData): Promise<User> => {
		const response = await apiClient.patch("/users/me", data);
		return response.data.data.user;
	},

	// Get current user's pinned ideas
	getPinnedIdeas: async () => {
		const response = await apiClient.get("/users/me/pinned");
		return response.data.data.pinned_ideas;
	},

	// Get user's validation summary
	getValidationSummary: async (
		username: string
	): Promise<ValidationSummary> => {
		const response = await apiClient.get(
			`/users/${username}/validation-summary`
		);
		return response.data.data;
	},

	// Get user's ideas with signal snapshots
	getUserIdeasWithSignals: async (
		username: string,
		params?: {
			page?: number;
			limit?: number;
			sort?: ProfileSortMode;
		}
	): Promise<{ ideas: IdeaWithSignals[]; pagination: PaginationMeta }> => {
		const response = await apiClient.get(
			`/users/${username}/ideas-with-signals`,
			{
				params,
			}
		);
		return response.data.data;
	},

	// Get user's idea portfolio
	getIdeaPortfolio: async (username: string): Promise<IdeaPortfolio> => {
		const response = await apiClient.get(
			`/users/${username}/idea-portfolio`
		);
		return response.data.data;
	},

	// Get idea scorecard
	getIdeaScorecard: async (
		username: string,
		ideaId: string
	): Promise<IdeaScorecard> => {
		const response = await apiClient.get(
			`/users/${username}/idea-scorecard/${ideaId}`
		);
		return response.data.data;
	},

	// Get analytics dashboard
	getAnalyticsDashboard: async (
		username: string,
		range: ActivityRange = "30d"
	): Promise<AnalyticsDashboardData> => {
		const response = await apiClient.get(
			`/users/${username}/analytics-dashboard`,
			{ params: { range } }
		);
		return response.data.data;
	},

	// Get idea analytics
	getIdeaAnalytics: async (
		username: string,
		ideaId: string,
		range: ActivityRange = "30d"
	): Promise<IdeaAnalyticsData> => {
		const response = await apiClient.get(
			`/users/${username}/idea-analytics/${ideaId}`,
			{ params: { range } }
		);
		return response.data.data;
	},

};
