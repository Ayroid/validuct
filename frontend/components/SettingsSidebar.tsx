"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiBell } from "react-icons/hi2";

const settingsNav = [
	{
		label: "Notifications",
		href: "/settings/notifications",
		icon: HiBell,
	},
];

export default function SettingsSidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-full md:w-56 shrink-0">
			<h1 className="text-foreground text-xl font-bold tracking-tight mb-5">Settings</h1>
			<nav className="space-y-1">
				{settingsNav.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
								isActive
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
		</aside>
	);
}
