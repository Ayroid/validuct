"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import IdeaCard from "./IdeaCard";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types";

const TimelineType = {
	NEW: "new",
	TRENDING: "trending",
	TOP: "top",
} as const;

type TimelineType = (typeof TimelineType)[keyof typeof TimelineType];

export default function Timeline() {
	const [activeTimeline, setActiveTimeline] = useState<TimelineType>(
		TimelineType.NEW
	);
	const [ideas, setIdeas] = useState<Idea[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const observerRef = useRef<HTMLDivElement>(null);

	const loadIdeas = async (reset = false, pageOverride?: number) => {
		try {
			setLoading(true);
			const currentPage = reset ? 1 : (pageOverride ?? page);
			const response = await ideasApi.getIdeas({
				timeline: activeTimeline,
				page: currentPage,
				limit: 10,
			});

			if (reset) {
				setIdeas(response.ideas);
				setPage(1);
			} else {
				// Deduplicate ideas to prevent duplicate key errors
				setIdeas((prev) => {
					const existingIds = new Set(prev.map((idea) => idea.id));
					const newIdeas = response.ideas.filter(
						(idea) => !existingIds.has(idea.id)
					);
					return [...prev, ...newIdeas];
				});
			}

			setHasMore(currentPage < response.pagination.total_pages);
		} catch (error) {
			console.error("Failed to load ideas:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLoadMore = useCallback(() => {
		if (!loading && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			loadIdeas(false, nextPage);
		}
	}, [loading, hasMore, page]);

	useEffect(() => {
		loadIdeas(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTimeline]);

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading && hasMore) {
					handleLoadMore();
				}
			},
			{ threshold: 0.1 }
		);

		const currentObserverRef = observerRef.current;
		if (currentObserverRef) {
			observer.observe(currentObserverRef);
		}

		return () => {
			if (currentObserverRef) {
				observer.unobserve(currentObserverRef);
			}
		};
	}, [loading, hasMore, handleLoadMore]);

	const tabs = [
		{ id: TimelineType.NEW, label: "New", icon: "🆕" },
		{ id: TimelineType.TRENDING, label: "Trending", icon: "🔥" },
		{ id: TimelineType.TOP, label: "Top", icon: "📈" },
	];

	return (
		<div className="px-6 py-8">
			<div className="w-full">
				{/* Centered Tabs */}
				<div className="mb-8 flex justify-between border-b">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTimeline(tab.id);
								setPage(1);
							}}
							className={`relative w-full flex-1 cursor-pointer px-4 py-3 font-medium transition-all sm:px-8 md:px-12 ${
								activeTimeline === tab.id
									? "text-foreground bg-primary/10"
									: "text-muted-foreground hover:text-foreground/80"
							}`}
						>
							<span className="flex items-center justify-center gap-2">
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
							</span>
							{activeTimeline === tab.id && (
								<div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5"></div>
							)}
						</button>
					))}
				</div>

				{/* Ideas List */}
				<div className="space-y-4">
					{loading && ideas.length === 0 ? (
						<div className="flex items-center justify-center py-12">
							<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
						</div>
					) : ideas.length === 0 ? (
						<div className="text-muted-foreground py-12 text-center">
							<p className="text-lg">No ideas found</p>
							<p className="mt-2 text-sm">Be the first to share an idea!</p>
						</div>
					) : (
						<>
							{ideas.map((idea) => (
								<IdeaCard key={idea.id} idea={idea} />
							))}

							{/* Infinite Scroll Observer Target */}
							{hasMore && (
								<div ref={observerRef} className="flex justify-center py-8">
									{loading && (
										<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
