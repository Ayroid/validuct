import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types";

export const waitlistApi = {
	joinWaitlist: async (email: string): Promise<void> => {
		await apiClient.post<ApiResponse<null>>("/waitlist/join", { email });
	},
};
