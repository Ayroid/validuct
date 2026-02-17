import apiClient from "./client";
import { ApiResponse, PaginationMeta, Suggestion, SuggestionStatus } from "@/types";

export interface GetAllSuggestionsResponse {
	suggestions: Suggestion[];
	pagination: PaginationMeta;
}

export const adminApi = {
	async getAllSuggestions(
		page: number = 1,
		limit: number = 20,
		status?: SuggestionStatus
	): Promise<GetAllSuggestionsResponse> {
		const params: Record<string, string | number> = { page, limit };
		if (status) params.status = status;

		const { data } = await apiClient.get<
			ApiResponse<GetAllSuggestionsResponse>
		>("/suggestions/all", { params });
		return data.data!;
	},

	async updateSuggestionStatus(
		id: string,
		status: "APPROVED" | "REJECTED"
	): Promise<Suggestion> {
		const { data } = await apiClient.patch<
			ApiResponse<{ suggestion: Suggestion }>
		>(`/suggestions/${id}/status`, { status });
		return data.data!.suggestion;
	},
};
