import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import {
	HeroSection,
	StatsSection,
	ProblemSection,
	SolutionSection,
	HowItWorksSection,
	RoadmapSection,
	WaitlistSection,
	CTASection,
	Footer,
} from "@/components/landing";

export default async function Home() {
	const session = await auth();
	const ctaLink = session ? "/home" : "/signin";

	return (
		<div className="bg-background min-h-screen overflow-x-hidden">
			<Navbar fixed />

			{/* Hero Section - Interactive with floating elements and animations */}
			<HeroSection ctaLink={ctaLink} />

			{/* Stats Banner - Animated counters */}
			<StatsSection />

			{/* Problem Section - Interactive cards with hover effects */}
			<ProblemSection />

			{/* Solution Section - Bento layout with animated stats */}
			<SolutionSection />

			{/* How It Works - Steps with visual preview */}
			<HowItWorksSection />

			{/* Roadmap Section - Feature cards with status badges */}
			<RoadmapSection />

			{/* Waitlist Section - With fade-in animation */}
			<WaitlistSection />

			{/* Final CTA Section */}
			<CTASection ctaLink={ctaLink} />

			{/* Footer */}
			<Footer />
		</div>
	);
}
