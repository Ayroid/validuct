import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import {
	HeroSection,
	StatsSection,
	ProblemSection,
	HowItWorksSection,
	CTASection,
	Footer,
} from "@/components/landing";

export default async function Home() {
	const session = await auth();
	const ctaLink = session ? "/home" : "/signin";

	return (
		<div className="landing-fonts min-h-screen overflow-x-hidden bg-background">
			{/* Landing Nav */}
			<nav className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/85 px-6 py-4 backdrop-blur-xl">
				<div className="mx-auto flex max-w-[1080px] items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
					>
						<Image
							src="/logo.png"
							alt="Validuct Logo"
							width={28}
							height={28}
							className="object-contain"
						/>
						<span className="font-mono text-[15px] font-medium uppercase tracking-wide text-primary">
							Validuct
							<span className="text-[var(--text-muted-extra)]">.com</span>
						</span>
					</Link>
					<Link
						href={ctaLink}
						className="rounded-md bg-foreground px-5 py-2 font-mono text-[13px] font-medium text-background transition-all hover:-translate-y-0.5 hover:opacity-85"
					>
						Start Validating &rarr;
					</Link>
				</div>
			</nav>

			{/* Hero + Stats — full viewport height above the fold */}
			<div className="flex min-h-screen flex-col">
				<HeroSection ctaLink={ctaLink} />
				<StatsSection />
			</div>

			{/* Problem - Comparison */}
			<ProblemSection />

			{/* How It Works */}
			<HowItWorksSection />

			{/* Final CTA */}
			<CTASection ctaLink={ctaLink} />

			{/* Footer */}
			<Footer />
		</div>
	);
}
