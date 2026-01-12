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
import {
	HiArrowLeft,
	HiEllipsisVertical,
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
		color: "text-signal-clarity",
		bgColor: "bg-signal-clarity",
	},
	TEST_PRICING: {
		icon: <HiCurrencyDollar className="h-5 w-5" />,
		color: "text-signal-pay",
		bgColor: "bg-signal-pay",
	},
	GATHER_FEEDBACK: {
		icon: <HiChatBubbleLeftRight className="h-5 w-5" />,
		color: "text-signal-build",
		bgColor: "bg-signal-build",
	},
	READY_TO_BUILD: {
		icon: <HiRocketLaunch className="h-5 w-5" />,
		color: "text-emerald-500",
		bgColor: "bg-emerald-500/10",
	},
	ADD_FIRST_IDEA: {
		icon: <HiPlusCircle className="h-5 w-5" />,
		color: "text-amber-500",
		bgColor: "bg-amber-500/10",
	},
};

const PRIORITY_BADGE: Record<ActionPriority, string> = {
	HIGH: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
	MEDIUM:
		"bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
	LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
};

export default function BuilderSnapshotHeader({
	profile,
	validationSummary,
	isOwnProfile,
}: BuilderSnapshotHeaderProps) {
	const nextAction = validationSummary?.nextAction;
	const actionConfig = nextAction ? ACTION_CONFIG[nextAction.action] : null;

	return (
		<div>
			{/* Back Link */}
			<Link
				href="/home"
				className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
			>
				<HiArrowLeft className="h-4 w-4" />
				<span>BACK</span>
			</Link>

			{/* Profile Card */}
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-6 sm:p-8">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-6 sm:flex-row">
						{/* Profile Picture */}
						<div className="shrink-0">
							{profile.user.profilePicture ? (
								<Image
									src={profile.user.profilePicture}
									alt={profile.user.username}
									width={96}
									height={96}
									className="ring-border h-20 w-20 rounded-full object-cover ring-4 sm:h-24 sm:w-24"
								/>
							) : (
								<div className="from-primary to-accent ring-border flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br text-2xl font-bold text-white ring-4 sm:h-24 sm:w-24 sm:text-3xl">
									{profile.user.username[0].toUpperCase()}
								</div>
							)}
						</div>

						{/* Profile Info */}
						<div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div className="min-w-0 flex-1">
								<h1 className="text-foreground text-2xl font-bold sm:text-3xl">
									{profile.user.username}
								</h1>
								{profile.user.bio && (
									<p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
										{profile.user.bio}
									</p>
								)}

								{/* Builder Stats */}
								<div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
									<div>
										<span className="text-foreground font-semibold">
											{validationSummary?.totalIdeas || 0}
										</span>
										<span className="text-muted-foreground"> ideas</span>
									</div>
									{validationSummary &&
										validationSummary.ideasByValidationState.readyToBuild >
											0 && (
											<div>
												<span className="font-semibold text-emerald-600 dark:text-emerald-400">
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
											<div>
												<span className="font-semibold text-sky-600 dark:text-sky-400">
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

							{/* CTA Section */}
							{isOwnProfile && (
								<div className="flex items-center gap-2">
									<Link href="/idea/new">
										<Button>New Idea</Button>
									</Link>
									<Link href={`/${profile.user.username}/edit`}>
										<Button variant="outline">Edit Profile</Button>
									</Link>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<HiEllipsisVertical className="h-5 w-5" />
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
						<div className="bg-muted/50 border-border/30 rounded-xl border p-4">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3">
									<div
										className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${actionConfig.bgColor} ${actionConfig.color}`}
									>
										{actionConfig.icon}
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-foreground text-sm font-medium">
												Next Step
											</span>
											<span
												className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_BADGE[nextAction.priority]}`}
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
										<Button variant="outline" size="sm" className="shrink-0">
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
