"use client";

import Waitlist from "@/components/Waitlist";
import FadeIn from "./FadeIn";

export default function WaitlistSection() {
	return (
		<section className="bg-muted/50 px-4 py-16 sm:py-20 md:py-24 lg:py-32 sm:px-6">
			<div className="mx-auto max-w-5xl">
				<FadeIn direction="up">
					<Waitlist />
				</FadeIn>
			</div>
		</section>
	);
}
