"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signalsApi } from "@/lib/api/signals";
import { SignalType, IdeaSignals } from "@/types";
import {
	HiCheckBadge,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
} from "react-icons/hi2";

interface ValidationSignalsProps {
	ideaId: string;
}

const SIGNAL_CONFIG: Record<
	SignalType,
	{
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		description: string;
		activeColor: string;
		activeBg: string;
		activeBorder: string;
	}
> = {
	PROBLEM_REAL: {
		label: "Problem feels real",
		icon: HiCheckBadge,
		description: "This addresses a genuine problem",
		activeColor: "text-blue-400",
		activeBg: "bg-blue-500/10",
		activeBorder: "border-blue-500/50",
	},
	WOULD_PAY: {
		label: "Would pay for this",
		icon: HiCurrencyDollar,
		description: "I'd pay for a solution",
		activeColor: "text-green-400",
		activeBg: "bg-green-500/10",
		activeBorder: "border-green-500/50",
	},
	READY_TO_BUILD: {
		label: "Ready to build",
		icon: HiRocketLaunch,
		description: "Clear enough to start building",
		activeColor: "text-purple-400",
		activeBg: "bg-purple-500/10",
		activeBorder: "border-purple-500/50",
	},
	NEEDS_CLARITY: {
		label: "Needs more clarity",
		icon: HiExclamationTriangle,
		description: "Needs more detail or refinement",
		activeColor: "text-orange-400",
		activeBg: "bg-orange-500/10",
		activeBorder: "border-orange-500/50",
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
		<div className="rounded-lg border border-border/50 bg-card p-5">
			<h3 className="text-foreground mb-4 text-sm font-semibold uppercase tracking-wide">
				Validation Signals
			</h3>
			<div className="grid grid-cols-2 gap-3">
				{signalTypes.map((type) => {
					const config = SIGNAL_CONFIG[type];
					const count = signals.counts[type] || 0;
					const isActive = signals.userSignals.includes(type);
					const isLoadingThis = loadingSignal === type;
					const IconComponent = config.icon;

					return (
						<button
							key={type}
							onClick={() => handleToggleSignal(type)}
							disabled={isLoadingThis}
							className={`group flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
								isActive
									? `${config.activeBorder} ${config.activeBg}`
									: "border-border/50 bg-background/50 hover:border-border hover:bg-background hover:shadow-sm"
							} ${isLoadingThis ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
							title={config.description}
						>
							<span className="flex items-center gap-2.5 text-sm">
								<IconComponent
									className={`h-5 w-5 ${isActive ? config.activeColor : "text-muted-foreground"}`}
								/>
								<span
									className={`hidden font-medium sm:inline ${isActive ? "text-foreground" : "text-muted-foreground"}`}
								>
									{config.label}
								</span>
								<span
									className={`font-medium sm:hidden ${isActive ? "text-foreground" : "text-muted-foreground"}`}
								>
									{config.label.split(" ")[0]}
								</span>
							</span>
							<span
								className={`min-w-6 text-right text-sm font-semibold tabular-nums ${
									isActive ? config.activeColor : "text-muted-foreground"
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
