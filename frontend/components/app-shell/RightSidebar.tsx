"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
	X,
	Lightbulb,
	MessageSquare,
	BarChart3,
	Rocket,
	MessageSquareHeart,
	Bug,
	Sparkles,
	ArrowUpRight,
	CircleDot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { suggestionsApi } from "@/lib/api/suggestions";
import type { Suggestion, SuggestionType } from "@/types";

/* ── Helpers ────────────────────────────────────────────── */

function getDismissedKey(userId: string) {
	return `validuct_sidebar_dismissed_${userId}`;
}

function getDismissedCards(userId: string): string[] {
	try {
		const raw = localStorage.getItem(getDismissedKey(userId));
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function dismissCard(userId: string, cardId: string) {
	const dismissed = getDismissedCards(userId);
	if (!dismissed.includes(cardId)) {
		dismissed.push(cardId);
		localStorage.setItem(getDismissedKey(userId), JSON.stringify(dismissed));
	}
}

/* ── Card wrapper ───────────────────────────────────────── */

function InfoCard({
	children,
	onDismiss,
}: {
	children: React.ReactNode;
	onDismiss: () => void;
}) {
	return (
		<div className="border-border/60 bg-card relative rounded-xl border p-4">
			<button
				onClick={onDismiss}
				className="text-muted-foreground/60 hover:text-foreground absolute top-3 right-3 cursor-pointer transition-colors"
				aria-label="Dismiss"
			>
				<X className="size-3.5" />
			</button>
			{children}
		</div>
	);
}

/* ── Walkthrough card ───────────────────────────────────── */

const walkthroughSteps = [
	{
		icon: Lightbulb,
		label: "Post your first idea",
		href: "/idea/new",
		color: "text-amber-500",
		bg: "bg-amber-50 dark:bg-amber-950/30",
	},
	{
		icon: MessageSquare,
		label: "Get community feedback",
		href: "/home",
		color: "text-blue-500",
		bg: "bg-blue-50 dark:bg-blue-950/30",
	},
	{
		icon: BarChart3,
		label: "Check validation signals",
		href: "/home",
		color: "text-indigo-500",
		bg: "bg-indigo-50 dark:bg-indigo-950/30",
	},
	{
		icon: Rocket,
		label: "Track your progress",
		href: "/home",
		color: "text-emerald-500",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
	},
];

function WalkthroughCard({ onDismiss }: { onDismiss: () => void }) {
	return (
		<InfoCard onDismiss={onDismiss}>
			<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
				Getting Started
			</p>
			<p className="text-foreground mt-1.5 text-[13px] font-medium">
				Here&apos;s how to make the most of Validuct
			</p>

			<div className="mt-4 space-y-2.5">
				{walkthroughSteps.map((step) => {
					const Icon = step.icon;
					return (
						<Link
							key={step.label}
							href={step.href}
							className="group hover:bg-muted/60 -ml-1.5 flex items-center gap-2.5 rounded-lg p-1.5 transition-colors"
						>
							<div
								className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${step.bg}`}
							>
								<Icon className={`size-3.5 ${step.color}`} />
							</div>
							<span className="text-muted-foreground group-hover:text-foreground text-[13px] transition-colors">
								{step.label}
							</span>
						</Link>
					);
				})}
			</div>
		</InfoCard>
	);
}

/* ── Tip card ───────────────────────────────────────────── */

function TipCard({ onDismiss }: { onDismiss: () => void }) {
	return (
		<InfoCard onDismiss={onDismiss}>
			<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
				Pro Tip
			</p>
			<p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
				Add a clear problem statement to your idea — ideas with strong problem
				definitions get{" "}
				<span className="text-foreground font-medium">3x more feedback</span>{" "}
				from the community.
			</p>
		</InfoCard>
	);
}

/* ── Feedback CTA card (non-dismissible) ───────────────── */

function FeedbackCard() {
	return (
		<div className="border-border/60 bg-card rounded-xl border p-4">
			<div className="flex items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
					<MessageSquareHeart className="size-4 text-amber-500" />
				</div>
				<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
					Feedback
				</p>
			</div>

			<div className="mt-2 flex items-start gap-3">
				<div className="min-w-0">
					<p className="text-foreground text-[13px] font-medium">
						Help us improve Validuct
					</p>
					<p className="text-muted-foreground mt-0.5 text-[12px] leading-relaxed">
						Share bug reports, feature ideas, or suggestions.
					</p>
				</div>
			</div>
			<Link
				href="/suggestions"
				className="bg-primary/10 text-primary hover:bg-primary/20 mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors"
			>
				Share feedback
				<ArrowUpRight className="size-3.5" />
			</Link>
		</div>
	);
}

/* ── Suggestion type badge ─────────────────────────────── */

const TYPE_CONFIG: Record<
	SuggestionType,
	{ label: string; color: string; icon: typeof Bug }
> = {
	FEATURE_REQUEST: {
		label: "Feature",
		color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
		icon: Sparkles,
	},
	BUG_REPORT: {
		label: "Bug",
		color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
		icon: Bug,
	},
	IMPROVEMENT: {
		label: "Improvement",
		color:
			"text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
		icon: ArrowUpRight,
	},
	OTHER: {
		label: "Other",
		color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/40",
		icon: CircleDot,
	},
};

function SuggestionTypeBadge({ type }: { type: SuggestionType }) {
	const config = TYPE_CONFIG[type];
	const Icon = config.icon;
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.color}`}
		>
			<Icon className="size-3" />
			{config.label}
		</span>
	);
}

/* ── Approved suggestions preview (non-dismissible) ────── */

function ApprovedSuggestionsPreview() {
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		suggestionsApi
			.getApprovedSuggestions(1, 3)
			.then((res) => {
				setSuggestions(res.suggestions);
				setLoaded(true);
			})
			.catch(() => {
				setLoaded(true);
			});
	}, []);

	if (!loaded || suggestions.length === 0) return null;

	return (
		<div className="border-border/60 bg-card rounded-xl border p-4">
			<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
				Community Suggestions
			</p>
			<div className="mt-3 space-y-2.5">
				{suggestions.map((s) => (
					<div
						key={s.id}
						className="bg-muted/50 flex flex-col items-start gap-2 rounded-lg px-3 py-2"
					>
						<SuggestionTypeBadge type={s.type} />
						<p className="text-foreground line-clamp-2 min-w-0 text-[13px] leading-snug">
							{s.title}
						</p>
					</div>
				))}
			</div>
			<Link
				href="/suggestions"
				className="text-muted-foreground hover:text-foreground mt-3 block text-center text-[12px] font-medium transition-colors"
			>
				View all suggestions
			</Link>
		</div>
	);
}

/* ── Main component ─────────────────────────────────────── */

const CARD_REGISTRY = [
	{ id: "walkthrough", Component: WalkthroughCard },
	{ id: "tip-problem", Component: TipCard },
] as const;

export { SuggestionTypeBadge, TYPE_CONFIG };

export default function RightSidebar() {
	const { user } = useAuth();
	const [dismissed, setDismissed] = useState<string[]>([]);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
		if (user?.id) {
			setDismissed(getDismissedCards(user.id));
		}
	}, [user?.id]);

	function handleDismiss(cardId: string) {
		if (!user?.id) return;
		dismissCard(user.id, cardId);
		setDismissed((prev) => [...prev, cardId]);
	}

	const visibleCards = user?.id
		? CARD_REGISTRY.filter((card) => !dismissed.includes(card.id))
		: [];

	// Don't render anything until mounted (avoid hydration mismatch)
	if (!mounted) {
		return (
			<aside className="hidden w-72 shrink-0 lg:block" aria-hidden="true" />
		);
	}

	return (
		<aside className="hidden w-72 shrink-0 lg:block">
			<div className="sticky top-0 space-y-3 px-5 pt-6">
				{visibleCards.map(({ id, Component }) => (
					<Component key={id} onDismiss={() => handleDismiss(id)} />
				))}

				{/* Non-dismissible sections — always visible */}
				<FeedbackCard />
				<ApprovedSuggestionsPreview />
			</div>
		</aside>
	);
}
