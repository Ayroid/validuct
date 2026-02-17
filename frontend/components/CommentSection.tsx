"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useComments } from "@/hooks/useComments";
import { ReplyProvider } from "./ReplyContext";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { CommentSectionProps, CommentCategory } from "@/types";
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
import { COMMENT_CATEGORY_CONFIG } from "@/lib/config";

export default function CommentSection({
	ideaId,
	initialCommentsCount = 0,
	ideaOwnerId,
	onCommentsCountChange,
}: CommentSectionProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const [newCommentContent, setNewCommentContent] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<CommentCategory>("GENERAL");

	const {
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
	} = useComments(ideaId, initialCommentsCount);

	useEffect(() => {
		onCommentsCountChange?.(totalComments);
	}, [totalComments, onCommentsCountChange]);

	const handleCreateComment = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!session) {
			router.push("/signin");
			return;
		}

		if (!newCommentContent.trim()) return;

		const success = await createComment(newCommentContent, selectedCategory);
		if (success) {
			setNewCommentContent("");
			setSelectedCategory("GENERAL");
		}
	};

	const handleStartReply = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_commentId: string): boolean => {
			if (!session) {
				router.push("/signin");
				return false;
			}
			return true;
		},
		[session, router]
	);

	const handleSubmitReply = useCallback(
		async (parentCommentId: string, content: string): Promise<boolean> => {
			return await submitReply(parentCommentId, content);
		},
		[submitReply]
	);

	return (
		<div>
			<h2 className="text-foreground mb-2 text-lg font-bold">
				Discussion
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
							{(Object.keys(COMMENT_CATEGORY_CONFIG) as CommentCategory[]).map(
								(category) => (
									<button
										key={category}
										type="button"
										onClick={() => setSelectedCategory(category)}
										className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-all ${
											selectedCategory === category
												? "border-primary bg-primary/10 text-primary"
												: "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
										}`}
									>
										<span className="hidden sm:inline">
											{COMMENT_CATEGORY_CONFIG[category].label}
										</span>
										<span className="sm:hidden">
											{COMMENT_CATEGORY_CONFIG[category].shortLabel}
										</span>
									</button>
								)
							)}
						</div>
					</div>

					<textarea
						value={newCommentContent}
						onChange={(e) => setNewCommentContent(e.target.value)}
						placeholder={COMMENT_CATEGORY_CONFIG[selectedCategory].placeholder}
						className="bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary border-border w-full resize-none rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
						rows={3}
						disabled={isSubmitting}
					/>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-muted-foreground text-xs">
							Category:{" "}
							<span className="text-foreground font-medium">
								{COMMENT_CATEGORY_CONFIG[selectedCategory].label}
							</span>
						</span>
						<Button
							type="submit"
							disabled={isSubmitting || !newCommentContent.trim()}
							className="cursor-pointer transition-colors"
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
					<Button onClick={() => router.push("/signin")} size="sm" className="cursor-pointer transition-colors">
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
				<ReplyProvider
					isSubmitting={isSubmitting}
					onSubmitReply={handleSubmitReply}
					onStartReply={handleStartReply}
				>
					<div className="space-y-2">
						{comments.map((comment) => (
							<CommentItem
								key={comment.id}
								comment={comment}
								onEdit={editComment}
								onDelete={handleDeleteClick}
								ideaOwnerId={ideaOwnerId}
							/>
						))}

						{/* Infinite Scroll Observer Target */}
						{hasMore && (
							<div ref={sentinelRef} className="flex justify-center pt-6">
								{isLoading && (
									<div className="border-primary inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
								)}
							</div>
						)}
					</div>
				</ReplyProvider>
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
							onClick={confirmDelete}
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
