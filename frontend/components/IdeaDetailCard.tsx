"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import ShareButton from "@/components/ShareButton";
import IdeaHeroCard from "@/components/IdeaHeroCard";
import { MessageSquareMore, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface IdeaDetailCardProps {
	ideaId: string;
	className?: string;
	/** Called when the idea data loads, so parent can access userId etc. */
	onIdeaLoad?: (idea: Idea) => void;
	/** Called when comments count changes externally (e.g. from a CommentSection) */
	commentsCount?: number;
}

export default function IdeaDetailCard({
	ideaId,
	className,
	onIdeaLoad,
	commentsCount: externalCommentsCount,
}: IdeaDetailCardProps) {
	const { user } = useAuth();
	const [idea, setIdea] = useState<Idea | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!ideaId) return;
		let cancelled = false;

		const load = async () => {
			try {
				setLoading(true);
				const data = await ideasApi.getIdeaById(ideaId);
				if (!cancelled) {
					setIdea(data);
					onIdeaLoad?.(data);
				}
			} catch (error) {
				console.error("Failed to load idea:", error);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		load();
		return () => {
			cancelled = true;
		};
	}, [ideaId]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleVoteUpdate = useCallback(
		(
			upvotesCount: number,
			downvotesCount: number,
			userVote: "upvote" | "downvote" | null
		) => {
			setIdea((prev) =>
				prev
					? { ...prev, upvotesCount, downvotesCount, userVote }
					: prev
			);
		},
		[]
	);

	if (loading && !idea) {
		return (
			<div
				className={`bg-card border-border/50 shadow-card overflow-hidden rounded-xl border ${className ?? ""}`}
			>
				<div className="bg-muted/80 dark:bg-muted/30 px-6 py-3">
					<Skeleton className="h-4 w-40" />
				</div>
				<div className="border-border/40 border-t" />
				<div className="px-6 py-6">
					<Skeleton className="mb-2 h-6 w-3/4" />
					<Skeleton className="h-4 w-full" />
				</div>
				<div className="flex gap-3 px-6 pb-3">
					<Skeleton className="h-8 w-24 rounded-full" />
					<Skeleton className="h-8 w-16 rounded-full" />
					<Skeleton className="h-8 w-16 rounded-full" />
				</div>
			</div>
		);
	}

	if (!idea) return null;

	const displayCommentsCount =
		externalCommentsCount ?? idea.commentsCount;
	const isOwner = user && user.id === idea.userId;

	return (
		<IdeaHeroCard
			heading={idea.heading}
			description={idea.description}
			status={idea.status}
			createdAt={idea.createdAt}
			isPinned={idea.isPinned}
			launchedLink={idea.launchedLink}
			user={idea.user}
			className={className}
		>
			{/* Bottom Action Bar */}
			<div className="flex items-center gap-3 px-6 pb-2.5 text-xs">
				<VoteButtons
					ideaId={idea.id}
					initialUpvotesCount={idea.upvotesCount}
					initialDownvotesCount={idea.downvotesCount}
					initialUserVote={idea.userVote}
					onVoteUpdate={handleVoteUpdate}
					orientation="horizontal"
				/>
				<span className="text-muted-foreground bg-muted/60 hover:bg-muted flex cursor-pointer flex-row items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-150">
					<MessageSquareMore className="h-3.5 w-3.5" />
					<span className="font-mono">{displayCommentsCount}</span>
				</span>
				<ShareButton
					idea={idea}
					size={null}
					showLabel={true}
					variant="ghost"
					className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground h-auto cursor-pointer gap-1.5 rounded-full px-4 py-2 text-xs transition-colors duration-150"
				/>
				{isOwner && (
					<Link
						href={`/idea/${idea.id}/edit`}
						className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-150"
					>
						<Pencil className="h-3.5 w-3.5" />
						<span>Edit</span>
					</Link>
				)}
			</div>
		</IdeaHeroCard>
	);
}
