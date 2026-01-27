"use client";

import Waitlist from "@/components/Waitlist";
import FadeIn from "./FadeIn";

export default function WaitlistSection() {
	return (
		<section className="bg-muted/30 px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
			<div className="mx-auto max-w-3xl">
				<FadeIn direction="up">
					<Waitlist />
				</FadeIn>
			</div>
		</section>
	);
}
