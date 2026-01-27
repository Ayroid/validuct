"use client";

import { HiCurrencyDollar, HiChartBar, HiCpuChip } from "react-icons/hi2";
import FadeIn from "./FadeIn";
import InteractiveCard from "./InteractiveCard";

const roadmapItems = [
	{
		icon: HiCurrencyDollar,
		title: "Payment Intent Capture",
		description:
			'Let visitors express "I\'d pay $X" for your idea. See potential revenue before building.',
		status: "In Progress",
		statusColor: "text-amber-600",
		statusBg: "bg-amber-500/10",
		accentColor: "#f59e0b",
	},
	{
		icon: HiChartBar,
		title: "Analytics Dashboard",
		description:
			"View trends, traffic sources, and conversion funnel. Make data-driven decisions.",
		status: "Planned",
		statusColor: "text-blue-600",
		statusBg: "bg-blue-500/10",
		accentColor: "#3b82f6",
	},
	{
		icon: HiCpuChip,
		title: "AI Market Analysis",
		description:
			"Get AI-powered competitor analysis and market insights for your idea.",
		status: "Exploring",
		statusColor: "text-purple-600",
		statusBg: "bg-purple-500/10",
		accentColor: "#8b5cf6",
	},
];

export default function RoadmapSection() {
	return (
		<section className="px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6">
			<div className="mx-auto max-w-6xl">
				<FadeIn direction="up" className="mb-10 sm:mb-16 text-center">
					<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
						Roadmap
					</span>
					<h2 className="text-foreground mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
						Even More Powerful Features Coming
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
						We&apos;re building the complete validation toolkit for builders.
					</p>
				</FadeIn>

				<div className="grid gap-4 sm:gap-6 md:grid-cols-3">
					{roadmapItems.map((item, index) => (
						<FadeIn key={item.title} delay={index * 150} direction="up">
							<InteractiveCard
								hoverEffect="border"
								accentColor={item.accentColor}
								className="h-full shadow-card hover:shadow-lg"
							>
								<div className="p-5 sm:p-6 pl-6 sm:pl-8">
									<div className="mb-4 flex items-center justify-between">
										<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
											<item.icon className="text-primary h-6 w-6" />
										</div>
										<span
											className={`rounded-full ${item.statusBg} px-3 py-1 text-xs font-medium ${item.statusColor}`}
										>
											{item.status}
										</span>
									</div>
									<h3 className="text-foreground mb-2 text-base sm:text-lg font-semibold">
										{item.title}
									</h3>
									<p className="text-muted-foreground text-sm">
										{item.description}
									</p>
								</div>
							</InteractiveCard>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}
