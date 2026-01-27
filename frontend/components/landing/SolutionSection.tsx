"use client";

import {
	HiEnvelope,
	HiRocketLaunch,
	HiUserGroup,
	HiCurrencyDollar,
	HiChartBar,
	HiCheckCircle,
	HiArrowTrendingUp,
} from "react-icons/hi2";
import FadeIn from "./FadeIn";
import InteractiveCard from "./InteractiveCard";
import AnimatedCounter from "./AnimatedCounter";

const features = [
	{
		icon: HiEnvelope,
		title: "Waitlist Collection",
		description:
			"Collect emails from people genuinely interested in your idea. Export anytime. Real commitment, not just a thumbs up.",
		badges: ["Email capture", "CSV export", "Social proof"],
	},
];

const smallFeatures = [
	{
		icon: HiRocketLaunch,
		title: "Shareable Pages",
		description:
			"Get a beautiful landing page for your idea in minutes. Share anywhere — Twitter, Reddit, communities.",
	},
	{
		icon: HiUserGroup,
		title: "Community Feedback",
		description:
			"Get structured feedback from other builders. Understand your target market better.",
	},
];

const comingSoonFeatures = [
	{
		icon: HiCurrencyDollar,
		title: "Payment Intent",
		description:
			'Capture "I\'d pay $X" signals. Know your potential revenue before building.',
	},
	{
		icon: HiChartBar,
		title: "Conversion Analytics",
		description:
			"Track views vs signups. Understand your conversion rate. Data-driven decisions.",
	},
];

const stats = [
	{ value: 500, suffix: "+", label: "Ideas Validated" },
	{ value: 12, suffix: "K+", label: "Waitlist Signups" },
	{ value: 8.5, suffix: "%", label: "Avg Conversion Rate", decimals: 1 },
];

export default function SolutionSection() {
	return (
		<section className="px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6">
			<div className="mx-auto max-w-6xl">
				{/* Section Header */}
				<FadeIn direction="up" className="mb-10 sm:mb-16 text-center">
					<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
						The Solution
					</span>
					<h2 className="text-foreground mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
						Capture Real Buying Intent
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
						Validuct gives you real demand signals — emails from interested
						users and payment intent from potential customers.
					</p>
				</FadeIn>

				{/* Two Column Bento Layout */}
				<div className="grid gap-6 lg:grid-cols-5">
					{/* Left Column - Feature Cards */}
					<div className="space-y-4 sm:space-y-6 lg:col-span-3">
						{/* Waitlist Collection Card */}
						<FadeIn delay={100} direction="up">
							{features.map((feature) => (
								<InteractiveCard key={feature.title} hoverEffect="lift" className="shadow-card">
									<div className="flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6">
										<div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
											<feature.icon className="text-primary h-6 w-6" />
										</div>
										<div>
											<h3 className="text-foreground mb-2 text-lg sm:text-xl font-semibold">
												{feature.title}
											</h3>
											<p className="text-muted-foreground text-sm sm:text-base">
												{feature.description}
											</p>
										</div>
									</div>
									<div className="border-border bg-muted/30 border-t px-5 sm:px-6 py-3 sm:py-4">
										<div className="flex flex-wrap gap-2 sm:gap-3">
											{feature.badges.map((badge) => (
												<span
													key={badge}
													className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 sm:px-3 py-1 text-xs font-medium text-green-600"
												>
													<HiCheckCircle className="h-3.5 w-3.5" />
													{badge}
												</span>
											))}
										</div>
									</div>
								</InteractiveCard>
							))}
						</FadeIn>

						{/* Two smaller cards in a row */}
						<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
							{smallFeatures.map((feature, index) => (
								<FadeIn key={feature.title} delay={200 + index * 100} direction="up">
									<InteractiveCard hoverEffect="lift" className="h-full shadow-card">
										<div className="p-5 sm:p-6">
											<div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
												<feature.icon className="text-primary h-6 w-6" />
											</div>
											<h3 className="text-foreground mb-2 text-base sm:text-lg font-semibold">
												{feature.title}
											</h3>
											<p className="text-muted-foreground text-sm">
												{feature.description}
											</p>
										</div>
									</InteractiveCard>
								</FadeIn>
							))}
						</div>

						{/* Coming Soon Cards */}
						<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
							{comingSoonFeatures.map((feature, index) => (
								<FadeIn key={feature.title} delay={400 + index * 100} direction="up">
									<InteractiveCard hoverEffect="glow" className="shadow-card">
										<div className="from-card to-muted/50 relative overflow-hidden bg-gradient-to-br p-5 sm:p-6">
											<div className="absolute top-3 right-3 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
												Coming Soon
											</div>
											<div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
												<feature.icon className="text-primary h-6 w-6" />
											</div>
											<h3 className="text-foreground mb-2 text-base sm:text-lg font-semibold">
												{feature.title}
											</h3>
											<p className="text-muted-foreground text-sm">
												{feature.description}
											</p>
										</div>
									</InteractiveCard>
								</FadeIn>
							))}
						</div>
					</div>

					{/* Right Column - Dark Stats Panel */}
					<div className="lg:col-span-2">
						<FadeIn delay={300} direction="right">
							<div className="bg-foreground text-background sticky top-24 rounded-2xl p-6 sm:p-8">
								<h3 className="text-background/70 mb-6 sm:mb-8 text-base sm:text-lg font-medium">
									Platform Stats
								</h3>

								<div className="space-y-6 sm:space-y-8">
									{stats.map((stat, index) => (
										<div key={stat.label} className="group">
											<p className="text-3xl sm:text-4xl md:text-5xl font-bold transition-transform duration-300 group-hover:scale-105">
												<AnimatedCounter
													end={stat.value}
													suffix={stat.suffix}
													decimals={stat.decimals || 0}
													duration={2000 + index * 200}
												/>
											</p>
											<p className="text-background/60 mt-1 text-xs sm:text-sm tracking-wider uppercase">
												{stat.label}
											</p>
										</div>
									))}

									<div className="flex items-center gap-3 pt-4 border-t border-background/10">
										<div className="bg-background/10 flex h-10 w-10 items-center justify-center rounded-lg">
											<HiArrowTrendingUp className="h-5 w-5" />
										</div>
										<p className="text-background/60 text-xs sm:text-sm tracking-wider uppercase">
											Real Demand Signals
										</p>
									</div>
								</div>
							</div>
						</FadeIn>
					</div>
				</div>
			</div>
		</section>
	);
}
