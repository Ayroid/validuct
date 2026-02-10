"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { userApi, UserProfile } from "@/lib/api/users";
import {
	ValidationSummary,
	IdeaWithSignals,
	ProfileSortMode,
	PaginationMeta,
	Idea,
} from "@/types";
import ProfileIdeaCard from "@/components/ProfileIdeaCard";
import IdeaCard from "@/components/IdeaCard";
import BuilderSnapshotHeader from "@/components/BuilderSnapshotHeader";
import ValidationSummaryCard from "@/components/ValidationSummaryCard";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
	const params = useParams();
	const username = params.username as string;
	const { data: session } = useSession();

	// State
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [validationSummary, setValidationSummary] =
		useState<ValidationSummary | null>(null);
	const [ideas, setIdeas] = useState<IdeaWithSignals[] | Idea[]>([]);
	const [loading, setLoading] = useState(true);
	const [ideasLoading, setIdeasLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// New state-based sorting
	const [activeTab, setActiveTab] = useState<"all" | "pinned">("all");
	const [sortBy, setSortBy] = useState<ProfileSortMode>("all");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);
	const observerRef = useRef<HTMLDivElement>(null);

	const isOwnProfile = session?.user?.username === username;

	// Fetch profile and validation summary
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [profileData, summaryData] = await Promise.all([
					userApi.getUserProfile(username),
					userApi.getValidationSummary(username),
				]);
				setProfile(profileData);
				setValidationSummary(summaryData);
			} catch (err: unknown) {
				// Handle 404
				if (err instanceof Error && "response" in err) {
					const errWithResponse = err as {
						response?: { status?: number; data?: { error?: string } };
					};
					if (errWithResponse.response?.status === 404) {
						notFound();
					}
					setError(
						errWithResponse.response?.data?.error || "Failed to load profile"
					);
				} else {
					setError("Failed to load profile");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [username]);

	// Fetch ideas with signals
	const fetchIdeas = useCallback(async () => {
		if (!profile) return;

		try {
			setIdeasLoading(true);
			if (activeTab === "pinned") {
				// For pinned tab, we show pinned ideas from profile
				setIdeas([]);
				setPagination(null);
			} else if (isOwnProfile) {
				// For own profile, fetch ideas with signals
				const data = await userApi.getUserIdeasWithSignals(username, {
					page,
					limit: 20,
					sort: sortBy,
				});
				setIdeas(data.ideas);
				setPagination(data.pagination);
			} else {
				// For other profiles, fetch regular ideas
				const data = await userApi.getUserIdeas(username, page, 20, "newest");
				setIdeas(data.ideas || []);
				setPagination(data.pagination || null);
			}
		} catch (err) {
			console.error("Failed to load ideas:", err);
		} finally {
			setIdeasLoading(false);
		}
	}, [username, profile, page, sortBy, activeTab, isOwnProfile]);

	useEffect(() => {
		if (profile) {
			fetchIdeas();
		}
	}, [profile, fetchIdeas]);

	const handlePinChange = async () => {
		// Refresh both profile and ideas
		try {
			const [profileData, summaryData] = await Promise.all([
				userApi.getUserProfile(username),
				userApi.getValidationSummary(username),
			]);
			setProfile(profileData);
			setValidationSummary(summaryData);
			fetchIdeas();
		} catch (err) {
			console.error("Failed to refresh data:", err);
		}
	};

	const hasMore = pagination ? pagination.page < pagination.total_pages : false;

	const handleLoadMore = useCallback(() => {
		if (!ideasLoading && hasMore) {
			setPage((p) => p + 1);
		}
	}, [ideasLoading, hasMore]);

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !ideasLoading && hasMore) {
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
	}, [ideasLoading, hasMore, handleLoadMore]);

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="text-destructive">{error || "Profile not found"}</div>
			</div>
		);
	}

	return (
		<div className="px-4 py-6 sm:px-6">
			{/* Builder Snapshot Header */}
			<BuilderSnapshotHeader
				profile={profile}
				validationSummary={validationSummary}
				isOwnProfile={isOwnProfile}
			/>

			{/* Validation Summary Card - Only show for own profile */}
			{isOwnProfile &&
				validationSummary &&
				validationSummary.totalIdeas > 0 && (
					<div className="mt-8">
						<ValidationSummaryCard summary={validationSummary} />
					</div>
				)}

			{/* Main Content */}
			<div className="mt-8">
				{/* Tabs and Sort Controls */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="bg-muted/50 flex gap-1 rounded-lg p-1">
						<button
							onClick={() => {
								setActiveTab("all");
								setPage(1);
							}}
							className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
								activeTab === "all"
									? "bg-card text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							All Ideas
						</button>
						{profile.pinnedIdeas.length > 0 && (
							<button
								onClick={() => {
									setActiveTab("pinned");
									setPage(1);
								}}
								className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
									activeTab === "pinned"
										? "bg-card text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Pinned ({profile.pinnedIdeas.length})
							</button>
						)}
					</div>

					{/* State-Based Sort Options - Only for own profile */}
					{activeTab === "all" && isOwnProfile && (
						<div className="bg-muted flex flex-wrap gap-2 rounded-lg p-1">
							<Button
								variant={sortBy === "all" ? "default" : "ghost"}
								onClick={() => {
									setSortBy("all");
									setPage(1);
								}}
								size="sm"
								className="cursor-pointer transition-colors"
							>
								All
							</Button>
							<Button
								variant={sortBy === "needs_action" ? "default" : "ghost"}
								onClick={() => {
									setSortBy("needs_action");
									setPage(1);
								}}
								size="sm"
								className="cursor-pointer transition-colors"
							>
								Needs Action
							</Button>
							<Button
								variant={sortBy === "ready_to_build" ? "default" : "ghost"}
								onClick={() => {
									setSortBy("ready_to_build");
									setPage(1);
								}}
								size="sm"
								className="cursor-pointer transition-colors"
							>
								Ready to Build
							</Button>
						</div>
					)}
				</div>

				{/* Ideas List */}
				{ideasLoading ? (
					<div className="py-12 text-center">
						<div className="text-muted-foreground text-lg">
							Loading ideas...
						</div>
					</div>
				) : activeTab === "pinned" ? (
					// Pinned ideas - use regular IdeaCard
					profile.pinnedIdeas.length === 0 ? (
						<div className="py-12 text-center">
							<p className="text-muted-foreground">No pinned ideas yet</p>
						</div>
					) : (
						<div className="space-y-4">
							{profile.pinnedIdeas.map((idea: Idea) => (
								<IdeaCard
									key={idea.id}
									idea={idea}
									showPinButton={isOwnProfile}
									onPinChange={handlePinChange}
								/>
							))}
						</div>
					)
				) : ideas.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							{sortBy === "needs_action"
								? "No ideas need action right now!"
								: sortBy === "ready_to_build"
									? "No ideas are ready to build yet"
									: "No ideas yet"}
						</p>
						{isOwnProfile && sortBy === "all" && (
							<Link href="/idea/new" className="mt-4 inline-block">
								<Button className="cursor-pointer transition-colors">
									Share Your First Idea
								</Button>
							</Link>
						)}
					</div>
				) : isOwnProfile ? (
					<div className="space-y-4">
						{(ideas as IdeaWithSignals[]).map((idea) => (
							<ProfileIdeaCard
								key={idea.id}
								idea={idea}
								showPinButton={isOwnProfile}
								onPinChange={handlePinChange}
							/>
						))}

						{/* Infinite Scroll Observer Target */}
						{hasMore && (
							<div ref={observerRef} className="flex justify-center pt-6">
								{ideasLoading && (
									<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
								)}
							</div>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{(ideas as Idea[]).map((idea) => (
							<IdeaCard
								key={idea.id}
								idea={idea}
								showPinButton={false}
								onPinChange={handlePinChange}
							/>
						))}

						{/* Infinite Scroll Observer Target */}
						{hasMore && (
							<div ref={observerRef} className="flex justify-center pt-6">
								{ideasLoading && (
									<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
