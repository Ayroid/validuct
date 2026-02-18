"use client";

import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useEffect } from "react";
import { AdminDashboardStats, AdminDashboardRange } from "@/types";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	Cell,
} from "recharts";
import {
	HiArrowPath,
	HiUsers,
	HiLightBulb,
	HiBolt,
	HiClipboardDocumentList,
	HiEnvelope,
	HiArrowUp,
} from "react-icons/hi2";
import Link from "next/link";
import { toast } from "react-toastify";

// ── Constants ────────────────────────────────────────────────────────────────

const RANGES: { label: string; value: AdminDashboardRange }[] = [
	{ label: "7d",  value: "7d" },
	{ label: "30d", value: "30d" },
	{ label: "90d", value: "90d" },
];

const CHART_LINES = [
	{ key: "signals",  name: "Signals",  color: "#6366f1" },
	{ key: "upvotes",  name: "Upvotes",  color: "#22c55e" },
	{ key: "comments", name: "Comments", color: "#f59e0b" },
	{ key: "waitlist", name: "Waitlist", color: "#3b82f6" },
];

const STATUS_COLORS: Record<string, string> = {
	DRAFT:     "#9ca3af",
	WIP:       "#3b82f6",
	VALIDATED: "#22c55e",
	LAUNCHED:  "#a855f7",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTickDate(dateStr: string, range: AdminDashboardRange) {
	const d = new Date(dateStr + "T00:00:00");
	if (range === "7d") return d.toLocaleDateString("en-US", { weekday: "short" });
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLabelDate(dateStr: string) {
	return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
		weekday: "long", month: "long", day: "numeric",
	});
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
	icon: Icon,
	label,
	value,
	sub,
	accent,
	loading,
}: {
	icon: React.ElementType;
	label: string;
	value: string | number;
	sub?: string;
	accent: string;
	loading: boolean;
}) {
	if (loading) {
		return (
			<div className="border-border/50 bg-card rounded-xl border p-5">
				<Skeleton className="h-9 w-9 rounded-lg" />
				<Skeleton className="mt-3 h-7 w-20 rounded" />
				<Skeleton className="mt-1.5 h-3 w-28 rounded" />
			</div>
		);
	}
	return (
		<div className="border-border/50 bg-card rounded-xl border p-5">
			<div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
				<Icon className="h-4.5 w-4.5" />
			</div>
			<p className="text-muted-foreground mt-3 text-xs font-medium uppercase tracking-wide">{label}</p>
			<p className="text-foreground mt-0.5 text-2xl font-bold">{value.toLocaleString()}</p>
			{sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
		</div>
	);
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number; dataKey: string }>; label?: string }) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-card border-border rounded-xl border p-3 text-xs shadow-xl">
			<p className="text-muted-foreground mb-2 font-medium">{label ? formatLabelDate(label) : ""}</p>
			{payload.map((p) => (
				<div key={p.dataKey} className="mt-1 flex items-center gap-2">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
					<span className="text-muted-foreground">{p.name}:</span>
					<span className="text-foreground font-semibold">{p.value}</span>
				</div>
			))}
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
	const [stats, setStats]   = useState<AdminDashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [range, setRange]   = useState<AdminDashboardRange>("30d");

	const fetchStats = useCallback(async () => {
		setLoading(true);
		try {
			const result = await adminApi.getDashboardStats(range);
			setStats(result);
		} catch {
			toast.error("Failed to load dashboard stats");
		} finally {
			setLoading(false);
		}
	}, [range]);

	useEffect(() => { fetchStats(); }, [fetchStats]);

	// Derived data for charts
	const statusChartData = stats
		? [
				{ label: "Draft",     value: stats.ideasByStatus.DRAFT,     status: "DRAFT" },
				{ label: "WIP",       value: stats.ideasByStatus.WIP,       status: "WIP" },
				{ label: "Validated", value: stats.ideasByStatus.VALIDATED, status: "VALIDATED" },
				{ label: "Launched",  value: stats.ideasByStatus.LAUNCHED,  status: "LAUNCHED" },
		  ]
		: [];

	return (
		<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">

			{/* ── Header ── */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
					<p className="text-muted-foreground mt-1 text-sm">Platform overview</p>
				</div>
				<div className="flex items-center gap-2">
					{/* Range picker */}
					<div className="border-border/50 bg-muted/30 flex gap-1 rounded-lg border p-1">
						{RANGES.map((r) => (
							<button key={r.value} onClick={() => setRange(r.value)}
								className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
									range === r.value
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}>
								{r.label}
							</button>
						))}
					</div>
					<Button variant="ghost" size="icon-sm" onClick={fetchStats} disabled={loading}>
						<HiArrowPath className={loading ? "animate-spin" : ""} />
					</Button>
				</div>
			</div>

			{/* ── KPI Cards ── */}
			<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
				<StatCard
					loading={loading}
					icon={HiUsers}
					label="Users"
					value={stats?.totalUsers ?? 0}
					sub={`${stats?.realUsers ?? 0} real · ${stats?.dummyUsers ?? 0} dummy · +${stats?.newUsersInRange ?? 0} this period`}
					accent="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
				/>
				<StatCard
					loading={loading}
					icon={HiLightBulb}
					label="Ideas"
					value={stats?.totalIdeas ?? 0}
					sub={`+${stats?.newIdeasInRange ?? 0} this period`}
					accent="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
				/>
				<StatCard
					loading={loading}
					icon={HiBolt}
					label="Engagement"
					value={(stats ? stats.totalSignals + stats.totalUpvotes + stats.totalComments : 0)}
					sub={stats ? `${stats.totalSignals} signals · ${stats.totalUpvotes} votes · ${stats.totalComments} comments` : ""}
					accent="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
				/>
				<StatCard
					loading={loading}
					icon={HiClipboardDocumentList}
					label="Waitlist"
					value={(stats ? stats.totalMainWaitlist + stats.totalIdeaWaitlist : 0)}
					sub={stats ? `${stats.totalMainWaitlist} platform · ${stats.totalIdeaWaitlist} idea` : ""}
					accent="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
				/>
				<StatCard
					loading={loading}
					icon={HiEnvelope}
					label="Emails"
					value={stats?.emailStats.total ?? 0}
					sub={stats ? `${stats.emailStats.pending} pending · ${stats.emailStats.failed} failed` : ""}
					accent="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
				/>
			</div>

			{/* ── Activity Chart ── */}
			<div className="border-border/50 bg-card mt-6 rounded-xl border p-5">
				<h2 className="text-foreground text-sm font-semibold">Activity Trend</h2>
				<p className="text-muted-foreground mt-0.5 text-xs">Signals, upvotes, comments & waitlist signups over time</p>

				{loading ? (
					<Skeleton className="mt-4 h-64 w-full rounded-lg" />
				) : (
					<div className="mt-4">
						<ResponsiveContainer width="100%" height={260}>
							<LineChart data={stats?.dailyActivity ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" />
								<XAxis
									dataKey="date"
									tickFormatter={(v) => formatTickDate(v, range)}
									tick={{ fontSize: 11, fill: "#9ca3af" }}
									axisLine={false}
									tickLine={false}
									interval={range === "7d" ? 0 : range === "30d" ? 4 : 12}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: "#9ca3af" }}
									axisLine={false}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend
									iconType="circle"
									iconSize={8}
									wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
								/>
								{CHART_LINES.map((l) => (
									<Line
										key={l.key}
										type="monotone"
										dataKey={l.key}
										name={l.name}
										stroke={l.color}
										strokeWidth={2}
										dot={false}
										activeDot={{ r: 4, strokeWidth: 0 }}
									/>
								))}
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</div>

			{/* ── Bottom row: Status Chart + Top Ideas ── */}
			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

				{/* Ideas by Status */}
				<div className="border-border/50 bg-card rounded-xl border p-5">
					<h2 className="text-foreground text-sm font-semibold">Ideas by Status</h2>
					<p className="text-muted-foreground mt-0.5 text-xs">Distribution across pipeline stages</p>

					{loading ? (
						<Skeleton className="mt-4 h-44 w-full rounded-lg" />
					) : (
						<div className="mt-4">
							<ResponsiveContainer width="100%" height={170}>
								<BarChart
									data={statusChartData}
									layout="vertical"
									margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
									<CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(120,120,120,0.12)" />
									<XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
									<YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={60} />
									<Tooltip
										cursor={{ fill: "rgba(120,120,120,0.06)" }}
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const p = payload[0];
											return (
												<div className="bg-card border-border rounded-xl border p-2.5 text-xs shadow-xl">
													<span className="text-foreground font-semibold">{p.payload.label}: </span>
													<span className="text-muted-foreground">{p.value} ideas</span>
												</div>
											);
										}}
									/>
									<Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
										{statusChartData.map((entry) => (
											<Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>

							{/* Legend */}
							<div className="mt-3 flex flex-wrap gap-3">
								{statusChartData.map((s) => (
									<div key={s.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
										{s.label} ({s.value})
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Top Ideas */}
				<div className="border-border/50 bg-card rounded-xl border p-5">
					<h2 className="text-foreground text-sm font-semibold">Top Ideas</h2>
					<p className="text-muted-foreground mt-0.5 text-xs">Most upvoted ideas on the platform</p>

					{loading ? (
						<div className="mt-4 space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3">
									<Skeleton className="h-3 w-4 rounded" />
									<div className="flex-1 space-y-1.5">
										<Skeleton className="h-3 w-3/4 rounded" />
										<Skeleton className="h-2.5 w-1/3 rounded" />
									</div>
									<Skeleton className="h-3 w-12 rounded" />
								</div>
							))}
						</div>
					) : stats?.topIdeas.length === 0 ? (
						<p className="text-muted-foreground mt-6 text-center text-sm">No ideas yet</p>
					) : (
						<div className="mt-4 space-y-1">
							{stats?.topIdeas.map((idea, i) => (
								<div key={idea.id} className="hover:bg-muted/40 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors">
									<span className="text-muted-foreground w-4 shrink-0 text-right text-xs font-medium">{i + 1}</span>
									<div className="min-w-0 flex-1">
										<Link href={`/idea/${idea.id}`} target="_blank"
											className="text-foreground hover:text-primary block truncate text-sm font-medium transition-colors">
											{idea.heading}
										</Link>
										<p className="text-muted-foreground text-xs">@{idea.username}</p>
									</div>
									<div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
										<span className="flex items-center gap-0.5">
											<HiArrowUp className="h-3 w-3" />{idea.upvotesCount}
										</span>
										<span>⚡{idea.signalsCount}</span>
									</div>
								</div>
							))}
						</div>
					)}

					{stats && (
						<Link href="/admin/ideas"
							className="text-primary hover:text-primary/80 mt-4 block text-center text-xs font-medium transition-colors">
							View all ideas →
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
