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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface IdeaStatus {
  VALIDATED: 'VALIDATED';
  WIP: 'WIP';
  LAUNCHED: 'LAUNCHED';
  DRAFT: 'DRAFT';
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
  userVote?: 'upvote' | 'downvote' | null;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    profilePicture: string | null;
  };
  replies?: Comment[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
