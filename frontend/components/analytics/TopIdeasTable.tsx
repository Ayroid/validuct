"use client";

import Link from "next/link";
import { TopIdea } from "@/types";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

interface TopIdeasTableProps {
	data: TopIdea[];
}

export default function TopIdeasTable({ data }: TopIdeasTableProps) {
	if (data.length === 0) {
		return (
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
				<h3 className="text-foreground mb-5 text-base font-semibold">
					Top Performing Ideas
				</h3>
				<div className="flex items-center justify-center h-48 text-muted-foreground">
					No ideas with signals yet
				</div>
			</div>
		);
	}

	return (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
			<h3 className="text-foreground mb-5 text-base font-semibold">
				Top Performing Ideas
			</h3>
			<div className="space-y-3">
				{data.map((idea, index) => (
					<div
						key={idea.id}
						className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0"
					>
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<span className="text-muted-foreground text-sm font-mono w-5">
								{index + 1}.
							</span>
							<Link
								href={`/idea/${idea.id}`}
								className="text-foreground text-sm font-medium hover:text-primary truncate flex items-center gap-1.5 group"
							>
								<span className="truncate">{idea.heading}</span>
								<HiArrowTopRightOnSquare className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
							</Link>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<span className="text-foreground font-mono text-sm font-semibold">
								{idea.totalSignals}
							</span>
							<span className="text-muted-foreground text-xs">signals</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
