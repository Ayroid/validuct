"use client";

import {
	BuilderSnapshotHeaderProps,
	ActionPriority,
	NextActionType,
} from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { HiDotsVertical } from "react-icons/hi";
import {
	HiExclamationTriangle,
	HiCurrencyDollar,
	HiChatBubbleLeftRight,
	HiRocketLaunch,
	HiPlusCircle,
} from "react-icons/hi2";

const ACTION_CONFIG: Record<
	NextActionType,
	{
		icon: React.ReactNode;
		color: string;
		bgColor: string;
	}
> = {
	CLARIFY_PROBLEM: {
		icon: <HiExclamationTriangle className="h-5 w-5" />,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10",
	},
	TEST_PRICING: {
		icon: <HiCurrencyDollar className="h-5 w-5" />,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
	},
	GATHER_FEEDBACK: {
		icon: <HiChatBubbleLeftRight className="h-5 w-5" />,
		color: "text-purple-500",
		bgColor: "bg-purple-500/10",
	},
	READY_TO_BUILD: {
		icon: <HiRocketLaunch className="h-5 w-5" />,
		color: "text-green-500",
		bgColor: "bg-green-500/10",
	},
	ADD_FIRST_IDEA: {
		icon: <HiPlusCircle className="h-5 w-5" />,
		color: "text-amber-500",
		bgColor: "bg-amber-500/10",
	},
};

const PRIORITY_BADGE: Record<ActionPriority, string> = {
	HIGH: "bg-red-500/20 text-red-400 border border-red-500/30",
	MEDIUM: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
	LOW: "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function BuilderSnapshotHeader({
	profile,
	validationSummary,
	isOwnProfile,
}: BuilderSnapshotHeaderProps) {
	const nextAction = validationSummary?.nextAction;
	const actionConfig = nextAction ? ACTION_CONFIG[nextAction.action] : null;

	return (
		<div className="">
			<Link
				href="/home"
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
			<div className="bg-card border-x border-t px-6 py-8">
				{/* Back Link */}

				<div className="flex flex-col items-start gap-6">
					<div className="flex w-full gap-6">
						{/* Profile Picture */}
						<div className="shrink-0">
							{profile.user.profilePicture ? (
								<Image
									src={profile.user.profilePicture}
									alt={profile.user.username}
									width={96}
									height={96}
									className="h-24 w-24 rounded-full object-cover"
								/>
							) : (
								<div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
									{profile.user.username[0].toUpperCase()}
								</div>
							)}
						</div>

						{/* Profile Info + Builder Snapshot */}

						<div className="flex w-full items-start justify-between">
							<div>
								<h1 className="text-foreground text-3xl font-bold">
									{profile.user.username}
								</h1>
								{profile.user.bio && (
									<p className="text-muted-foreground mt-2 max-w-2xl">
										{profile.user.bio}
									</p>
								)}

								{/* Builder Snapshot - replaces "Joined / ideas count" */}
								<div className="mt-3 flex items-center gap-4">
									<div className="text-sm">
										<span className="text-foreground font-semibold">
											{validationSummary?.totalIdeas || 0}
										</span>
										<span className="text-muted-foreground"> ideas</span>
									</div>
									{validationSummary &&
										validationSummary.ideasByValidationState.readyToBuild >
											0 && (
											<div className="text-sm">
												<span className="font-semibold text-green-500">
													{
														validationSummary.ideasByValidationState
															.readyToBuild
													}
												</span>
												<span className="text-muted-foreground">
													{" "}
													ready to build
												</span>
											</div>
										)}
									{validationSummary &&
										validationSummary.ideasByValidationState.validated > 0 && (
											<div className="text-sm">
												<span className="font-semibold text-blue-500">
													{validationSummary.ideasByValidationState.validated}
												</span>
												<span className="text-muted-foreground">
													{" "}
													validated
												</span>
											</div>
										)}
								</div>
							</div>

							{/* CTA Section - Redesigned hierarchy */}
							{isOwnProfile && (
								<div className="flex items-center gap-2">
									{/* Primary CTA: New Idea */}
									<Link href="/idea/new">
										<Button variant="default" className="cursor-pointer">
											New Idea
										</Button>
									</Link>

									{/* Secondary: Edit Profile */}
									<Link href={`/${profile.user.username}/edit`}>
										<Button variant="outline" className="cursor-pointer">
											Edit Profile
										</Button>
									</Link>

									{/* Dropdown for Logout */}
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="cursor-pointer"
											>
												<HiDotsVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => signOut({ callbackUrl: "/" })}
												className="text-destructive focus:text-destructive cursor-pointer"
											>
												Logout
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							)}
						</div>
					</div>
					{/* Next Action Recommendation */}
					{isOwnProfile && nextAction && actionConfig && (
						<div className="border-border/50 bg-background/50 mt-4 rounded-lg border p-4">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-full ${actionConfig.bgColor} ${actionConfig.color}`}
									>
										{actionConfig.icon}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="text-foreground text-sm font-medium">
												Next Step
											</span>
											<span
												className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${PRIORITY_BADGE[nextAction.priority]}`}
											>
												{nextAction.priority}
											</span>
										</div>
										<p
											className={`mt-0.5 text-sm ${actionConfig.color} line-clamp-2`}
										>
											{nextAction.message}
										</p>
									</div>
								</div>
								{nextAction.targetIdeaId && (
									<Link href={`/idea/${nextAction.targetIdeaId}`}>
										<Button
											variant="outline"
											size="sm"
											className="shrink-0 cursor-pointer"
										>
											View Idea
										</Button>
									</Link>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
