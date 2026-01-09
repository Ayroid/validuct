"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { votesApi } from "@/lib/api/votes";
import { VoteButtonsProps } from "@/types";

export default function VoteButtons({
	ideaId,
	initialUpvotesCount,
	initialDownvotesCount,
	initialUserVote,
	onVoteUpdate,
}: VoteButtonsProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [upvotesCount, setUpvotesCount] = useState(initialUpvotesCount);
	const [downvotesCount, setDownvotesCount] = useState(initialDownvotesCount);
	const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(
		initialUserVote || null
	);
	const [isLoading, setIsLoading] = useState(false);

	const handleVote = async (voteType: "upvote" | "downvote") => {
		if (!session) {
			router.push("/signin");
			return;
		}

		setIsLoading(true);
		try {
			const result = await votesApi.voteOnIdea(ideaId, voteType);

			setUpvotesCount(result.upvotes_count);
			setDownvotesCount(result.downvotes_count);
			setUserVote(result.vote.vote_type);

			if (onVoteUpdate) {
				onVoteUpdate(
					result.upvotes_count,
					result.downvotes_count,
					result.vote.vote_type
				);
			}
		} catch {
		} finally {
			setIsLoading(false);
		}
	};

	const netVotes = upvotesCount - downvotesCount;

	return (
		<div
			className="group/vote flex min-w-12 flex-col items-center gap-0.5"
			data-no-navigate
		>
			<button
				className={`rounded p-1 transition-all duration-150 ${
					userVote === "upvote"
						? "text-amber-500"
						: "text-muted-foreground/40 hover:text-amber-500/80"
				} ${isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-amber-500/10"}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("upvote");
				}}
				disabled={isLoading}
				aria-label="Upvote"
			>
				<svg
					className="h-6 w-6"
					fill={userVote === "upvote" ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2.5}
						d="M5 15l7-7 7 7"
					/>
				</svg>
			</button>
			<span
				className={`text-lg font-bold tabular-nums transition-transform duration-150 group-hover/vote:scale-105 ${
					userVote === "upvote"
						? "text-amber-500"
						: userVote === "downvote"
							? "text-blue-500"
							: "text-foreground/80"
				}`}
			>
				{netVotes}
			</span>
			<button
				className={`rounded p-1 transition-all duration-150 ${
					userVote === "downvote"
						? "text-blue-500"
						: "text-muted-foreground/40 hover:text-blue-500/80"
				} ${isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-blue-500/10"}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("downvote");
				}}
				disabled={isLoading}
				aria-label="Downvote"
			>
				<svg
					className="h-6 w-6"
					fill={userVote === "downvote" ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2.5}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
		</div>
	);
}
