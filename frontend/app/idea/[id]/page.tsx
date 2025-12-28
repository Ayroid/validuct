'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ideasApi } from '@/lib/api/ideas';
import { Idea } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import VoteButtons from '@/components/VoteButtons';
import CommentSection from '@/components/CommentSection';

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadIdea();
    }
  }, [params.id]);

  const loadIdea = async () => {
    try {
      setLoading(true);
      const data = await ideasApi.getIdeaById(params.id as string);
      setIdea(data);
    } catch (error) {
      console.error('Failed to load idea:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return 'bg-green-100 text-green-800';
      case 'WIP':
        return 'bg-yellow-100 text-yellow-800';
      case 'LAUNCHED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'WIP':
        return 'Work in Progress';
      case 'VALIDATED':
        return 'Validated';
      case 'LAUNCHED':
        return 'Launched';
      case 'DRAFT':
      default:
        return 'Draft';
    }
  };

  const handleVoteUpdate = (upvotesCount: number, downvotesCount: number, userVote: 'upvote' | 'downvote' | null) => {
    if (idea) {
      setIdea({
        ...idea,
        upvotesCount,
        downvotesCount,
        userVote,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Timeline
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{idea.heading}</h1>
                {idea.isPrivate && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700" title="This is a private idea">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="font-medium">Private</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Link
                  href={`/profile/${idea.user.username}`}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  {idea.user.profilePicture ? (
                    <img
                      src={idea.user.profilePicture}
                      alt={idea.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-600">
                      {idea.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{idea.user.username}</span>
                </Link>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                  idea.status
                )}`}
              >
                {formatStatus(idea.status)}
              </span>
              {/* Edit/Delete buttons - only visible to owner */}
              {user && user.id === idea.userId && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/idea/${idea.id}/edit`}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Edit idea"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Vote Section */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
            <VoteButtons
              ideaId={idea.id}
              initialUpvotesCount={idea.upvotesCount}
              initialDownvotesCount={idea.downvotesCount}
              initialUserVote={idea.userVote}
              onVoteUpdate={handleVoteUpdate}
            />
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{idea.commentsCount} comments</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{idea.description}</p>
          </div>

          {/* Launched Link */}
          {idea.launchedLink && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Link</h2>
              <a
                href={idea.launchedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
              >
                {idea.launchedLink}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <CommentSection ideaId={idea.id} initialCommentsCount={idea.commentsCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
