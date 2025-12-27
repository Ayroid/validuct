'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Idea } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import VoteButtons from './VoteButtons';

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const router = useRouter();

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the card itself, not on interactive elements
    const target = e.target as HTMLElement;
    if (
      !target.closest('a') &&
      !target.closest('button') &&
      !target.closest('[data-no-navigate]')
    ) {
      router.push(`/idea/${idea.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <VoteButtons
          ideaId={idea.id}
          initialUpvotesCount={idea.upvotesCount}
          initialDownvotesCount={idea.downvotesCount}
          initialUserVote={idea.userVote}
        />

        {/* Content Section */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {idea.heading}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                idea.status
              )}`}
            >
              {formatStatus(idea.status)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">{idea.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${idea.user.username}`}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {idea.user.profilePicture ? (
                  <Image
                    src={idea.user.profilePicture}
                    alt={idea.user.username}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {idea.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{idea.user.username}</span>
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{idea.commentsCount}</span>
              </div>
              {idea.launchedLink && (
                <a
                  href={idea.launchedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span>Visit</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
