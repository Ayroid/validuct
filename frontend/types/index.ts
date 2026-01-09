import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// ============================================================================
// Core Domain Types
// ============================================================================

export interface User {
	id: string;
	username: string;
	email: string;
	profilePicture: string | null;
	bio?: string | null;
	createdAt: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface IdeaStatus {
	VALIDATED: "VALIDATED";
	WIP: "WIP";
	LAUNCHED: "LAUNCHED";
	DRAFT: "DRAFT";
}

export interface Idea {
	id: string;
	userId: string;
	heading: string;
	description: string;
	status: keyof IdeaStatus;
	launchedLink: string | null;
	upvotesCount: number;
	downvotesCount: number;
	commentsCount: number;
	isPinned: boolean;
	createdAt: string;
	updatedAt: string;
	user: {
		username: string;
		profilePicture: string | null;
	};
	userVote?: "upvote" | "downvote" | null;
}

export type CommentCategory =
	| "PROBLEM_CLARITY"
	| "TARGET_USERS"
	| "WILLINGNESS_TO_PAY"
	| "TECHNICAL_FEASIBILITY"
	| "FEATURE_SUGGESTION"
	| "GENERAL";

export interface Comment {
	id: string;
	userId: string;
	content: string;
	category: CommentCategory;
	helpfulCount: number;
	createdAt: string;
	updatedAt: string;
	user: {
		username: string;
		profilePicture: string | null;
	};
	replies?: Comment[];
	isHelpful?: boolean;
}

export type SignalType =
	| "PROBLEM_REAL"
	| "WOULD_PAY"
	| "READY_TO_BUILD"
	| "NEEDS_CLARITY";

export interface IdeaSignals {
	counts: Record<SignalType, number>;
	userSignals: SignalType[];
	total: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
	message: string;
	status?: number;
	code?: string;
	data?: unknown;
}

export interface ErrorResponse {
	response?: {
		data?: {
			message?: string;
			error?: string;
		};
		status?: number;
	};
	message?: string;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	logout: () => void;
	isAuthenticated: boolean;
	backendToken: string | null;
}

export interface ExtendedJWT {
	id?: string;
	username?: string;
	email?: string;
	profilePicture?: string | null;
	bio?: string | null;
	createdAt?: string;
	backendToken?: string;
	provider?: string;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "danger";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	children: ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

// ============================================================================
// Feature Component Props Types
// ============================================================================

export interface IdeaCardProps {
	idea: Idea;
	onPinChange?: () => void;
	showPinButton?: boolean;
}

export interface CommentSectionProps {
	ideaId: string;
	initialCommentsCount?: number;
	ideaOwnerId?: string;
}

export interface CommentItemProps {
	comment: Comment;
	onReply?: (parentCommentId: string) => void;
	onEdit?: (commentId: string, content: string) => void;
	onDelete?: (commentId: string) => void;
	depth?: number;
	replyToCommentId?: string | null;
	replyContent?: string;
	setReplyContent?: (content: string) => void;
	handleSubmitReply?: (parentCommentId: string) => Promise<void>;
	isSubmitting?: boolean;
	setReplyToCommentId?: (commentId: string | null) => void;
	ideaOwnerId?: string;
}

export interface VoteButtonsProps {
	ideaId: string;
	initialUpvotesCount: number;
	initialDownvotesCount: number;
	initialUserVote?: "upvote" | "downvote" | null;
	onVoteUpdate?: (
		upvotesCount: number,
		downvotesCount: number,
		userVote: "upvote" | "downvote" | null
	) => void;
}

export interface PinButtonProps {
	ideaId: string;
	ideaUserId: string;
	initialIsPinned?: boolean;
	onPinChange?: () => void;
}

// ============================================================================
// Page Types
// ============================================================================
