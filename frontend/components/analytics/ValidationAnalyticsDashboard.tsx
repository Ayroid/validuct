"use client";

import { ValidationAnalytics } from "@/types";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import SignalDistributionChart from "./SignalDistributionChart";
import ValidationStateChart from "./ValidationStateChart";
import SignalTrendChart from "./SignalTrendChart";
import TopIdeasTable from "./TopIdeasTable";

interface ValidationAnalyticsDashboardProps {
	analytics: ValidationAnalytics;
}

export default function ValidationAnalyticsDashboard({
	analytics,
}: ValidationAnalyticsDashboardProps) {
	return (
		<div className="space-y-8">
			{/* Summary Cards */}
			<AnalyticsSummaryCards
				totalIdeas={analytics.totals.totalIdeas}
				totalSignals={analytics.totals.totalSignals}
				avgSignalsPerIdea={analytics.totals.avgSignalsPerIdea}
			/>

			{/* Charts Row 1 */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<SignalDistributionChart data={analytics.signalDistribution} />
				<ValidationStateChart data={analytics.validationStateBreakdown} />
			</div>

			{/* Signal Trends */}
			<SignalTrendChart data={analytics.dailyTrends} />

			{/* Top Ideas */}
			<TopIdeasTable data={analytics.topIdeas} />
		</div>
	);
}
