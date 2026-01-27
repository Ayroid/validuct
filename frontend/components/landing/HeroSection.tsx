"use client";

import Link from "next/link";
import {
	HiSparkles,
	HiCheckCircle,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
	HiUserGroup,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import FadeIn from "./FadeIn";

interface HeroSectionProps {
	ctaLink: string;
}

// Social proof avatars - replace with real user data when available
const socialProofAvatars = [
	{ name: "Alex", color: "bg-blue-500" },
	{ name: "Sarah", color: "bg-green-500" },
	{ name: "Mike", color: "bg-purple-500" },
	{ name: "Emma", color: "bg-pink-500" },
	{ name: "John", color: "bg-amber-500" },
];

// Mock validation signals for the product preview
const mockSignals = [
	{
		icon: HiCheckCircle,
		label: "Problem feels real",
		count: 24,
		color: "text-signal-problem",
		bg: "bg-signal-problem",
	},
	{
		icon: HiCurrencyDollar,
		label: "Would pay",
		count: 18,
		color: "text-signal-pay",
		bg: "bg-signal-pay",
	},
	{
		icon: HiRocketLaunch,
		label: "Ready to build",
		count: 12,
		color: "text-signal-build",
		bg: "bg-signal-build",
	},
	{
		icon: HiExclamationTriangle,
		label: "Needs clarity",
		count: 3,
		color: "text-signal-clarity",
		bg: "bg-signal-clarity",
	},
];

export default function HeroSection({ ctaLink }: HeroSectionProps) {
	return (
		<section className="relative flex min-h-screen flex-col justify-center px-4 pt-20 pb-8 sm:px-6 sm:pt-24 sm:pb-12 lg:pt-8 lg:pb-8">
			{/* Main Content */}
			<div className="mx-auto w-full max-w-7xl">
				<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
					{/* Left Column - Content */}
					<div>
						{/* Badge */}
						<FadeIn delay={100} direction="up">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary sm:text-base">
								<HiSparkles className="h-4 w-4 sm:h-5 sm:w-5" />
								<span>For Builders & Makers</span>
							</div>
						</FadeIn>

						{/* Headline */}
						<FadeIn delay={200} direction="up">
							<h1 className="text-foreground mb-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
								Know if people will{" "}
								<span className="text-primary relative inline-block">
									pay
									<svg
										className="absolute -bottom-1 left-0 w-full sm:-bottom-2"
										viewBox="0 0 100 12"
										preserveAspectRatio="none"
										height="12"
									>
										<path
											d="M0,8 Q25,2 50,8 T100,8"
											fill="none"
											stroke="currentColor"
											strokeWidth="4"
											strokeLinecap="round"
											className="text-primary/40"
										/>
									</svg>
								</span>{" "}
								before you build
							</h1>
						</FadeIn>

						{/* Subheadline */}
						<FadeIn delay={300} direction="up">
							<p className="text-muted-foreground mb-8 max-w-xl text-lg sm:text-xl md:text-2xl">
								Collect waitlist signups and real validation signals for your
								idea. Stop building products nobody wants.
							</p>
						</FadeIn>

						{/* CTA */}
						<FadeIn delay={400} direction="up">
							<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
								<Button
									asChild
									size="lg"
									className="group relative gap-2 overflow-hidden px-8 py-6 text-base sm:px-10 sm:py-7 sm:text-lg"
								>
									<Link href={ctaLink}>
										<span className="relative z-10">Validate Your Idea</span>
										<HiSparkles className="relative z-10 h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
										<div className="from-primary to-accent absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
									</Link>
								</Button>
								<p className="text-muted-foreground text-sm sm:text-base">
									Free to start • No credit card
								</p>
							</div>
						</FadeIn>

						{/* Social Proof */}
						<FadeIn delay={500} direction="up">
							<div className="flex items-center gap-4">
								<div className="flex -space-x-2">
									{socialProofAvatars.map((avatar, i) => (
										<div
											key={avatar.name}
											className={`${avatar.color} flex h-10 w-10 items-center justify-center rounded-full border-2 border-background text-sm font-medium text-white sm:h-11 sm:w-11`}
											style={{ zIndex: socialProofAvatars.length - i }}
										>
											{avatar.name[0]}
										</div>
									))}
								</div>
								<div className="text-sm sm:text-base">
									<span className="text-foreground font-semibold">
										Join 50+ builders
									</span>
									<span className="text-muted-foreground">
										{" "}
										validating their ideas
									</span>
								</div>
							</div>
						</FadeIn>
					</div>

					{/* Right Column - Product Mockup */}
					<div>
						<FadeIn delay={300} direction="right">
							<div className="relative mx-auto w-full max-w-lg lg:ml-auto lg:mr-0 lg:max-w-xl">
								{/* Main Product Card */}
								<div className="bg-card border-border rounded-2xl border p-5 shadow-xl sm:rounded-3xl sm:p-8">
									{/* Card Header */}
									<div className="mb-5 flex items-center justify-between">
										<span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 sm:text-sm">
											In Progress
										</span>
										<div className="flex items-center gap-2 text-muted-foreground">
											<span className="text-xs sm:text-sm">by @maker</span>
										</div>
									</div>

									{/* Idea Title & Description */}
									<h3 className="text-foreground mb-3 text-xl font-semibold sm:text-2xl">
										AI Writing Assistant for Developers
									</h3>
									<p className="text-muted-foreground mb-6 text-sm sm:text-base">
										Generate documentation, README files, and code comments
										using AI. Trained specifically on technical writing
										patterns.
									</p>

									{/* Validation Signals */}
									<div className="mb-6">
										<p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wider sm:text-sm">
											Validation Signals
										</p>
										<div className="grid grid-cols-2 gap-2 sm:gap-3">
											{mockSignals.map((signal) => (
												<div
													key={signal.label}
													className={`${signal.bg} flex items-center justify-between rounded-lg px-3 py-3 sm:rounded-xl sm:px-4 sm:py-3.5`}
												>
													<div className="flex items-center gap-2">
														<signal.icon
															className={`h-4 w-4 sm:h-5 sm:w-5 ${signal.color}`}
														/>
														<span className="text-foreground text-xs font-medium sm:text-sm">
															{signal.label}
														</span>
													</div>
													<span
														className={`text-sm font-bold sm:text-base ${signal.color}`}
													>
														{signal.count}
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Waitlist Section */}
									<div className="bg-muted/50 rounded-xl p-4 sm:rounded-2xl sm:p-5">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 sm:gap-4">
												<div className="bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl">
													<HiUserGroup className="text-primary h-5 w-5 sm:h-7 sm:w-7" />
												</div>
												<div>
													<p className="text-foreground text-2xl font-bold sm:text-3xl">
														47
													</p>
													<p className="text-muted-foreground text-xs sm:text-sm">
														people interested
													</p>
												</div>
											</div>
											<div className="text-right">
												<span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1.5 text-xs font-medium text-green-600 sm:text-sm">
													<span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
													+5 today
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Floating accent badges near the card */}
								<div className="absolute -top-3 -right-3 hidden animate-float rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white shadow-lg sm:block sm:text-sm">
									+23% this week
								</div>

								<div
									className="bg-card border-border absolute -bottom-3 -left-3 hidden animate-float-reverse rounded-lg border px-3 py-2 text-xs font-medium shadow-lg sm:block sm:text-sm"
									style={{ animationDelay: "0.5s" }}
								>
									<span className="text-primary font-semibold">12</span>
									<span className="text-muted-foreground"> would pay</span>
								</div>
							</div>
						</FadeIn>
					</div>
				</div>
			</div>

			{/* Scroll Indicator - Absolute positioned at bottom */}
			<div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
				<FadeIn delay={800} direction="none">
					<div className="text-muted-foreground flex animate-bounce flex-col items-center gap-2">
						<span className="text-xs tracking-widest uppercase">Scroll</span>
						<svg
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 14l-7 7m0 0l-7-7m7 7V3"
							/>
						</svg>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
