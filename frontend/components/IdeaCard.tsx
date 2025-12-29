"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IdeaCardProps } from "@/types";
import { formatDistanceToNow } from "date-fns";
import VoteButtons from "./VoteButtons";
import PinButton from "./PinButton";
import { HiUserCircle } from "react-icons/hi2";

export default function IdeaCard({ idea, onPinChange }: IdeaCardProps) {
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
				return "Work in Progress";
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
			className="bg-card rounded-lg border hover:shadow-md transition-shadow p-6 cursor-pointer"
			onClick={handleCardClick}
		>
			<div className="flex gap-4">
				{/* Content Section */}
				<div className="flex-1">
					{/* Header */}
					<div className="flex items-start justify-between mb-2">
						<h2 className="text-xl font-semibold hover:text-primary transition-colors">
							{idea.heading}
						</h2>
						<div className="flex items-center gap-2">
							<PinButton
								ideaId={idea.id}
								ideaUserId={idea.userId}
								onPinChange={onPinChange}
							/>
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
									idea.status
								)}`}
							>
								{formatStatus(idea.status)}
							</span>
						</div>
					</div>

					{/* Description */}
					<p className="text-muted-foreground mb-4 line-clamp-3">{idea.description}</p>

					{/* Footer */}
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Link
								href={`/profile/${idea.user.username}`}
								className="flex items-center gap-1 transition-colors font-bold"
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
									<HiUserCircle className="w-6 h-6 text-muted-foreground" />
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

						<div className="flex items-center gap-4">
							{idea.launchedLink && (
								<a
									href={idea.launchedLink}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
									onClick={(e) => e.stopPropagation()}
								>
									<svg
										className="w-4 h-4"
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
									<span>Visit</span>
								</a>
							)}
						</div>
					</div>
				</div>
				{/* Vote Section */}
				<VoteButtons
					ideaId={idea.id}
					initialUpvotesCount={idea.upvotesCount}
					initialDownvotesCount={idea.downvotesCount}
					initialUserVote={idea.userVote}
				/>
			</div>
		</div>
	);
}
