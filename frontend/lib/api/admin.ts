import apiClient from "./client";
import {
	AdminDashboardRange,
	AdminDashboardStats,
	AdminIdea,
	AdminIdeaWaitlistEntry,
	ApiResponse,
	EmailQueueEntry,
	EmailQueueStats,
	EmailStatus,
	MainWaitlistEntry,
	PaginationMeta,
	Suggestion,
	SuggestionStatus,
	User,
	UserType,
} from "@/types";

export interface GetAllSuggestionsResponse {
	suggestions: Suggestion[];
	pagination: PaginationMeta;
}

export interface GetAllUsersResponse {
	users: User[];
	pagination: PaginationMeta;
}

export interface GetAllIdeasResponse {
	ideas: AdminIdea[];
	pagination: PaginationMeta;
}

export interface GetEmailQueueResponse {
	entries: EmailQueueEntry[];
	pagination: PaginationMeta;
}

export interface GetMainWaitlistResponse {
	entries: MainWaitlistEntry[];
	pagination: PaginationMeta;
}

export interface GetIdeaWaitlistsResponse {
	entries: AdminIdeaWaitlistEntry[];
	pagination: PaginationMeta;
}

export const adminApi = {
	// ── Suggestions ────────────────────────────────────────────────────────────
	async getAllSuggestions(
		page: number = 1,
		limit: number = 20,
		status?: SuggestionStatus
	): Promise<GetAllSuggestionsResponse> {
		const params: Record<string, string | number> = { page, limit };
		if (status) params.status = status;
		const { data } = await apiClient.get<ApiResponse<GetAllSuggestionsResponse>>(
			"/suggestions/all",
			{ params }
		);
		return data.data!;
	},

	async updateSuggestionStatus(
		id: string,
		status: "APPROVED" | "REJECTED"
	): Promise<Suggestion> {
		const { data } = await apiClient.patch<ApiResponse<{ suggestion: Suggestion }>>(
			`/suggestions/${id}/status`,
			{ status }
		);
		return data.data!.suggestion;
	},

	// ── Users ──────────────────────────────────────────────────────────────────
	async getAllUsers(
		page: number = 1,
		limit: number = 20,
		userType?: UserType,
		sort?: string
	): Promise<GetAllUsersResponse> {
		const params: Record<string, string | number> = { page, limit };
		if (userType) params.userType = userType;
		if (sort) params.sort = sort;
		const { data } = await apiClient.get<ApiResponse<GetAllUsersResponse>>(
			"/users/all",
			{ params }
		);
		return data.data!;
	},

	// ── Ideas ──────────────────────────────────────────────────────────────────
	async getAllIdeas(
		page: number = 1,
		limit: number = 20,
		status?: string,
		sort?: string
	): Promise<GetAllIdeasResponse> {
		const params: Record<string, string | number> = { page, limit };
		if (status) params.status = status;
		if (sort) params.sort = sort;
		const { data } = await apiClient.get<ApiResponse<GetAllIdeasResponse>>(
			"/ideas/admin/all",
			{ params }
		);
		return data.data!;
	},

	async adminUpdateIdeaStatus(id: string, status: string): Promise<AdminIdea> {
		const { data } = await apiClient.patch<ApiResponse<{ idea: AdminIdea }>>(
			`/ideas/${id}/admin/status`,
			{ status }
		);
		return data.data!.idea;
	},

	async adminDeleteIdea(id: string): Promise<void> {
		await apiClient.delete(`/ideas/${id}/admin`);
	},

	// ── Email Queue ────────────────────────────────────────────────────────────
	async getAllEmailQueue(
		page: number = 1,
		limit: number = 20,
		status?: EmailStatus
	): Promise<GetEmailQueueResponse> {
		const params: Record<string, string | number> = { page, limit };
		if (status) params.status = status;
		const { data } = await apiClient.get<ApiResponse<GetEmailQueueResponse>>(
			"/emails/all",
			{ params }
		);
		return data.data!;
	},

	async getEmailQueueStats(): Promise<EmailQueueStats> {
		const { data } = await apiClient.get<ApiResponse<EmailQueueStats>>(
			"/emails/stats"
		);
		return data.data!;
	},

	async retryEmail(id: string): Promise<EmailQueueEntry> {
		const { data } = await apiClient.post<ApiResponse<{ entry: EmailQueueEntry }>>(
			`/emails/${id}/retry`
		);
		return data.data!.entry;
	},

	async deleteEmailQueueEntry(id: string): Promise<void> {
		await apiClient.delete(`/emails/${id}`);
	},

	// ── Waitlist ───────────────────────────────────────────────────────────────
	async getMainWaitlist(
		page: number = 1,
		limit: number = 50
	): Promise<GetMainWaitlistResponse> {
		const { data } = await apiClient.get<ApiResponse<GetMainWaitlistResponse>>(
			"/waitlist/admin/main",
			{ params: { page, limit } }
		);
		return data.data!;
	},

	async getAllIdeaWaitlists(
		page: number = 1,
		limit: number = 50,
		ideaId?: string
	): Promise<GetIdeaWaitlistsResponse> {
		const params: Record<string, string | number> = { page, limit };
		if (ideaId) params.ideaId = ideaId;
		const { data } = await apiClient.get<ApiResponse<GetIdeaWaitlistsResponse>>(
			"/waitlist/admin/ideas",
			{ params }
		);
		return data.data!;
	},

	async removeFromMainWaitlist(id: string): Promise<void> {
		await apiClient.delete(`/waitlist/admin/main/${id}`);
	},

	async removeFromIdeaWaitlist(id: string): Promise<void> {
		await apiClient.delete(`/waitlist/admin/ideas/${id}`);
	},

	// ── Dashboard ──────────────────────────────────────────────────────────────
	async getDashboardStats(range: AdminDashboardRange = "30d"): Promise<AdminDashboardStats> {
		const { data } = await apiClient.get<ApiResponse<AdminDashboardStats>>(
			"/admin/stats",
			{ params: { range } }
		);
		return data.data!;
	},
};
