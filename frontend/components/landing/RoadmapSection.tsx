"use client";

import { HiCurrencyDollar, HiChartBar, HiCpuChip } from "react-icons/hi2";

const roadmapItems = [
	{
		icon: HiCurrencyDollar,
		title: "Payment Intent",
		description: "Let visitors say \"I'd pay $X\" — see potential revenue before building.",
		status: "In Progress",
	},
	{
		icon: HiChartBar,
		title: "Analytics Dashboard",
		description: "Track views, signups, and conversion rates over time.",
		status: "Planned",
	},
	{
		icon: HiCpuChip,
		title: "AI Market Analysis",
		description: "Get competitor analysis and market insights for your idea.",
		status: "Exploring",
	},
];

const statusStyles: Record<string, string> = {
	"In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
	"Planned": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
	"Exploring": "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
};

export default function RoadmapSection() {
	return (
		<section className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24 bg-muted/30">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="max-w-2xl mb-12">
					<p className="text-primary font-medium text-sm mb-3">Roadmap</p>
					<h2 className="text-foreground text-3xl font-bold sm:text-4xl mb-4">
						What's coming next
					</h2>
					<p className="text-muted-foreground text-lg">
						Building the complete validation toolkit for builders.
					</p>
				</div>

				{/* Roadmap Items */}
				<div className="space-y-4">
					{roadmapItems.map((item) => (
						<div
							key={item.title}
							className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
						>
							<div className="bg-muted w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
								<item.icon className="h-5 w-5 text-muted-foreground" />
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-foreground font-semibold mb-1">
									{item.title}
								</h3>
								<p className="text-muted-foreground text-sm">
									{item.description}
								</p>
							</div>
							<span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyles[item.status]}`}>
								{item.status}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
