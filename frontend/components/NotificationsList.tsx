"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	HiUserCircle,
	HiCheck,
	HiTrash,
	HiArrowLeft,
	HiCog6Tooth,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	deleteNotification,
} from "@/lib/api/notifications";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";

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
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const observerRef = useRef<HTMLDivElement>(null);

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

	const handleLoadMore = useCallback(() => {
		if (!isLoading && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchNotifications(nextPage, true);
		}
	}, [isLoading, hasMore, page]);

	useEffect(() => {
		fetchNotifications(1);
	}, []);

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading && hasMore) {
					handleLoadMore();
				}
			},
			{ threshold: 0.1 }
		);

		const currentObserverRef = observerRef.current;
		if (currentObserverRef) {
			observer.observe(currentObserverRef);
		}

		return () => {
			if (currentObserverRef) {
				observer.unobserve(currentObserverRef);
			}
		};
	}, [isLoading, hasMore, handleLoadMore]);

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

	const hasUnread = notifications.some((n) => !n.read);

	return (
		<div>
			{/* Sticky header — X style */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center justify-between px-4 py-3">
					<div className="flex items-center gap-3">
						<button
							onClick={() => router.back()}
							className="text-foreground hover:bg-muted -ml-1 cursor-pointer rounded-full p-1 transition-colors"
						>
							<HiArrowLeft className="h-5 w-5" />
						</button>
						<h1 className="text-foreground text-lg font-bold">Notifications</h1>
					</div>
					<div className="flex items-center gap-1">
						{hasUnread && (
							<button
								onClick={handleMarkAllAsRead}
								className="text-primary hover:bg-muted cursor-pointer rounded-full p-2 transition-colors"
								title="Mark all as read"
							>
								<HiCheck className="h-5 w-5" />
							</button>
						)}
						<Link
							href="/settings/notifications"
							className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
							title="Notification settings"
						>
							<HiCog6Tooth className="h-5 w-5" />
						</Link>
					</div>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			{/* Notifications List */}
			<div>
				{isLoading && notifications.length === 0 ? (
					<div className="flex items-center justify-center py-16">
						<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
					</div>
				) : notifications.length === 0 ? (
					<div className="text-muted-foreground py-16 text-center">
						<p className="text-sm font-medium">Nothing here yet</p>
						<p className="mt-1 text-xs">
							When someone interacts with your ideas, you&apos;ll see it here.
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<Link
							key={notification.id}
							href={notification.actionUrl || "#"}
							onClick={() => {
								if (!notification.read) {
									handleMarkAsRead(notification.id);
								}
							}}
							className={`hover:bg-muted/50 border-border/50 flex gap-3.5 border-b px-4 py-4 transition-colors ${
								!notification.read ? "bg-primary/3" : ""
							}`}
						>
							{/* Avatar */}
							<div className="relative shrink-0 pt-0.5">
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
									<span className="flex h-11 w-11 items-center justify-center rounded-full text-xl">
										{getNotificationIcon(notification.type)}
									</span>
								)}
								{/* Type indicator */}
								<span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs">
									{getNotificationIcon(notification.type)}
								</span>
							</div>

							{/* Content */}
							<div className="min-w-0 flex-1">
								<p className="text-sm leading-snug">
									{notification.triggeredBy ? (
										<>
											<span className="text-foreground font-semibold">
												{notification.triggeredBy.username}
											</span>{" "}
											<span className="text-muted-foreground">
												{notification.message}
											</span>
										</>
									) : (
										<span className="text-muted-foreground">
											{notification.message}
										</span>
									)}
								</p>
								<p className="text-muted-foreground mt-0.5 text-xs">
									{formatDistanceToNow(new Date(notification.createdAt), {
										addSuffix: true,
									})}
								</p>
							</div>

							{/* Delete action */}
							<div className="flex shrink-0 items-center">
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleDelete(notification.id);
									}}
									className="hover:bg-muted text-muted-foreground hover:text-destructive cursor-pointer rounded-full p-1.5 transition-colors"
									title="Delete"
								>
									<HiTrash className="h-4 w-4" />
								</button>
							</div>
						</Link>
					))
				)}
			</div>

			{/* Infinite Scroll Observer Target */}
			{hasMore && notifications.length > 0 && (
				<div ref={observerRef} className="py-6">
					{isLoading && (
						<div className="flex justify-center">
							<div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
