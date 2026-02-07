"use client";

import { useRouter } from "next/navigation";
import { ProfileIdeaCardProps, ValidationState } from "@/types";
import { formatDistanceToNow } from "date-fns";
import PinButton from "./PinButton";
import {
	HiCheckBadge,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
} from "react-icons/hi2";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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

export default function ProfileIdeaCard({
	idea,
	showPinButton = false,
	onPinChange,
}: ProfileIdeaCardProps) {
	const router = useRouter();
	const stateConfig = VALIDATION_STATE_CONFIG[idea.validationState];

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

	const totalPositiveSignals =
		idea.signals.problemReal +
		idea.signals.wouldPay +
		idea.signals.readyToBuild;

	return (
		<article
			className="group bg-card border-border/50 shadow-card hover:shadow-card-hover hover:border-border cursor-pointer rounded-xl border p-6 transition-all duration-200 hover:-translate-y-0.5"
			onClick={handleCardClick}
		>
			<div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
				{/* Signal Snapshot Column */}
				<div className="flex w-full shrink-0 flex-row items-center gap-4 sm:w-20 sm:flex-col sm:gap-0">
					<div className="bg-muted/50 border-border/30 rounded-xl border p-4 text-center">
						<div className="text-foreground font-mono text-2xl font-bold">
							{totalPositiveSignals}
						</div>
						<div className="text-muted-foreground text-xs">signals</div>
					</div>
					{/* Mini signal icons */}
					<div className="flex w-full items-center justify-start gap-2 sm:mt-3 sm:justify-center">
						{idea.signals.problemReal > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center gap-0.5">
										<HiCheckBadge className="text-signal-problem h-4 w-4" />
										<span className="text-muted-foreground font-mono text-[10px]">
											{idea.signals.problemReal}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									{idea.signals.problemReal} Problem Real
								</TooltipContent>
							</Tooltip>
						)}
						{idea.signals.wouldPay > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center gap-0.5">
										<HiCurrencyDollar className="text-signal-pay h-4 w-4" />
										<span className="text-muted-foreground font-mono text-[10px]">
											{idea.signals.wouldPay}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									{idea.signals.wouldPay} Would Pay
								</TooltipContent>
							</Tooltip>
						)}
						{idea.signals.readyToBuild > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center gap-0.5">
										<HiRocketLaunch className="text-signal-build h-4 w-4" />
										<span className="text-muted-foreground font-mono text-[10px]">
											{idea.signals.readyToBuild}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									{idea.signals.readyToBuild} Ready to Build
								</TooltipContent>
							</Tooltip>
						)}
						{idea.signals.needsClarity > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center gap-0.5">
										<HiExclamationTriangle className="text-signal-clarity h-4 w-4" />
										<span className="text-muted-foreground font-mono text-[10px]">
											{idea.signals.needsClarity}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									{idea.signals.needsClarity} Needs Clarity
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>

				{/* Content Section */}
				<div className="flex min-w-0 flex-1 flex-col gap-3.5">
					{/* Title Row with Validation State */}
					<div className="flex items-start justify-between gap-3">
						<h2 className="text-foreground group-hover:text-primary line-clamp-2 min-w-0 flex-1 text-base leading-snug font-semibold transition-colors sm:text-lg">
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
							<span
								className={`rounded-full px-2.5 py-1 text-xs font-medium ${stateConfig.bgColor} ${stateConfig.textColor}`}
							>
								{stateConfig.label}
							</span>
						</div>
					</div>

					{/* Description */}
					<p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
						{idea.description}
					</p>

					{/* Meta Row */}
					<div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
						<div className="flex items-center gap-2">
							<span>
								{formatDistanceToNow(new Date(idea.createdAt), {
									addSuffix: false,
								}).replace(/^(about|over|almost) /, "")}
							</span>
							<span className="text-border">·</span>
							<span>
								<span className="font-mono">{idea.commentsCount}</span> comments
							</span>
						</div>
						<span className="text-muted-foreground group-hover:text-primary font-medium transition-colors">
							View →
						</span>
					</div>
				</div>
			</div>
		</article>
	);
}
