"use client";

import { useState, useEffect, useCallback } from "react";
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
import { HiArrowTopRightOnSquare, HiArrowLeft } from "react-icons/hi2";
import { MessageSquareMore, Pencil } from "lucide-react";

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
				return "bg-zinc-200 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400";
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

	const handleCommentsCountChange = useCallback((count: number) => {
		setIdea((prev) => (prev ? { ...prev, commentsCount: count } : prev));
	}, []);

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
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => router.back()}
						className="text-foreground hover:bg-muted -ml-1 cursor-pointer rounded-full p-1 transition-colors"
					>
						<HiArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-foreground text-lg font-bold">Idea</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

		<div className="px-4 py-6 sm:px-6 flex flex-col gap-5">
			{/* Hero Card */}
			<article className="bg-card border-border/50 shadow-card overflow-hidden rounded-xl border">
				{/* Top Meta Row */}
				<div className="flex bg-muted/80 dark:bg-muted/30 items-center justify-between gap-3 px-6 py-3 ">
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
							<span className="font-medium hover:text-primary transition-colors">
								{idea.user.username}
							</span>
						</Link>
						<span className="text-muted-foreground/50">·</span>
						<span className="text-muted-foreground">
							{formatDistanceToNow(new Date(idea.createdAt), {
								addSuffix: false,
							}).replace(/^(about|over|almost) /, "")}
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
					</div>
				</div>

				{/* Separator */}
				<div className="border-border/40 border-t" />

				{/* Content */}
				<div className="px-6 py-6">
					<h2 className="text-foreground text-xl leading-tight font-bold sm:text-xl">
						{idea.heading}
					</h2>
					<p className="text-foreground mt-2 leading-relaxed whitespace-pre-wrap">
						{idea.description}
					</p>
				</div>

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
						<span className="font-mono">{idea.commentsCount}</span>
					</span>
					<ShareButton
						idea={idea}
						size={null}
						showLabel={true}
						variant="ghost"
						className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground h-auto cursor-pointer gap-1.5 rounded-full px-4 py-2 text-xs transition-colors duration-150"
					/>
					{user && user.id === idea.userId && (
						<Link
							href={`/idea/${idea.id}/edit`}
							className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-150"
						>
							<Pencil className="h-3.5 w-3.5" />
							<span>Edit</span>
						</Link>
					)}
				</div>
			</article>

			{/* Community Validation Section */}
			<section>
				{/* <h2 className="text-muted-foreground mb-5 text-xs font-semibold tracking-widest uppercase">
					Community Validation
				</h2> */}
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
			<section>
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
		</div>
	);
}
