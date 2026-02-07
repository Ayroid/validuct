"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { votesApi } from "@/lib/api/votes";
import { VoteButtonsProps } from "@/types";

interface ExtendedVoteButtonsProps extends VoteButtonsProps {
	orientation?: "vertical" | "horizontal";
}

function RollingNumber({
	value,
	className,
}: {
	value: number;
	className: string;
}) {
	const prevValue = useRef(value);
	const [direction, setDirection] = useState<"up" | "down" | null>(null);
	const [key, setKey] = useState(0);

	useEffect(() => {
		if (value !== prevValue.current) {
			setDirection(value > prevValue.current ? "up" : "down");
			setKey((k) => k + 1);
			prevValue.current = value;
		}
	}, [value]);

	return (
		<span
			className={`relative inline-flex h-5 items-center overflow-hidden ${className}`}
		>
			<span
				key={key}
				className={
					direction === "up"
						? "animate-roll-up"
						: direction === "down"
							? "animate-roll-down"
							: ""
				}
			>
				{value}
			</span>
		</span>
	);
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
			className={`group/vote flex items-center justify-center ${isHorizontal ? "bg-muted/60 flex-row gap-1.5 rounded-full px-2 py-1" : "flex-col gap-0"}`}
			data-no-navigate
		>
			{/* Upvote button */}
			<button
				className={`flex cursor-pointer items-center justify-center rounded-full p-1 transition-all duration-150 ${
					userVote === "upvote"
						? "text-primary"
						: "text-muted-foreground/50 hover:text-primary/80"
				} ${isHorizontal ? "order-1" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("upvote");
				}}
				aria-label="Upvote"
			>
				<svg className={isHorizontal ? "h-4 w-4" : "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor">
					<path d="M3.8 17a2 2 0 01-1.7-3l7.5-12a2.5 2.5 0 014.3 0L21.4 14a2 2 0 01-1.7 3z" />
				</svg>
			</button>
			{/* Vote count - center */}
			<RollingNumber
				value={netVotes}
				className={`font-mono leading-none font-bold tabular-nums ${isHorizontal ? "text-xs" : "text-sm"} ${
					userVote === "upvote"
						? "text-primary"
						: userVote === "downvote"
							? "text-blue-500"
							: "text-foreground/80"
				} ${isHorizontal ? "order-2" : ""}`}
			/>
			{/* Downvote button */}
			<button
				className={`flex cursor-pointer items-center justify-center rounded-full p-1 transition-all duration-150 ${
					userVote === "downvote"
						? "text-blue-500"
						: "text-muted-foreground/50 hover:text-blue-500/80"
				} ${isHorizontal ? "order-3" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					handleVote("downvote");
				}}
				aria-label="Downvote"
			>
				<svg className={isHorizontal ? "h-4 w-4" : "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.2 7a2 2 0 011.7 3l-7.5 12a2.5 2.5 0 01-4.3 0L2.6 10a2 2 0 011.7-3z" />
				</svg>
			</button>
		</div>
	);
}
