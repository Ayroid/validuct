"use client";

import {
	HiLightBulb,
	HiSignal,
	HiChartBar,
} from "react-icons/hi2";

interface AnalyticsSummaryCardsProps {
	totalIdeas: number;
	totalSignals: number;
	avgSignalsPerIdea: number;
}

export default function AnalyticsSummaryCards({
	totalIdeas,
	totalSignals,
	avgSignalsPerIdea,
}: AnalyticsSummaryCardsProps) {
	const stats = [
		{
			label: "Total Ideas",
			value: totalIdeas,
			icon: HiLightBulb,
			iconBg: "bg-blue-500/10",
			iconColor: "text-blue-500",
		},
		{
			label: "Total Signals",
			value: totalSignals,
			icon: HiSignal,
			iconBg: "bg-emerald-500/10",
			iconColor: "text-emerald-500",
		},
		{
			label: "Avg Signals/Idea",
			value: avgSignalsPerIdea.toFixed(1),
			icon: HiChartBar,
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-500",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className="bg-card border-border/50 shadow-card rounded-xl border p-6"
					>
						<div className="flex items-center gap-4">
							<div
								className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
							>
								<Icon className={`h-5 w-5 ${stat.iconColor}`} />
							</div>
							<div>
								<p className="text-muted-foreground text-xs tracking-wide uppercase">{stat.label}</p>
								<p className="text-foreground text-2xl font-bold font-mono">
									{stat.value}
								</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
