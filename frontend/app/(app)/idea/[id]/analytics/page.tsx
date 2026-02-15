"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/lib/api/users";
import {
	Idea,
	IdeaAnalyticsData,
	IdeaStatus,
	ActivityRange,
	ScorecardComment,
	ScorecardNextStepType,
	CommentCategory,
} from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowLeft,
	ArrowUpRight,
	Signal,
	ThumbsUp,
	MessageSquare,
	Users,
	Compass,
	Zap,
	Rocket,
	Search,
	DollarSign,
	ClipboardList,
	MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import IdeaDetailCard from "@/components/IdeaDetailCard";
import ValidationProcessFlow from "@/components/analytics/ValidationProcessFlow";
import ActivityChart from "@/components/analytics/ActivityChart";
import { useNavBack } from "@/hooks/useNavBack";
import {
	PieChart,
	Pie,
	Cell,
	Legend,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const SIGNAL_COLORS = [
	{ key: "problemReal" as const, label: "Problem Real", cssVar: "var(--signal-problem)" },
	{ key: "wouldPay" as const, label: "Would Pay", cssVar: "var(--signal-pay)" },
	{ key: "readyToBuild" as const, label: "Ready to Build", cssVar: "var(--signal-build)" },
	{ key: "needsClarity" as const, label: "Needs Clarity", cssVar: "var(--signal-clarity)" },
];

function SignalPieTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: { name: string; value: number; percentage: number } }>;
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

const CATEGORY_LABELS: Record<CommentCategory, string> = {
	PROBLEM_CLARITY: "Problem Clarity",
	TARGET_USERS: "Target Users",
	WILLINGNESS_TO_PAY: "Willingness to Pay",
	TECHNICAL_FEASIBILITY: "Technical Feasibility",
	FEATURE_SUGGESTION: "Feature Suggestion",
	GENERAL: "General",
};

const ALL_CATEGORIES: CommentCategory[] = [
	"PROBLEM_CLARITY",
	"TARGET_USERS",
	"WILLINGNESS_TO_PAY",
	"TECHNICAL_FEASIBILITY",
	"FEATURE_SUGGESTION",
	"GENERAL",
];

const STEP_CONFIG: Record<
	ScorecardNextStepType,
	{ icon: typeof Compass; color: string; bg: string }
> = {
	CLARIFY: { icon: Search, color: "text-amber-500", bg: "bg-amber-500/10" },
	TEST_PRICING: { icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
	GATHER_SIGNALS: { icon: Compass, color: "text-blue-500", bg: "bg-blue-500/10" },
	BUILD_WAITLIST: { icon: ClipboardList, color: "text-violet-500", bg: "bg-violet-500/10" },
	ADDRESS_FEEDBACK: { icon: MessageCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
	READY: { icon: Rocket, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

const PRIORITY_STYLES: Record<string, { label: string; dot: string }> = {
	HIGH: { label: "Do this first", dot: "bg-amber-500" },
	MEDIUM: { label: "Up next", dot: "bg-blue-500" },
	LOW: { label: "On track", dot: "bg-emerald-500" },
};

export default function IdeaAnalyticsPage() {
	const params = useParams();
	const { user } = useAuth();
	const ideaId = params.id as string;
	const back = useNavBack();
	const username = user?.username;

	const [data, setData] = useState<IdeaAnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [range, setRange] = useState<ActivityRange>("30d");
	const [categoryFilter, setCategoryFilter] = useState<
		CommentCategory | "ALL"
	>("ALL");
	const [ideaStatus, setIdeaStatus] = useState<keyof IdeaStatus | null>(null);
	const handleIdeaLoad = useCallback(
		(idea: Idea) => {
			setIdeaStatus(idea.status);
		},
		[]
	);

	const fetchData = useCallback(
		async (r: ActivityRange) => {
			if (!username) return;
			try {
				setLoading(true);
				const result = await userApi.getIdeaAnalytics(
					username,
					ideaId,
					r
				);
				setData(result);
			} catch (err) {
				console.error("Failed to load idea analytics:", err);
			} finally {
				setLoading(false);
			}
		},
		[username, ideaId]
	);

	useEffect(() => {
		if (username) {
			fetchData(range);
		}
	}, [username, ideaId]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleRangeChange = useCallback(
		(newRange: ActivityRange) => {
			setRange(newRange);
			fetchData(newRange);
		},
		[fetchData]
	);

	const filteredComments = useMemo(() => {
		if (!data) return [];
		if (categoryFilter === "ALL") return data.comments;
		return data.comments.filter((c) => c.category === categoryFilter);
	}, [data, categoryFilter]);

	// Category counts for filter badges
	const categoryCounts = useMemo(() => {
		if (!data) return {};
		const counts: Record<string, number> = {};
		for (const c of data.comments) {
			counts[c.category] = (counts[c.category] || 0) + 1;
		}
		return counts;
	}, [data]);

	if (loading && !data) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
				<Skeleton className="mb-6 h-4 w-32" />
				<Skeleton className="mb-8 h-8 w-64" />
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-24 rounded-xl" />
					))}
				</div>
				<Skeleton className="mt-6 h-[300px] w-full rounded-xl" />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
				<button
					onClick={() => back(`/idea/${ideaId}`)}
					className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors cursor-pointer"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Back
				</button>
				<div className="bg-card border-border/50 rounded-xl border p-10 text-center">
					<p className="text-muted-foreground text-sm">
						Idea not found or you don&apos;t have access.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => back(`/idea/${ideaId}`)}
						className="text-foreground hover:bg-muted/60 cursor-pointer rounded-full p-1 transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-foreground text-lg font-bold">
						Idea Analytics
					</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
			{/* Hero Card — same component as idea detail page */}
			<IdeaDetailCard ideaId={ideaId} className="mb-6" onIdeaLoad={handleIdeaLoad} />

			{/* Validation Process Flow */}
			{ideaStatus && (
				<ValidationProcessFlow
					currentStatus={ideaStatus}
					onStatusChange={() => {}}
				/>
			)}

			{/* Metric Cards */}
			<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div className="bg-card border-border/50 rounded-xl border p-5">
					<div className="mb-2 flex items-center gap-1.5">
						<Signal className="h-4 w-4 text-emerald-500" />
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Signals
						</span>
					</div>
					<p className="text-2xl font-bold tracking-tight tabular-nums">
						{data.totalSignals}
					</p>
				</div>
				<div className="bg-card border-border/50 rounded-xl border p-5">
					<div className="mb-2 flex items-center gap-1.5">
						<ThumbsUp className="h-4 w-4 text-blue-500" />
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Upvotes
						</span>
					</div>
					<p className="text-2xl font-bold tracking-tight tabular-nums">
						{data.upvotesCount}
					</p>
				</div>
				<div className="bg-card border-border/50 rounded-xl border p-5">
					<div className="mb-2 flex items-center gap-1.5">
						<MessageSquare className="h-4 w-4 text-violet-500" />
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Feedback
						</span>
					</div>
					<p className="text-2xl font-bold tracking-tight tabular-nums">
						{data.commentsCount}
					</p>
				</div>
				<Link
					href={`/idea/${ideaId}/waitlist`}
					className="group bg-card border-border/50 rounded-xl border p-5 transition-colors hover:bg-muted/40"
				>
					<div className="mb-2 flex items-center gap-1.5">
						<Users className="h-4 w-4 text-rose-500" />
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Waitlist
						</span>
						<ArrowUpRight className="text-muted-foreground ml-auto h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
					</div>
					<p className="text-2xl font-bold tracking-tight tabular-nums">
						{data.waitlistCount}
					</p>
				</Link>
			</div>

			{/* Next Recommended Action */}
			{data.nextSteps.length > 0 && (
				<div className="mt-8">
					<div className="mb-3 flex items-center gap-2">
						<Zap className="h-4 w-4 text-amber-500" />
						<span className="text-foreground text-sm font-semibold">
							Next Recommended Action
						</span>
					</div>
					<div className="space-y-3">
						{data.nextSteps.map((step, i) => {
							const config = STEP_CONFIG[step.type];
							const priority = PRIORITY_STYLES[step.priority];
							const Icon = config.icon;
							return (
								<div
									key={i}
									className={`bg-card border-border/50 flex items-start gap-4 rounded-xl border p-5 ${
										i === 0 ? "ring-1 ring-amber-500/20" : ""
									}`}
								>
									<div
										className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}
									>
										<Icon className={`h-5 w-5 ${config.color}`} />
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center gap-2">
											<span
												className={`h-1.5 w-1.5 rounded-full ${priority.dot}`}
											/>
											<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
												{priority.label}
											</span>
										</div>
										<p className="text-foreground text-sm font-medium leading-relaxed">
											{step.message}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Signal Distribution */}
			<div className="mt-10">
				{(() => {
					const totalSignals = data.signals.problemReal + data.signals.wouldPay + data.signals.readyToBuild + data.signals.needsClarity;
					const pieData = SIGNAL_COLORS.map((s) => {
						const value = data.signals[s.key];
						return {
							name: s.label,
							value,
							fill: s.cssVar,
							percentage: totalSignals > 0 ? (value / totalSignals) * 100 : 0,
						};
					});

					return (
						<div className="bg-card border-border/50 rounded-xl border p-6">
							<h3 className="text-foreground mb-5 text-base font-semibold">
								Signal Distribution
							</h3>
							<div className="relative h-64">
								{/* Center total count — rendered first so chart tooltip sits on top */}
								<div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 36 }}>
									<div className="text-center">
										<p className="text-2xl font-bold tracking-tight">
											{totalSignals}
										</p>
										<p className="text-muted-foreground text-xs">
											Total
										</p>
									</div>
								</div>
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
										<Tooltip content={<SignalPieTooltip />} />
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
							</div>
						</div>
					);
				})()}
			</div>

			{/* Activity Chart */}
			<div className="mt-6">
				<ActivityChart
					dailyActivity={data.dailyActivity}
					range={range}
					onRangeChange={handleRangeChange}
				/>
			</div>

			{/* Feedback Section */}
			<div className="mt-10">
				<div className="mb-4 flex items-center justify-between">
					<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
						Feedback ({data.comments.length})
					</span>
				</div>

				{/* Category filter tabs */}
				<div className="mb-5 flex flex-wrap gap-2">
					<button
						onClick={() => setCategoryFilter("ALL")}
						className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
							categoryFilter === "ALL"
								? "bg-foreground text-background"
								: "bg-muted/60 text-muted-foreground hover:bg-muted"
						}`}
					>
						All ({data.comments.length})
					</button>
					{ALL_CATEGORIES.map((cat) => {
						const count = categoryCounts[cat] || 0;
						if (count === 0) return null;
						return (
							<button
								key={cat}
								onClick={() => setCategoryFilter(cat)}
								className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
									categoryFilter === cat
										? "bg-foreground text-background"
										: "bg-muted/60 text-muted-foreground hover:bg-muted"
								}`}
							>
								{CATEGORY_LABELS[cat]} ({count})
							</button>
						);
					})}
				</div>

				{/* Comments list */}
				{filteredComments.length === 0 ? (
					<div className="bg-card border-border/50 rounded-xl border p-8 text-center">
						<p className="text-muted-foreground text-sm">
							{data.comments.length === 0
								? "No feedback yet."
								: "No feedback in this category."}
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredComments.map((comment: ScorecardComment) => (
							<div
								key={comment.id}
								className="bg-card border-border/50 rounded-xl border p-5"
							>
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center gap-2">
										{comment.user.profilePicture ? (
											<Image
												src={
													comment.user
														.profilePicture
												}
												alt=""
												width={24}
												height={24}
												className="h-6 w-6 rounded-full"
											/>
										) : (
											<div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
												{comment.user.username
													.charAt(0)
													.toUpperCase()}
											</div>
										)}
										<span className="text-sm font-medium">
											{comment.user.username}
										</span>
										<span className="text-muted-foreground text-xs">
											{new Date(
												comment.createdAt
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</span>
									</div>
									<span className="bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5 text-xs">
										{
											CATEGORY_LABELS[
												comment.category
											]
										}
									</span>
								</div>
								<p className="text-sm leading-relaxed">
									{comment.content}
								</p>
								{comment.helpfulCount > 0 && (
									<p className="text-muted-foreground mt-2 text-xs">
										{comment.helpfulCount} found this
										helpful
									</p>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
		</div>
	);
}
