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

	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case "VALIDATED":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
			case "WIP":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
			case "LAUNCHED":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
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
		<div
			className="group border-border/50 bg-card cursor-pointer border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
			onClick={handleCardClick}
		>
			<div className="flex gap-5">
				{/* Voting Column - Far Left */}
				<div className="flex shrink-0 items-start pt-1">
					<VoteButtons
						ideaId={idea.id}
						initialUpvotesCount={idea.upvotesCount}
						initialDownvotesCount={idea.downvotesCount}
						initialUserVote={idea.userVote}
					/>
				</div>

				{/* Content Section */}
				<div className="flex min-w-0 flex-1 flex-col justify-between py-1">
					{/* Title Row with Status */}
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
										initialIsPinned={idea.isPinned}
										onPinChange={onPinChange}
									/>
								)}
								<span
									className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
										idea.status
									)}`}
								>
									{formatStatus(idea.status)}
								</span>
							</div>
						</div>

						{/* Description - Single Line, Lower Contrast */}
						<p className="text-muted-foreground/70 line-clamp-1 text-sm">
							{idea.description}
						</p>
					</div>

					{/* Meta Row - Low Visual Priority */}
					<div className="text-muted-foreground/60 flex items-center justify-between text-xs">
						<div className="flex items-center gap-1.5">
							<Link
								href={`/${idea.user.username}`}
								className="hover:text-foreground/80 flex items-center gap-1.5 transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								{idea.user.profilePicture ? (
									<Image
										src={idea.user.profilePicture}
										alt={idea.user.username}
										width={16}
										height={16}
										className="rounded-full"
									/>
								) : (
									<HiUserCircle className="h-4 w-4" />
								)}
								<span className="font-medium hover:underline">
									{idea.user.username}
								</span>
							</Link>
							<span className="text-muted-foreground/40">·</span>
							<span>
								{formatDistanceToNow(new Date(idea.createdAt), {
									addSuffix: false,
								}).replace(/^(about|over|almost) /, "")}
							</span>
							<span className="text-muted-foreground/40">·</span>
							<span>{idea.commentsCount} comments</span>
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
