"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signalsApi } from "@/lib/api/signals";
import { SignalType, IdeaSignals } from "@/types";

interface ValidationSignalsProps {
	ideaId: string;
}

const SIGNAL_CONFIG: Record<
	SignalType,
	{ label: string; emoji: string; description: string }
> = {
	PROBLEM_REAL: {
		label: "Problem feels real",
		emoji: "👍",
		description: "This addresses a genuine problem",
	},
	WOULD_PAY: {
		label: "Would pay for this",
		emoji: "💰",
		description: "I'd pay for a solution",
	},
	READY_TO_BUILD: {
		label: "Ready to build",
		emoji: "🚀",
		description: "Clear enough to start building",
	},
	NEEDS_CLARITY: {
		label: "Needs more clarity",
		emoji: "⚠️",
		description: "Needs more detail or refinement",
	},
};

export default function ValidationSignals({ ideaId }: ValidationSignalsProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [signals, setSignals] = useState<IdeaSignals | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingSignal, setLoadingSignal] = useState<SignalType | null>(null);

	useEffect(() => {
		const fetchSignals = async () => {
			try {
				const data = await signalsApi.getIdeaSignals(ideaId);
				setSignals(data);
			} catch {
				// Silently fail, signals are optional
			} finally {
				setIsLoading(false);
			}
		};

		fetchSignals();
	}, [ideaId]);

	const handleToggleSignal = async (signalType: SignalType) => {
		if (!session) {
			router.push("/signin");
			return;
		}

		setLoadingSignal(signalType);
		try {
			const result = await signalsApi.toggleSignal(ideaId, signalType);

			setSignals((prev) => {
				if (!prev) return prev;

				const newCounts = { ...prev.counts };
				let newUserSignals = [...prev.userSignals];

				if (result.hasSignal) {
					newCounts[signalType] = (newCounts[signalType] || 0) + 1;
					newUserSignals.push(signalType);
				} else {
					newCounts[signalType] = Math.max(0, (newCounts[signalType] || 0) - 1);
					newUserSignals = newUserSignals.filter((s) => s !== signalType);
				}

				return {
					counts: newCounts,
					userSignals: newUserSignals,
					total: Object.values(newCounts).reduce((a, b) => a + b, 0),
				};
			});
		} catch {
			// Silently fail
		} finally {
			setLoadingSignal(null);
		}
	};

	if (isLoading) {
		return (
			<div className="border-border/50 bg-card/30 rounded-lg border p-4">
				<div className="bg-muted/50 mb-3 h-4 w-32 animate-pulse rounded" />
				<div className="grid grid-cols-2 gap-2">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-muted/30 h-10 animate-pulse rounded-md"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!signals) return null;

	const signalTypes: SignalType[] = [
		"PROBLEM_REAL",
		"WOULD_PAY",
		"READY_TO_BUILD",
		"NEEDS_CLARITY",
	];

	return (
		<div className="border-border/50 bg-card/30 rounded-lg border p-4">
			<h3 className="text-muted-foreground mb-3 text-sm font-medium">
				Validation signals
			</h3>
			<div className="grid grid-cols-2 gap-2">
				{signalTypes.map((type) => {
					const config = SIGNAL_CONFIG[type];
					const count = signals.counts[type] || 0;
					const isActive = signals.userSignals.includes(type);
					const isLoadingThis = loadingSignal === type;

					return (
						<button
							key={type}
							onClick={() => handleToggleSignal(type)}
							disabled={isLoadingThis}
							className={`flex items-center justify-between rounded-md border px-3 py-2 text-left transition-all duration-150 ${
								isActive
									? "border-primary/50 bg-primary/10 text-foreground"
									: "border-border/50 bg-background/50 text-muted-foreground hover:border-border hover:bg-background"
							} ${isLoadingThis ? "cursor-not-allowed opacity-50" : ""}`}
							title={config.description}
						>
							<span className="flex items-center gap-2 text-sm">
								<span>{config.emoji}</span>
								<span className="hidden sm:inline">{config.label}</span>
								<span className="sm:hidden">{config.label.split(" ")[0]}</span>
							</span>
							<span
								className={`min-w-6 text-right text-sm font-medium tabular-nums ${
									isActive ? "text-primary" : "text-muted-foreground"
								}`}
							>
								{count}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
