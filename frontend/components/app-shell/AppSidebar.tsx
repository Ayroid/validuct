"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
	HiHome,
	HiBell,
	HiUser,
	HiCog6Tooth,
	HiPlusCircle,
} from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";
import { useNotificationCount } from "@/hooks/useNotificationCount";

const navItems = [
	{ label: "Home", href: "/home", icon: HiHome },
	{ label: "Notifications", href: "/notifications", icon: HiBell },
];

export default function AppSidebar() {
	const pathname = usePathname();
	const { user } = useAuth();
	const { unreadCount } = useNotificationCount();

	const allNavItems = [
		...navItems,
		{
			label: "Profile",
			href: user ? `/${user.username}` : "/home",
			icon: HiUser,
		},
		{ label: "Settings", href: "/settings/notifications", icon: HiCog6Tooth },
	];

	const isActive = (href: string) => {
		if (href === "/home") return pathname === "/home";
		if (href === "/notifications") return pathname === "/notifications";
		if (href.startsWith("/settings")) return pathname.startsWith("/settings");
		if (user && href === `/${user.username}`)
			return pathname === `/${user.username}` || pathname.startsWith(`/${user.username}/`);
		return pathname === href;
	};

	return (
		<aside className="border-border/50 hidden md:flex sticky top-0 h-screen w-56 shrink-0 flex-col border-r bg-background z-40">
			{/* Logo */}
			<Link
				href="/home"
				className="flex items-center gap-2.5 px-5 py-5 transition-opacity hover:opacity-80"
			>
				<Image
					src="/logo.png"
					alt="Validuct Logo"
					width={28}
					height={28}
					className="object-contain"
				/>
				<span
					className="text-primary text-[15px] font-medium tracking-wide uppercase"
					style={{ fontFamily: "var(--font-geist)" }}
				>
					Validuct
				</span>
			</Link>

			{/* Nav Items */}
			<nav className="flex-1 space-y-1 px-3 pt-2">
				{allNavItems.map((item) => {
					const active = isActive(item.href);
					const Icon = item.icon;
					return (
						<Link
							key={item.label}
							href={item.href}
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
								active
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-muted hover:text-foreground"
							}`}
						>
							<div className="relative">
								<Icon className="h-5 w-5" />
								{item.label === "Notifications" && unreadCount > 0 && (
									<span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
										{unreadCount > 99 ? "99+" : unreadCount}
									</span>
								)}
							</div>
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* Bottom Section */}
			<div className="space-y-3 px-3 pb-5">
				<Link href="/idea/new">
					<button className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
						<HiPlusCircle className="h-5 w-5" />
						New Idea
					</button>
				</Link>
			</div>
		</aside>
	);
}
