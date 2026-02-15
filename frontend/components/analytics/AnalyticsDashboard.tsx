"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsDashboardData, ActivityRange } from "@/types";
import { userApi } from "@/lib/api/users";
import { Skeleton } from "@/components/ui/skeleton";
import MetricCards from "./MetricCards";
import ActivityChart from "./ActivityChart";
import BreakdownCharts from "./BreakdownCharts";
import IdeasTable from "./IdeasTable";

interface AnalyticsDashboardProps {
	username: string;
}

export default function AnalyticsDashboard({
	username,
}: AnalyticsDashboardProps) {
	const [dashboardData, setDashboardData] =
		useState<AnalyticsDashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [range, setRange] = useState<ActivityRange>("30d");

	const fetchDashboard = useCallback(
		async (r: ActivityRange) => {
			try {
				setLoading(true);
				const data = await userApi.getAnalyticsDashboard(username, r);
				setDashboardData(data);
			} catch (err) {
				console.error("Failed to load analytics dashboard:", err);
			} finally {
				setLoading(false);
			}
		},
		[username]
	);

	// Fetch on mount
	useEffect(() => {
		fetchDashboard(range);
	}, [username]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleRangeChange = useCallback(
		(newRange: ActivityRange) => {
			setRange(newRange);
			fetchDashboard(newRange);
		},
		[fetchDashboard]
	);

	// Loading skeleton
	if (loading && !dashboardData) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="bg-card border-border/50 rounded-xl border p-5"
						>
							<Skeleton className="mb-3 h-9 w-9 rounded-full" />
							<Skeleton className="mb-2 h-3 w-16" />
							<Skeleton className="h-7 w-12" />
						</div>
					))}
				</div>
				<div className="bg-card border-border/50 rounded-xl border p-6">
					<Skeleton className="mb-5 h-4 w-40" />
					<Skeleton className="h-70 w-full rounded-lg" />
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="bg-card border-border/50 rounded-xl border p-6"
						>
							<Skeleton className="mb-4 h-4 w-36" />
							<Skeleton className="h-50 w-full rounded-lg" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!dashboardData) {
		return (
			<div className="bg-card border-border/50 rounded-xl border p-10 text-center">
				<p className="text-muted-foreground text-sm">
					Unable to load analytics. Please try again later.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Metric Cards */}
			<MetricCards
				totalIdeas={dashboardData.totalIdeas}
				totalSignals={dashboardData.totalSignals}
				totalUpvotes={dashboardData.totalUpvotes}
				totalComments={dashboardData.totalComments}
				totalWaitlistSignups={dashboardData.totalWaitlistSignups}
			/>

			{/* Breakdown Charts (3 cards) */}
			<BreakdownCharts
				signalDistribution={dashboardData.signalDistribution}
				ideasByStatus={dashboardData.ideasByStatus}
				ideasByValidationState={dashboardData.ideasByValidationState}
			/>

			{/* Activity Chart with Range Selector */}
			<ActivityChart
				dailyActivity={dashboardData.dailyActivity}
				range={range}
				onRangeChange={handleRangeChange}
			/>

			{/* Ideas Table */}
			<IdeasTable
				ideas={dashboardData.topIdeas}
			/>
		</div>
	);
}
