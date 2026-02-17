import type { ErrorResponse } from "@/types";

/**
 * Extract a user-friendly error message from an unknown error.
 * Handles axios ErrorResponse, standard Error, and unknown shapes.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === "object" && error !== null) {
		const err = error as ErrorResponse;
		if (err.response?.data?.message) return err.response.data.message;
		if (err.response?.data?.error) {
			const apiError = err.response.data.error;
			return typeof apiError === "string" ? apiError : fallback;
		}
	}
	if (error instanceof Error) return error.message;
	return fallback;
}
