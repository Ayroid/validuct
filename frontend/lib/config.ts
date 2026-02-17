import type { ValidationState, CommentCategory, Notification } from "@/types";

// ── Status badge config (used by IdeaCard + ProfileIdeaCard) ──

export const STATUS_BADGE_CONFIG: Record<
	string,
	{ label: string; className: string }
> = {
	DRAFT: {
		label: "Draft",
		className:
			"bg-zinc-200 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
	},
	WIP: {
		label: "In Progress",
		className:
			"bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
	},
	LAUNCHED: {
		label: "Launched",
		className:
			"bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
	},
	VALIDATED: {
		label: "Validated",
		className:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
	},
};

// ── Validation state config (used by ProfileIdeaCard) ──

export const VALIDATION_STATE_CONFIG: Record<
	ValidationState,
	{ label: string; bgColor: string; textColor: string }
> = {
	NEEDS_ACTION: {
		label: "Needs Action",
		bgColor: "bg-amber-100 dark:bg-amber-500/20",
		textColor: "text-amber-700 dark:text-amber-400",
	},
	READY_TO_BUILD: {
		label: "Ready to Build",
		bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
		textColor: "text-emerald-700 dark:text-emerald-400",
	},
	VALIDATED: {
		label: "Validated",
		bgColor: "bg-sky-100 dark:bg-sky-500/20",
		textColor: "text-sky-700 dark:text-sky-400",
	},
	NEUTRAL: {
		label: "Gathering Signals",
		bgColor: "bg-muted",
		textColor: "text-muted-foreground",
	},
};

// ── Comment category configs ──

export const COMMENT_CATEGORY_CONFIG: Record<
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

export const COMMENT_CATEGORY_LABELS: Record<
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

// ── Notification icon/accent maps ──

export const NOTIFICATION_ICON_MAP: Record<Notification["type"], string> = {
	UPVOTE: "👍",
	SIGNAL: "🎯",
	COMMENT: "💬",
	REPLY: "↩️",
	MILESTONE: "🎉",
};

export const NOTIFICATION_ACCENT_MAP: Record<Notification["type"], string> = {
	UPVOTE: "bg-emerald-500/10 ring-emerald-500/20",
	SIGNAL: "bg-blue-500/10 ring-blue-500/20",
	COMMENT: "bg-purple-500/10 ring-purple-500/20",
	REPLY: "bg-sky-500/10 ring-sky-500/20",
	MILESTONE: "bg-amber-500/10 ring-amber-500/20",
};
