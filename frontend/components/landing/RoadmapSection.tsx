"use client";

import { HiCurrencyDollar, HiChartBar, HiCpuChip } from "react-icons/hi2";
import FadeIn from "./FadeIn";

const roadmapItems = [
	{
		icon: HiCurrencyDollar,
		title: "Payment Intent Capture",
		description:
			'Let visitors express "I\'d pay $X" for your idea. See potential revenue before building.',
		status: "In Progress",
		statusColor: "text-amber-600",
		statusBg: "bg-amber-500/10",
		iconBg: "bg-amber-500/10",
		iconColor: "text-amber-500",
	},
	{
		icon: HiChartBar,
		title: "Analytics Dashboard",
		description:
			"View trends, traffic sources, and conversion funnel. Make data-driven decisions.",
		status: "Planned",
		statusColor: "text-blue-600",
		statusBg: "bg-blue-500/10",
		iconBg: "bg-blue-500/10",
		iconColor: "text-blue-500",
	},
	{
		icon: HiCpuChip,
		title: "AI Market Analysis",
		description:
			"Get AI-powered competitor analysis and market insights for your idea.",
		status: "Exploring",
		statusColor: "text-purple-600",
		statusBg: "bg-purple-500/10",
		iconBg: "bg-purple-500/10",
		iconColor: "text-purple-500",
	},
];

export default function RoadmapSection() {
	return (
		<section className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
			<div className="mx-auto max-w-7xl">
				<FadeIn direction="up" className="mb-12 text-center sm:mb-16 lg:mb-20">
					<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-medium sm:text-base">
						Roadmap
					</span>
					<h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
						What&apos;s Coming Next
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
						We&apos;re building the complete validation toolkit for builders.
					</p>
				</FadeIn>

				<div className="grid gap-6 sm:gap-8 md:grid-cols-3">
					{roadmapItems.map((item, index) => (
						<FadeIn key={item.title} delay={index * 150} direction="up">
							<div className="bg-card border-border group relative h-full overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8">
								{/* Header */}
								<div className="mb-5 flex items-center justify-between">
									<div
										className={`${item.iconBg} flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16`}
									>
										<item.icon
											className={`h-7 w-7 sm:h-8 sm:w-8 ${item.iconColor}`}
										/>
									</div>
									<span
										className={`rounded-full ${item.statusBg} px-3 py-1.5 text-xs font-medium sm:text-sm ${item.statusColor}`}
									>
										{item.status}
									</span>
								</div>

								{/* Content */}
								<h3 className="text-foreground mb-3 text-xl font-semibold sm:text-2xl">
									{item.title}
								</h3>
								<p className="text-muted-foreground text-base sm:text-lg">
									{item.description}
								</p>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}
