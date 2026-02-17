import apiClient from "./client";
import { ApiResponse, PaginationMeta, Suggestion, SuggestionType } from "@/types";

export interface CreateSuggestionData {
	type: SuggestionType;
	suggestion: string;
}

export interface GetSuggestionsResponse {
	suggestions: Suggestion[];
	pagination: PaginationMeta;
}

export const suggestionsApi = {
	async createSuggestion(data: CreateSuggestionData): Promise<Suggestion> {
		const { data: res } = await apiClient.post<
			ApiResponse<{ suggestion: Suggestion }>
		>("/suggestions", data);
		return res.data!.suggestion;
	},

	async getApprovedSuggestions(
		page: number = 1,
		limit: number = 10
	): Promise<GetSuggestionsResponse> {
		const { data } = await apiClient.get<ApiResponse<GetSuggestionsResponse>>(
			"/suggestions",
			{ params: { page, limit } }
		);
		return data.data!;
	},

	async getMySuggestions(
		page: number = 1,
		limit: number = 10
	): Promise<GetSuggestionsResponse> {
		const { data } = await apiClient.get<ApiResponse<GetSuggestionsResponse>>(
			"/suggestions/mine",
			{ params: { page, limit } }
		);
		return data.data!;
	},
};
