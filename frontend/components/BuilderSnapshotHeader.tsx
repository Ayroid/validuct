"use client";

import { BuilderSnapshotHeaderProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiChartBar, HiPencil } from "react-icons/hi2";

export default function BuilderSnapshotHeader({
	profile,
	validationSummary,
	isOwnProfile,
}: BuilderSnapshotHeaderProps) {
	return (
		<div>
			{/* Profile Card */}
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-6 sm:p-8">
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
								<Link href={`/${profile.user.username}/analytics`}>
									<Button
										variant="default"
										className="cursor-pointer transition-colors"
									>
										<HiChartBar className="mr-1.5 h-4 w-4" />
										Analytics
									</Button>
								</Link>
								<Link href={`/${profile.user.username}/edit`}>
									<Button
										variant="outline"
										className="cursor-pointer transition-colors"
									>
										<HiPencil className="h-4 w-4" />
										Edit Profile
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
