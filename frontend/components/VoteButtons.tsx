"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { votesApi } from "@/lib/api/votes";
import { VoteButtonsProps } from "@/types";

interface ExtendedVoteButtonsProps extends VoteButtonsProps {
	orientation?: "vertical" | "horizontal";
}

export default function VoteButtons({
	ideaId,
	initialUpvotesCount,
	initialDownvotesCount,
	initialUserVote,
	onVoteUpdate,
	orientation = "vertical",
}: ExtendedVoteButtonsProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [upvotesCount, setUpvotesCount] = useState(initialUpvotesCount);
	const [downvotesCount, setDownvotesCount] = useState(initialDownvotesCount);
	const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(
		initialUserVote || null
	);
	const handleVote = async (voteType: "upvote" | "downvote") => {
		if (!session) {
			router.push("/signin");
			return;
		}

		// Save previous state for rollback
		const prevUpvotes = upvotesCount;
		const prevDownvotes = downvotesCount;
		const prevUserVote = userVote;

		// Optimistically update UI
		let newUpvotes = upvotesCount;
		let newDownvotes = downvotesCount;
		let newUserVote: "upvote" | "downvote" | null = voteType;

		if (userVote === voteType) {
			// Removing vote
			newUserVote = null;
			if (voteType === "upvote") newUpvotes--;
			else newDownvotes--;
		} else {
			// Adding or switching vote
			if (userVote === "upvote") newUpvotes--;
			else if (userVote === "downvote") newDownvotes--;

			if (voteType === "upvote") newUpvotes++;
			else newDownvotes++;
		}

		setUpvotesCount(newUpvotes);
		setDownvotesCount(newDownvotes);
		setUserVote(newUserVote);

		if (onVoteUpdate) {
			onVoteUpdate(newUpvotes, newDownvotes, newUserVote);
		}

		try {
			const result = await votesApi.voteOnIdea(ideaId, voteType);

			// Sync with server response
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
			// Revert on error
			setUpvotesCount(prevUpvotes);
			setDownvotesCount(prevDownvotes);
			setUserVote(prevUserVote);

			if (onVoteUpdate) {
				onVoteUpdate(prevUpvotes, prevDownvotes, prevUserVote);
			}
		}
	};

	const netVotes = upvotesCount - downvotesCount;

	const isHorizontal = orientation === "horizontal";

	return (
		<div
			className={`group/vote flex items-center gap-0.5 ${isHorizontal ? "flex-row" : "flex-col"}`}
			data-no-navigate
		>
			{/* Upvote button - top in vertical, right in horizontal */}
			<button
				className={`rounded p-1 transition-all duration-150 hover:bg-amber-500/10 ${
					userVote === "upvote"
						? "text-amber-500"
						: "text-muted-foreground/40 hover:text-amber-500/80"
				} ${isHorizontal ? "order-3" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("upvote");
				}}
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
			{/* Vote count - center */}
			<span
				className={`font-mono text-lg font-bold transition-transform duration-150 group-hover/vote:scale-105 ${
					userVote === "upvote"
						? "text-amber-500"
						: userVote === "downvote"
							? "text-blue-500"
							: "text-foreground/80"
				} ${isHorizontal ? "order-2 min-w-8 text-center" : ""}`}
			>
				{netVotes}
			</span>
			{/* Downvote button - bottom in vertical, left in horizontal */}
			<button
				className={`rounded p-1 transition-all duration-150 hover:bg-blue-500/10 ${
					userVote === "downvote"
						? "text-blue-500"
						: "text-muted-foreground/40 hover:text-blue-500/80"
				} ${isHorizontal ? "order-1" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("downvote");
				}}
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
