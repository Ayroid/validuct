"use client";

import { useState, useEffect, useRef } from "react";
import { HiBell } from "react-icons/hi2";
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from "@/lib/api/notifications";
import NotificationDropdown from "./NotificationDropdown";
import { Notification } from "@/types";

const NotificationBell = () => {
	const [unreadCount, setUnreadCount] = useState(0);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Fetch unread count on mount and poll every 30s
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

	// Fetch notifications when dropdown opens
	useEffect(() => {
		if (isOpen) {
			const fetchNotifications = async () => {
				setIsLoading(true);
				try {
					const data = await getNotifications(1, 10);
					setNotifications(data.notifications);
				} catch (error) {
					console.error("Failed to fetch notifications:", error);
				} finally {
					setIsLoading(false);
				}
			};
			fetchNotifications();
		}
	}, [isOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markAsRead(notificationId);
			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="hover:bg-muted relative rounded-full p-1.5 transition-colors cursor-pointer"
				title="Notifications"
			>
				<HiBell className="text-muted-foreground h-5 w-5" />
				{unreadCount > 0 && (
					<span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<NotificationDropdown
					notifications={notifications}
					isLoading={isLoading}
					onMarkAsRead={handleMarkAsRead}
					onMarkAllAsRead={handleMarkAllAsRead}
					onClose={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
};

export default NotificationBell;
