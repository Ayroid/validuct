"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { userApi } from "@/lib/api/users";
import { ValidationAnalytics } from "@/types";
import ValidationAnalyticsDashboard from "@/components/analytics/ValidationAnalyticsDashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";

export default function AnalyticsPage() {
	const params = useParams();
	const router = useRouter();
	const username = params.username as string;
	const { data: session, status } = useSession();

	const [analytics, setAnalytics] = useState<ValidationAnalytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const isOwnProfile = session?.user?.username === username;

	useEffect(() => {
		// Redirect if not authenticated or not own profile
		if (status === "authenticated" && !isOwnProfile) {
			router.push(`/${username}`);
			return;
		}

		if (status === "unauthenticated") {
			router.push("/");
			return;
		}
	}, [status, isOwnProfile, username, router]);

	useEffect(() => {
		const fetchAnalytics = async () => {
			if (status !== "authenticated" || !isOwnProfile) return;

			try {
				setLoading(true);
				const data = await userApi.getValidationAnalytics(username);
				setAnalytics(data);
			} catch (err: unknown) {
				if (err instanceof Error && "response" in err) {
					const errWithResponse = err as {
						response?: { status?: number; data?: { error?: string } };
					};
					if (errWithResponse.response?.status === 404) {
						notFound();
					}
					setError(
						errWithResponse.response?.data?.error || "Failed to load analytics"
					);
				} else {
					setError("Failed to load analytics");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchAnalytics();
	}, [username, status, isOwnProfile]);

	if (status === "loading" || loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (!isOwnProfile) {
		return null;
	}

	if (error) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="text-destructive">{error}</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Header */}
			<div className="mb-10">
				<Link
					href={`/${username}`}
					className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium tracking-wide uppercase mb-4 transition-colors"
				>
					<HiArrowLeft className="h-3.5 w-3.5" />
					Back to Profile
				</Link>
				<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
					Validation Analytics
				</h1>
				<p className="text-muted-foreground mt-2 text-base">
					Track how your ideas are being validated by the community
				</p>
			</div>

			{/* Dashboard */}
			{analytics ? (
				<ValidationAnalyticsDashboard analytics={analytics} />
			) : (
				<div className="bg-card border-border/50 shadow-card rounded-xl border p-12 text-center">
					<p className="text-muted-foreground mb-4">
						Share some ideas to start seeing analytics
					</p>
					<Link href="/idea/new">
						<Button className="cursor-pointer">Share Your First Idea</Button>
					</Link>
				</div>
			)}
		</div>
	);
}
