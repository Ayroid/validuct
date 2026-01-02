"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { userApi, UpdateProfileData } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	const [success, setSuccess] = useState(false);

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
		setSuccess(false);

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

			setSuccess(true);

			// Redirect to profile after 1 second
			setTimeout(() => {
				router.push(`/${updatedUser.username}`);
			}, 1000);
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
		router.push("/login");
		return null;
	}

	return (
		<div className="bg-background min-h-screen py-12">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl">
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
				</div>
				<div className="bg-card rounded-lg border p-8">
					<h1 className="mb-6 text-3xl font-bold">Edit Profile</h1>

					{error && (
						<div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
							{error}
						</div>
					)}

					{success && (
						<div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
							Profile updated successfully! Redirecting...
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Username */}
						<div>
							<label
								htmlFor="username"
								className="mb-2 block text-sm font-medium text-gray-700"
							>
								Username
							</label>
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
							<p className="mt-1 text-sm text-gray-500">
								Letters, numbers, and underscores only. 3-50 characters.
							</p>
						</div>

						{/* Bio */}
						<div>
							<label
								htmlFor="bio"
								className="mb-2 block text-sm font-medium text-gray-700"
							>
								Bio
							</label>
							<textarea
								id="bio"
								value={formData.bio}
								onChange={(e) =>
									setFormData({ ...formData, bio: e.target.value })
								}
								placeholder="Tell us about yourself"
								rows={4}
								maxLength={500}
								className="w-full resize-none rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
							/>
							<p className="mt-1 text-sm text-gray-500">
								{formData.bio?.length || 0}/500 characters
							</p>
						</div>

						{/* Profile Picture URL */}
						<div>
							<label
								htmlFor="profilePicture"
								className="mb-2 block text-sm font-medium text-gray-700"
							>
								Profile Picture URL
							</label>
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
									<p className="mb-2 text-sm text-gray-700">Preview:</p>
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
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={isLoading}
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
