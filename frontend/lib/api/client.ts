import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "react-toastify";
import { API_URL } from "../constants";

const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token from NextAuth session
apiClient.interceptors.request.use(
	async (config) => {
		const session = await getSession();
		if (session?.backendToken) {
			config.headers.Authorization = `Bearer ${session.backendToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			window.location.href = "/signin";
		}
		if (error.response?.status === 429) {
			toast.error("Too many requests.");
		}
		return Promise.reject(error);
	}
);

export default apiClient;
