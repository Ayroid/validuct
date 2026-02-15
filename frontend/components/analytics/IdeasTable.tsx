"use client";

import { useMemo, useState } from "react";
import { ThumbsUp, MessageSquare, Users } from "lucide-react";
import { TopIdeaAnalytics } from "@/types";
import Link from "next/link";

interface IdeasTableProps {
	ideas: TopIdeaAnalytics[];
}

type SortKey =
	| "totalSignals"
	| "upvotesCount"
	| "waitlistCount"
	| "commentsCount";

const STATUS_BADGE: Record<string, string> = {
	DRAFT: "bg-muted text-muted-foreground",
	WIP: "bg-primary/10 text-primary",
	VALIDATED: "bg-emerald-500/10 text-emerald-600",
	LAUNCHED: "bg-blue-500/10 text-blue-600",
};

const STATUS_LABEL: Record<string, string> = {
	DRAFT: "Draft",
	WIP: "WIP",
	VALIDATED: "Validated",
	LAUNCHED: "Launched",
};

export default function IdeasTable({ ideas }: IdeasTableProps) {
	const [sortKey, setSortKey] = useState<SortKey>("totalSignals");

	const sorted = useMemo(
		() => [...ideas].sort((a, b) => b[sortKey] - a[sortKey]),
		[ideas, sortKey]
	);

	if (ideas.length === 0) {
		return (
			<div className="bg-card border-border/50 rounded-xl border p-10 text-center">
				<p className="text-muted-foreground text-sm">
					No ideas yet. Share your first idea to see analytics here.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-card border-border/50 rounded-xl border">
			<div className="flex items-center justify-between p-5 pb-3">
				<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
					Your Ideas
				</span>
				<select
					value={sortKey}
					onChange={(e) => setSortKey(e.target.value as SortKey)}
					className="bg-muted/50 border-border/50 text-foreground rounded-md border px-2 py-1 text-xs"
				>
					<option value="totalSignals">By Signals</option>
					<option value="upvotesCount">By Upvotes</option>
					<option value="waitlistCount">By Waitlist</option>
					<option value="commentsCount">By Feedback</option>
				</select>
			</div>

			{/* Header row - hidden on mobile */}
			<div className="border-border/50 text-muted-foreground hidden border-b px-5 py-2 text-xs font-medium sm:grid sm:grid-cols-[1fr_80px_80px_80px_80px_80px]">
				<span>Idea</span>
				<span className="text-center">Signals</span>
				<span className="text-center">Upvotes</span>
				<span className="text-center">Waitlist</span>
				<span className="text-center">Feedback</span>
				<span className="text-center">Status</span>
			</div>

			{/* Rows */}
			{sorted.map((idea) => {
				const maxSignal = Math.max(
					idea.signals.problemReal,
					idea.signals.wouldPay,
					idea.signals.readyToBuild,
					idea.signals.needsClarity,
					1
				);

				return (
					<Link
						key={idea.id}
						href={`/idea/${idea.id}/analytics`}
						className="border-border/30 block border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
					>
						{/* Desktop layout */}
						<div className="hidden items-center sm:grid sm:grid-cols-[1fr_80px_80px_80px_80px_80px]">
							<div className="min-w-0 pr-3">
								<p className="truncate text-sm font-medium">
									{idea.heading}
								</p>
								{/* Inline signal mini-bar */}
								<div className="mt-1.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
									{idea.signals.problemReal > 0 && (
										<div
											className="rounded-full"
											style={{
												width: `${(idea.signals.problemReal / maxSignal) * 100}%`,
												backgroundColor:
													"var(--signal-problem)",
											}}
										/>
									)}
									{idea.signals.wouldPay > 0 && (
										<div
											className="rounded-full"
											style={{
												width: `${(idea.signals.wouldPay / maxSignal) * 100}%`,
												backgroundColor:
													"var(--signal-pay)",
											}}
										/>
									)}
									{idea.signals.readyToBuild > 0 && (
										<div
											className="rounded-full"
											style={{
												width: `${(idea.signals.readyToBuild / maxSignal) * 100}%`,
												backgroundColor:
													"var(--signal-build)",
											}}
										/>
									)}
									{idea.signals.needsClarity > 0 && (
										<div
											className="rounded-full"
											style={{
												width: `${(idea.signals.needsClarity / maxSignal) * 100}%`,
												backgroundColor:
													"var(--signal-clarity)",
											}}
										/>
									)}
								</div>
							</div>
							<span className="text-center text-sm font-semibold tabular-nums">
								{idea.totalSignals}
							</span>
							<span className="flex items-center justify-center gap-1 text-sm tabular-nums">
								<ThumbsUp className="text-muted-foreground h-3 w-3" />
								{idea.upvotesCount}
							</span>
							<span className="flex items-center justify-center gap-1 text-sm tabular-nums">
								<Users className="text-muted-foreground h-3 w-3" />
								{idea.waitlistCount}
							</span>
							<span className="flex items-center justify-center gap-1 text-sm tabular-nums">
								<MessageSquare className="text-muted-foreground h-3 w-3" />
								{idea.commentsCount}
							</span>
							<span className="flex justify-center">
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[idea.status]}`}
								>
									{STATUS_LABEL[idea.status]}
								</span>
							</span>
						</div>

						{/* Mobile layout */}
						<div className="flex items-center justify-between sm:hidden">
							<div className="min-w-0 flex-1 pr-3">
								<p className="truncate text-sm font-medium">
									{idea.heading}
								</p>
								<p className="text-muted-foreground mt-0.5 text-xs">
									{idea.totalSignals} signals
								</p>
							</div>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[idea.status]}`}
							>
								{STATUS_LABEL[idea.status]}
							</span>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
