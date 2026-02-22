"use client";

import { BuilderSnapshotHeaderProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	ThumbsUp,
	Zap,
	BookmarkCheck,
	MessageSquare,
} from "lucide-react";

function formatMemberSince(createdAt: string) {
	return new Date(createdAt).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	});
}

function ContribStat({
	icon: Icon,
	count,
	label,
	iconBgClass,
	iconColorClass,
}: {
	icon: React.ElementType;
	count: number;
	label: string;
	iconBgClass: string;
	iconColorClass: string;
}) {
	return (
		<div className="bg-muted/50 dark:bg-muted/20 flex flex-col items-center justify-between rounded-xl px-4 py-4">
			<div
				className={`flex h-12 w-12 items-center justify-center mb-2 rounded-full ${iconBgClass}`}
			>
				<Icon className={`h-4 w-4 ${iconColorClass}`} />
			</div>
			<div className="flex flex-col gap-1 text-center">
				<span className="text-foreground text-3xl leading-none font-bold">
					{count}
				</span>
				<span className="text-muted-foreground text-xs font-medium">
					{label}
				</span>
			</div>
		</div>
	);
}

export default function BuilderSnapshotHeader({
	profile,
	validationSummary,
	isOwnProfile,
}: BuilderSnapshotHeaderProps) {
	const totalIdeas = validationSummary?.totalIdeas || profile.ideasCount || 0;
	const validated = validationSummary?.ideasByValidationState.validated || 0;
	const readyToBuild =
		validationSummary?.ideasByValidationState.readyToBuild || 0;

	const { upvotesGiven, signalsGiven, commentsGiven, waitlistJoins } =
		profile.contributionStats;

	return (
		<div className="dark:bg-card relative flex flex-col items-center rounded-lg bg-white p-6 py-10 text-center shadow-sm">
			{/* Avatar */}
			{profile.user.profilePicture ? (
				<Image
					src={profile.user.profilePicture}
					alt={profile.user.username}
					width={120}
					height={120}
					className="ring-border h-24 w-24 rounded-full object-cover ring-4 sm:h-30 sm:w-30"
				/>
			) : (
				<div className="from-primary to-accent ring-border flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br text-3xl font-bold text-white ring-4 sm:h-30 sm:w-30 sm:text-4xl">
					{profile.user.username[0].toUpperCase()}
				</div>
			)}

			{/* Username */}
			<h1 className="font-display text-foreground mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
				{profile.user.username}
			</h1>

			{/* Member Since */}
			<div className="text-muted-foreground mt-1.5 flex items-center gap-1 text-xs">
				<Calendar className="h-3 w-3" />
				<span>Member since {formatMemberSince(profile.user.createdAt)}</span>
			</div>

			{/* Bio */}
			{profile.user.bio && (
				<p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
					{profile.user.bio}
				</p>
			)}

			{/* Idea Stats Row */}
			<div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
				<span className="bg-muted text-foreground rounded-full px-3 py-1 font-medium">
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

			{/* Contribution Stats */}
			<div className="border-border/50 mt-5 w-full border-t pt-5">
				<p className="text-muted-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
					Community Impact
				</p>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<ContribStat
						icon={ThumbsUp}
						count={upvotesGiven}
						label="Upvotes Given"
						iconBgClass="bg-amber-100 dark:bg-amber-500/20"
						iconColorClass="text-amber-500 dark:text-amber-400"
					/>
					<ContribStat
						icon={Zap}
						count={signalsGiven}
						label="Signals Sent"
						iconBgClass="bg-violet-100 dark:bg-violet-500/20"
						iconColorClass="text-violet-500 dark:text-violet-400"
					/>
					<ContribStat
						icon={BookmarkCheck}
						count={waitlistJoins}
						label="Ideas Waitlisted"
						iconBgClass="bg-sky-100 dark:bg-sky-500/20"
						iconColorClass="text-sky-500 dark:text-sky-400"
					/>
					<ContribStat
						icon={MessageSquare}
						count={commentsGiven}
						label="Feedbacks Given"
						iconBgClass="bg-emerald-100 dark:bg-emerald-500/20"
						iconColorClass="text-emerald-500 dark:text-emerald-400"
					/>
				</div>
			</div>

			{/* Action Buttons */}
			{isOwnProfile && (
				<div className="absolute top-5 right-5">
					<Link href={`/${profile.user.username}/edit`}>
						<Button
							variant="secondary"
							size="sm"
							className="cursor-pointer transition-colors"
						>
							Edit Profile
						</Button>
					</Link>
				</div>
			)}
		</div>
	);
}
