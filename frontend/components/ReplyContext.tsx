"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ReplyContextValue {
	replyToCommentId: string | null;
	replyContent: string;
	isSubmitting: boolean;
	setReplyContent: (content: string) => void;
	startReply: (commentId: string) => void;
	cancelReply: () => void;
	submitReply: (parentCommentId: string) => Promise<void>;
}

const ReplyContext = createContext<ReplyContextValue | null>(null);

export function useReply() {
	const ctx = useContext(ReplyContext);
	if (!ctx) throw new Error("useReply must be used within ReplyProvider");
	return ctx;
}

export function ReplyProvider({
	children,
	isSubmitting,
	onSubmitReply,
	onStartReply,
}: {
	children: React.ReactNode;
	isSubmitting: boolean;
	onSubmitReply: (parentCommentId: string, content: string) => Promise<boolean>;
	onStartReply: (parentCommentId: string) => boolean;
}) {
	const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState("");

	const startReply = useCallback(
		(commentId: string) => {
			if (onStartReply(commentId)) {
				setReplyToCommentId(commentId);
				setReplyContent("");
			}
		},
		[onStartReply]
	);

	const cancelReply = useCallback(() => {
		setReplyToCommentId(null);
		setReplyContent("");
	}, []);

	const submitReply = useCallback(
		async (parentCommentId: string) => {
			const success = await onSubmitReply(parentCommentId, replyContent);
			if (success) {
				setReplyToCommentId(null);
				setReplyContent("");
			}
		},
		[onSubmitReply, replyContent]
	);

	return (
		<ReplyContext.Provider
			value={{
				replyToCommentId,
				replyContent,
				isSubmitting,
				setReplyContent,
				startReply,
				cancelReply,
				submitReply,
			}}
		>
			{children}
		</ReplyContext.Provider>
	);
}
