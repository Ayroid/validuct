"use client";

import { useMemo } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { DailyActivity, ActivityRange } from "@/types";

interface ActivityChartProps {
	dailyActivity: DailyActivity[];
	range: ActivityRange;
	onRangeChange: (range: ActivityRange) => void;
	title?: string;
}

const RANGE_OPTIONS: { value: ActivityRange; label: string }[] = [
	{ value: "24h", label: "24 hrs" },
	{ value: "7d", label: "7 days" },
	{ value: "30d", label: "30 days" },
	{ value: "all", label: "Lifetime" },
];

function formatTick(dateStr: string): string {
	if (dateStr.includes("T")) {
		const hour = parseInt(dateStr.split("T")[1].split(":")[0]);
		const ampm = hour >= 12 ? "PM" : "AM";
		const h = hour % 12 || 12;
		return `${h} ${ampm}`;
	}
	const d = new Date(dateStr + "T00:00:00");
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipDate(dateStr: string): string {
	if (dateStr.includes("T")) {
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	}
	const d = new Date(dateStr + "T00:00:00");
	return d.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function CustomTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{ value: number; name: string; color: string }>;
	label?: string;
}) {
	if (!active || !payload || !label) return null;

	return (
		<div className="bg-card border-border/50 rounded-lg border p-3 shadow-lg">
			<p className="text-muted-foreground mb-1.5 text-xs font-medium">
				{formatTooltipDate(label)}
			</p>
			{payload.map((entry) => (
				<div key={entry.name} className="flex items-center gap-2 text-xs">
					<span
						className="h-2 w-2 rounded-full"
						style={{ backgroundColor: entry.color }}
					/>
					<span className="text-muted-foreground capitalize">
						{entry.name}
					</span>
					<span className="ml-auto font-semibold">{entry.value}</span>
				</div>
			))}
		</div>
	);
}

export default function ActivityChart({
	dailyActivity,
	range,
	onRangeChange,
	title = "Activity Overview",
}: ActivityChartProps) {
	const totalActivity = useMemo(
		() =>
			dailyActivity.reduce(
				(sum, d) => sum + d.signals + d.upvotes + d.comments + (d.waitlist || 0),
				0
			),
		[dailyActivity]
	);

	const tickIndices = useMemo(() => {
		const maxTicks = range === "24h" ? 8 : 6;
		const step = Math.max(1, Math.floor(dailyActivity.length / maxTicks));
		const indices: number[] = [];
		for (let i = 0; i < dailyActivity.length; i += step) {
			indices.push(i);
		}
		return new Set(indices);
	}, [dailyActivity, range]);

	return (
		<div className="bg-card border-border/50 rounded-xl border p-6">
			<div className="mb-5 flex items-baseline justify-between">
				<div className="flex items-baseline gap-3">
					<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
						{title}
					</span>
					<span className="text-2xl font-bold tracking-tight">
						{totalActivity.toLocaleString()}
					</span>
				</div>
				<select
					value={range}
					onChange={(e) =>
						onRangeChange(e.target.value as ActivityRange)
					}
					className="bg-muted/50 border-border/50 text-foreground rounded-md border px-2 py-1 text-xs"
				>
					{RANGE_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>

			<ResponsiveContainer width="100%" height={280}>
				<AreaChart
					data={dailyActivity}
					margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
				>
					<defs>
						<linearGradient
							id="gradSignals"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="var(--signal-problem)"
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor="var(--signal-problem)"
								stopOpacity={0}
							/>
						</linearGradient>
						<linearGradient
							id="gradUpvotes"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="var(--signal-pay)"
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor="var(--signal-pay)"
								stopOpacity={0}
							/>
						</linearGradient>
						<linearGradient
							id="gradComments"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="var(--signal-build)"
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor="var(--signal-build)"
								stopOpacity={0}
							/>
						</linearGradient>
						<linearGradient
							id="gradWaitlist"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="var(--signal-clarity)"
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor="var(--signal-clarity)"
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="hsl(var(--border))"
						opacity={0.3}
					/>
					<XAxis
						dataKey="date"
						tick={{ fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: string, index: number) =>
							tickIndices.has(index) ? formatTick(value) : ""
						}
						stroke="hsl(var(--muted-foreground))"
					/>
					<YAxis
						tick={{ fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						allowDecimals={false}
						stroke="hsl(var(--muted-foreground))"
					/>
					<Tooltip content={<CustomTooltip />} />
					<Area
						type="monotone"
						dataKey="signals"
						stroke="var(--signal-problem)"
						fill="url(#gradSignals)"
						strokeWidth={2}
					/>
					<Area
						type="monotone"
						dataKey="upvotes"
						stroke="var(--signal-pay)"
						fill="url(#gradUpvotes)"
						strokeWidth={2}
					/>
					<Area
						type="monotone"
						dataKey="comments"
						stroke="var(--signal-build)"
						fill="url(#gradComments)"
						strokeWidth={2}
					/>
					<Area
						type="monotone"
						dataKey="waitlist"
						stroke="var(--signal-clarity)"
						fill="url(#gradWaitlist)"
						strokeWidth={2}
					/>
				</AreaChart>
			</ResponsiveContainer>

			<div className="mt-4 flex items-center justify-center gap-5">
				<div className="flex items-center gap-1.5 text-xs">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--signal-problem)" }} />
					<span className="text-muted-foreground">Signals</span>
				</div>
				<div className="flex items-center gap-1.5 text-xs">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--signal-pay)" }} />
					<span className="text-muted-foreground">Upvotes</span>
				</div>
				<div className="flex items-center gap-1.5 text-xs">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--signal-build)" }} />
					<span className="text-muted-foreground">Feedback</span>
				</div>
				<div className="flex items-center gap-1.5 text-xs">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--signal-clarity)" }} />
					<span className="text-muted-foreground">Waitlist</span>
				</div>
			</div>
		</div>
	);
}
