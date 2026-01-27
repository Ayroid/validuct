"use client";

import {
	HiPencilSquare,
	HiShare,
	HiChartBar,
	HiArrowRight,
	HiUserGroup,
	HiCheckCircle,
} from "react-icons/hi2";
import FadeIn from "./FadeIn";

const steps = [
	{
		number: 1,
		icon: HiPencilSquare,
		title: "Describe your idea",
		description:
			"Post your concept with problem, solution, and target audience. Get a shareable page instantly.",
		color: "bg-blue-500",
	},
	{
		number: 2,
		icon: HiShare,
		title: "Share & collect",
		description:
			"Share your page anywhere. Collect waitlist signups from people who actually want your product.",
		color: "bg-purple-500",
	},
	{
		number: 3,
		icon: HiChartBar,
		title: "Build or pivot",
		description:
			"50 signups? Build it. Zero interest? Pivot. Let data guide your decisions, not opinions.",
		color: "bg-green-500",
	},
];

export default function HowItWorksSection() {
	return (
		<section className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<FadeIn direction="up" className="mb-12 text-center sm:mb-16 lg:mb-20">
					<span className="bg-card text-muted-foreground border-border mb-4 inline-block rounded-full border px-4 py-2 text-sm font-medium sm:text-base">
						How It Works
					</span>
					<h2 className="text-foreground mb-5 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
						Validate in 3 Simple Steps
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
						Go from idea to validated demand in minutes, not months.
					</p>
				</FadeIn>

				{/* Steps - Horizontal on desktop, vertical on mobile */}
				<div className="relative">
					{/* Connection line - desktop only */}
					<div className="absolute top-16 right-[16.67%] left-[16.67%] hidden h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 lg:block" />

					<div className="grid gap-8 sm:gap-10 lg:grid-cols-3 lg:gap-8">
						{steps.map((step, index) => (
							<FadeIn
								key={step.number}
								delay={100 + index * 150}
								direction="up"
							>
								<div className="relative flex flex-col items-center text-center">
									{/* Step number circle */}
									<div
										className={`${step.color} relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 hover:scale-110 sm:h-24 sm:w-24 lg:h-28 lg:w-28`}
									>
										<step.icon className="h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
									</div>

									{/* Step indicator */}
									<span className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wider">
										Step {step.number}
									</span>

									{/* Content */}
									<h3 className="text-foreground mb-3 text-xl font-semibold sm:text-2xl">
										{step.title}
									</h3>
									<p className="text-muted-foreground mx-auto max-w-xs text-base sm:text-lg">
										{step.description}
									</p>

									{/* Arrow for mobile */}
									{index < steps.length - 1 && (
										<div className="mt-6 flex justify-center lg:hidden">
											<HiArrowRight className="text-muted-foreground/40 h-6 w-6 rotate-90" />
										</div>
									)}
								</div>
							</FadeIn>
						))}
					</div>
				</div>

				{/* Bottom CTA Card */}
				<FadeIn delay={500} direction="up">
					<div className="bg-card border-border mx-auto mt-16 max-w-3xl rounded-2xl border p-6 shadow-lg sm:mt-20 sm:rounded-3xl sm:p-8 lg:p-10">
						<div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
							{/* Icon group */}
							<div className="flex -space-x-3">
								<div className="bg-primary/10 border-background flex h-14 w-14 items-center justify-center rounded-full border-4 sm:h-16 sm:w-16">
									<HiUserGroup className="text-primary h-7 w-7 sm:h-8 sm:w-8" />
								</div>
								<div className="bg-green-500/10 border-background flex h-14 w-14 items-center justify-center rounded-full border-4 sm:h-16 sm:w-16">
									<HiCheckCircle className="h-7 w-7 text-green-500 sm:h-8 sm:w-8" />
								</div>
							</div>

							{/* Text */}
							<div className="flex-1">
								<h3 className="text-foreground mb-2 text-xl font-semibold sm:text-2xl">
									Most ideas get their first signup within 24 hours
								</h3>
								<p className="text-muted-foreground text-base sm:text-lg">
									Share on Twitter, Reddit, or Indie Hackers and watch the
									signups roll in.
								</p>
							</div>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
