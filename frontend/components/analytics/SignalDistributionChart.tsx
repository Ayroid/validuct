"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SignalDistribution } from "@/types";

interface SignalDistributionChartProps {
	data: SignalDistribution[];
}

const SIGNAL_COLORS: Record<string, string> = {
	PROBLEM_REAL: "#10b981", // emerald-500
	WOULD_PAY: "#f59e0b", // amber-500
	READY_TO_BUILD: "#3b82f6", // blue-500
	NEEDS_CLARITY: "#f97316", // orange-500
};

const SIGNAL_LABELS: Record<string, string> = {
	PROBLEM_REAL: "Problem Real",
	WOULD_PAY: "Would Pay",
	READY_TO_BUILD: "Ready to Build",
	NEEDS_CLARITY: "Needs Clarity",
};

export default function SignalDistributionChart({ data }: SignalDistributionChartProps) {
	const chartData = data.map((item) => ({
		name: SIGNAL_LABELS[item.type] || item.type,
		value: item.count,
		percentage: item.percentage,
		type: item.type,
	}));

	const totalSignals = data.reduce((sum, item) => sum + item.count, 0);

	if (totalSignals === 0) {
		return (
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
				<h3 className="text-foreground mb-5 text-base font-semibold">
					Signal Distribution
				</h3>
				<div className="flex items-center justify-center h-64 text-muted-foreground">
					No signals yet
				</div>
			</div>
		);
	}

	return (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
			<h3 className="text-foreground mb-5 text-base font-semibold">
				Signal Distribution
			</h3>
			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={80}
							paddingAngle={2}
							dataKey="value"
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={SIGNAL_COLORS[entry.type] || "#6b7280"}
								/>
							))}
						</Pie>
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const data = payload[0].payload;
									return (
										<div className="bg-popover border-border rounded-lg border px-3 py-2 shadow-lg">
											<p className="text-foreground text-sm font-medium">
												{data.name}
											</p>
											<p className="text-muted-foreground text-xs">
												{data.value} signals ({data.percentage.toFixed(1)}%)
											</p>
										</div>
									);
								}
								return null;
							}}
						/>
						<Legend
							verticalAlign="bottom"
							height={36}
							formatter={(value) => (
								<span className="text-muted-foreground text-xs">{value}</span>
							)}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
