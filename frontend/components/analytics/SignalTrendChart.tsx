"use client";

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";
import { DailySignalTrend } from "@/types";

interface SignalTrendChartProps {
	data: DailySignalTrend[];
}

export default function SignalTrendChart({ data }: SignalTrendChartProps) {
	const hasData = data.some(
		(d) => d.problemReal > 0 || d.wouldPay > 0 || d.readyToBuild > 0 || d.needsClarity > 0
	);

	if (!hasData) {
		return (
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
				<h3 className="text-foreground mb-5 text-base font-semibold">
					Signal Trends (Last 30 Days)
				</h3>
				<div className="flex items-center justify-center h-72 text-muted-foreground">
					No signal activity in the last 30 days
				</div>
			</div>
		);
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	return (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
			<h3 className="text-foreground mb-5 text-base font-semibold">
				Signal Trends (Last 30 Days)
			</h3>
			<div className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="colorProblem" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorBuild" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#f97316" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis
							dataKey="date"
							tickFormatter={formatDate}
							tick={{ fontSize: 10 }}
							tickLine={false}
							axisLine={false}
							interval="preserveStartEnd"
						/>
						<YAxis
							tick={{ fontSize: 10 }}
							tickLine={false}
							axisLine={false}
							allowDecimals={false}
						/>
						<Tooltip
							content={({ active, payload, label }) => {
								if (active && payload && payload.length) {
									return (
										<div className="bg-popover border-border rounded-lg border px-3 py-2 shadow-lg">
											<p className="text-foreground text-sm font-medium mb-1">
												{label ? formatDate(String(label)) : ""}
											</p>
											{payload.map((item, index) => (
												<p
													key={index}
													className="text-xs"
													style={{ color: item.color }}
												>
													{item.name}: {item.value}
												</p>
											))}
										</div>
									);
								}
								return null;
							}}
						/>
						<Legend
							verticalAlign="top"
							height={36}
							formatter={(value) => (
								<span className="text-muted-foreground text-xs">{value}</span>
							)}
						/>
						<Area
							type="monotone"
							dataKey="problemReal"
							name="Problem Real"
							stroke="#10b981"
							fill="url(#colorProblem)"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="wouldPay"
							name="Would Pay"
							stroke="#f59e0b"
							fill="url(#colorPay)"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="readyToBuild"
							name="Ready to Build"
							stroke="#3b82f6"
							fill="url(#colorBuild)"
							strokeWidth={2}
						/>
						<Area
							type="monotone"
							dataKey="needsClarity"
							name="Needs Clarity"
							stroke="#f97316"
							fill="url(#colorClarity)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
