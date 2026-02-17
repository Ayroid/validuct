"use client";

import Link from "next/link";
import {
	HiChatBubbleLeftRight,
	HiChartBar,
	HiUsers,
	HiLightBulb,
	HiEnvelope,
	HiClipboardDocumentList,
	HiArrowRight,
} from "react-icons/hi2";

const pages = [
	{
		label: "Suggestions",
		description: "View, approve, and reject user suggestions",
		href: "/admin/suggestions",
		icon: HiChatBubbleLeftRight,
		enabled: true,
	},
	{
		label: "Overview",
		description: "Platform-wide stats and daily trends",
		href: "/admin",
		icon: HiChartBar,
		enabled: false,
	},
	{
		label: "Users",
		description: "Browse users, search, toggle admin status",
		href: "/admin/users",
		icon: HiUsers,
		enabled: false,
	},
	{
		label: "Ideas",
		description: "Browse and moderate all ideas",
		href: "/admin/ideas",
		icon: HiLightBulb,
		enabled: false,
	},
	{
		label: "Email Queue",
		description: "View email delivery status and retry failed",
		href: "/admin/emails",
		icon: HiEnvelope,
		enabled: false,
	},
	{
		label: "Waitlist",
		description: "View all waitlist signups",
		href: "/admin/waitlist",
		icon: HiClipboardDocumentList,
		enabled: false,
	},
];

export default function AdminPage() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
				Admin Dashboard
			</h1>
			<p className="text-muted-foreground mt-1 text-sm">
				Manage your platform from here.
			</p>

			<div className="mt-10 grid gap-4 sm:grid-cols-2">
				{pages.map((item) => {
					const Icon = item.icon;

					if (!item.enabled) {
						return (
							<div
								key={item.label}
								className="rounded-xl border border-border/50 bg-card p-6 opacity-50"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
										<Icon className="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<p className="text-sm font-semibold text-foreground">
											{item.label}
										</p>
										<p className="text-xs text-muted-foreground">
											{item.description}
										</p>
									</div>
								</div>
								<span className="mt-4 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
									Coming soon
								</span>
							</div>
						);
					}

					return (
						<Link
							key={item.label}
							href={item.href}
							className="group rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-border hover:bg-card/80"
						>
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
									<Icon className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">
										{item.label}
									</p>
									<p className="text-xs text-muted-foreground">
										{item.description}
									</p>
								</div>
							</div>
							<div className="text-primary mt-4 flex items-center gap-1.5 text-xs font-medium">
								Open
								<HiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
