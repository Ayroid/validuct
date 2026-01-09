import apiClient from "./client";
import { ApiResponse, IdeaSignals, SignalType } from "@/types";

interface ToggleSignalResponse {
	hasSignal: boolean;
	signalType: SignalType;
}

export const signalsApi = {
	/**
	 * Get all signals for an idea
	 */
	getIdeaSignals: async (ideaId: string): Promise<IdeaSignals> => {
		const response = await apiClient.get<ApiResponse<IdeaSignals>>(
			`/ideas/${ideaId}/signals`
		);
		return response.data.data!;
	},

	/**
	 * Toggle a signal on an idea
	 */
	toggleSignal: async (
		ideaId: string,
		signalType: SignalType
	): Promise<ToggleSignalResponse> => {
		const response = await apiClient.post<ApiResponse<ToggleSignalResponse>>(
			`/ideas/${ideaId}/signals`,
			{ signalType }
		);
		return response.data.data!;
	},
};
