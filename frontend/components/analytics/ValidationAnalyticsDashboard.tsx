"use client";

import { useState, useMemo } from "react";
import { ValidationAnalytics } from "@/types";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import SignalDistributionChart from "./SignalDistributionChart";
import ValidationStateChart from "./ValidationStateChart";
import SignalTrendChart from "./SignalTrendChart";
import TopIdeasTable from "./TopIdeasTable";
import IdeaFilterSelect from "./IdeaFilterSelect";

interface ValidationAnalyticsDashboardProps {
	analytics: ValidationAnalytics;
}

export default function ValidationAnalyticsDashboard({
	analytics,
}: ValidationAnalyticsDashboardProps) {
	const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		if (!selectedIdeaId) {
			return {
				signalDistribution: analytics.signalDistribution,
				dailyTrends: analytics.dailyTrends,
				totalSignals: analytics.totals.totalSignals,
				totalIdeas: analytics.totals.totalIdeas,
				avgSignalsPerIdea: analytics.totals.avgSignalsPerIdea,
			};
		}

		const idea = analytics.perIdeaAnalytics.find(
			(i) => i.id === selectedIdeaId
		);
		if (!idea) {
			return {
				signalDistribution: analytics.signalDistribution,
				dailyTrends: analytics.dailyTrends,
				totalSignals: analytics.totals.totalSignals,
				totalIdeas: analytics.totals.totalIdeas,
				avgSignalsPerIdea: analytics.totals.avgSignalsPerIdea,
			};
		}

		return {
			signalDistribution: idea.signalDistribution,
			dailyTrends: idea.dailyTrends,
			totalSignals: idea.totals.totalSignals,
			totalIdeas: 1,
			avgSignalsPerIdea: idea.totals.totalSignals,
		};
	}, [selectedIdeaId, analytics]);

	const isFiltered = selectedIdeaId !== null;

	return (
		<div className="space-y-8">
			{/* Filter */}
			{analytics.perIdeaAnalytics.length > 0 && (
				<div className="flex items-center justify-between">
					<IdeaFilterSelect
						ideas={analytics.perIdeaAnalytics}
						selectedIdeaId={selectedIdeaId}
						onSelect={setSelectedIdeaId}
					/>
				</div>
			)}

			{/* Summary Cards */}
			<AnalyticsSummaryCards
				totalIdeas={filtered.totalIdeas}
				totalSignals={filtered.totalSignals}
				avgSignalsPerIdea={filtered.avgSignalsPerIdea}
			/>

			{/* Charts Row 1 */}
			{isFiltered ? (
				<SignalDistributionChart data={filtered.signalDistribution} />
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<SignalDistributionChart data={filtered.signalDistribution} />
					<ValidationStateChart
						data={analytics.validationStateBreakdown}
					/>
				</div>
			)}

			{/* Signal Trends */}
			<SignalTrendChart data={filtered.dailyTrends} />

			{/* Top Ideas (hidden when filtering by a single idea) */}
			{!isFiltered && <TopIdeasTable data={analytics.topIdeas} />}
		</div>
	);
}
