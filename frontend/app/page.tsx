import Link from "next/link";
import {
	HiSparkles,
	HiRocketLaunch,
	HiUsers,
	HiChartBar,
} from "react-icons/hi2";
import { FaProductHunt, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import AnimatedLogo from "@/components/AnimatedLogo";
import Waitlist from "@/components/Waitlist";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
	const session = await auth();
	const ctaLink = session ? "/home" : "/signin";

	return (
		<div className="bg-background mx-auto min-h-screen max-w-5xl">
			<Navbar />

			{/* Hero Section */}
			<div className="py-16">
				<div className="mx-auto max-w-4xl">
					<div className="border-none">
						<div className="px-8 py-12 text-center md:py-16">
							<div className="mb-6 flex justify-center">
								<AnimatedLogo />
							</div>

							<h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
								Stop guessing. Start Validating
							</h2>
							<p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
								Share your product idea, get honest feedback from builders, and
								track your journey from concept to launch.
							</p>

							<Button asChild size="lg" className="gap-2 px-10 py-6 text-lg">
								<Link href={ctaLink}>
									<span>Share Your Idea</span>
									<HiSparkles className="h-5 w-5" />
								</Link>
							</Button>
							<p className="text-muted-foreground mt-3 text-sm">
								Takes under 2 minutes
							</p>

							<div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
								<div className="flex items-center gap-2">
									<div className="bg-primary h-2 w-2 rounded-full"></div>
									<span>Demand Signals</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="bg-primary/80 h-2 w-2 rounded-full"></div>
									<span>Builder Feedback</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="bg-primary/60 h-2 w-2 rounded-full"></div>
									<span>Journey Tracking</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* What's Live & Coming Soon Section */}
			<div className="bg-background mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row">
				{/* What's Live Now Card */}
				<Card className="bg-primary text-primary-foreground w-full border">
					<CardContent className="p-8 text-left">
						<h4 className="mb-4 text-2xl font-bold">What&apos;s live now</h4>
						<p className="mb-6 opacity-90">
							Start validating your ideas today with these features.
						</p>
						<div className="bg-card text-card-foreground space-y-3 rounded-xl p-4">
							<div className="bg-muted flex items-center justify-between rounded-lg p-3">
								<span className="text-sm font-medium">
									Validation signals: Would Pay, Problem Real & more
								</span>
								<span className="text-primary font-bold">✓</span>
							</div>
							<div className="bg-muted flex items-center justify-between rounded-lg p-3">
								<span className="text-sm font-medium">
									Category-based nested comments & discussions
								</span>
								<span className="text-primary font-bold">✓</span>
							</div>
							<div className="bg-muted flex items-center justify-between rounded-lg p-3">
								<span className="text-sm font-medium">
									Builder profiles with validation summaries
								</span>
								<span className="text-primary font-bold">✓</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Coming Soon Card */}
				<Card className="bg-secondary text-secondary-foreground w-full border">
					<CardContent className="p-8 text-left">
						<div className="mb-4 flex items-center gap-2">
							<h4 className="text-2xl font-bold">Coming soon</h4>
							<span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
								Roadmap
							</span>
						</div>
						<p className="text-secondary-foreground/80 mb-6">
							Powerful features to supercharge your validation process.
						</p>
						<div className="bg-card space-y-3 rounded-xl p-4">
							<div className="bg-muted flex items-center justify-between rounded-lg p-3">
								<span className="text-sm font-medium">
									AI-powered competitor & market analysis
								</span>
								<span className="text-primary/60 font-bold">Soon</span>
							</div>
							<div className="bg-muted flex items-center justify-between rounded-lg p-3">
								<span className="text-sm font-medium">
									Collect waitlist signups for your ideas
								</span>
								<span className="text-primary/60 font-bold">Soon</span>
							</div>
							<div className="bg-muted flex items-center justify-between rounded-lg p-3">
								<span className="text-sm font-medium">
									Validation analytics & insights dashboard
								</span>
								<span className="text-primary/60 font-bold">Soon</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Problem Section */}
			<div className="bg-muted mx-auto max-w-5xl border py-16">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<h3 className="mb-6 text-3xl font-bold md:text-4xl">
						Current platforms give you opinions, not validation
					</h3>
					<p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-xl">
						Product Hunt, Reddit, Twitter—they all offer noise. Nobody offers
						structured feedback with actionable intelligence.
					</p>
					<div className="grid gap-8 md:grid-cols-3">
						<Card className="bg-card border">
							<CardContent className="p-6 text-center">
								<FaProductHunt className="mx-auto mb-3 h-10 w-10" />
								<div className="mb-2 text-xl font-semibold">Product Hunt</div>
								<p className="text-muted-foreground text-sm">
									Great for launches, useless for pre-launch validation
								</p>
							</CardContent>
						</Card>
						<Card className="bg-card border">
							<CardContent className="p-6 text-center">
								<FaRedditAlien className="mx-auto mb-3 h-10 w-10" />
								<div className="mb-2 text-xl font-semibold">Reddit</div>
								<p className="text-muted-foreground text-sm">
									Scattered discussions, no structure or follow-through
								</p>
							</CardContent>
						</Card>
						<Card className="bg-card border">
							<CardContent className="p-6 text-center">
								<FaXTwitter className="mx-auto mb-3 h-10 w-10" />
								<div className="mb-2 text-xl font-semibold">Twitter/X</div>
								<p className="text-muted-foreground text-sm">
									Viral reach but no depth or organized feedback
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Solution Section */}
			<div className="bg-background mx-auto max-w-5xl py-16">
				<div className="max-w-5xl text-center">
					<h3 className="mb-6 text-3xl font-bold md:text-4xl">
						Validuct gives you validation, not just votes
					</h3>
					<p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-xl">
						Get structured feedback from builders who understand what it takes
						to ship. Track your idea from concept to launch.
					</p>
				</div>

				<div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6 md:flex-row">
					{/* Structured Validation Card */}
					<Card className="bg-primary text-primary-foreground w-full border">
						<CardContent className="p-8 text-left">
							<h4 className="mb-4 text-2xl font-bold">Real demand signals</h4>
							<p className="mb-6 opacity-90">
								Not just thumbs up/down—get signals that show real demand and
								actionable feedback.
							</p>
							<div className="bg-card text-card-foreground space-y-3 rounded-xl p-4">
								<div className="bg-muted flex items-center justify-between rounded-lg p-3">
									<span className="text-sm font-medium">
										&quot;Would Pay&quot; & &quot;Problem Real&quot; signals
									</span>
									<span className="text-primary font-bold">💰</span>
								</div>
								<div className="bg-muted flex items-center justify-between rounded-lg p-3">
									<span className="text-sm font-medium">
										Category-based feedback by topic
									</span>
									<span className="text-primary font-bold">💬</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Journey Tracking Card */}
					<Card className="bg-secondary text-secondary-foreground w-full border">
						<CardContent className="p-8 text-left">
							<h4 className="mb-4 text-2xl font-bold">Track your journey</h4>
							<p className="text-secondary-foreground/80 mb-6">
								From first idea to successful launch—document your entire
								journey.
							</p>
							<div className="bg-card rounded-xl p-5">
								{/* Visual Progress Stepper */}
								<div className="flex items-center justify-between">
									{/* Draft */}
									<div className="flex flex-col items-center">
										<div className="bg-primary/20 border-primary mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2">
											<span className="text-primary text-sm font-bold">1</span>
										</div>
										<span className="text-xs font-medium">Draft</span>
									</div>
									{/* Connector */}
									<div className="bg-primary/30 mx-2 mb-6 h-1 flex-1 rounded"></div>
									{/* Validated */}
									<div className="flex flex-col items-center">
										<div className="bg-primary/20 border-primary mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2">
											<span className="text-primary text-sm font-bold">2</span>
										</div>
										<span className="text-xs font-medium">Validated</span>
									</div>
									{/* Connector */}
									<div className="bg-primary/30 mx-2 mb-6 h-1 flex-1 rounded"></div>
									{/* Launched */}
									<div className="flex flex-col items-center">
										<div className="bg-primary mb-2 flex h-10 w-10 items-center justify-center rounded-full">
											<span className="text-sm">🚀</span>
										</div>
										<span className="text-xs font-medium">Launched</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* How It Works Section */}
			<div className="bg-muted border py-16">
				<div className="mx-auto max-w-4xl px-6">
					<h3 className="mb-12 text-center text-3xl font-bold md:text-4xl">
						From idea to evidence in minutes
					</h3>

					<div className="grid gap-8 md:grid-cols-3">
						<div className="text-center">
							<Card className="mb-4">
								<CardContent className="p-6">
									<HiRocketLaunch className="text-brand-yellow mx-auto h-12 w-12" />
								</CardContent>
							</Card>
							<h4 className="mb-2 text-xl font-bold">Post your idea</h4>
							<p className="text-muted-foreground">
								Describe your concept in under 2 minutes
							</p>
						</div>

						<div className="text-center">
							<Card className="mb-4">
								<CardContent className="p-6">
									<HiUsers className="text-brand-orange mx-auto h-12 w-12" />
								</CardContent>
							</Card>
							<h4 className="mb-2 text-xl font-bold">Get demand signals</h4>
							<p className="text-muted-foreground">
								Builders signal &quot;Would Pay&quot; and share structured
								feedback
							</p>
						</div>

						<div className="text-center">
							<Card className="mb-4">
								<CardContent className="p-6">
									<HiChartBar className="text-brand-red mx-auto h-12 w-12" />
								</CardContent>
							</Card>
							<h4 className="mb-2 text-xl font-bold">Validate or pivot</h4>
							<p className="text-muted-foreground">
								Know what to build before you write a single line of code
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Waitlist Section */}
			<div className="py-16">
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<Waitlist />
				</div>
			</div>

			{/* Footer */}
			<div className="bg-background border-t py-8">
				<div className="text-muted-foreground mx-auto max-w-4xl px-6 text-center">
					<p className="text-foreground mb-1 font-medium">Validuct</p>
					<p className="mb-3 text-sm">
						The Idea Validation Platform for Builders
					</p>
					<p className="text-sm">
						&copy; 2026 Validuct | Built by{" "}
						<a
							href="https://ayroid.in"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground font-semibold hover:underline"
						>
							Ayroid
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
