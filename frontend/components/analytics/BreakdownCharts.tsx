"use client";

import { useState } from "react";
import {
	PieChart,
	Pie,
	Cell,
	Legend,
	ResponsiveContainer,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { IdeaSignalCounts } from "@/types";
import { LayoutGrid, BarChart3 } from "lucide-react";

interface BreakdownChartsProps {
	signalDistribution: IdeaSignalCounts;
	ideasByStatus: {
		DRAFT: number;
		WIP: number;
		VALIDATED: number;
		LAUNCHED: number;
	};
	ideasByValidationState: {
		NEEDS_ACTION: number;
		READY_TO_BUILD: number;
		VALIDATED: number;
		NEUTRAL: number;
	};
}

const SIGNAL_COLORS = [
	{
		key: "problemReal" as const,
		label: "Problem Real",
		cssVar: "var(--signal-problem)",
	},
	{
		key: "wouldPay" as const,
		label: "Would Pay",
		cssVar: "var(--signal-pay)",
	},
	{
		key: "readyToBuild" as const,
		label: "Ready to Build",
		cssVar: "var(--signal-build)",
	},
	{
		key: "needsClarity" as const,
		label: "Needs Clarity",
		cssVar: "var(--signal-clarity)",
	},
];

const STATUS_CONFIG = [
	{ key: "DRAFT" as const, label: "Draft", color: "#9CA3AF" },
	{ key: "WIP" as const, label: "WIP", color: "#EDA839" },
	{ key: "VALIDATED" as const, label: "Validated", color: "#10B981" },
	{ key: "LAUNCHED" as const, label: "Launched", color: "#2563EB" },
];

const VALIDATION_STATE_CONFIG = [
	{ key: "NEEDS_ACTION" as const, label: "Needs Action", color: "#EDA839" },
	{ key: "READY_TO_BUILD" as const, label: "Ready to Build", color: "#2563EB" },
	{ key: "VALIDATED" as const, label: "Validated", color: "#10B981" },
	{ key: "NEUTRAL" as const, label: "Early Stage", color: "#9CA3AF" },
];

function PieTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ name: string; value: number; payload: { name: string; value: number; fill: string; percentage: number } }>;
}) {
	if (!active || !payload || payload.length === 0) return null;
	const data = payload[0].payload;
	return (
		<div className="bg-popover border-border rounded-lg border px-3 py-2 shadow-lg">
			<p className="text-foreground text-sm font-medium">{data.name}</p>
			<p className="text-muted-foreground text-xs">
				{data.value} signals ({data.percentage.toFixed(1)}%)
			</p>
		</div>
	);
}

function BarTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ name: string; value: number; payload: { name: string; value: number; fill: string } }>;
}) {
	if (!active || !payload || payload.length === 0) return null;
	const data = payload[0].payload;
	return (
		<div className="bg-popover border-border rounded-lg border px-3 py-2 shadow-lg">
			<p className="text-foreground text-sm font-medium">{data.name}</p>
			<p className="text-muted-foreground text-xs">
				{data.value} ideas
			</p>
		</div>
	);
}

type ViewMode = "cards" | "bars";

export default function BreakdownCharts({
	signalDistribution,
	ideasByStatus,
	ideasByValidationState,
}: BreakdownChartsProps) {
	const [statusView, setStatusView] = useState<ViewMode>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem("analytics:statusView") as ViewMode) || "cards";
		}
		return "cards";
	});
	const [validationView, setValidationView] = useState<ViewMode>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem("analytics:validationView") as ViewMode) || "cards";
		}
		return "cards";
	});

	const updateStatusView = (v: ViewMode) => {
		setStatusView(v);
		localStorage.setItem("analytics:statusView", v);
	};

	const updateValidationView = (v: ViewMode) => {
		setValidationView(v);
		localStorage.setItem("analytics:validationView", v);
	};

	const totalSignals =
		signalDistribution.problemReal +
		signalDistribution.wouldPay +
		signalDistribution.readyToBuild +
		signalDistribution.needsClarity;

	const pieData = SIGNAL_COLORS.map((s) => {
		const value = signalDistribution[s.key];
		return {
			name: s.label,
			value,
			fill: s.cssVar,
			percentage: totalSignals > 0 ? (value / totalSignals) * 100 : 0,
		};
	});

	const statusBarData = STATUS_CONFIG.map((s) => ({
		name: s.label,
		value: ideasByStatus[s.key],
		fill: s.color,
	}));

	const validationBarData = VALIDATION_STATE_CONFIG.map((s) => ({
		name: s.label,
		value: ideasByValidationState[s.key],
		fill: s.color,
	}));

	return (
		<div className="space-y-4">
			{/* Idea Progress Status & Idea Validation Status — 50/50 row */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{/* Idea Progress Status */}
				<div className="bg-card border-border/50 rounded-xl border p-5">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Idea Progress Status
						</span>
						<button
							onClick={() =>
								updateStatusView(
									statusView === "cards" ? "bars" : "cards"
								)
							}
							className="text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer rounded-md p-1.5 transition-colors"
							title={statusView === "cards" ? "Bar graph view" : "Card view"}
						>
							{statusView === "cards" ? (
								<BarChart3 className="h-4 w-4" />
							) : (
								<LayoutGrid className="h-4 w-4" />
							)}
						</button>
					</div>

					{statusView === "cards" ? (
						<div className="mt-4 grid grid-cols-2 gap-3">
							{STATUS_CONFIG.map((s) => (
								<div
									key={s.key}
									className="rounded-xl p-4"
									style={{ backgroundColor: s.color + "15" }}
								>
									<span
										className="text-xs font-semibold"
										style={{ color: s.color }}
									>
										{s.label}
									</span>
									<p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
										{ideasByStatus[s.key]}
									</p>
								</div>
							))}
						</div>
					) : (
						<div className="mt-4 h-52">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={statusBarData}
									layout="vertical"
									margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										horizontal={false}
										stroke="var(--color-border)"
										strokeOpacity={0.5}
									/>
									<XAxis
										type="number"
										allowDecimals={false}
										tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										type="category"
										dataKey="name"
										width={72}
										tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip
										content={<BarTooltip />}
										cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
									/>
									<Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
										{statusBarData.map((entry, i) => (
											<Cell key={i} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>

				{/* Idea Validation Status */}
				<div className="bg-card border-border/50 rounded-xl border p-5">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Idea Validation Status
						</span>
						<button
							onClick={() =>
								updateValidationView(
									validationView === "cards" ? "bars" : "cards"
								)
							}
							className="text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer rounded-md p-1.5 transition-colors"
							title={validationView === "cards" ? "Bar graph view" : "Card view"}
						>
							{validationView === "cards" ? (
								<BarChart3 className="h-4 w-4" />
							) : (
								<LayoutGrid className="h-4 w-4" />
							)}
						</button>
					</div>

					{validationView === "cards" ? (
						<div className="mt-4 grid grid-cols-2 gap-3">
							{VALIDATION_STATE_CONFIG.map((s) => (
								<div
									key={s.key}
									className="rounded-xl p-4"
									style={{ backgroundColor: s.color + "15" }}
								>
									<span
										className="text-xs font-semibold"
										style={{ color: s.color }}
									>
										{s.label}
									</span>
									<p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
										{ideasByValidationState[s.key]}
									</p>
								</div>
							))}
						</div>
					) : (
						<div className="mt-4 h-52">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={validationBarData}
									layout="vertical"
									margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										horizontal={false}
										stroke="var(--color-border)"
										strokeOpacity={0.5}
									/>
									<XAxis
										type="number"
										allowDecimals={false}
										tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										type="category"
										dataKey="name"
										width={90}
										tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip
										content={<BarTooltip />}
										cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
									/>
									<Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
										{validationBarData.map((entry, i) => (
											<Cell key={i} fill={entry.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>
			</div>

			{/* Signal Distribution Donut — full width row below */}
			<div className="bg-card border-border/50 rounded-xl border p-6">
				<h3 className="text-foreground mb-5 text-base font-semibold">
					Signal Distribution
				</h3>

				<div className="relative h-64">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={pieData}
								cx="50%"
								cy="45%"
								innerRadius={60}
								outerRadius={80}
								paddingAngle={2}
								dataKey="value"
							>
								{pieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={entry.fill}
									/>
								))}
							</Pie>
							<Tooltip content={<PieTooltip />} />
							<Legend
								verticalAlign="bottom"
								height={36}
								formatter={(value) => (
									<span className="text-muted-foreground text-xs">
										{value}
									</span>
								)}
							/>
						</PieChart>
					</ResponsiveContainer>

					{/* Center total count */}
					<div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center" style={{ paddingBottom: 36 }}>
						<div className="text-center">
							<p className="text-2xl font-bold tracking-tight">
								{totalSignals}
							</p>
							<p className="text-muted-foreground text-xs">
								Total
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
