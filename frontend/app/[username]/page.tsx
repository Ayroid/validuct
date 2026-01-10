"use client";

import { useEffect, useState, useCallback } from "react";
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
	const [sortBy, setSortBy] = useState<ProfileSortMode>("needs_action");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);

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
		<div className="mx-auto max-w-5xl px-6 py-8">
			{/* Builder Snapshot Header */}
			<BuilderSnapshotHeader
				profile={profile}
				validationSummary={validationSummary}
				isOwnProfile={isOwnProfile}
			/>

			{/* Main Content */}
			<div className="mx-auto mt-8 max-w-5xl">
				{/* Validation Summary Card - Only show for own profile */}
				{isOwnProfile &&
					validationSummary &&
					validationSummary.totalIdeas > 0 && (
						<div className="mb-8 border-x border-b">
							<ValidationSummaryCard summary={validationSummary} />
						</div>
					)}

				{/* Tabs and Sort Controls */}
				<div className="mb-6 flex items-center justify-between">
					<div className="flex gap-4 border-b">
						<button
							onClick={() => {
								setActiveTab("all");
								setPage(1);
							}}
							className={`px-4 py-2 font-medium transition-colors ${
								activeTab === "all"
									? "text-primary border-primary border-b-2"
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
								className={`px-4 py-2 font-medium transition-colors ${
									activeTab === "pinned"
										? "text-primary border-primary border-b-2"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Pinned ({profile.pinnedIdeas.length})
							</button>
						)}
					</div>

					{/* State-Based Sort Options - Only for own profile */}
					{activeTab === "all" && isOwnProfile && (
						<div className="flex gap-2">
							<Button
								variant={sortBy === "needs_action" ? "default" : "outline"}
								onClick={() => {
									setSortBy("needs_action");
									setPage(1);
								}}
								size="sm"
							>
								Needs Action
							</Button>
							<Button
								variant={sortBy === "ready_to_build" ? "default" : "outline"}
								onClick={() => {
									setSortBy("ready_to_build");
									setPage(1);
								}}
								size="sm"
							>
								Ready to Build
							</Button>
							<Button
								variant={sortBy === "all" ? "default" : "outline"}
								onClick={() => {
									setSortBy("all");
									setPage(1);
								}}
								size="sm"
							>
								All
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
								<Button>Share Your First Idea</Button>
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

						{/* Load More */}
						{hasMore && (
							<div className="pt-6 text-center">
								<Button
									variant="outline"
									onClick={() => setPage((p) => p + 1)}
									disabled={ideasLoading}
								>
									{ideasLoading ? "Loading..." : "Load More"}
								</Button>
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

						{/* Load More */}
						{hasMore && (
							<div className="pt-6 text-center">
								<Button
									variant="outline"
									onClick={() => setPage((p) => p + 1)}
									disabled={ideasLoading}
								>
									{ideasLoading ? "Loading..." : "Load More"}
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
