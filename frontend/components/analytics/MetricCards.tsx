"use client";

import { Lightbulb, Signal, ThumbsUp, MessageSquare, Users } from "lucide-react";

interface MetricCardsProps {
	totalIdeas: number;
	totalSignals: number;
	totalUpvotes: number;
	totalComments: number;
	totalWaitlistSignups: number;
}

const METRICS = [
	{
		key: "totalIdeas",
		label: "Ideas",
		icon: Lightbulb,
		iconColor: "text-primary",
		iconBg: "bg-primary/10",
	},
	{
		key: "totalSignals",
		label: "Signals",
		icon: Signal,
		iconColor: "text-signal-problem",
		iconBg: "bg-signal-problem",
	},
	{
		key: "totalUpvotes",
		label: "Upvotes",
		icon: ThumbsUp,
		iconColor: "text-signal-build",
		iconBg: "bg-signal-build",
	},
	{
		key: "totalComments",
		label: "Feedback",
		icon: MessageSquare,
		iconColor: "text-signal-pay",
		iconBg: "bg-signal-pay",
	},
	{
		key: "totalWaitlistSignups",
		label: "Waitlist",
		icon: Users,
		iconColor: "text-amber-600",
		iconBg: "bg-amber-600/10",
	},
] as const;

export default function MetricCards(props: MetricCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			{METRICS.map((metric) => {
				const Icon = metric.icon;
				const value = props[metric.key];

				return (
					<div
						key={metric.key}
						className="bg-card border-border/50 rounded-xl border p-5"
					>
						<div
							className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full ${metric.iconBg}`}
						>
							<Icon className={`h-4.5 w-4.5 ${metric.iconColor}`} />
						</div>
						<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							{metric.label}
						</p>
						<p className="mt-1 text-2xl font-bold tracking-tight">
							{value.toLocaleString()}
						</p>
					</div>
				);
			})}
		</div>
	);
}
