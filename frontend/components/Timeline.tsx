'use client';

import { useState, useEffect } from 'react';
import IdeaCard from './IdeaCard';
import { ideasApi } from '@/lib/api/ideas';
import { Idea } from '@/types';

type TimelineType = 'hot' | 'new' | 'trending';

export default function Timeline() {
  const [activeTimeline, setActiveTimeline] = useState<TimelineType>('hot');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadIdeas(true);
  }, [activeTimeline]);

  const loadIdeas = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const response = await ideasApi.getIdeas({
        timeline: activeTimeline,
        page: currentPage,
        limit: 20,
      });

      if (reset) {
        setIdeas(response.ideas);
        setPage(1);
      } else {
        setIdeas((prev) => [...prev, ...response.ideas]);
      }

      setHasMore(currentPage < response.pagination.total_pages);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    loadIdeas();
  };

  const tabs = [
    { id: 'hot' as TimelineType, label: 'Hot', icon: '🔥' },
    { id: 'new' as TimelineType, label: 'New', icon: '🆕' },
    { id: 'trending' as TimelineType, label: 'Trending', icon: '📈' },
  ];

  return (
    <div className="w-full">
      {/* Centered Tabs */}
      <div className="flex justify-center border-b border-gray-300 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTimeline(tab.id);
              setPage(1);
            }}
            className={`px-12 py-3 font-medium transition-all relative ${
              activeTimeline === tab.id
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
            {activeTimeline === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
        ))}
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {loading && ideas.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No ideas found</p>
            <p className="text-sm mt-2">Be the first to share an idea!</p>
          </div>
        ) : (
          <>
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
