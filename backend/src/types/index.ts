import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ============================================================================
// Validation Dashboard Types
// ============================================================================

export type SignalType = 'PROBLEM_REAL' | 'WOULD_PAY' | 'READY_TO_BUILD' | 'NEEDS_CLARITY';

export type SignalStrength = 'STRONG' | 'MIXED' | 'WEAK' | 'NONE' | 'EARLY';

export type ValidationState = 'NEEDS_ACTION' | 'READY_TO_BUILD' | 'VALIDATED' | 'NEUTRAL';

export type NextActionType =
  | 'CLARIFY_PROBLEM'
  | 'TEST_PRICING'
  | 'GATHER_FEEDBACK'
  | 'READY_TO_BUILD'
  | 'ADD_FIRST_IDEA';

export type ActionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

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
  status: 'VALIDATED' | 'WIP' | 'LAUNCHED' | 'DRAFT';
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

export type ProfileSortMode = 'needs_action' | 'ready_to_build' | 'newest' | 'oldest' | 'all';

// ============================================================================
// Idea Portfolio & Scorecard Types
// ============================================================================

export type ValidationHealthLevel = 'green' | 'amber' | 'gray';

export interface ValidationHealthDots {
  problem: ValidationHealthLevel;
  pay: ValidationHealthLevel;
  buildable: ValidationHealthLevel;
}

export type ScorecardNextStepType =
  | 'CLARIFY'
  | 'TEST_PRICING'
  | 'GATHER_SIGNALS'
  | 'BUILD_WAITLIST'
  | 'ADDRESS_FEEDBACK'
  | 'READY';

export interface ScorecardNextStep {
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: ScorecardNextStepType;
}

export interface PortfolioIdea {
  id: string;
  heading: string;
  status: 'VALIDATED' | 'WIP' | 'LAUNCHED' | 'DRAFT';
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

export type CommentCategoryType =
  | 'PROBLEM_CLARITY'
  | 'TARGET_USERS'
  | 'WILLINGNESS_TO_PAY'
  | 'TECHNICAL_FEASIBILITY'
  | 'FEATURE_SUGGESTION'
  | 'GENERAL';

export interface ScorecardComment {
  id: string;
  content: string;
  category: CommentCategoryType;
  helpfulCount: number;
  createdAt: string;
  user: {
    username: string;
    profilePicture: string | null;
  };
}

export interface CommentCategoryGroup {
  category: CommentCategoryType;
  count: number;
  comments: ScorecardComment[];
}

export interface IdeaScorecard {
  id: string;
  heading: string;
  description: string;
  status: 'VALIDATED' | 'WIP' | 'LAUNCHED' | 'DRAFT';
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

export type ActivityRange = '24h' | '7d' | '30d' | 'all';

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
  status: 'VALIDATED' | 'WIP' | 'LAUNCHED' | 'DRAFT';
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
  status: 'VALIDATED' | 'WIP' | 'LAUNCHED' | 'DRAFT';
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

