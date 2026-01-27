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
		<section className="px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6">
			<div className="mx-auto max-w-5xl">
				<FadeIn direction="up">
					<div className="bg-foreground overflow-hidden rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center relative">
						{/* Decorative gradient blobs */}
						<div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2"></div>
						<div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2"></div>

						<div className="relative z-10">
							<h2 className="text-background mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
								Stop Guessing. Start Validating.
							</h2>
							<p className="text-background/70 mx-auto mb-8 sm:mb-10 max-w-2xl text-base sm:text-lg">
								Join hundreds of builders who validate their ideas with real
								demand signals before investing months of development time.
							</p>
							<Button
								asChild
								size="lg"
								variant="secondary"
								className="gap-2 px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold group"
							>
								<Link href={ctaLink}>
									<span>Test Your Idea Free</span>
									<HiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
							<p className="text-background/50 mt-4 sm:mt-6 text-xs sm:text-sm">
								Free to start • No credit card required
							</p>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
