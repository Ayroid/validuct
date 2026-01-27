"use client";

import {
	HiEnvelope,
	HiRocketLaunch,
	HiUserGroup,
	HiCurrencyDollar,
	HiChartBar,
	HiCheckCircle,
} from "react-icons/hi2";
import FadeIn from "./FadeIn";

const mainFeatures = [
	{
		icon: HiEnvelope,
		title: "Waitlist Collection",
		description:
			"Collect emails from people genuinely interested in your idea. Real commitment, not just likes. Export your list anytime.",
		highlights: ["Email capture", "CSV export", "Real-time notifications"],
		color: "text-green-600",
		bgColor: "bg-green-500/10",
	},
	{
		icon: HiUserGroup,
		title: "Validation Signals",
		description:
			"Get structured feedback from builders. Know if your problem is real, if people would pay, and if your idea is ready to build.",
		highlights: ["Would pay signals", "Problem validation", "Build readiness"],
		color: "text-blue-600",
		bgColor: "bg-blue-500/10",
	},
	{
		icon: HiRocketLaunch,
		title: "Shareable Idea Pages",
		description:
			"Get a beautiful landing page for your idea in minutes. Share anywhere — Twitter, Reddit, Indie Hackers, communities.",
		highlights: ["Instant pages", "Social sharing", "SEO optimized"],
		color: "text-purple-600",
		bgColor: "bg-purple-500/10",
	},
];

const comingSoonFeatures = [
	{
		icon: HiCurrencyDollar,
		title: "Payment Intent",
		description: "Capture \"I'd pay $X\" signals from potential customers.",
	},
	{
		icon: HiChartBar,
		title: "Analytics Dashboard",
		description: "Track views, signups, and conversion rates over time.",
	},
];

export default function SolutionSection() {
	return (
		<section className="px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<FadeIn direction="up" className="mb-12 text-center sm:mb-16 lg:mb-20">
					<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-2 text-sm font-medium sm:text-base">
						The Solution
					</span>
					<h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
						Capture Real Buying Intent
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
						Validuct gives you real demand signals — emails from interested
						users and validation from potential customers.
					</p>
				</FadeIn>

				{/* Main Features Grid */}
				<div className="mb-16 grid gap-6 sm:mb-20 sm:gap-8 lg:grid-cols-3">
					{mainFeatures.map((feature, index) => (
						<FadeIn key={feature.title} delay={100 + index * 100} direction="up">
							<div className="bg-card border-border group relative h-full overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8">
								{/* Icon */}
								<div
									className={`${feature.bgColor} mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16`}
								>
									<feature.icon
										className={`h-7 w-7 sm:h-8 sm:w-8 ${feature.color}`}
									/>
								</div>

								{/* Content */}
								<h3 className="text-foreground mb-3 text-xl font-semibold sm:text-2xl">
									{feature.title}
								</h3>
								<p className="text-muted-foreground mb-6 text-base sm:text-lg">
									{feature.description}
								</p>

								{/* Highlights */}
								<div className="flex flex-wrap gap-2">
									{feature.highlights.map((highlight) => (
										<span
											key={highlight}
											className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground sm:text-sm"
										>
											<HiCheckCircle
												className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${feature.color}`}
											/>
											{highlight}
										</span>
									))}
								</div>
							</div>
						</FadeIn>
					))}
				</div>

				{/* Coming Soon Section */}
				<FadeIn delay={400} direction="up">
					<div className="bg-muted/50 rounded-2xl p-6 sm:rounded-3xl sm:p-8 lg:p-10">
						<div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
							{/* Left side - Label and description */}
							<div className="max-w-xl">
								<div className="mb-3 flex items-center gap-2">
									<span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 sm:text-sm">
										Coming Soon
									</span>
								</div>
								<h3 className="text-foreground mb-2 text-xl font-semibold sm:text-2xl">
									Even more powerful features on the way
								</h3>
								<p className="text-muted-foreground text-base sm:text-lg">
									We&apos;re building the complete validation toolkit for
									builders.
								</p>
							</div>

							{/* Right side - Feature pills */}
							<div className="flex flex-wrap gap-3 lg:flex-nowrap">
								{comingSoonFeatures.map((feature) => (
									<div
										key={feature.title}
										className="bg-card border-border flex items-center gap-3 rounded-xl border px-4 py-3 sm:px-5 sm:py-4"
									>
										<div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12">
											<feature.icon className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
										</div>
										<div>
											<p className="text-foreground text-sm font-semibold sm:text-base">
												{feature.title}
											</p>
											<p className="text-muted-foreground hidden text-xs sm:block sm:text-sm">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
