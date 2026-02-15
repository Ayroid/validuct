"use client";

import { IdeaSignalCounts, ValidationState } from "@/types";

const SIGNAL_CONFIG = [
	{
		key: "problemReal" as const,
		label: "Problem is real",
		cssVar: "var(--signal-problem)",
	},
	{
		key: "wouldPay" as const,
		label: "Would pay",
		cssVar: "var(--signal-pay)",
	},
	{
		key: "readyToBuild" as const,
		label: "Ready to build",
		cssVar: "var(--signal-build)",
	},
	{
		key: "needsClarity" as const,
		label: "Needs clarity",
		cssVar: "var(--signal-clarity)",
	},
];

const STATE_LABELS: Record<ValidationState, { label: string; description: string }> = {
	VALIDATED: {
		label: "Validated",
		description: "Strong signals across all dimensions",
	},
	READY_TO_BUILD: {
		label: "Ready to Build",
		description: "Good signals — consider moving forward",
	},
	NEEDS_ACTION: {
		label: "Needs Action",
		description: "Some gaps to address before building",
	},
	NEUTRAL: {
		label: "Early Stage",
		description: "Gathering initial validation signals",
	},
};

interface SignalGaugesProps {
	signals: IdeaSignalCounts;
	validationState: ValidationState;
}

export default function SignalGauges({
	signals,
	validationState,
}: SignalGaugesProps) {
	const maxSignal = Math.max(
		signals.problemReal,
		signals.wouldPay,
		signals.readyToBuild,
		signals.needsClarity,
		1
	);
	const stateInfo = STATE_LABELS[validationState];

	return (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
			<div className="mb-5 flex items-baseline justify-between">
				<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
					Validation Signals
				</span>
				<span className="text-xs font-medium text-foreground">
					{stateInfo.label}
				</span>
			</div>

			<div className="space-y-4">
				{SIGNAL_CONFIG.map((config) => {
					const count = signals[config.key];
					const width =
						maxSignal > 0
							? Math.max((count / maxSignal) * 100, count > 0 ? 8 : 0)
							: 0;

					return (
						<div key={config.key}>
							<div className="mb-1.5 flex items-center justify-between">
								<span className="text-xs font-medium">
									{config.label}
								</span>
								<span className="text-muted-foreground text-xs tabular-nums">
									{count}
								</span>
							</div>
							<div
								className="h-2 w-full overflow-hidden rounded-full"
								style={{ backgroundColor: `color-mix(in srgb, ${config.cssVar} 15%, transparent)` }}
							>
								<div
									className="h-full rounded-full transition-all"
									style={{ width: `${width}%`, backgroundColor: config.cssVar }}
								/>
							</div>
						</div>
					);
				})}
			</div>

			<p className="text-muted-foreground mt-4 text-xs">
				{stateInfo.description}
			</p>
		</div>
	);
}
