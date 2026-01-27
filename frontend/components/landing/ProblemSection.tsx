"use client";

import { FaProductHunt, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import { HiXCircle } from "react-icons/hi2";
import FadeIn from "./FadeIn";

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
		<section className="px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<FadeIn direction="up" className="mb-12 text-center sm:mb-16 lg:mb-20">
					<span className="bg-destructive/10 text-destructive mb-4 inline-block rounded-full px-4 py-2 text-sm font-medium sm:text-base">
						The Problem
					</span>
					<h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
						Likes and Upvotes Don&apos;t Pay Bills
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
						Twitter polls, Reddit posts, and Product Hunt launches give you
						vanity metrics. None of them capture real buying intent.
					</p>
				</FadeIn>

				{/* Problem Cards */}
				<div className="grid gap-6 sm:gap-8 md:grid-cols-3">
					{problems.map((problem, index) => (
						<FadeIn key={problem.title} delay={index * 150} direction="up">
							<div className="bg-card border-border group relative h-full overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8">
								{/* Accent bar */}
								<div
									className="absolute top-0 left-0 h-full w-1 transition-all duration-300 group-hover:w-1.5"
									style={{ backgroundColor: problem.color }}
								/>

								{/* Icon */}
								<div
									className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16"
									style={{ backgroundColor: `${problem.color}15` }}
								>
									<problem.icon
										className="h-7 w-7 sm:h-8 sm:w-8"
										style={{ color: problem.color }}
									/>
								</div>

								{/* Content */}
								<h3 className="text-foreground mb-3 text-xl font-semibold sm:text-2xl">
									{problem.title}
								</h3>
								<p className="text-muted-foreground mb-5 text-base sm:text-lg">
									{problem.description}
								</p>

								{/* Issue badge */}
								<div className="text-destructive inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium">
									<HiXCircle className="h-4 w-4" />
									<span>{problem.issue}</span>
								</div>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}
