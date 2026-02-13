"use client";

import { useRouter } from "next/navigation";
import { ProfileIdeaCardProps, ValidationState } from "@/types";
import { formatDistanceToNow } from "date-fns";
import PinButton from "./PinButton";
import ShareButton from "./ShareButton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	BadgeCheck,
	DollarSign,
	Rocket,
	TriangleAlert,
	MessageSquareMore,
	Clock,
} from "lucide-react";

const VALIDATION_STATE_CONFIG: Record<
	ValidationState,
	{ label: string; bgColor: string; textColor: string }
> = {
	NEEDS_ACTION: {
		label: "Needs Action",
		bgColor: "bg-amber-100 dark:bg-amber-500/20",
		textColor: "text-amber-700 dark:text-amber-400",
	},
	READY_TO_BUILD: {
		label: "Ready to Build",
		bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
		textColor: "text-emerald-700 dark:text-emerald-400",
	},
	VALIDATED: {
		label: "Validated",
		bgColor: "bg-sky-100 dark:bg-sky-500/20",
		textColor: "text-sky-700 dark:text-sky-400",
	},
	NEUTRAL: {
		label: "Gathering Signals",
		bgColor: "bg-muted",
		textColor: "text-muted-foreground",
	},
};

const SIGNAL_TYPES = [
	{
		key: "problemReal" as const,
		label: "Problem",
		icon: BadgeCheck,
		color: "text-signal-problem",
	},
	{
		key: "wouldPay" as const,
		label: "Would Pay",
		icon: DollarSign,
		color: "text-signal-pay",
	},
	{
		key: "readyToBuild" as const,
		label: "Build",
		icon: Rocket,
		color: "text-signal-build",
	},
	{
		key: "needsClarity" as const,
		label: "Clarity",
		icon: TriangleAlert,
		color: "text-signal-clarity",
	},
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
	DRAFT: {
		label: "Draft",
		className:
			"bg-zinc-200 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
	},
	WIP: {
		label: "In Progress",
		className:
			"bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
	},
	LAUNCHED: {
		label: "Launched",
		className:
			"bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
	},
	VALIDATED: {
		label: "Validated",
		className:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
	},
};

export default function ProfileIdeaCard({
	idea,
	showPinButton = false,
	onPinChange,
}: ProfileIdeaCardProps) {
	const router = useRouter();
	const stateConfig = VALIDATION_STATE_CONFIG[idea.validationState];
	const statusConfig = STATUS_BADGE[idea.status];

	const handleCardClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			!target.closest("a") &&
			!target.closest("button") &&
			!target.closest("[data-no-navigate]")
		) {
			router.push(`/idea/${idea.id}`);
		}
	};

	const totalSignals =
		idea.signals.problemReal +
		idea.signals.wouldPay +
		idea.signals.readyToBuild +
		idea.signals.needsClarity;

	return (
		<article
			className="group dark:bg-card border-border/50 shadow-card hover:shadow-card-hover hover:border-border cursor-pointer overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
			onClick={handleCardClick}
		>
			<div className="flex min-h-36">
				{/* Left: Signal Column */}
				<div className="flex w-28 shrink-0 flex-col border-r border-border/40 bg-muted/30 sm:w-32">
					{/* Total Signals — ~70% */}
					<div className="flex flex-1 flex-col items-center justify-center p-3 min-h-6/12">
						<div className="font-mono text-3xl font-bold tracking-tight text-foreground">
							{totalSignals}
						</div>
						<div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
							Signal{totalSignals !== 1 ? "s" : ""}
						</div>
					</div>

					{/* 2x2 Breakdown — ~30% */}
					<div className="grid grid-cols-4 border-t py-2 bg-white">
						{SIGNAL_TYPES.map(({ key, label, icon: Icon, color }) => {
							const count = idea.signals[key];
							const active = count > 0;
							return (
								<Tooltip key={key} delayDuration={250}>
									<TooltipTrigger asChild>
										<div className="flex flex-col items-center gap-0.5 bg-white dark:bg-card py-1">
											<Icon
												className={`h-3.5 w-3.5 ${active ? color : "text-muted-foreground/30"}`}
											/>
											<span
												className={`font-mono text-[11px] font-bold ${active ? "text-foreground" : "text-muted-foreground/30"}`}
											>
												{count}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										{count} {label}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>

				{/* Right: Content — mirrors IdeaCard structure */}
				<div className="flex min-w-0 flex-1 flex-col">
					{/* Title + Badges */}
					<div className="flex items-start justify-between gap-3 px-6 pt-5">
						<h2 className="text-foreground line-clamp-2 min-w-0 flex-1 text-base leading-snug font-semibold sm:text-lg">
							{idea.heading}
						</h2>
						<div className="flex shrink-0 items-center gap-2">
							{showPinButton && (
								<PinButton
									ideaId={idea.id}
									ideaUserId={idea.userId}
									initialIsPinned={false}
									onPinChange={onPinChange}
								/>
							)}
							{statusConfig && (
								<span
									className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
								>
									{statusConfig.label}
								</span>
							)}
							<span
								className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stateConfig.bgColor} ${stateConfig.textColor}`}
							>
								{stateConfig.label}
							</span>
						</div>
					</div>

					{/* Description */}
					<p className="text-muted-foreground mt-2 line-clamp-2 px-6 text-sm leading-relaxed">
						{idea.description}
					</p>

					{/* Bottom Action Bar — same styles as IdeaCard */}
					<div className="mt-auto flex items-center gap-3 px-6 pb-2.5 pt-4 text-xs">
						<span className="flex items-center gap-1 text-muted-foreground">
							<Clock className="h-3 w-3" />
							{formatDistanceToNow(new Date(idea.createdAt), {
								addSuffix: false,
							}).replace(/^(about|over|almost) /, "")}
						</span>
						<button
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/idea/${idea.id}#comments`);
							}}
							className="text-muted-foreground bg-muted/60 hover:bg-muted flex cursor-pointer flex-row items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-150"
						>
							<MessageSquareMore className="h-3.5 w-3.5" />
							<span className="font-mono">{idea.commentsCount}</span>
						</button>
						<ShareButton
							idea={idea}
							size={null}
							showLabel={true}
							variant="ghost"
							className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground h-auto cursor-pointer gap-1.5 rounded-full px-4 py-2 text-xs transition-colors duration-150"
						/>
					</div>
				</div>
			</div>
		</article>
	);
}
