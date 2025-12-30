"use client";

import { useState, useEffect } from "react";
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

	useEffect(() => {
		loadIdeas(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTimeline]);

	const loadIdeas = async (reset = false, pageOverride?: number) => {
		try {
			setLoading(true);
			const currentPage = reset ? 1 : pageOverride ?? page;
			const response = await ideasApi.getIdeas({
				timeline: activeTimeline,
				page: currentPage,
				limit: 10,
			});

			console.log(
				"Timeline Type:",
				activeTimeline,
				"Ideas Loaded:",
				response.ideas.length
			);

			if (reset) {
				setIdeas(response.ideas);
				setPage(1);
			} else {
				setIdeas((prev) => [...prev, ...response.ideas]);
			}

			setHasMore(currentPage < response.pagination.total_pages);
		} catch (error) {
			console.error("Failed to load ideas:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLoadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		loadIdeas(false, nextPage);
	};

	const tabs = [
		{ id: TimelineType.NEW, label: "New", icon: "🆕" },
		{ id: TimelineType.TRENDING, label: "Trending", icon: "🔥" },
		{ id: TimelineType.TOP, label: "Top", icon: "📈" },
	];

	return (
		<div className="max-w-5xl mx-auto px-6 py-8">
			<div className="w-full">
				{/* Centered Tabs */}
				<div className="flex justify-between border-b mb-8">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTimeline(tab.id);
								setPage(1);
							}}
							className={`px-12 py-3 font-medium transition-all relative flex-1 w-full${
								activeTimeline === tab.id
									? "text-foreground bg-primary/10"
									: "text-muted-foreground hover:text-foreground/80"
							}`}
						>
							<span className="flex items-center gap-2 justify-center">
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
							</span>
							{activeTimeline === tab.id && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
							)}
						</button>
					))}
				</div>

				{/* Ideas List */}
				<div className="space-y-4">
					{loading && ideas.length === 0 ? (
						<div className="flex justify-center items-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
						</div>
					) : ideas.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
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
										className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{loading ? "Loading..." : "Load More"}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
