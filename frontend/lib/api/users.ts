import apiClient from "./client";
import { Idea } from "@/types";

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
};
