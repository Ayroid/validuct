'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ideasApi } from '@/lib/api/ideas';
import { userApi } from '@/lib/api/users';
import { Idea, PinButtonProps } from '@/types';

export default function PinButton({
  ideaId,
  ideaUserId,
  initialIsPinned = false,
  onPinChange,
}: PinButtonProps) {
  const { data: session } = useSession();
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pinned status on mount
  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const pinnedIdeas = await userApi.getPinnedIdeas();
        const pinned = pinnedIdeas.some((idea: Idea) => idea.id === ideaId);
        setIsPinned(pinned);
      } catch (error) {
        console.error('Failed to check pin status:', error);
      }
    };

    checkPinStatus();
  }, [ideaId]);

  // Only show pin button if the current user is the idea owner
  if (!session?.user || session.user.id !== ideaUserId) {
    return null;
  }

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoading) return;

    try {
      setIsLoading(true);
      if (isPinned) {
        await ideasApi.unpinIdea(ideaId);
        setIsPinned(false);
      } else {
        await ideasApi.pinIdea(ideaId);
        setIsPinned(true);
      }
      onPinChange?.();
    } catch (error: any) {
      console.error('Failed to pin/unpin idea:', error);
      alert(error.response?.data?.error || 'Failed to update pin status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePin}
      disabled={isLoading}
      className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        isPinned
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isPinned ? 'Unpin this idea' : 'Pin this idea to your profile (max 5)'}
    >
      <svg
        className={`w-4 h-4 ${isPinned ? 'fill-current' : 'fill-none'}`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {isPinned ? 'Pinned' : 'Pin'}
    </button>
  );
}
