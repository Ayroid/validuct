"use client";

import { useEffect, useState, useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useParams, useRouter, notFound } from "next/navigation";
import { userApi, UserProfile } from "@/lib/api/users";
import {
	ValidationSummary,
	IdeaWithSignals,
	PaginationMeta,
	Idea,
} from "@/types";
import ProfileIdeaCard from "@/components/ProfileIdeaCard";
import IdeaCard from "@/components/IdeaCard";
import BuilderSnapshotHeader from "@/components/BuilderSnapshotHeader";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Lightbulb, BarChart3, Pin, ArrowLeft, LayoutList } from "lucide-react";
import { useNavBack } from "@/hooks/useNavBack";
import { getErrorMessage } from "@/lib/errors";

export default function ProfilePage() {
	const params = useParams();
	const router = useRouter();
	const back = useNavBack();
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
	const [is404, setIs404] = useState(false);

	// Tab & sort state
	const [activeTab, setActiveTab] = useState<"ideas" | "analytics">("ideas");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);
	const isOwnProfile = session?.user?.username === username;

	// Sync tab from URL search params
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const tab = urlParams.get("tab");
		if (tab === "analytics" && isOwnProfile) {
			setActiveTab("analytics");
		}
	}, [isOwnProfile]);

	// Fetch profile, validation summary, and analytics (own profile)
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
				const apiErr = err as Error & { status?: number };
				if (apiErr.status === 404) {
					setIs404(true);
					return;
				}
				setError(getErrorMessage(err, "An unexpected error occurred"));
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [username, session?.user?.username]);

	// Fetch ideas with signals
	const fetchIdeas = useCallback(async () => {
		if (!profile) return;

		try {
			setIdeasLoading(true);
			if (isOwnProfile) {
				const data = await userApi.getUserIdeasWithSignals(username, {
					page,
					limit: 20,
				});
				setIdeas(data.ideas);
				setPagination(data.pagination);
			} else {
				const data = await userApi.getUserIdeas(username, page, 20, "newest");
				setIdeas(data.ideas || []);
				setPagination(data.pagination || null);
			}
		} catch (err) {
			console.error("Failed to load ideas:", err);
		} finally {
			setIdeasLoading(false);
		}
	}, [username, profile, page, isOwnProfile]);

	useEffect(() => {
		if (profile) {
			fetchIdeas();
		}
	}, [profile, fetchIdeas]);

	const handlePinChange = async () => {
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

	const sentinelRef = useInfiniteScroll(handleLoadMore, !ideasLoading && hasMore);

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (is404) {
		notFound();
	}

	if (error || !profile) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="text-destructive">{error || "Profile not found"}</div>
			</div>
		);
	}

	const hasPinnedIdeas = profile.pinnedIdeas.length > 0;

	return (
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => back()}
						className="text-foreground hover:bg-muted/60 cursor-pointer rounded-full p-1 transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-foreground text-lg font-bold">
						{profile.user.username}
					</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Profile Hero */}
			<BuilderSnapshotHeader
				profile={profile}
				validationSummary={validationSummary}
				isOwnProfile={isOwnProfile}
			/>

			{/* Tabbed Content */}
			<div className="mt-5">
				{/* Tab Bar */}
				{isOwnProfile && (
					<div className="border-border/50 flex min-h-12 border-b">
						<button
							onClick={() => {
								setActiveTab("ideas");
								router.replace(`/${username}`, { scroll: false });
							}}
							className={`hover:bg-muted/60 relative flex-1 cursor-pointer text-center text-sm font-semibold transition-colors ${
								activeTab === "ideas"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground/80"
							}`}
						>
							<span className="flex items-center justify-center gap-1.5">
								<Lightbulb className="h-4 w-4" />
								Ideas
							</span>
							{activeTab === "ideas" && (
								<div className="bg-primary absolute bottom-0 left-1/2 h-0.75 w-14 -translate-x-1/2 rounded-full"></div>
							)}
						</button>
						<button
							onClick={() => {
								setActiveTab("analytics");
								router.replace(`/${username}?tab=analytics`, { scroll: false });
							}}
							className={`hover:bg-muted/60 relative flex-1 cursor-pointer text-center text-sm font-semibold transition-colors ${
								activeTab === "analytics"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground/80"
							}`}
						>
							<span className="flex items-center justify-center gap-1.5">
								<BarChart3 className="h-4 w-4" />
								Analytics
							</span>
							{activeTab === "analytics" && (
								<div className="bg-primary absolute bottom-0 left-1/2 h-0.75 w-14 -translate-x-1/2 rounded-full"></div>
							)}
						</button>
					</div>
				)}

				{/* Tab Content */}
				<div className="mt-6">
					{activeTab === "ideas" ? (
						<IdeasTabContent
							ideas={ideas}
							profile={profile}
							isOwnProfile={isOwnProfile}
							ideasLoading={ideasLoading}
							hasPinnedIdeas={hasPinnedIdeas}
							handlePinChange={handlePinChange}
							hasMore={hasMore}
							sentinelRef={sentinelRef}
						/>
					) : (
						<AnalyticsTabContent username={username} />
					)}
				</div>
			</div>
		</div>
		</div>
	);
}

/* ─── Ideas Tab ─────────────────────────────────────────────────────────────── */

function IdeasTabContent({
	ideas,
	profile,
	isOwnProfile,
	ideasLoading,
	hasPinnedIdeas,
	handlePinChange,
	hasMore,
	sentinelRef,
}: {
	ideas: IdeaWithSignals[] | Idea[];
	profile: UserProfile;
	isOwnProfile: boolean;
	ideasLoading: boolean;
	hasPinnedIdeas: boolean;
	handlePinChange: () => void;
	hasMore: boolean;
	sentinelRef: React.RefObject<HTMLDivElement | null>;
}) {
	return (
		<>
			{/* Pinned Ideas inline section */}
			{hasPinnedIdeas && (
				<div className="mb-8">
					<div className="mb-3 flex items-center gap-1.5">
						<Pin className="text-muted-foreground h-3.5 w-3.5" />
						<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Pinned
						</span>
					</div>
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
				</div>
			)}

			{/* All Ideas label */}
			{hasPinnedIdeas && ideas.length > 0 && (
				<div className="mb-3 flex items-center gap-1.5">
					<LayoutList className="text-muted-foreground h-3.5 w-3.5" />
					<span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
						All Ideas
					</span>
				</div>
			)}

			{/* Ideas List */}
			{ideasLoading ? (
				<div className="py-12 text-center">
					<div className="text-muted-foreground text-lg">Loading ideas...</div>
				</div>
			) : ideas.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-muted-foreground">
						 No ideas yet
					</p>
					{isOwnProfile && (
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

					{hasMore && (
						<div ref={sentinelRef} className="flex justify-center pt-6">
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

					{hasMore && (
						<div ref={sentinelRef} className="flex justify-center pt-6">
							{ideasLoading && (
								<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
}

/* ─── Analytics Tab ─────────────────────────────────────────────────────────── */

function AnalyticsTabContent({ username }: { username: string }) {
	return <AnalyticsDashboard username={username} />;
}
