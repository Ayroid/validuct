"use client";

import { ValidationSummaryCardProps, SignalStrength } from "@/types";
import {
	HiCheckBadge,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
} from "react-icons/hi2";

const STRENGTH_CONFIG: Record<
	SignalStrength,
	{ label: string; bgColor: string; textColor: string }
> = {
	STRONG: {
		label: "Strong",
		bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
		textColor: "text-emerald-700 dark:text-emerald-400",
	},
	MIXED: {
		label: "Mixed",
		bgColor: "bg-amber-100 dark:bg-amber-500/20",
		textColor: "text-amber-700 dark:text-amber-400",
	},
	WEAK: {
		label: "Weak",
		bgColor: "bg-orange-100 dark:bg-orange-500/20",
		textColor: "text-orange-700 dark:text-orange-400",
	},
	NONE: {
		label: "None",
		bgColor: "bg-muted",
		textColor: "text-muted-foreground",
	},
	EARLY: {
		label: "Early",
		bgColor: "bg-muted",
		textColor: "text-muted-foreground",
	},
};

const SIGNAL_LABELS = {
	problem: {
		icon: HiCheckBadge,
		label: "Problem Validation",
		iconColor: "text-signal-problem",
		iconBg: "bg-signal-problem",
	},
	willingness: {
		icon: HiCurrencyDollar,
		label: "Willingness to Pay",
		iconColor: "text-signal-pay",
		iconBg: "bg-signal-pay",
	},
	execution: {
		icon: HiRocketLaunch,
		label: "Ready to Build",
		iconColor: "text-signal-build",
		iconBg: "bg-signal-build",
	},
};

export default function ValidationSummaryCard({
	summary,
}: ValidationSummaryCardProps) {
	const signalCategories = [
		{ key: "problem", data: summary.problem, config: SIGNAL_LABELS.problem },
		{
			key: "willingness",
			data: summary.willingness,
			config: SIGNAL_LABELS.willingness,
		},
		{
			key: "execution",
			data: summary.execution,
			config: SIGNAL_LABELS.execution,
		},
	];

	return (
		<div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
			<h3 className="text-foreground mb-5 text-lg font-semibold">
				Validation Signals
			</h3>

			{/* Signal Strength Grid */}
			<div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
				{signalCategories.map(({ key, data, config }) => {
					const strengthConfig = STRENGTH_CONFIG[data.strength];
					const IconComponent = config.icon;
					return (
						<div
							key={key}
							className="bg-muted/30 rounded-xl border border-border/30 p-4 text-center"
						>
							<div
								className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}
							>
								<IconComponent className={`h-6 w-6 ${config.iconColor}`} />
							</div>
							<div className="text-foreground mb-2 text-sm font-medium">
								{config.label}
							</div>
							<div
								className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${strengthConfig.bgColor} ${strengthConfig.textColor}`}
							>
								{strengthConfig.label}
							</div>
							<div className="text-muted-foreground mt-2 text-xs">
								<span className="font-mono">{data.ideasWithSignal}/{summary.totalIdeas}</span> ideas
							</div>
						</div>
					);
				})}
			</div>

			{/* Clarity Warning */}
			{summary.clarity.ideasWithSignal > 0 && (
				<div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
					<div className="flex items-center gap-2">
						<HiExclamationTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						<span className="text-sm text-amber-700 dark:text-amber-300">
							{summary.clarity.ideasWithSignal} idea
							{summary.clarity.ideasWithSignal > 1 ? "s" : ""} need more clarity
						</span>
					</div>
				</div>
			)}

			{/* Ideas by State */}
			<div className="flex flex-wrap gap-4 border-t border-border/50 pt-4 text-sm sm:gap-6">
				<div className="flex items-center gap-2">
					<div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
					<span className="text-foreground font-mono font-medium">
						{summary.ideasByValidationState.readyToBuild}
					</span>
					<span className="text-muted-foreground">ready to build</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
					<span className="text-foreground font-mono font-medium">
						{summary.ideasByValidationState.needsAction}
					</span>
					<span className="text-muted-foreground">need action</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-2.5 w-2.5 rounded-full bg-sky-500"></div>
					<span className="text-foreground font-mono font-medium">
						{summary.ideasByValidationState.validated}
					</span>
					<span className="text-muted-foreground">validated</span>
				</div>
			</div>
		</div>
	);
}
