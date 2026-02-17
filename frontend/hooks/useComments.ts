import { useState, useEffect, useCallback } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { commentsApi, Comment } from "@/lib/api/comments";
import { CommentCategory } from "@/types";
import { getErrorMessage } from "@/lib/errors";

export function useComments(ideaId: string, initialCommentsCount: number) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalComments, setTotalComments] = useState(initialCommentsCount);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

	const updateTotalComments = useCallback(
		(updater: (prev: number) => number) => {
			setTotalComments(updater);
		},
		[]
	);

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

			setHasMore(page < response.pagination.total_pages);
		} catch (error: unknown) {
			setError(getErrorMessage(error, "Failed to load comments"));
		} finally {
			setIsLoading(false);
		}
	}, [ideaId, page]);

	const handleLoadMore = useCallback(() => {
		if (!isLoading && hasMore) {
			setPage((prev) => prev + 1);
		}
	}, [isLoading, hasMore]);

	const sentinelRef = useInfiniteScroll(handleLoadMore, !isLoading && hasMore);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const createComment = async (
		content: string,
		category: CommentCategory
	) => {
		try {
			setIsSubmitting(true);
			setError(null);

			const newComment = await commentsApi.createComment(ideaId, {
				content,
				category,
			});

			setComments((prev) => [newComment, ...prev]);
			updateTotalComments((prev) => prev + 1);
			return true;
		} catch (error: unknown) {
			setError(getErrorMessage(error, "Failed to post comment"));
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	const submitReply = async (parentCommentId: string, content: string) => {
		if (!content.trim()) return false;

		try {
			setIsSubmitting(true);
			setError(null);

			await commentsApi.createComment(ideaId, {
				content,
				parentCommentId,
			});

			// Refresh comments to show new reply
			setPage(1);
			await fetchComments();
			updateTotalComments((prev) => prev + 1);
			return true;
		} catch (error: unknown) {
			setError(getErrorMessage(error, "Failed to post reply"));
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	const editComment = async (commentId: string, content: string) => {
		try {
			setError(null);
			const updatedComment = await commentsApi.updateComment(commentId, {
				content,
			});

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

			setComments((prev) => updateCommentInList(prev));
		} catch (error: unknown) {
			setError(getErrorMessage(error, "Failed to update comment"));
		}
	};

	const handleDeleteClick = (commentId: string) => {
		setCommentToDelete(commentId);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!commentToDelete) return;

		try {
			setError(null);
			await commentsApi.deleteComment(commentToDelete);

			setPage(1);
			await fetchComments();
			updateTotalComments((prev) => Math.max(0, prev - 1));
			setDeleteDialogOpen(false);
			setCommentToDelete(null);
		} catch (error: unknown) {
			setError(getErrorMessage(error, "Failed to delete comment"));
			setDeleteDialogOpen(false);
		}
	};

	return {
		comments,
		isLoading,
		isSubmitting,
		error,
		totalComments,
		page,
		hasMore,
		deleteDialogOpen,
		setDeleteDialogOpen,
		sentinelRef,
		createComment,
		submitReply,
		editComment,
		handleDeleteClick,
		confirmDelete,
	};
}
