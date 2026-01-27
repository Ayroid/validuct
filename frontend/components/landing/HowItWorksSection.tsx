"use client";

import Image from "next/image";
import {
	HiEye,
	HiClipboardDocumentList,
	HiArrowTrendingUp,
} from "react-icons/hi2";
import FadeIn from "./FadeIn";

const steps = [
	{
		number: 1,
		title: "Describe your idea",
		description:
			"Post your concept with problem, solution, and target audience. Get a shareable page instantly.",
	},
	{
		number: 2,
		title: "Share & collect",
		description:
			"Share your page anywhere. Collect waitlist signups from people who actually want your product.",
	},
	{
		number: 3,
		title: "Build or pivot",
		description:
			"50 signups? Build it. Zero interest? Pivot. Let data guide your decisions, not opinions.",
	},
];

const sampleSignups = [
	{ email: "john@example.com", time: "2m ago" },
	{ email: "sarah@startup.io", time: "5m ago" },
	{ email: "mike@company.com", time: "12m ago" },
];

export default function HowItWorksSection() {
	return (
		<section className="bg-muted/50 px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6">
			<div className="mx-auto max-w-6xl">
				{/* Section Header */}
				<FadeIn direction="up" className="mb-12 sm:mb-20 text-center">
					<span className="bg-card text-muted-foreground mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
						How It Works
					</span>
					<h2 className="text-foreground mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
						Validate in 3 Simple Steps
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
						Go from idea to validated demand in minutes, not months.
					</p>
				</FadeIn>

				{/* Two Column Layout */}
				<div className="grid items-start gap-8 sm:gap-12 lg:grid-cols-2">
					{/* Left Column - Steps */}
					<div className="space-y-6 sm:space-y-8">
						{steps.map((step, index) => (
							<FadeIn key={step.number} delay={index * 150} direction="left">
								<div className="flex gap-4 sm:gap-6 group">
									<div className="bg-primary flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
										<span className="text-primary-foreground text-lg sm:text-xl font-bold">
											{step.number}
										</span>
									</div>
									<div>
										<h3 className="text-foreground mb-2 text-lg sm:text-xl font-semibold">
											{step.title}
										</h3>
										<p className="text-muted-foreground text-sm sm:text-base">
											{step.description}
										</p>
									</div>
								</div>
								{index < steps.length - 1 && (
									<div className="bg-border ml-[22px] sm:ml-7 h-6 sm:h-8 w-px mt-4"></div>
								)}
							</FadeIn>
						))}
					</div>

					{/* Right Column - Visual Preview */}
					<FadeIn delay={300} direction="right">
						<div className="border-border bg-card rounded-2xl border p-5 sm:p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
							<div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<Image
										src="/logo.png"
										alt="Validuct"
										width={32}
										height={32}
									/>
									<span className="text-foreground text-sm sm:text-base font-semibold">
										Your Idea Dashboard
									</span>
								</div>
								<span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 animate-pulse">
									Live
								</span>
							</div>

							{/* Stats Grid */}
							<div className="grid gap-3 sm:gap-4 grid-cols-3">
								<div className="bg-muted rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-muted/80">
									<div className="text-muted-foreground mb-1 flex items-center gap-1.5 sm:gap-2">
										<HiEye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										<span className="text-[10px] sm:text-xs">Views</span>
									</div>
									<p className="text-foreground text-lg sm:text-2xl font-bold">1,247</p>
								</div>
								<div className="bg-muted rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-muted/80">
									<div className="text-muted-foreground mb-1 flex items-center gap-1.5 sm:gap-2">
										<HiClipboardDocumentList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										<span className="text-[10px] sm:text-xs">Waitlist</span>
									</div>
									<p className="text-foreground text-lg sm:text-2xl font-bold">156</p>
								</div>
								<div className="bg-muted rounded-xl p-3 sm:p-4 transition-all duration-300 hover:bg-muted/80">
									<div className="text-muted-foreground mb-1 flex items-center gap-1.5 sm:gap-2">
										<HiArrowTrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
										<span className="text-[10px] sm:text-xs">Conv.</span>
									</div>
									<p className="text-foreground text-lg sm:text-2xl font-bold">12.5%</p>
								</div>
							</div>

							{/* Sample Signups Preview */}
							<div className="border-border bg-background mt-4 sm:mt-6 rounded-xl border p-3 sm:p-4">
								<p className="text-muted-foreground mb-2 sm:mb-3 text-[10px] sm:text-xs font-medium tracking-wider uppercase">
									Recent Signups
								</p>
								<div className="space-y-2">
									{sampleSignups.map((signup, index) => (
										<div
											key={signup.email}
											className="bg-muted/50 flex items-center justify-between rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all duration-300 hover:bg-muted"
											style={{ animationDelay: `${index * 100}ms` }}
										>
											<span className="text-foreground text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
												{signup.email}
											</span>
											<span className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap ml-2">
												{signup.time}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</FadeIn>
				</div>
			</div>
		</section>
	);
}
