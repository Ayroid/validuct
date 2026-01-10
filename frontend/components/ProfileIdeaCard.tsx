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
	{ label: string; color: string; bgColor: string; borderColor: string }
> = {
	NEEDS_ACTION: {
		label: "Needs Action",
		color: "text-orange-400",
		bgColor: "bg-orange-500/20",
		borderColor: "border-orange-500/30",
	},
	READY_TO_BUILD: {
		label: "Ready to Build",
		color: "text-green-400",
		bgColor: "bg-green-500/20",
		borderColor: "border-green-500/30",
	},
	VALIDATED: {
		label: "Validated",
		color: "text-blue-400",
		bgColor: "bg-blue-500/20",
		borderColor: "border-blue-500/30",
	},
	NEUTRAL: {
		label: "Gathering Signals",
		color: "text-muted-foreground",
		bgColor: "bg-muted",
		borderColor: "border-border",
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

	// Calculate total positive signals
	const totalPositiveSignals =
		idea.signals.problemReal +
		idea.signals.wouldPay +
		idea.signals.readyToBuild;

	return (
		<div
			className="group border-border/50 bg-card cursor-pointer rounded-lg border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
			onClick={handleCardClick}
		>
			<div className="flex gap-5">
				{/* Signal Snapshot Column */}
				<div className="flex w-20 shrink-0 flex-col items-center justify-center">
					<div className="border-border/30 bg-background/50 rounded-lg border p-4 text-center">
						<div className="text-foreground text-2xl font-bold">
							{totalPositiveSignals}
						</div>
						<div className="text-muted-foreground text-xs">signals</div>
					</div>
					{/* Mini signal icons */}
					<div className="mt-2 flex w-full items-center justify-evenly gap-1">
						{idea.signals.problemReal > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center gap-0.5">
										<HiCheckBadge className="h-3.5 w-3.5 text-blue-400" />
										<span className="text-muted-foreground text-[10px]">
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
										<HiCurrencyDollar className="h-3.5 w-3.5 text-green-400" />
										<span className="text-muted-foreground text-[10px]">
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
										<HiRocketLaunch className="h-3.5 w-3.5 text-purple-400" />
										<span className="text-muted-foreground text-[10px]">
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
										<HiExclamationTriangle className="h-3.5 w-3.5 text-orange-400" />
										<span className="text-muted-foreground text-[10px]">
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
				<div className="flex min-w-0 flex-1 flex-col justify-between py-1">
					{/* Title Row with Validation State */}
					<div className="flex min-w-0 flex-1 flex-col gap-3">
						<div className="flex items-start justify-between gap-3">
							<h2 className="text-foreground/95 group-hover:text-foreground min-w-0 flex-1 text-lg leading-snug font-semibold transition-colors">
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
								{/* Validation State Badge */}
								<span
									className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${stateConfig.bgColor} ${stateConfig.color} ${stateConfig.borderColor}`}
								>
									{stateConfig.label}
								</span>
							</div>
						</div>

						{/* Description */}
						<p className="text-muted-foreground/70 line-clamp-1 text-sm">
							{idea.description}
						</p>
					</div>

					{/* Meta Row with Signal Details */}
					<div className="text-muted-foreground/60 mt-3 flex items-center justify-between text-xs">
						<div className="flex items-center gap-3">
							{/* Signal counts with icons */}
							{/* {(Object.keys(SIGNAL_ICONS) as Array<keyof IdeaSignalCounts>).map(
								(key) => {
									const count = idea.signals[key];
									if (count === 0) return null;
									const { icon: Icon, color, label } = SIGNAL_ICONS[key];
									return (
										<span
											key={key}
											className="flex items-center gap-1"
											title={label}
										>
											<Icon className={`h-3.5 w-3.5 ${color}`} />
											<span className="text-foreground/70">{count}</span>
										</span>
									);
								}
							)}
							<span className="text-muted-foreground/30">|</span> */}
							<span>{idea.commentsCount} comments</span>
							<span className="text-muted-foreground/30">|</span>
							<span>
								{formatDistanceToNow(new Date(idea.createdAt), {
									addSuffix: false,
								}).replace(/^(about|over|almost) /, "")}
							</span>
						</div>
						<span className="text-muted-foreground/70 font-medium transition-colors group-hover:text-amber-500/80">
							View →
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
