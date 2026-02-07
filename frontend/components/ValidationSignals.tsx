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
	bare?: boolean;
}

const SIGNAL_CONFIG: Record<
	SignalType,
	{
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		description: string;
		activeText: string;
		activeBg: string;
		activeBorder: string;
	}
> = {
	PROBLEM_REAL: {
		label: "Problem feels real",
		icon: HiCheckBadge,
		description: "This addresses a genuine problem",
		activeText: "text-signal-problem",
		activeBg: "bg-signal-problem",
		activeBorder: "border-signal-problem",
	},
	WOULD_PAY: {
		label: "Would pay for this",
		icon: HiCurrencyDollar,
		description: "I'd pay for a solution",
		activeText: "text-signal-pay",
		activeBg: "bg-signal-pay",
		activeBorder: "border-signal-pay",
	},
	READY_TO_BUILD: {
		label: "Ready to build",
		icon: HiRocketLaunch,
		description: "Clear enough to start building",
		activeText: "text-signal-build",
		activeBg: "bg-signal-build",
		activeBorder: "border-signal-build",
	},
	NEEDS_CLARITY: {
		label: "Needs more clarity",
		icon: HiExclamationTriangle,
		description: "Needs more detail or refinement",
		activeText: "text-signal-clarity",
		activeBg: "bg-signal-clarity",
		activeBorder: "border-signal-clarity",
	},
};

export default function ValidationSignals({ ideaId, bare }: ValidationSignalsProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [signals, setSignals] = useState<IdeaSignals | null>(null);
	const [isLoading, setIsLoading] = useState(true);
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

		if (!signals) return;

		// Save previous state for rollback
		const prevSignals = { ...signals };

		// Optimistically update UI
		const isCurrentlyActive = signals.userSignals.includes(signalType);
		const newCounts = { ...signals.counts };
		let newUserSignals = [...signals.userSignals];

		if (isCurrentlyActive) {
			newCounts[signalType] = Math.max(0, (newCounts[signalType] || 0) - 1);
			newUserSignals = newUserSignals.filter((s) => s !== signalType);
		} else {
			newCounts[signalType] = (newCounts[signalType] || 0) + 1;
			newUserSignals.push(signalType);
		}

		setSignals({
			counts: newCounts,
			userSignals: newUserSignals,
			total: Object.values(newCounts).reduce((a, b) => a + b, 0),
		});

		try {
			await signalsApi.toggleSignal(ideaId, signalType);
		} catch {
			// Revert on error
			setSignals(prevSignals);
		}
	};

	const Wrapper = bare ? "div" : ({ children }: { children: React.ReactNode }) => (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-5">{children}</div>
	);

	if (isLoading) {
		return (
			<Wrapper>
				<div className="bg-muted mb-4 h-4 w-32 animate-pulse rounded-md" />
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-muted/50 h-24 animate-pulse rounded-lg"
						/>
					))}
				</div>
			</Wrapper>
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
		<Wrapper>
			<h3 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
				Validation Signals
			</h3>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{signalTypes.map((type) => {
					const config = SIGNAL_CONFIG[type];
					const count = signals.counts[type] || 0;
					const isActive = signals.userSignals.includes(type);
					const IconComponent = config.icon;

					return (
						<button
							key={type}
							onClick={() => handleToggleSignal(type)}
							className={`group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border px-3 py-4 transition-all duration-200 ${
								isActive
									? `${config.activeBorder} ${config.activeBg}`
									: "border-border/50 bg-background hover:border-border hover:bg-muted/50"
							}`}
							title={config.description}
						>
							<IconComponent
								className={`h-6 w-6 ${isActive ? config.activeText : "text-muted-foreground"}`}
							/>
							<span
								className={`text-center text-xs font-medium leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}
							>
								{config.label}
							</span>
							<span
								className={`font-mono text-lg font-semibold ${
									isActive ? config.activeText : "text-muted-foreground"
								}`}
							>
								{count}
							</span>
						</button>
					);
				})}
			</div>
		</Wrapper>
	);
}
