"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userApi, UserProfile } from "@/lib/api/users";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types";
import IdeaCard from "@/components/IdeaCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { IoArrowBackOutline } from "react-icons/io5";

export default function ProfilePage() {
	const params = useParams();
	const username = params.username as string;
	const { data: session } = useSession();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [ideas, setIdeas] = useState<Idea[]>([]);
	const [loading, setLoading] = useState(true);
	const [ideasLoading, setIdeasLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"all" | "pinned">("all");
	const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
		"newest"
	);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const isOwnProfile = session?.user?.username === username;

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true);
				const data = await userApi.getUserProfile(username);
				setProfile(data);
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error && "response" in err
						? (err as { response?: { data?: { error?: string } } }).response
								?.data?.error
						: undefined;
				setError(errorMessage || "Failed to load profile");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [username]);

	useEffect(() => {
		const fetchIdeas = async () => {
			try {
				setIdeasLoading(true);
				if (activeTab === "pinned" && profile) {
					setIdeas(profile.pinnedIdeas);
					setHasMore(false);
				} else {
					const data = await ideasApi.getUserIdeas(username, {
						page,
						limit: 20,
						sort: sortBy,
					});
					setIdeas(data.ideas);
					setHasMore(data.pagination.page < data.pagination.total_pages);
				}
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error && "response" in err
						? (err as { response?: { data?: { error?: string } } }).response
								?.data?.error
						: undefined;
				setError(errorMessage || "Failed to load ideas");
			} finally {
				setIdeasLoading(false);
			}
		};

		if (profile) {
			fetchIdeas();
		}
	}, [username, profile, page, sortBy, activeTab]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading profile...</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-destructive">{error || "Profile not found"}</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Profile Header */}
			<div className="bg-card border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="max-w-4xl">
						<Link
							href="/home"
							className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-8 text-sm"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							<span>BACK</span>
						</Link>
					</div>
					<div className="flex items-start gap-6">
						{/* Profile Picture */}
						<div className="shrink-0">
							{profile.user.profilePicture ? (
								<Image
									src={profile.user.profilePicture}
									alt={profile.user.username}
									width={96}
									height={96}
									className="w-24 h-24 rounded-full object-cover"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
									{profile.user.username[0].toUpperCase()}
								</div>
							)}
						</div>

						{/* Profile Info */}
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold text-foreground">
										{profile.user.username}
									</h1>
									<p className="text-muted-foreground mt-1">
										{profile.ideasCount} ideas shared
									</p>
								</div>
								{isOwnProfile && (
									<div className="flex gap-3 flex-col">
										<div className="flex gap-3">
											<Link href={`/${profile.user.username}/edit`} className="flex-1">
												<Button variant="outline" className="w-full cursor-pointer">Edit Profile</Button>
											</Link>
											<Button
												variant="destructive"
												className="flex-1 w-full cursor-pointer"
												onClick={() => signOut({ callbackUrl: "/" })}
											>
												Logout
											</Button>
										</div>
										<Link href="/idea/new" className="w-full">
											<Button variant="default" className="w-full cursor-pointer hover:bg-primary/90">
												New Idea
											</Button>
										</Link>
									</div>
								)}
							</div>

							{profile.user.bio && (
								<p className="text-muted-foreground mt-4 max-w-2xl">
									{profile.user.bio}
								</p>
							)}

							<div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
								<span>
									Joined{" "}
									{new Date(profile.user.createdAt).toLocaleDateString(
										"en-US",
										{
											month: "long",
											year: "numeric",
										}
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Ideas Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Tabs */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex gap-4 border-b">
						<button
							onClick={() => {
								setActiveTab("all");
								setPage(1);
							}}
							className={`px-4 py-2 font-medium transition-colors ${
								activeTab === "all"
									? "text-primary border-b-2 border-primary"
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
										? "text-primary border-b-2 border-primary"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								Pinned ({profile.pinnedIdeas.length})
							</button>
						)}
					</div>

					{/* Sort Options - Only for All Ideas */}
					{activeTab === "all" && (
						<div className="flex gap-2">
							<Button
								variant={sortBy === "newest" ? "default" : "outline"}
								onClick={() => {
									setSortBy("newest");
									setPage(1);
								}}
								size="sm"
							>
								Newest
							</Button>
							<Button
								variant={sortBy === "popular" ? "default" : "outline"}
								onClick={() => {
									setSortBy("popular");
									setPage(1);
								}}
								size="sm"
							>
								Popular
							</Button>
							<Button
								variant={sortBy === "oldest" ? "default" : "outline"}
								onClick={() => {
									setSortBy("oldest");
									setPage(1);
								}}
								size="sm"
							>
								Oldest
							</Button>
						</div>
					)}
				</div>

				{/* Ideas List */}
				{ideasLoading ? (
					<div className="text-center py-12">
						<div className="text-lg text-muted-foreground">
							Loading ideas...
						</div>
					</div>
				) : ideas.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							{activeTab === "pinned" ? "No pinned ideas yet" : "No ideas yet"}
						</p>
						{isOwnProfile && activeTab === "all" && (
							<Link href="/idea/new" className="inline-block mt-4">
								<Button>Share Your First Idea</Button>
							</Link>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{ideas.map((idea) => (
							<IdeaCard key={idea.id} idea={idea} />
						))}

						{/* Load More */}
						{activeTab === "all" && hasMore && (
							<div className="text-center pt-6">
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
