"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { commentsApi, Comment } from "@/lib/api/comments";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CommentSectionProps, ErrorResponse, CommentCategory } from "@/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORY_CONFIG: Record<
	CommentCategory,
	{ label: string; placeholder: string; shortLabel: string }
> = {
	PROBLEM_CLARITY: {
		label: "Problem clarity",
		shortLabel: "Problem",
		placeholder: "Is the problem well-defined? Any gaps in understanding?",
	},
	TARGET_USERS: {
		label: "Target users",
		shortLabel: "Users",
		placeholder: "Who would use this? Are the target users clear?",
	},
	WILLINGNESS_TO_PAY: {
		label: "Willingness to pay",
		shortLabel: "Pricing",
		placeholder: "Would people pay for this? At what price point?",
	},
	TECHNICAL_FEASIBILITY: {
		label: "Technical feasibility",
		shortLabel: "Tech",
		placeholder: "Is this technically achievable? Any blockers?",
	},
	FEATURE_SUGGESTION: {
		label: "Feature suggestion",
		shortLabel: "Feature",
		placeholder: "What features would make this better?",
	},
	GENERAL: {
		label: "General feedback",
		shortLabel: "General",
		placeholder: "Share your thoughts on this idea...",
	},
};

export default function CommentSection({
	ideaId,
	initialCommentsCount = 0,
	ideaOwnerId,
}: CommentSectionProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newCommentContent, setNewCommentContent] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<CommentCategory>("GENERAL");
	const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalComments, setTotalComments] = useState(initialCommentsCount);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

	// Fetch comments
	const fetchComments = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await commentsApi.getIdeaComments({
				ideaId,
				page,
				limit: 20,
			});

			if (page === 1) {
				setComments(response.comments);
			} else {
				setComments((prev) => [...prev, ...response.comments]);
			}

			setTotalComments(response.pagination.total);
			setHasMore(page < response.pagination.total_pages);
		} catch (error: unknown) {
			const err = error as ErrorResponse;
			setError(err.response?.data?.message || "Failed to load comments");
		} finally {
			setIsLoading(false);
		}
	}, [ideaId, page]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const handleCreateComment = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!session) {
			router.push("/signin");
			return;
		}

		if (!newCommentContent.trim()) return;

		try {
			setIsSubmitting(true);
			setError(null);

			const newComment = await commentsApi.createComment(ideaId, {
				content: newCommentContent,
				category: selectedCategory,
			});

			setComments([newComment, ...comments]);
			setNewCommentContent("");
			setSelectedCategory("GENERAL");
			setTotalComments((prev) => prev + 1);
		} catch (error: unknown) {
			const err = error as ErrorResponse;
			setError(err.response?.data?.message || "Failed to post comment");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReply = (parentCommentId: string) => {
		if (!session) {
			router.push("/signin");
			return;
		}
		setReplyToCommentId(parentCommentId);
		setReplyContent("");
	};

	const handleSubmitReply = async (parentCommentId: string) => {
		if (!replyContent.trim()) return;

		try {
			setIsSubmitting(true);
			setError(null);

			await commentsApi.createComment(ideaId, {
				content: replyContent,
				parentCommentId,
			});

			// Refresh comments to show new reply
			setPage(1);
			await fetchComments();

			setReplyToCommentId(null);
			setReplyContent("");
			setTotalComments((prev) => prev + 1);
		} catch (error: unknown) {
			const err = error as ErrorResponse;
			setError(err.response?.data?.message || "Failed to post reply");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = async (commentId: string, content: string) => {
		try {
			setError(null);
			const updatedComment = await commentsApi.updateComment(commentId, {
				content,
			});

			// Update comment in the list
			const updateCommentInList = (commentsList: Comment[]): Comment[] => {
				return commentsList.map((comment) => {
					if (comment.id === commentId) {
						return updatedComment;
					}
					if (comment.replies) {
						return {
							...comment,
							replies: updateCommentInList(comment.replies),
						};
					}
					return comment;
				});
			};

			setComments(updateCommentInList(comments));
		} catch (error: unknown) {
			const err = error as ErrorResponse;
			setError(err.response?.data?.message || "Failed to update comment");
		}
	};

	const handleDeleteClick = (commentId: string) => {
		setCommentToDelete(commentId);
		setDeleteDialogOpen(true);
	};

	const handleDelete = async () => {
		if (!commentToDelete) return;

		try {
			setError(null);
			await commentsApi.deleteComment(commentToDelete);

			// Refresh comments
			setPage(1);
			await fetchComments();
			setDeleteDialogOpen(false);
			setCommentToDelete(null);
		} catch (error: unknown) {
			const err = error as ErrorResponse;
			setError(err.response?.data?.message || "Failed to delete comment");
			setDeleteDialogOpen(false);
		}
	};

	const handleLoadMore = () => {
		setPage((prev) => prev + 1);
	};

	return (
		<div className="mt-8">
			<h2 className="text-foreground mb-6 text-xl font-bold">
				Discussion{" "}
				<span className="text-muted-foreground text-base font-normal">
					({totalComments})
				</span>
			</h2>

			{error && (
				<div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 text-sm">
					{error}
				</div>
			)}

			{/* New Comment Form */}
			{session ? (
				<form onSubmit={handleCreateComment} className="mb-8">
					{/* Category Selection */}
					<div className="mb-3">
						<p className="text-muted-foreground mb-2 text-sm">
							What kind of feedback are you giving?
						</p>
						<div className="flex flex-wrap gap-2">
							{(Object.keys(CATEGORY_CONFIG) as CommentCategory[]).map(
								(category) => (
									<button
										key={category}
										type="button"
										onClick={() => setSelectedCategory(category)}
										className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
											selectedCategory === category
												? "border-primary bg-primary/10 text-primary"
												: "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
										}`}
									>
										<span className="hidden sm:inline">
											{CATEGORY_CONFIG[category].label}
										</span>
										<span className="sm:hidden">
											{CATEGORY_CONFIG[category].shortLabel}
										</span>
									</button>
								)
							)}
						</div>
					</div>

					<textarea
						value={newCommentContent}
						onChange={(e) => setNewCommentContent(e.target.value)}
						placeholder={CATEGORY_CONFIG[selectedCategory].placeholder}
						className="bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary border-border w-full resize-none rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
						rows={3}
						disabled={isSubmitting}
					/>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-muted-foreground text-xs">
							Category:{" "}
							<span className="text-foreground font-medium">
								{CATEGORY_CONFIG[selectedCategory].label}
							</span>
						</span>
						<Button
							type="submit"
							disabled={isSubmitting || !newCommentContent.trim()}
						>
							{isSubmitting ? "Posting..." : "Post Comment"}
						</Button>
					</div>
				</form>
			) : (
				<div className="bg-card border-border mb-8 rounded-lg border p-4 text-center">
					<p className="text-muted-foreground mb-2">
						Sign in to join the conversation
					</p>
					<Button onClick={() => router.push("/signin")} size="sm">
						Sign In
					</Button>
				</div>
			)}

			{/* Comments List */}
			{isLoading && page === 1 ? (
				<div className="py-8 text-center">
					<div className="border-primary inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<p className="text-muted-foreground mt-2">Loading comments...</p>
				</div>
			) : comments.length === 0 ? (
				<div className="text-muted-foreground py-4 text-center">
					<p>No comments yet. Be the first to share your validation!</p>
				</div>
			) : (
				<div className="space-y-2">
					{comments.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							onReply={handleReply}
							onEdit={handleEdit}
							onDelete={handleDeleteClick}
							replyToCommentId={replyToCommentId}
							replyContent={replyContent}
							setReplyContent={setReplyContent}
							handleSubmitReply={handleSubmitReply}
							isSubmitting={isSubmitting}
							setReplyToCommentId={setReplyToCommentId}
							ideaOwnerId={ideaOwnerId}
						/>
					))}

					{/* Load More Button */}
					{hasMore && (
						<div className="flex justify-center pt-6">
							<Button
								onClick={handleLoadMore}
								variant="outline"
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : "Load More Comments"}
							</Button>
						</div>
					)}
				</div>
			)}
			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							comment.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="cursor-pointer">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
