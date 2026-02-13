"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HiHome, HiBell, HiUser, HiCog6Tooth } from "react-icons/hi2";
import { TbHexagonFilled } from "react-icons/tb";
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
			return (
				pathname === `/${user.username}` ||
				pathname.startsWith(`/${user.username}/`)
			);
		return pathname === href;
	};

	return (
		<aside className="border-border/50 bg-background sticky top-0 z-40 hidden h-screen w-56 shrink-0 flex-col border-r md:flex">
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
									<span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
										{unreadCount > 99 ? "99+" : unreadCount}
									</span>
								)}
							</div>
							{item.label}
						</Link>
					);
				})}

				{/* New Idea */}
				<div className="mt-4 pt-4 border-t border-border/50">
					<Link
						href="/idea/new"
						className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 rounded-lg px-3 py-3 text-sm font-semibold tracking-wide transition-all"
					>
						<TbHexagonFilled className="h-5 w-5" />
						New Idea
					</Link>
				</div>
			</nav>
		</aside>
	);
}
