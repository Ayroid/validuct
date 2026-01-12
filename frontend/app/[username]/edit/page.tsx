"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { userApi, UpdateProfileData } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function ProfileSettingsPage() {
	const { data: session, update } = useSession();
	const router = useRouter();
	const [formData, setFormData] = useState<UpdateProfileData>({
		username: "",
		bio: "",
		profilePicture: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (session?.user) {
			setFormData({
				username: session.user.username || "",
				bio: session.user.bio || "",
				profilePicture: session.user.profilePicture || "",
			});
		}
	}, [session]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const updatedUser = await userApi.updateProfile(formData);

			// Update the session with new user data
			await update({
				...session,
				user: {
					...session?.user,
					username: updatedUser.username,
					bio: updatedUser.bio,
					profilePicture: updatedUser.profilePicture,
				},
			});
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error && "response" in err
					? (err as { response?: { data?: { error?: string } } }).response?.data
							?.error
					: undefined;
			setError(errorMessage || "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	if (!session?.user) {
		router.push("/signin");
		return null;
	}

	return (
		<div className="mx-auto max-w-5xl px-6 py-8">
			<div className="mb-10">
				<Link
					href={`/${session.user.username}`}
					className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1 text-sm"
				>
					<svg
						className="h-4 w-4"
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
				<h1 className="mb-2 text-3xl font-bold">Edit Profile</h1>
			</div>

			<div className="bg-card rounded-lg border p-8 md:p-10">
				{error && (
					<div className="border-destructive/30 bg-destructive/10 text-destructive mb-6 rounded-md border px-4 py-3">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Username */}
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							type="text"
							value={formData.username}
							onChange={(e) =>
								setFormData({ ...formData, username: e.target.value })
							}
							placeholder="Enter your username"
							required
							minLength={3}
							maxLength={50}
							pattern="^[a-zA-Z0-9_]+$"
							title="Username can only contain letters, numbers, and underscores"
						/>
						<p className="text-muted-foreground text-sm">
							Letters, numbers, and underscores only. 3-50 characters.
						</p>
					</div>

					{/* Bio */}
					<div className="space-y-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							value={formData.bio}
							onChange={(e) =>
								setFormData({ ...formData, bio: e.target.value })
							}
							placeholder="Tell us about yourself"
							rows={4}
							maxLength={500}
							className="resize-none"
						/>
						<div className="text-muted-foreground text-right text-xs">
							{formData.bio?.length || 0}/500
						</div>
					</div>

					{/* Profile Picture URL */}
					<div className="space-y-2">
						<Label htmlFor="profilePicture">Profile Picture URL</Label>
						<Input
							id="profilePicture"
							type="url"
							value={formData.profilePicture}
							onChange={(e) =>
								setFormData({ ...formData, profilePicture: e.target.value })
							}
							placeholder="https://example.com/your-image.jpg"
						/>
						{formData.profilePicture && (
							<div className="mt-4">
								<p className="text-muted-foreground mb-2 text-sm">Preview:</p>
								<Image
									src={formData.profilePicture}
									alt="Profile preview"
									className="h-24 w-24 rounded-full object-cover"
									height={96}
									width={96}
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = "none";
									}}
								/>
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-4 pt-4">
						<Button type="submit" disabled={isLoading} className="cursor-pointer">
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={isLoading}
							className="cursor-pointer"
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
