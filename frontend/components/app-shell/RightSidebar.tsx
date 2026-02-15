"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Lightbulb, MessageSquare, BarChart3, Rocket } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
			<p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
				Getting Started
			</p>
			<p className="mt-1.5 text-[13px] font-medium text-foreground">
				Here&apos;s how to make the most of Validuct
			</p>

			<div className="mt-4 space-y-2.5">
				{walkthroughSteps.map((step) => {
					const Icon = step.icon;
					return (
						<Link
							key={step.label}
							href={step.href}
							className="group flex items-center gap-2.5 rounded-lg p-1.5 -ml-1.5 transition-colors hover:bg-muted/60"
						>
							<div
								className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${step.bg}`}
							>
								<Icon className={`size-3.5 ${step.color}`} />
							</div>
							<span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
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
			<p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
				Pro Tip
			</p>
			<p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
				Add a clear problem statement to your idea — ideas with strong
				problem definitions get{" "}
				<span className="text-foreground font-medium">3x more feedback</span>{" "}
				from the community.
			</p>
		</InfoCard>
	);
}

/* ── Main component ─────────────────────────────────────── */

const CARD_REGISTRY = [
	{ id: "walkthrough", Component: WalkthroughCard },
	{ id: "tip-problem", Component: TipCard },
] as const;

export default function RightSidebar() {
	const { user } = useAuth();
	const [dismissed, setDismissed] = useState<string[]>(() => {
		if (typeof window !== "undefined" && user?.id) {
			return getDismissedCards(user.id);
		}
		return [];
	});
	const [mounted] = useState(() => {
		return typeof window !== "undefined" && !!user?.id;
	});

	function handleDismiss(cardId: string) {
		if (!user?.id) return;
		dismissCard(user.id, cardId);
		setDismissed((prev) => [...prev, cardId]);
	}

	const visibleCards = CARD_REGISTRY.filter(
		(card) => !dismissed.includes(card.id)
	);

	// Don't render anything until mounted (avoid hydration mismatch)
	if (!mounted) {
		return (
			<aside
				className="hidden w-72 shrink-0 lg:block"
				aria-hidden="true"
			/>
		);
	}

	return (
		<aside className="hidden w-72 shrink-0 lg:block">
			{visibleCards.length > 0 && (
				<div className="sticky top-0 space-y-3 px-5 pt-6">
					{visibleCards.map(({ id, Component }) => (
						<Component
							key={id}
							onDismiss={() => handleDismiss(id)}
						/>
					))}
				</div>
			)}
		</aside>
	);
}
