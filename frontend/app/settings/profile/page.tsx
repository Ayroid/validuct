"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { userApi, UpdateProfileData } from "@/lib/api/users";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
				router.push(`/profile/${updatedUser.username}`);
			}, 1000);
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	if (!session?.user) {
		router.push("/login");
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white rounded-lg shadow-md p-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">
						Edit Profile
					</h1>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
							{error}
						</div>
					)}

					{success && (
						<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
							Profile updated successfully! Redirecting...
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Username */}
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 mb-2"
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
							<p className="text-sm text-gray-500 mt-1">
								Letters, numbers, and underscores only. 3-50 characters.
							</p>
						</div>

						{/* Bio */}
						<div>
							<label
								htmlFor="bio"
								className="block text-sm font-medium text-gray-700 mb-2"
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
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
							/>
							<p className="text-sm text-gray-500 mt-1">
								{formData.bio?.length || 0}/500 characters
							</p>
						</div>

						{/* Profile Picture URL */}
						<div>
							<label
								htmlFor="profilePicture"
								className="block text-sm font-medium text-gray-700 mb-2"
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
									<p className="text-sm text-gray-700 mb-2">Preview:</p>
									<img
										src={formData.profilePicture}
										alt="Profile preview"
										className="w-24 h-24 rounded-full object-cover"
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
