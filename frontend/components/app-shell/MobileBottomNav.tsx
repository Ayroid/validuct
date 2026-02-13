"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiBell, HiUser, HiCog6Tooth } from "react-icons/hi2";
import { TbHexagonFilled } from "react-icons/tb";
import { useAuth } from "@/context/AuthContext";
import { useNotificationCount } from "@/hooks/useNotificationCount";

export default function MobileBottomNav() {
	const pathname = usePathname();
	const { user } = useAuth();
	const { unreadCount } = useNotificationCount();

	const profileHref = user ? `/${user.username}` : "/home";

	const isActive = (href: string) => {
		if (href === "/home") return pathname === "/home";
		if (href === "/notifications") return pathname === "/notifications";
		if (href === "/settings") return pathname.startsWith("/settings");
		if (user && href === `/${user.username}`)
			return pathname === `/${user.username}` || pathname.startsWith(`/${user.username}/`);
		return pathname === href;
	};

	return (
		<nav className="fixed bottom-3 left-3 right-3 z-50 mx-auto flex max-w-md items-center justify-around rounded-2xl border border-border/50 bg-background/85 shadow-lg backdrop-blur-lg md:hidden pb-[env(safe-area-inset-bottom)]">
			{/* Home */}
			<Link
				href="/home"
				className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
					isActive("/home")
						? "text-primary"
						: "text-muted-foreground"
				}`}
			>
				<HiHome className="h-5 w-5" />
				Home
			</Link>

			{/* Profile */}
			<Link
				href={profileHref}
				className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
					isActive(profileHref)
						? "text-primary"
						: "text-muted-foreground"
				}`}
			>
				<HiUser className="h-5 w-5" />
				Profile
			</Link>

			{/* New Idea — center CTA */}
			<Link
				href="/idea/new"
				className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors"
			>
				<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
					<TbHexagonFilled className="h-5 w-5" />
				</div>
				Create
			</Link>

			{/* Notifications */}
			<Link
				href="/notifications"
				className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
					isActive("/notifications")
						? "text-primary"
						: "text-muted-foreground"
				}`}
			>
				<div className="relative">
					<HiBell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</div>
				Notifications
			</Link>

			{/* Settings */}
			<Link
				href="/settings"
				className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
					isActive("/settings")
						? "text-primary"
						: "text-muted-foreground"
				}`}
			>
				<HiCog6Tooth className="h-5 w-5" />
				Settings
			</Link>
		</nav>
	);
}
