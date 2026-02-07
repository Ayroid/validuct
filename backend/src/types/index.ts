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
// Validation Analytics Types
// ============================================================================

export interface SignalDistribution {
  type: SignalType;
  count: number;
  percentage: number;
}

export interface DailySignalTrend {
  date: string;
  problemReal: number;
  wouldPay: number;
  readyToBuild: number;
  needsClarity: number;
}

export interface TopIdea {
  id: string;
  heading: string;
  totalSignals: number;
}

export interface ValidationAnalytics {
  signalDistribution: SignalDistribution[];
  validationStateBreakdown: { state: string; count: number }[];
  dailyTrends: DailySignalTrend[];
  topIdeas: TopIdea[];
  totals: {
    totalSignals: number;
    totalIdeas: number;
    avgSignalsPerIdea: number;
  };
}
