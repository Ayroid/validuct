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
	isAdmin?: boolean;
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

// ============================================================================
// Idea Waitlist Types
// ============================================================================

export interface IdeaWaitlistStats {
	count: number;
	accessToken: string | null;
	isOwner: boolean;
}

export interface IdeaWaitlistEntry {
	id: string;
	email: string;
	createdAt: string;
}

export interface IdeaWaitlistData {
	ideaId: string;
	ideaHeading: string;
	totalCount: number;
	entries: IdeaWaitlistEntry[];
	pagination: PaginationMeta;
}

export interface IdeaWaitlistExport {
	ideaId: string;
	ideaHeading: string;
	totalCount: number;
	entries: { email: string; createdAt: string }[];
}

// ============================================================================
// Validation Dashboard Types
// ============================================================================

export type SignalStrength = "STRONG" | "MIXED" | "WEAK" | "NONE" | "EARLY";

export type ValidationState =
	| "NEEDS_ACTION"
	| "READY_TO_BUILD"
	| "VALIDATED"
	| "NEUTRAL";

export type NextActionType =
	| "CLARIFY_PROBLEM"
	| "TEST_PRICING"
	| "GATHER_FEEDBACK"
	| "READY_TO_BUILD"
	| "ADD_FIRST_IDEA";

export type ActionPriority = "HIGH" | "MEDIUM" | "LOW";

export type ProfileSortMode =
	| "needs_action"
	| "ready_to_build"
	| "newest"
	| "oldest"
	| "all";

export interface SignalCategorySummary {
	signalType: SignalType;
	totalCount: number;
	ideasWithSignal: number;
	strength: SignalStrength;
}

export interface NextActionRecommendation {
	action: NextActionType;
	message: string;
	priority: ActionPriority;
	targetIdeaId?: string;
	targetIdeaHeading?: string;
}

export interface ValidationSummary {
	totalIdeas: number;
	problem: SignalCategorySummary;
	willingness: SignalCategorySummary;
	execution: SignalCategorySummary;
	clarity: SignalCategorySummary;
	nextAction: NextActionRecommendation;
	ideasByValidationState: {
		needsAction: number;
		readyToBuild: number;
		validated: number;
	};
}

export interface IdeaSignalCounts {
	problemReal: number;
	wouldPay: number;
	readyToBuild: number;
	needsClarity: number;
}

export interface IdeaWithSignals {
	id: string;
	userId: string;
	heading: string;
	description: string;
	status: keyof IdeaStatus;
	launchedLink: string | null;
	commentsCount: number;
	createdAt: string;
	updatedAt: string;
	user: {
		username: string;
		profilePicture: string | null;
	};
	signals: IdeaSignalCounts;
	validationState: ValidationState;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
	totalPages: number;
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
	onCommentsCountChange?: (count: number) => void;
}

export interface CommentItemProps {
	comment: Comment;
	onEdit?: (commentId: string, content: string) => void;
	onDelete?: (commentId: string) => void;
	depth?: number;
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

export interface ProfileIdeaCardProps {
	idea: IdeaWithSignals;
	showPinButton?: boolean;
	onPinChange?: () => void;
}

export interface ValidationSummaryCardProps {
	summary: ValidationSummary;
}

export interface BuilderSnapshotHeaderProps {
	profile: {
		user: {
			id: string;
			username: string;
			profilePicture?: string | null;
			bio?: string | null;
			createdAt: string;
		};
		ideasCount: number;
		pinnedIdeas: Idea[];
	};
	validationSummary: ValidationSummary | null;
	isOwnProfile: boolean;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = "UPVOTE" | "SIGNAL" | "COMMENT" | "REPLY" | "MILESTONE";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	priority: NotificationPriority;
	title: string;
	message: string;
	actionUrl: string | null;
	ideaId: string | null;
	commentId: string | null;
	triggeredById: string | null;
	read: boolean;
	readAt: string | null;
	createdAt: string;
	triggeredBy?: {
		id: string;
		username: string;
		profilePicture: string | null;
	} | null;
	idea?: {
		id: string;
		heading: string;
	} | null;
}

export interface NotificationPreferences {
	id: string;
	userId: string;
	emailFirstFeedback: boolean;
	emailDailySummary: boolean;
	emailSignals: boolean;
	emailComments: boolean;
	emailReplies: boolean;
	emailMilestones: boolean;
	inAppUpVotes: boolean;
	inAppUpSignals: boolean;
	inAppUpComments: boolean;
	inAppUpReplies: boolean;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// Idea Portfolio & Scorecard Types
// ============================================================================

export type ValidationHealthLevel = "green" | "amber" | "gray";

export interface ValidationHealthDots {
	problem: ValidationHealthLevel;
	pay: ValidationHealthLevel;
	buildable: ValidationHealthLevel;
}

export type ScorecardNextStepType =
	| "CLARIFY"
	| "TEST_PRICING"
	| "GATHER_SIGNALS"
	| "BUILD_WAITLIST"
	| "ADDRESS_FEEDBACK"
	| "READY";

export interface ScorecardNextStep {
	message: string;
	priority: "HIGH" | "MEDIUM" | "LOW";
	type: ScorecardNextStepType;
}

export interface PortfolioIdea {
	id: string;
	heading: string;
	status: keyof IdeaStatus;
	validationState: ValidationState;
	signals: IdeaSignalCounts;
	commentsCount: number;
	waitlistCount: number;
	healthDots: ValidationHealthDots;
	primaryGap: string;
	createdAt: string;
}

export interface IdeaPortfolio {
	ideas: PortfolioIdea[];
	totalIdeas: number;
}

export interface ScorecardComment {
	id: string;
	content: string;
	category: CommentCategory;
	helpfulCount: number;
	createdAt: string;
	user: {
		username: string;
		profilePicture: string | null;
	};
}

export interface CommentCategoryGroup {
	category: CommentCategory;
	count: number;
	comments: ScorecardComment[];
}

export interface IdeaScorecard {
	id: string;
	heading: string;
	description: string;
	status: keyof IdeaStatus;
	validationState: ValidationState;
	signals: IdeaSignalCounts;
	healthDots: ValidationHealthDots;
	commentsByCategory: CommentCategoryGroup[];
	topComments: ScorecardComment[];
	nextSteps: ScorecardNextStep[];
	waitlistCount: number;
	commentsCount: number;
	createdAt: string;
}


// ============================================================================
// Analytics Dashboard Types
// ============================================================================

export type ActivityRange = "24h" | "7d" | "30d" | "all";

export interface DailyActivity {
	date: string;
	signals: number;
	upvotes: number;
	comments: number;
	waitlist: number;
}

export interface TopIdeaAnalytics {
	id: string;
	heading: string;
	status: keyof IdeaStatus;
	upvotesCount: number;
	totalSignals: number;
	signals: IdeaSignalCounts;
	commentsCount: number;
	waitlistCount: number;
}

export interface AnalyticsDashboardData {
	totalIdeas: number;
	totalSignals: number;
	totalUpvotes: number;
	totalComments: number;
	totalWaitlistSignups: number;
	ideasByStatus: {
		DRAFT: number;
		WIP: number;
		VALIDATED: number;
		LAUNCHED: number;
	};
	ideasByValidationState: {
		NEEDS_ACTION: number;
		READY_TO_BUILD: number;
		VALIDATED: number;
		NEUTRAL: number;
	};
	signalDistribution: IdeaSignalCounts;
	dailyActivity: DailyActivity[];
	topIdeas: TopIdeaAnalytics[];
}

export interface IdeaAnalyticsData {
	id: string;
	heading: string;
	description: string;
	status: keyof IdeaStatus;
	isPinned: boolean;
	createdAt: string;
	upvotesCount: number;
	downvotesCount: number;
	totalSignals: number;
	signals: IdeaSignalCounts;
	commentsCount: number;
	waitlistCount: number;
	validationState: ValidationState;
	nextSteps: ScorecardNextStep[];
	dailyActivity: DailyActivity[];
	comments: ScorecardComment[];
}

// ============================================================================
// Suggestion / Feedback Types
// ============================================================================

export type SuggestionType = "FEATURE_REQUEST" | "BUG_REPORT" | "IMPROVEMENT" | "OTHER";
export type SuggestionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Suggestion {
	id: string;
	userId: string;
	type: SuggestionType;
	title: string;
	description: string;
	status: SuggestionStatus;
	createdAt: string;
	updatedAt: string;
	user: {
		username: string;
		profilePicture: string | null;
	};
}

// ============================================================================
// Page Types
// ============================================================================
