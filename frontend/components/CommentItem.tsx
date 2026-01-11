"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { commentsApi } from "@/lib/api/comments";
import { Button } from "./ui/button";
import Image from "next/image";
import { CommentItemProps, CommentCategory } from "@/types";

const CATEGORY_LABELS: Record<
	CommentCategory,
	{ label: string; color: string }
> = {
	PROBLEM_CLARITY: {
		label: "Problem",
		color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	},
	TARGET_USERS: {
		label: "Users",
		color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	},
	WILLINGNESS_TO_PAY: {
		label: "Pricing",
		color: "bg-green-500/10 text-green-600 dark:text-green-400",
	},
	TECHNICAL_FEASIBILITY: {
		label: "Tech",
		color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
	},
	FEATURE_SUGGESTION: {
		label: "Feature",
		color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
	},
	GENERAL: { label: "General", color: "bg-muted text-muted-foreground" },
};

export default function CommentItem({
	comment,
	onReply,
	onEdit,
	onDelete,
	depth = 0,
	replyToCommentId,
	replyContent,
	setReplyContent,
	handleSubmitReply,
	isSubmitting,
	setReplyToCommentId,
	ideaOwnerId,
}: CommentItemProps & { ideaOwnerId?: string }) {
	const { data: session } = useSession();
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState(comment.content);
	const [showReplies, setShowReplies] = useState(true);
	const [helpfulCount, setHelpfulCount] = useState(comment.helpfulCount || 0);
	const [isHelpful, setIsHelpful] = useState(comment.isHelpful || false);

	const isOwner = session?.user?.id === comment.userId;
	const isIdeaOwner = comment.userId === ideaOwnerId;
	const maxDepth = 5; // Limit nesting depth

	const handleToggleHelpful = async () => {
		if (!session) {
			router.push("/signin");
			return;
		}

		// Save previous state for rollback
		const prevIsHelpful = isHelpful;
		const prevHelpfulCount = helpfulCount;

		// Optimistically update UI
		const newIsHelpful = !isHelpful;
		const newHelpfulCount = newIsHelpful ? helpfulCount + 1 : helpfulCount - 1;

		setIsHelpful(newIsHelpful);
		setHelpfulCount(Math.max(0, newHelpfulCount));

		try {
			await commentsApi.toggleHelpful(comment.id);
		} catch {
			// Revert on error
			setIsHelpful(prevIsHelpful);
			setHelpfulCount(prevHelpfulCount);
		}
	};

	const handleEdit = () => {
		if (editedContent.trim() && editedContent !== comment.content) {
			onEdit?.(comment.id, editedContent);
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setEditedContent(comment.content);
		setIsEditing(false);
	};

	return (
		<div
			className={`${
				depth > 0 ? "mt-3 ml-6" : "mt-6 first:mt-0"
			} border-l pl-4 ${
				isIdeaOwner ? "border-primary/40" : "border-border/50"
			}`}
		>
			<div className="flex items-start gap-3">
				{/* User Avatar */}
				<div className="relative shrink-0">
					{comment.user.profilePicture ? (
						<Image
							src={comment.user.profilePicture}
							alt={comment.user.username}
							width={32}
							height={32}
							className="rounded-full"
						/>
					) : (
						<div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
							{comment.user.username[0].toUpperCase()}
						</div>
					)}
					{isIdeaOwner && (
						<div className="bg-primary border-background absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2" />
					)}
				</div>

				{/* Comment Content */}
				<div className="min-w-0 flex-1">
					{/* User Info and Timestamp */}
					<div className="mb-1 flex flex-wrap items-center gap-2">
						<span className="text-foreground text-sm font-semibold">
							{comment.user.username}
						</span>
						{isIdeaOwner && (
							<span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
								Author
							</span>
						)}
						{comment.category && comment.category !== "GENERAL" && (
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_LABELS[comment.category]?.color || ""}`}
							>
								{CATEGORY_LABELS[comment.category]?.label || comment.category}
							</span>
						)}
						<span className="text-muted-foreground text-xs">
							{formatDistanceToNow(new Date(comment.createdAt), {
								addSuffix: true,
							})}
						</span>
						{comment.updatedAt !== comment.createdAt && (
							<span className="text-muted-foreground/70 text-xs">(edited)</span>
						)}
					</div>

					{/* Comment Text or Edit Form */}
					{isEditing ? (
						<div className="mt-2">
							<textarea
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
								className="bg-background focus:ring-ring w-full resize-none rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
								rows={3}
								autoFocus
							/>
							<div className="mt-2 flex gap-2">
								<Button onClick={handleEdit} size="sm">
									Save
								</Button>
								<Button onClick={handleCancelEdit} variant="outline" size="sm">
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<p className="text-muted-foreground text-sm wrap-break-word whitespace-pre-wrap">
							{comment.content}
						</p>
					)}

					{/* Action Buttons */}
					{!isEditing && (
						<div className="mt-2 flex items-center gap-3">
							{/* Helpful Button */}
							<button
								onClick={handleToggleHelpful}
								className={`flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors ${
									isHelpful
										? "text-green-600 dark:text-green-400"
										: "text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
								}`}
							>
								<svg
									className="h-3.5 w-3.5"
									fill={isHelpful ? "currentColor" : "none"}
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
									/>
								</svg>
								<span>
									Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ""}
								</span>
							</button>

							{session && depth < maxDepth && (
								<button
									onClick={() => onReply?.(comment.id)}
									className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium transition-colors"
								>
									Reply
								</button>
							)}
							{isOwner && (
								<>
									<button
										onClick={() => setIsEditing(true)}
										className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium transition-colors"
									>
										Edit
									</button>
									<button
										onClick={() => {
											onDelete?.(comment.id);
										}}
										className="text-muted-foreground hover:text-destructive cursor-pointer text-xs font-medium transition-colors"
									>
										Delete
									</button>
								</>
							)}
						</div>
					)}

					{/* Nested Replies */}
					{comment.replies && comment.replies.length > 0 && (
						<div className="mt-3">
							{comment.replies.length > 0 && (
								<button
									onClick={() => setShowReplies(!showReplies)}
									className="text-foreground hover:text-foreground/80 mb-2 cursor-pointer text-xs font-medium"
								>
									{showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
									{comment.replies.length === 1 ? "reply" : "replies"}
								</button>
							)}
							{showReplies &&
								comment.replies.map((reply) => (
									<CommentItem
										key={reply.id}
										comment={reply}
										onReply={onReply}
										onEdit={onEdit}
										onDelete={onDelete}
										depth={depth + 1}
										replyToCommentId={replyToCommentId}
										replyContent={replyContent}
										setReplyContent={setReplyContent}
										handleSubmitReply={handleSubmitReply}
										isSubmitting={isSubmitting}
										setReplyToCommentId={setReplyToCommentId}
										ideaOwnerId={ideaOwnerId}
									/>
								))}
						</div>
					)}

					{/* Reply Form */}
					{replyToCommentId === comment.id && (
						<div className="mt-3">
							<textarea
								value={replyContent}
								onChange={(e) => setReplyContent?.(e.target.value)}
								placeholder="Write a reply..."
								className="bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary border-border w-full resize-none rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
								rows={2}
								autoFocus
							/>
							<div className="mt-2 flex gap-2">
								<Button
									onClick={() => handleSubmitReply?.(comment.id)}
									size="sm"
									disabled={isSubmitting || !replyContent?.trim()}
								>
									{isSubmitting ? "Posting..." : "Reply"}
								</Button>
								<Button
									onClick={() => {
										setReplyToCommentId?.(null);
										setReplyContent?.("");
									}}
									variant="outline"
									size="sm"
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
