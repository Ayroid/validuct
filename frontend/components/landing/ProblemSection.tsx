"use client";

import { FaProductHunt, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import { HiXCircle } from "react-icons/hi2";
import FadeIn from "./FadeIn";
import InteractiveCard from "./InteractiveCard";

const problems = [
	{
		icon: FaProductHunt,
		title: "Product Hunt",
		description:
			"You need a finished product to launch. Upvotes come from other makers, not customers.",
		issue: "No pre-launch validation",
		color: "#DA552F",
	},
	{
		icon: FaRedditAlien,
		title: "Reddit",
		description:
			'"Cool idea bro" comments don\'t validate demand. No way to capture or track interested users.',
		issue: "No actionable data",
		color: "#FF4500",
	},
	{
		icon: FaXTwitter,
		title: "Twitter/X",
		description:
			"Likes from followers who'll never become customers. Engagement ≠ willingness to pay.",
		issue: "Vanity metrics only",
		color: "var(--foreground)",
	},
];

export default function ProblemSection() {
	return (
		<section className="px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6">
			<div className="mx-auto max-w-6xl">
				{/* Section Header */}
				<FadeIn direction="up" className="mb-10 sm:mb-16 text-center">
					<span className="bg-destructive/10 text-destructive mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
						The Problem
					</span>
					<h2 className="text-foreground mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
						Likes and Upvotes Don&apos;t Pay Bills
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
						Twitter polls, Reddit posts, and Product Hunt launches give you
						vanity metrics. None of them capture real buying intent.
					</p>
				</FadeIn>

				{/* Problem Cards */}
				<div className="grid gap-4 sm:gap-6 md:grid-cols-3">
					{problems.map((problem, index) => (
						<FadeIn key={problem.title} delay={index * 150} direction="up">
							<InteractiveCard
								hoverEffect="lift"
								accentColor={problem.color}
								className="h-full shadow-card"
							>
								<div className="p-5 sm:p-6 pl-6 sm:pl-8">
									<div
										className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
										style={{ backgroundColor: `${problem.color}15` }}
									>
										<problem.icon
											className="h-6 w-6 sm:h-7 sm:w-7"
											style={{ color: problem.color }}
										/>
									</div>
									<h3 className="text-foreground mb-2 text-lg sm:text-xl font-semibold">
										{problem.title}
									</h3>
									<p className="text-muted-foreground mb-4 text-sm sm:text-base">
										{problem.description}
									</p>
									<div className="text-destructive flex items-center gap-2 text-sm">
										<HiXCircle className="h-4 w-4" />
										<span>{problem.issue}</span>
									</div>
								</div>
							</InteractiveCard>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}
