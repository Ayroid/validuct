"use client";

import { useState, useEffect } from "react";
import { getUnreadCount } from "@/lib/api/notifications";

export function useNotificationCount() {
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		const fetchUnreadCount = async () => {
			try {
				const count = await getUnreadCount();
				setUnreadCount(count);
			} catch (error) {
				console.error("Failed to fetch unread count:", error);
			}
		};

		fetchUnreadCount();
		const interval = setInterval(fetchUnreadCount, 30000);
		return () => clearInterval(interval);
	}, []);

	return { unreadCount };
}
