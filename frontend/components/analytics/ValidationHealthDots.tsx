"use client";

import { ValidationHealthDots as HealthDotsType } from "@/types";

const DOT_COLORS: Record<string, string> = {
	green: "bg-emerald-500",
	amber: "bg-amber-400",
	gray: "bg-muted-foreground/30",
};

const DOT_LABELS: Record<string, string> = {
	problem: "Problem",
	pay: "Pay",
	buildable: "Build",
};

interface ValidationHealthDotsProps {
	dots: HealthDotsType;
}

export default function ValidationHealthDots({
	dots,
}: ValidationHealthDotsProps) {
	const entries = [
		{ key: "problem", level: dots.problem },
		{ key: "pay", level: dots.pay },
		{ key: "buildable", level: dots.buildable },
	] as const;

	return (
		<div className="flex items-center gap-1.5">
			{entries.map((entry) => (
				<div
					key={entry.key}
					className="group relative flex items-center"
				>
					<div
						className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[entry.level]}`}
					/>
					<span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded bg-foreground/90 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100">
						{DOT_LABELS[entry.key]}
					</span>
				</div>
			))}
		</div>
	);
}
