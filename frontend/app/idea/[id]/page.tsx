"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import VoteButtons from "@/components/VoteButtons";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import ValidationSignals from "@/components/ValidationSignals";
import IdeaWaitlist from "@/components/IdeaWaitlist";
import Image from "next/image";
import {
	HiArrowLeft,
	HiPencilSquare,
	HiArrowTopRightOnSquare,
} from "react-icons/hi2";

export default function IdeaDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const [idea, setIdea] = useState<Idea | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (params.id) {
			loadIdea();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id]);

	const loadIdea = async () => {
		try {
			setLoading(true);
			const data = await ideasApi.getIdeaById(params.id as string);
			console.log("Loaded idea:", data);
			setIdea(data);
		} catch (error) {
			console.error("Failed to load idea:", error);
			router.push("/");
		} finally {
			setLoading(false);
		}
	};

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

	const handleVoteUpdate = (
		upvotesCount: number,
		downvotesCount: number,
		userVote: "upvote" | "downvote" | null
	) => {
		if (idea) {
			setIdea({
				...idea,
				upvotesCount,
				downvotesCount,
				userVote,
			});
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (!idea) {
		return null;
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
			{/* Back Button */}
			<Link
				href={`/home`}
				className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
			>
				<HiArrowLeft className="h-4 w-4" />
				<span>HOME</span>
			</Link>

			{/* Main Content Card */}
			<article className="bg-card border-border/50 shadow-card rounded-xl border p-6 sm:p-8">
				{/* Header */}
				<header className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 flex-1 flex-col gap-4">
						{/* Status badges and share button row on mobile */}
						<div className="flex items-start justify-between gap-3">
							<div className="flex flex-wrap items-center gap-3">
								<span
									className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeStyles(idea.status)}`}
								>
									{formatStatus(idea.status)}
								</span>
								{idea.launchedLink && (
									<Link
										href={idea.launchedLink}
										target="_blank"
										rel="noopener noreferrer"
										className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${getStatusBadgeStyles("LAUNCHED")} hover:opacity-80`}
									>
										Visit
										<HiArrowTopRightOnSquare className="h-3.5 w-3.5" />
									</Link>
								)}
							</div>
							{/* Share button - visible only on mobile */}
							<div className="flex items-center gap-2 sm:hidden">
								<ShareButton idea={idea} size="icon" showLabel={false} />
								{user && user.id === idea.userId && (
									<Link
										href={`/idea/${idea.id}/edit`}
										className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
										title="Edit idea"
									>
										<HiPencilSquare className="h-5 w-5" />
									</Link>
								)}
							</div>
						</div>
						<h1 className="text-foreground text-2xl leading-tight font-bold sm:text-3xl">
							{idea.heading}
						</h1>
						<p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
							{idea.description}
						</p>
						<div className="text-muted-foreground flex items-center gap-3 text-sm">
							<Link
								href={`/${idea.user.username}`}
								className="hover:text-foreground flex items-center gap-2 transition-colors"
							>
								{idea.user.profilePicture ? (
									<Image
										src={idea.user.profilePicture}
										alt={idea.user.username}
										className="ring-border h-7 w-7 rounded-full ring-2"
										width={28}
										height={28}
									/>
								) : (
									<div className="bg-muted text-foreground ring-border flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ring-2">
										{idea.user.username.charAt(0).toUpperCase()}
									</div>
								)}
								<span className="font-medium">{idea.user.username}</span>
							</Link>
							<span className="text-border">·</span>
							<span>
								{formatDistanceToNow(new Date(idea.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>
						{/* Vote buttons - horizontal on mobile */}
						<div className="flex justify-center sm:hidden">
							<VoteButtons
								ideaId={idea.id}
								initialUpvotesCount={idea.upvotesCount}
								initialDownvotesCount={idea.downvotesCount}
								initialUserVote={idea.userVote}
								onVoteUpdate={handleVoteUpdate}
								orientation="horizontal"
							/>
						</div>
					</div>

					{/* Actions Column - visible only on desktop */}
					<div className="hidden flex-col items-end gap-2 sm:flex">
						<div className="flex items-center gap-2">
							<ShareButton idea={idea} size="icon" showLabel={false} />
							{user && user.id === idea.userId && (
								<Link
									href={`/idea/${idea.id}/edit`}
									className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
									title="Edit idea"
								>
									<HiPencilSquare className="h-5 w-5" />
								</Link>
							)}
						</div>
						<VoteButtons
							ideaId={idea.id}
							initialUpvotesCount={idea.upvotesCount}
							initialDownvotesCount={idea.downvotesCount}
							initialUserVote={idea.userVote}
							onVoteUpdate={handleVoteUpdate}
						/>
					</div>
				</header>

				{/* Validation Signals */}
				<section className="mt-8">
					<ValidationSignals ideaId={idea.id} />
				</section>

				{/* Idea Waitlist */}
				<section className="mt-4">
					<IdeaWaitlist ideaId={idea.id} ideaOwnerId={idea.userId} />
				</section>

				{/* Comments Section */}
				<section className="border-border/50 mt-8 border-t pt-8">
					<CommentSection
						ideaId={idea.id}
						initialCommentsCount={idea.commentsCount}
						ideaOwnerId={idea.userId}
					/>
				</section>
			</article>
		</div>
	);
}
