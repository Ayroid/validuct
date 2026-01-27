"use client";

import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import FadeIn from "./FadeIn";

interface CTASectionProps {
	ctaLink: string;
}

export default function CTASection({ ctaLink }: CTASectionProps) {
	return (
		<section className="px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
			<div className="mx-auto max-w-5xl">
				<FadeIn direction="up">
					<div className="bg-foreground relative overflow-hidden rounded-2xl p-8 text-center sm:rounded-3xl sm:p-12 md:p-16 lg:p-20">
						{/* Decorative gradient blobs */}
						<div className="bg-primary/20 absolute top-0 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl" />
						<div className="bg-accent/20 absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full blur-3xl" />

						<div className="relative z-10">
							<h2 className="text-background mb-5 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
								Stop Guessing. Start Validating.
							</h2>
							<p className="text-background/70 mx-auto mb-8 max-w-2xl text-lg sm:mb-10 sm:text-xl">
								Join builders who validate their ideas with real demand signals
								before investing months of development time.
							</p>
							<Button
								asChild
								size="lg"
								variant="secondary"
								className="group gap-2 px-8 py-6 text-base font-semibold sm:px-10 sm:py-7 sm:text-lg"
							>
								<Link href={ctaLink}>
									<span>Test Your Idea Free</span>
									<HiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
							<p className="text-background/50 mt-5 text-sm sm:mt-6 sm:text-base">
								Free to start • No credit card required
							</p>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
