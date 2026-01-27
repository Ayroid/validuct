"use client";

import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import FloatingElements from "./FloatingElements";
import FadeIn from "./FadeIn";

interface HeroSectionProps {
	ctaLink: string;
}

const trustLogos = [
	"YC",
	"Indie Hackers",
	"Product Hunt",
	"Hacker News",
	"Twitter/X",
	"Reddit",
];

export default function HeroSection({ ctaLink }: HeroSectionProps) {
	return (
		<section className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4 pt-24 pb-16 sm:gap-12 sm:px-6 sm:pt-28 sm:pb-20">
			<FloatingElements />

			{/* Main Hero Content */}
			<div className="relative mx-auto max-w-4xl text-center">
				<FadeIn delay={100} direction="up">
					<h1 className="text-foreground mb-6 text-3xl leading-tight font-bold tracking-tight sm:mb-8 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
						Validate Demand Before
						<br />
						<span className="text-primary relative">
							You Write Code
							<svg
								className="text-primary/30 absolute -bottom-2 left-0 h-3 w-full"
								viewBox="0 0 200 12"
								preserveAspectRatio="none"
							>
								<path
									d="M0,8 Q50,0 100,8 T200,8"
									fill="none"
									stroke="currentColor"
									strokeWidth="4"
									strokeLinecap="round"
								/>
							</svg>
						</span>
					</h1>
				</FadeIn>

				<FadeIn delay={200} direction="up">
					<p className="text-muted-foreground mx-auto mb-8 max-w-2xl px-4 text-base sm:mb-10 sm:text-lg md:text-xl">
						Collect waitlist signups and payment intent for your idea. Know if
						people will pay before building a single feature.
					</p>
				</FadeIn>

				<FadeIn delay={300} direction="up">
					<div className="mb-4 sm:mb-6">
						<Button
							asChild
							size="lg"
							className="group relative gap-2 overflow-hidden px-6 py-5 text-base sm:px-8 sm:py-6 sm:text-lg"
						>
							<Link href={ctaLink}>
								<span className="relative z-10">Test Your Idea</span>
								<HiSparkles className="relative z-10 h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
								<div className="from-primary to-accent absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
							</Link>
						</Button>
					</div>
					<p className="text-muted-foreground text-xs sm:text-sm">
						Free to start • No credit card required
					</p>
				</FadeIn>
			</div>

			{/* Trust Logos */}
			<FadeIn delay={500} direction="up" className="w-full">
				<div className="mx-auto max-w-6xl">
					<p className="text-muted-foreground mb-6 text-center text-xs font-medium tracking-wider uppercase sm:mb-8 sm:text-sm">
						Trusted by builders from
					</p>
					<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 opacity-60 grayscale sm:gap-x-12 sm:gap-y-6">
						{trustLogos.map((logo) => (
							<span
								key={logo}
								className="text-foreground cursor-default text-base font-bold transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:text-xl"
							>
								{logo}
							</span>
						))}
					</div>
				</div>
			</FadeIn>

			{/* Scroll Indicator */}
			<FadeIn
				delay={800}
				direction="none"
				className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
			>
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
		</section>
	);
}
