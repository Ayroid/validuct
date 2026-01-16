import apiClient from "./client";
import { ApiResponse, Notification, NotificationPreferences, PaginationMeta } from "@/types";

export interface NotificationsResponse {
	notifications: Notification[];
	pagination: PaginationMeta;
}

export interface UnreadCountResponse {
	unreadCount: number;
}

// Get user's notifications
export const getNotifications = async (page = 1, limit = 20): Promise<NotificationsResponse> => {
	const response = await apiClient.get<ApiResponse<NotificationsResponse>>(
		`/notifications?page=${page}&limit=${limit}`
	);
	return response.data.data!;
};

// Get unread count
export const getUnreadCount = async (): Promise<number> => {
	const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
		"/notifications/unread-count"
	);
	return response.data.data!.unreadCount;
};

// Mark single notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
	await apiClient.patch(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
	await apiClient.post("/notifications/mark-all-read");
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
	await apiClient.delete(`/notifications/${notificationId}`);
};

// Get notification preferences
export const getPreferences = async (): Promise<NotificationPreferences> => {
	const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
		"/notifications/preferences"
	);
	return response.data.data!;
};

// Update notification preferences
export const updatePreferences = async (
	data: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
	const response = await apiClient.patch<ApiResponse<NotificationPreferences>>(
		"/notifications/preferences",
		data
	);
	return response.data.data!;
};
