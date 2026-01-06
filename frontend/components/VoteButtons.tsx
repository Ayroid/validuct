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
		// Redirect to login if not authenticated
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
		<div className="flex min-w-15 flex-col items-center gap-1" data-no-navigate>
			<button
				className={`transition-colors ${
					userVote === "upvote"
						? "text-orange-500"
						: "text-gray-400 hover:text-orange-500"
				} ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("upvote");
				}}
				disabled={isLoading}
				aria-label="Upvote"
			>
				<svg
					className="h-8 w-8"
					fill={userVote === "upvote" ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 15l7-7 7 7"
					/>
				</svg>
			</button>
			<span className="text-xl font-bold text-gray-700">{netVotes}</span>
			<button
				className={`transition-colors ${
					userVote === "downvote"
						? "text-blue-500"
						: "text-gray-400 hover:text-blue-500"
				} ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("downvote");
				}}
				disabled={isLoading}
				aria-label="Downvote"
			>
				<svg
					className="h-8 w-8"
					fill={userVote === "downvote" ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
		</div>
	);
}
