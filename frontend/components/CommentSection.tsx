"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { commentsApi, Comment } from "@/lib/api/comments";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CommentSectionProps, ErrorResponse } from "@/types";
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

export default function CommentSection({
	ideaId,
	initialCommentsCount = 0,
}: CommentSectionProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newCommentContent, setNewCommentContent] = useState("");
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
			router.push("/login");
			return;
		}

		if (!newCommentContent.trim()) return;

		try {
			setIsSubmitting(true);
			setError(null);

			const newComment = await commentsApi.createComment(ideaId, {
				content: newCommentContent,
			});

			setComments([newComment, ...comments]);
			setNewCommentContent("");
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
			router.push("/login");
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
			<h2 className="text-xl font-bold mb-6">
				{totalComments} Comment{totalComments !== 1 ? "s" : ""}
			</h2>

			{error && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
					{error}
				</div>
			)}

			{/* New Comment Form */}
			{session ? (
				<form onSubmit={handleCreateComment} className="mb-8">
					<textarea
						value={newCommentContent}
						onChange={(e) => setNewCommentContent(e.target.value)}
						placeholder="Share your thoughts..."
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
						rows={3}
						disabled={isSubmitting}
					/>
					<div className="flex justify-end mt-2">
						<Button
							type="submit"
							disabled={isSubmitting || !newCommentContent.trim()}
						>
							{isSubmitting ? "Posting..." : "Post Comment"}
						</Button>
					</div>
				</form>
			) : (
				<div className="mb-8 p-4 bg-background border border-gray-200 rounded-lg text-center">
					<p className="text-gray-600 mb-2">Sign in to join the conversation</p>
					<Button onClick={() => router.push("/login")} size="sm">
						Sign In
					</Button>
				</div>
			)}

			{/* Comments List */}
			{isLoading && page === 1 ? (
				<div className="text-center py-8">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
					<p className="mt-2 text-gray-600">Loading comments...</p>
				</div>
			) : comments.length === 0 ? (
				<div className="text-center py-2 text-gray-500">
					<p>No comments yet. Be the first to share your thoughts!</p>
				</div>
			) : (
				<div className="space-y-4">
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
