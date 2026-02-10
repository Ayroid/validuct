'use client'

import { useEffect, useState } from "react";
import { userApi, UserProfile } from "@/lib/api/users";
import { useParams, useRouter, notFound } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";

export default function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const params = useParams();
	const router = useRouter();
	const username = params.username as string;
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [profileData] = await Promise.all([
					userApi.getUserProfile(username),
				]);
				setProfile(profileData);
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

	return (
		<>
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => router.back()}
						className="text-foreground hover:bg-muted -ml-1 cursor-pointer rounded-full p-1 transition-colors"
					>
						<HiArrowLeft className="h-5 w-5" />
					</button>
					{profile && (
						<h1 className="text-foreground text-lg font-bold">
							{profile.user.username}
						</h1>
					)}
				</div>
				<div className="border-border/50 border-b" />
			</div>
			{loading ? (
				<div className="flex min-h-[50vh] items-center justify-center">
					<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
				</div>
			) : error || !profile ? (
				<div className="flex min-h-[50vh] items-center justify-center">
					<div className="text-destructive">{error || "Profile not found"}</div>
				</div>
			) : (
				children
			)}
		</>
	);
}
