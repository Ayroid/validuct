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
		// Only navigate if clicking on the card itself, not on interactive elements
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
			className="bg-card cursor-pointer border p-6 transition-shadow hover:shadow-md"
			onClick={handleCardClick}
		>
			<div className="flex min-h-32 gap-4">
				{/* Content Section */}
				<div className="flex min-w-0 flex-1 flex-col justify-between">
					<div>
						{/* Header */}
						<div className="mb-2 flex items-start justify-between">
							<h2 className="min-w-0 pr-2 text-xl font-semibold wrap-break-word transition-colors">
								{idea.heading}
							</h2>
						</div>

						{/* Description */}
						<p className="text-muted-foreground mb-4 line-clamp-3 wrap-break-word">
							{idea.description}
						</p>
					</div>

					{/* Footer */}
					<div className="text-muted-foreground flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<Link
								href={`/${idea.user.username}`}
								className="flex items-center gap-2 font-bold transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								{idea.user.profilePicture ? (
									<Image
										src={idea.user.profilePicture}
										alt={idea.user.username}
										width={20}
										height={20}
										className="rounded-full"
									/>
								) : (
									<HiUserCircle className="text-muted-foreground h-6 w-6" />
								)}
								<span className="hover:underline">{idea.user.username}</span>
							</Link>
							|
							<span>
								{formatDistanceToNow(new Date(idea.createdAt), {
									addSuffix: true,
								}).replace(/^(about|over|almost) /, "")}
							</span>
							|
							<span className="hover:underline">
								{idea.commentsCount} comments
							</span>
						</div>
					</div>
				</div>
				{/* Vote Section */}
				<div className="flex flex-col items-end gap-2">
					<div className="flex items-center gap-2">
						{showPinButton && (
							<PinButton
								ideaId={idea.id}
								ideaUserId={idea.userId}
								initialIsPinned={idea.isPinned}
								onPinChange={onPinChange}
							/>
						)}
						{idea.launchedLink && (
							<Link
								href={idea.launchedLink}
								target="_blank"
								rel="noopener noreferrer"
								className={`flex gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
									"LAUNCHED"
								)}`}
								onClick={(e) => e.stopPropagation()}
							>
								Visit{" "}
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
							</Link>
						)}
						<span
							className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
								idea.status
							)}`}
						>
							{formatStatus(idea.status)}
						</span>
					</div>
					<VoteButtons
						ideaId={idea.id}
						initialUpvotesCount={idea.upvotesCount}
						initialDownvotesCount={idea.downvotesCount}
						initialUserVote={idea.userVote}
					/>
				</div>
			</div>
		</div>
	);
}
