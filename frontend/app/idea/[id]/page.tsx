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
import Image from "next/image";

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
			<div className="bg-background flex min-h-screen items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (!idea) {
		return null;
	}

	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto max-w-5xl px-4 py-8">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="text-muted-foreground hover:text-foreground mb-8 inline-flex cursor-pointer items-center gap-1 text-sm"
				>
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
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					<span>BACK</span>
				</button>

				{/* Main Content */}
				<div className="bg-card border p-8">
					{/* Header */}
					<div className="mb-6 flex min-h-40 items-start justify-between">
						<div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
							<div className="mb-2 items-center gap-3 pr-2">
								<h1 className="text-foreground mb-4 text-3xl font-bold wrap-break-word">
									{idea.heading}
								</h1>
								<p className="text-muted-foreground leading-relaxed wrap-break-word whitespace-pre-wrap">
									{idea.description}
								</p>
							</div>
							<div className="text-muted-foreground flex items-center gap-3 text-sm">
								<Link
									href={`/${idea.user.username}`}
									className="hover:text-primary flex items-center gap-2 transition-colors"
								>
									{idea.user.profilePicture ? (
										<Image
											src={idea.user.profilePicture}
											alt={idea.user.username}
											className="h-8 w-8 rounded-full"
											width={32}
											height={32}
										/>
									) : (
										<div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full font-semibold">
											{idea.user.username.charAt(0).toUpperCase()}
										</div>
									)}
									<span className="font-medium">{idea.user.username}</span>
								</Link>
								<span>•</span>
								<span>
									{formatDistanceToNow(new Date(idea.createdAt), {
										addSuffix: true,
									})}
								</span>
							</div>
						</div>
						<div className="flex flex-col items-end justify-between gap-3 self-stretch">
							<div className="flex flex-col items-end gap-3">
								<div className="flex items-center gap-3">
									<span
										className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
											idea.status
										)}`}
									>
										{formatStatus(idea.status)}
									</span>
									{/* Share button - visible to everyone */}
									<ShareButton idea={idea} size="icon" showLabel={false} />
									{/* Edit/Delete buttons - only visible to owner */}
									{user && user.id === idea.userId && (
										<div className="flex items-center gap-2">
											<Link
												href={`/idea/${idea.id}/edit`}
												className="hover:bg-muted text-primary rounded-lg p-2 transition-colors"
												title="Edit idea"
											>
												<svg
													className="h-5 w-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</Link>
										</div>
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
							{idea.launchedLink && (
								<Link
									href={idea.launchedLink}
									target="_blank"
									rel="noopener noreferrer"
								>
									<div
										className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
											"LAUNCHED"
										)}`}
									>
										Visit
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
									</div>
								</Link>
							)}
						</div>
					</div>

					{/* Comments Section */}
					<div className="mt-4 border-t">
						<CommentSection
							ideaId={idea.id}
							initialCommentsCount={idea.commentsCount}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
