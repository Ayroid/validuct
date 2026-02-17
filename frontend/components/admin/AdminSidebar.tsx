"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	HiChatBubbleLeftRight,
	HiChartBar,
	HiUsers,
	HiLightBulb,
	HiEnvelope,
	HiClipboardDocumentList,
} from "react-icons/hi2";
import { TbArrowLeft } from "react-icons/tb";

const navItems = [
	{
		label: "Dashboard",
		href: "/admin",
		icon: HiChartBar,
		enabled: true,
	},
	{
		label: "Suggestions",
		href: "/admin/suggestions",
		icon: HiChatBubbleLeftRight,
		enabled: true,
	},
	{
		label: "Users",
		href: "/admin/users",
		icon: HiUsers,
		enabled: false,
	},
	{
		label: "Ideas",
		href: "/admin/ideas",
		icon: HiLightBulb,
		enabled: false,
	},
	{
		label: "Email Queue",
		href: "/admin/emails",
		icon: HiEnvelope,
		enabled: false,
	},
	{
		label: "Waitlist",
		href: "/admin/waitlist",
		icon: HiClipboardDocumentList,
		enabled: false,
	},
];

export default function AdminSidebar() {
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === "/admin") return pathname === "/admin";
		return pathname.startsWith(href);
	};

	return (
		<aside className="border-border/50 bg-background sticky top-0 z-40 hidden h-screen w-56 shrink-0 flex-col border-r md:flex">
			{/* Header */}
			<div className="px-5 py-5">
				<p className="text-foreground text-sm font-semibold tracking-wide">
					Admin Panel
				</p>
			</div>

			{/* Nav Items */}
			<nav className="flex-1 space-y-1 px-3 pt-2">
				{navItems.map((item) => {
					const active = isActive(item.href);
					const Icon = item.icon;

					if (!item.enabled) {
						return (
							<div
								key={item.label}
								className="text-muted-foreground/40 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
							>
								<Icon className="h-5 w-5" />
								{item.label}
								<span className="text-muted-foreground/30 ml-auto text-[10px] font-medium uppercase tracking-wide">
									Soon
								</span>
							</div>
						);
					}

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
							<Icon className="h-5 w-5" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* Back to app */}
			<div className="border-border/50 border-t px-3 py-4">
				<Link
					href="/home"
					className="text-muted-foreground hover:text-foreground flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors"
				>
					<TbArrowLeft className="h-4 w-4" />
					Back to App
				</Link>
			</div>
		</aside>
	);
}
