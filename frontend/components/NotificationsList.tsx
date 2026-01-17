"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiUserCircle, HiCheck, HiArrowUpRight, HiTrash } from "react-icons/hi2";
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	deleteNotification,
} from "@/lib/api/notifications";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import NotificationSettingsDialog from "./NotificationSettingsDialog";

const getNotificationIcon = (type: Notification["type"]) => {
	switch (type) {
		case "UPVOTE":
			return "👍";
		case "SIGNAL":
			return "🎯";
		case "COMMENT":
			return "💬";
		case "REPLY":
			return "↩️";
		case "MILESTONE":
			return "🎉";
		default:
			return "🔔";
	}
};

export default function NotificationsList() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchNotifications = async (pageNum: number, append = false) => {
		try {
			setIsLoading(true);
			const data = await getNotifications(pageNum, 20);
			if (append) {
				setNotifications((prev) => [...prev, ...data.notifications]);
			} else {
				setNotifications(data.notifications);
			}
			setHasMore(pageNum < data.pagination.totalPages);
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications(1);
	}, []);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markAsRead(notificationId);
			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
			);
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	const handleDelete = async (notificationId: string) => {
		try {
			await deleteNotification(notificationId);
			setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
		} catch (error) {
			console.error("Failed to delete notification:", error);
		}
	};

	const handleLoadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchNotifications(nextPage, true);
	};

	const hasUnread = notifications.some((n) => !n.read);

	return (
		<div className="bg-card border-border rounded-2xl border shadow-sm">
			{/* Header */}
			<div className="border-border flex items-center justify-between border-b px-6 py-4">
				<h1 className="text-foreground text-xl font-semibold">Notifications</h1>
				<div className="flex items-center gap-2">
					{hasUnread && (
						<button
							onClick={handleMarkAllAsRead}
							className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
						>
							<HiCheck className="h-4 w-4" />
							Mark all as read
						</button>
					)}
					<NotificationSettingsDialog />
				</div>
			</div>

			{/* Notifications List */}
			<div className="divide-border divide-y">
				{isLoading && notifications.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
					</div>
				) : notifications.length === 0 ? (
					<div className="text-muted-foreground py-12 text-center">
						<p className="text-base">No notifications yet</p>
						<p className="mt-1 text-sm">
							When someone interacts with your ideas, you&apos;ll see it here.
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<div
							key={notification.id}
							className={`hover:bg-muted/50 relative flex gap-4 px-6 py-4 transition-colors ${
								!notification.read ? "bg-primary/5" : ""
							}`}
						>
							{/* Unread indicator */}
							{!notification.read && (
								<div className="bg-primary absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" />
							)}

							{/* Icon or Avatar */}
							<div className="flex-shrink-0">
								{notification.triggeredBy?.profilePicture ? (
									<Image
										src={notification.triggeredBy.profilePicture}
										alt=""
										width={44}
										height={44}
										className="h-11 w-11 rounded-full object-cover"
									/>
								) : notification.triggeredBy ? (
									<HiUserCircle className="text-muted-foreground h-11 w-11" />
								) : (
									<span className="flex h-11 w-11 items-center justify-center text-2xl">
										{getNotificationIcon(notification.type)}
									</span>
								)}
							</div>

							{/* Content */}
							<div className="min-w-0 flex-1">
								<p className="text-foreground font-medium">{notification.title}</p>
								<p className="text-muted-foreground mt-0.5 text-sm">
									{notification.message}
								</p>
								<p className="text-muted-foreground mt-1.5 text-xs">
									{formatDistanceToNow(new Date(notification.createdAt), {
										addSuffix: true,
									})}
								</p>
							</div>

							{/* Actions */}
							<div className="flex flex-shrink-0 items-center gap-1">
								{notification.actionUrl && (
									<Link
										href={notification.actionUrl}
										onClick={() => {
											if (!notification.read) {
												handleMarkAsRead(notification.id);
											}
										}}
										className="hover:bg-muted rounded-lg p-2 transition-colors"
										title="View"
									>
										<HiArrowUpRight className="text-muted-foreground h-5 w-5" />
									</Link>
								)}
								{!notification.read && (
									<button
										onClick={() => handleMarkAsRead(notification.id)}
										className="hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer"
										title="Mark as read"
									>
										<HiCheck className="text-muted-foreground h-5 w-5" />
									</button>
								)}
								<button
									onClick={() => handleDelete(notification.id)}
									className="hover:bg-muted rounded-lg p-2 transition-colors cursor-pointer"
									title="Delete"
								>
									<HiTrash className="text-muted-foreground h-5 w-5" />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Load More */}
			{hasMore && notifications.length > 0 && (
				<div className="border-border border-t px-6 py-4">
					<button
						onClick={handleLoadMore}
						disabled={isLoading}
						className="text-primary hover:text-primary/80 w-full text-center text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
					>
						{isLoading ? "Loading..." : "Load more"}
					</button>
				</div>
			)}
		</div>
	);
}
