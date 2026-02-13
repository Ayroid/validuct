"use client";

import { BuilderSnapshotHeaderProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function BuilderSnapshotHeader({
	profile,
	validationSummary,
	isOwnProfile,
}: BuilderSnapshotHeaderProps) {
	const totalIdeas = validationSummary?.totalIdeas || profile.ideasCount || 0;
	const validated = validationSummary?.ideasByValidationState.validated || 0;
	const readyToBuild =
		validationSummary?.ideasByValidationState.readyToBuild || 0;

	return (
		<div className="flex flex-col items-center text-center bg-white rounded-lg p-6 py-10 dark:bg-card shadow-sm">
			{/* Avatar */}
			{profile.user.profilePicture ? (
				<Image
					src={profile.user.profilePicture}
					alt={profile.user.username}
					width={120}
					height={120}
					className="h-24 w-24 rounded-full object-cover ring-4 ring-border sm:h-30 sm:w-30"
				/>
			) : (
				<div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-3xl font-bold text-white ring-4 ring-border sm:h-30 sm:w-30 sm:text-4xl">
					{profile.user.username[0].toUpperCase()}
				</div>
			)}

			{/* Username */}
			<h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
				{profile.user.username}
			</h1>

			{/* Bio */}
			{profile.user.bio && (
				<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
					{profile.user.bio}
				</p>
			)}

			{/* Stats Row */}
			<div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
				<span className="rounded-full bg-muted px-3 py-1 font-medium text-foreground">
					{totalIdeas} idea{totalIdeas !== 1 ? "s" : ""}
				</span>
				{validated > 0 && (
					<span className="rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
						{validated} validated
					</span>
				)}
				{readyToBuild > 0 && (
					<span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
						{readyToBuild} ready to build
					</span>
				)}
			</div>

			{/* Action Buttons */}
			{isOwnProfile && (
				<div className="mt-5">
					<Link href={`/${profile.user.username}/edit`}>
						<Button
							variant="default"
							size="sm"
							className="cursor-pointer transition-colors"
						>
							<Pencil className="mr-1.5 h-3.5 w-3.5" />
							Edit Profile
						</Button>
					</Link>
				</div>
			)}
		</div>
	);
}
