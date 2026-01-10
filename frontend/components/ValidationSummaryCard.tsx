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
	{ label: string; color: string; bgColor: string; borderColor: string }
> = {
	STRONG: {
		label: "Strong",
		color: "text-green-400",
		bgColor: "bg-green-500/20",
		borderColor: "border-green-500/30",
	},
	MIXED: {
		label: "Mixed",
		color: "text-yellow-400",
		bgColor: "bg-yellow-500/20",
		borderColor: "border-yellow-500/30",
	},
	WEAK: {
		label: "Weak",
		color: "text-orange-400",
		bgColor: "bg-orange-500/20",
		borderColor: "border-orange-500/30",
	},
	NONE: {
		label: "None",
		color: "text-muted-foreground",
		bgColor: "bg-muted",
		borderColor: "border-border",
	},
	EARLY: {
		label: "Early",
		color: "text-muted-foreground",
		bgColor: "bg-muted",
		borderColor: "border-border",
	},
};

const SIGNAL_LABELS = {
	problem: {
		icon: HiCheckBadge,
		label: "Problem Validation",
		iconColor: "text-blue-400",
		iconBg: "bg-blue-500/10",
	},
	willingness: {
		icon: HiCurrencyDollar,
		label: "Willingness to Pay",
		iconColor: "text-green-400",
		iconBg: "bg-green-500/10",
	},
	execution: {
		icon: HiRocketLaunch,
		label: "Ready to Build",
		iconColor: "text-purple-400",
		iconBg: "bg-purple-500/10",
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
		<div className="rounded-lg border border-border/50 bg-card p-6">
			<h3 className="text-foreground mb-5 text-lg font-semibold">
				Validation Signals
			</h3>

			{/* Signal Strength Grid */}
			<div className="mb-5 grid grid-cols-3 gap-4">
				{signalCategories.map(({ key, data, config }) => {
					const strengthConfig = STRENGTH_CONFIG[data.strength];
					const IconComponent = config.icon;
					return (
						<div
							key={key}
							className="rounded-lg border border-border/30 bg-background/50 p-4 text-center"
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
								className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${strengthConfig.bgColor} ${strengthConfig.color} ${strengthConfig.borderColor}`}
							>
								{strengthConfig.label}
							</div>
							<div className="text-muted-foreground mt-2 text-xs">
								{data.ideasWithSignal}/{summary.totalIdeas} ideas
							</div>
						</div>
					);
				})}
			</div>

			{/* Clarity Warning (if applicable) */}
			{summary.clarity.ideasWithSignal > 0 && (
				<div className="mb-5 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
					<div className="flex items-center gap-2">
						<HiExclamationTriangle className="h-5 w-5 text-orange-400" />
						<span className="text-sm text-orange-300">
							{summary.clarity.ideasWithSignal} idea
							{summary.clarity.ideasWithSignal > 1 ? "s" : ""} need more clarity
						</span>
					</div>
				</div>
			)}

			{/* Ideas by State */}
			<div className="flex gap-6 border-t border-border/50 pt-4 text-sm">
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-green-500"></div>
					<span className="text-foreground font-medium">
						{summary.ideasByValidationState.readyToBuild}
					</span>
					<span className="text-muted-foreground">ready to build</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-orange-500"></div>
					<span className="text-foreground font-medium">
						{summary.ideasByValidationState.needsAction}
					</span>
					<span className="text-muted-foreground">need action</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-blue-500"></div>
					<span className="text-foreground font-medium">
						{summary.ideasByValidationState.validated}
					</span>
					<span className="text-muted-foreground">validated</span>
				</div>
			</div>
		</div>
	);
}
