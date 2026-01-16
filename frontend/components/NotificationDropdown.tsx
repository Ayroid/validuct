"use client";

import Link from "next/link";
import Image from "next/image";
import { HiUserCircle, HiCheck, HiArrowUpRight } from "react-icons/hi2";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
	notifications: Notification[];
	isLoading: boolean;
	onMarkAsRead: (id: string) => void;
	onMarkAllAsRead: () => void;
	onClose: () => void;
}

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

const NotificationDropdown = ({
	notifications,
	isLoading,
	onMarkAsRead,
	onMarkAllAsRead,
	onClose,
}: NotificationDropdownProps) => {
	const hasUnread = notifications.some((n) => !n.read);

	return (
		<div className="bg-card border-border absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-lg sm:w-96">
			{/* Header */}
			<div className="border-border flex items-center justify-between border-b px-4 py-3">
				<h3 className="text-foreground font-semibold">Notifications</h3>
				{hasUnread && (
					<button
						onClick={onMarkAllAsRead}
						className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
					>
						<HiCheck className="h-4 w-4" />
						Mark all read
					</button>
				)}
			</div>

			{/* Notifications List */}
			<div className="max-h-96 overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
					</div>
				) : notifications.length === 0 ? (
					<div className="text-muted-foreground py-8 text-center">
						<p className="text-sm">No notifications yet</p>
					</div>
				) : (
					<div className="divide-border divide-y">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								className={`hover:bg-muted/50 relative flex gap-3 px-4 py-3 transition-colors ${
									!notification.read ? "bg-primary/5" : ""
								}`}
							>
								{/* Unread indicator */}
								{!notification.read && (
									<div className="bg-primary absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" />
								)}

								{/* Icon or Avatar */}
								<div className="flex-shrink-0">
									{notification.triggeredBy?.profilePicture ? (
										<Image
											src={notification.triggeredBy.profilePicture}
											alt=""
											width={36}
											height={36}
											className="h-9 w-9 rounded-full object-cover"
										/>
									) : notification.triggeredBy ? (
										<HiUserCircle className="text-muted-foreground h-9 w-9" />
									) : (
										<span className="flex h-9 w-9 items-center justify-center text-xl">
											{getNotificationIcon(notification.type)}
										</span>
									)}
								</div>

								{/* Content */}
								<div className="min-w-0 flex-1">
									<p className="text-foreground text-sm font-medium">
										{notification.title}
									</p>
									<p className="text-muted-foreground line-clamp-2 text-sm">
										{notification.message}
									</p>
									<p className="text-muted-foreground mt-1 text-xs">
										{formatDistanceToNow(new Date(notification.createdAt), {
											addSuffix: true,
										})}
									</p>
								</div>

								{/* Actions */}
								<div className="flex flex-shrink-0 items-start gap-1">
									{notification.actionUrl && (
										<Link
											href={notification.actionUrl}
											onClick={() => {
												if (!notification.read) {
													onMarkAsRead(notification.id);
												}
												onClose();
											}}
											className="hover:bg-muted rounded p-1 transition-colors"
											title="View"
										>
											<HiArrowUpRight className="text-muted-foreground h-4 w-4" />
										</Link>
									)}
									{!notification.read && (
										<button
											onClick={() => onMarkAsRead(notification.id)}
											className="hover:bg-muted rounded p-1 transition-colors cursor-pointer"
											title="Mark as read"
										>
											<HiCheck className="text-muted-foreground h-4 w-4" />
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			{notifications.length > 0 && (
				<div className="border-border border-t px-4 py-2">
					<Link
						href="/notifications"
						onClick={onClose}
						className="text-primary hover:text-primary/80 block text-center text-sm font-medium transition-colors"
					>
						View all notifications
					</Link>
				</div>
			)}
		</div>
	);
};

export default NotificationDropdown;
