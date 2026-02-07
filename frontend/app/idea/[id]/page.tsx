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

	const handleCommentsCountChange = (count: number) => {
		if (idea) {
			setIdea({ ...idea, commentsCount: count });
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
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Back Link */}
			<Link
				href="/home"
				className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
			>
				<HiArrowLeft className="h-3.5 w-3.5" />
				<span>Home</span>
			</Link>

			{/* Hero Card */}
			<article className="bg-card border-border/50 shadow-card overflow-hidden rounded-xl border">
				{/* Top Meta Row */}
				<div className="flex items-center justify-between gap-3 px-6 py-3">
					<div className="flex min-w-0 items-center gap-2 text-xs">
						<Link
							href={`/${idea.user.username}`}
							className="hover:text-foreground flex shrink-0 items-center gap-1.5 transition-colors"
						>
							{idea.user.profilePicture ? (
								<Image
									src={idea.user.profilePicture}
									alt={idea.user.username}
									width={22}
									height={22}
									className="rounded-full"
								/>
							) : (
								<div className="bg-muted text-foreground flex h-5.5 w-5.5 items-center justify-center rounded-full text-[10px] font-semibold">
									{idea.user.username.charAt(0).toUpperCase()}
								</div>
							)}
							<span className="font-medium hover:underline">
								{idea.user.username}
							</span>
						</Link>
						<span className="text-muted-foreground/50">·</span>
						<span className="text-muted-foreground">
							{formatDistanceToNow(new Date(idea.createdAt), {
								addSuffix: true,
							})}
						</span>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<span
							className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyles(idea.status)}`}
						>
							{formatStatus(idea.status)}
						</span>
						{idea.launchedLink && (
							<Link
								href={idea.launchedLink}
								target="_blank"
								rel="noopener noreferrer"
								className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${getStatusBadgeStyles("LAUNCHED")} hover:opacity-80`}
							>
								Visit
								<HiArrowTopRightOnSquare className="h-3 w-3" />
							</Link>
						)}
						<ShareButton idea={idea} size={null} showLabel={false} variant="ghost" className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-1.5 h-auto cursor-pointer transition-colors" />
						{user && user.id === idea.userId && (
							<Link
								href={`/idea/${idea.id}/edit`}
								className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
								title="Edit idea"
							>
								<HiPencilSquare className="h-4 w-4" />
							</Link>
						)}
					</div>
				</div>

				{/* Separator */}
				<div className="border-border/40 border-t" />

				{/* Content */}
				<div className="px-6 py-6">
					<h1 className="text-foreground text-2xl leading-tight font-bold sm:text-3xl">
						{idea.heading}
					</h1>
					<p className="text-foreground mt-4 leading-relaxed whitespace-pre-wrap">
						{idea.description}
					</p>
				</div>

				{/* Separator */}
				<div className="border-border/40 border-t" />

				{/* Bottom Action Bar */}
				<div className="flex items-center gap-4 px-6 py-2.5 text-xs">
					<VoteButtons
						ideaId={idea.id}
						initialUpvotesCount={idea.upvotesCount}
						initialDownvotesCount={idea.downvotesCount}
						initialUserVote={idea.userVote}
						onVoteUpdate={handleVoteUpdate}
						orientation="horizontal"
					/>
					<span className="text-border">·</span>
					<span className="text-muted-foreground flex items-center gap-1.5">
						<svg
							className="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
						</svg>
						<span className="font-mono">{idea.commentsCount}</span>
					</span>
				</div>
			</article>

			{/* Community Validation Section */}
			<section className="mt-10">
				<h2 className="text-muted-foreground mb-5 text-xs font-semibold tracking-widest uppercase">
					Community Validation
				</h2>
				<div className="bg-card border-border/50 shadow-card rounded-xl border">
					<div className="p-5">
						<ValidationSignals ideaId={idea.id} bare />
					</div>
					<div className="border-border/40 border-t" />
					<div className="p-5">
						<IdeaWaitlist ideaId={idea.id} ideaOwnerId={idea.userId} bare />
					</div>
				</div>
			</section>

			{/* Comments Section */}
			<section className="mt-10">
				<div className="bg-card border-border/50 shadow-card rounded-xl border p-5 sm:p-6">
					<CommentSection
						ideaId={idea.id}
						initialCommentsCount={idea.commentsCount}
						ideaOwnerId={idea.userId}
						onCommentsCountChange={handleCommentsCountChange}
					/>
				</div>
			</section>
		</div>
	);
}
