"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IdeaCardProps } from "@/types";
import { formatDistanceToNow } from "date-fns";
import VoteButtons from "./VoteButtons";
import PinButton from "./PinButton";
import { HiUserCircle } from "react-icons/hi2";

export default function IdeaCard({
	idea,
	showPinButton = false,
	onPinChange,
}: IdeaCardProps) {
	const router = useRouter();

	const getStatusBadgeStyles = (status: string) => {
		switch (status) {
			case "VALIDATED":
				return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
			case "WIP":
				return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
			case "LAUNCHED":
				return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
			case "DRAFT":
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const formatStatus = (status: string) => {
		switch (status) {
			case "WIP":
				return "In Progress";
			case "VALIDATED":
				return "Validated";
			case "LAUNCHED":
				return "Launched";
			case "DRAFT":
			default:
				return "Draft";
		}
	};

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

	return (
		<article
			className="group bg-card cursor-pointer rounded-xl border border-border/50 p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-border"
			onClick={handleCardClick}
		>
			<div className="flex gap-4 items-center ">
				{/* Voting Column */}
				<div className="flex shrink-0 items-start pt-0.5">
					<VoteButtons
						ideaId={idea.id}
						initialUpvotesCount={idea.upvotesCount}
						initialDownvotesCount={idea.downvotesCount}
						initialUserVote={idea.userVote}
					/>
				</div>

				{/* Content Section */}
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					{/* Title Row with Status */}
					<div className="flex items-start justify-between gap-3">
						<h2 className="text-foreground group-hover:text-primary line-clamp-2 min-w-0 flex-1 text-base font-semibold leading-snug transition-colors sm:text-lg">
							{idea.heading}
						</h2>
						<div className="flex shrink-0 items-center gap-2">
							{showPinButton && (
								<PinButton
									ideaId={idea.id}
									ideaUserId={idea.userId}
									initialIsPinned={idea.isPinned}
									onPinChange={onPinChange}
								/>
							)}
							<span
								className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeStyles(
									idea.status
								)}`}
							>
								{formatStatus(idea.status)}
							</span>
						</div>
					</div>

					{/* Description */}
					<p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
						{idea.description}
					</p>

					{/* Meta Row */}
					<div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
						<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
							<Link
								href={`/${idea.user.username}`}
								className="hover:text-foreground flex shrink-0 items-center gap-1.5 transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								{idea.user.profilePicture ? (
									<Image
										src={idea.user.profilePicture}
										alt={idea.user.username}
										width={18}
										height={18}
										className="rounded-full"
									/>
								) : (
									<HiUserCircle className="h-4.5 w-4.5" />
								)}
								<span className="font-medium hover:underline">
									{idea.user.username}
								</span>
							</Link>
							<span className="text-border hidden sm:inline">·</span>
							<span className="hidden sm:inline">
								{formatDistanceToNow(new Date(idea.createdAt), {
									addSuffix: false,
								}).replace(/^(about|over|almost) /, "")}
							</span>
							<span className="text-border hidden sm:inline">·</span>
							<span className="hidden sm:inline"><span className="font-mono">{idea.commentsCount}</span> comments</span>
						</div>
						<span className="text-muted-foreground shrink-0 font-medium transition-colors group-hover:text-primary">
							View →
						</span>
					</div>
				</div>
			</div>
		</article>
	);
}
