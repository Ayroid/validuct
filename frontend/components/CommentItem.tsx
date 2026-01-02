"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/lib/api/comments";
import { Button } from "./ui/button";
import Image from "next/image";
import { CommentItemProps } from "@/types";

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
}: CommentItemProps) {
	const { data: session } = useSession();
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState(comment.content);
	const [showReplies, setShowReplies] = useState(true);

	const isOwner = session?.user?.id === comment.userId;
	const maxDepth = 5; // Limit nesting depth

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
				depth > 0 ? "mt-4 ml-8" : "mt-4"
			} border-border border-l-2 pl-4`}
		>
			<div className="flex items-start gap-3">
				{/* User Avatar */}
				<div className="shrink-0">
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
				</div>

				{/* Comment Content */}
				<div className="min-w-0 flex-1">
					{/* User Info and Timestamp */}
					<div className="mb-1 flex items-center gap-2">
						<span className="text-foreground text-sm font-semibold">
							{comment.user.username}
						</span>
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
							{session && depth < maxDepth && (
								<button
									onClick={() => onReply?.(comment.id)}
									className="text-muted-foreground hover:text-muted-foreground/80 cursor-pointer text-xs font-medium transition-colors"
								>
									Reply
								</button>
							)}
							{isOwner && (
								<>
									<button
										onClick={() => setIsEditing(true)}
										className="text-muted-foreground hover:text-muted-foreground/80 cursor-pointer text-xs font-medium transition-colors"
									>
										Edit
									</button>
									<button
										onClick={() => {
											onDelete?.(comment.id);
										}}
										className="text-muted-foreground hover:text-muted-foreground/80 cursor-pointer text-xs font-medium transition-colors"
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
								className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
