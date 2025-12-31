import Link from "next/link";
import {
	HiSparkles,
	HiRocketLaunch,
	HiUsers,
	HiChartBar,
} from "react-icons/hi2";
import Navbar from "@/components/Navbar";
import AnimatedLogo from "@/components/AnimatedLogo";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
	const session = await auth();
	const ctaLink = session ? "/home" : "/login";

	return (
		<div className="min-h-screen bg-background max-w-5xl mx-auto">
			<Navbar />

			{/* Hero Section */}
			<div className="py-16">
				<div className="max-w-4xl mx-auto">
					<div className="border-none">
						<div className="px-8 py-12 md:py-16 text-center">
							<div className="flex justify-center mb-6">
								<AnimatedLogo />
							</div>

							<h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
								Validate your idea before you build it
							</h2>
							<p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
								Get honest feedback, votes, and insights from a focused
								community—so you don&apos;t ship something nobody wants.
							</p>

							<Button asChild size="lg" className="gap-2 px-10 py-6 text-lg">
								<Link href={ctaLink}>
									<span>Share Your Idea</span>
									<HiSparkles className="h-5 w-5" />
								</Link>
							</Button>
							<p className="mt-3 text-sm text-muted-foreground">
								Takes under 2 minutes
							</p>

							<div className="mt-8 flex items-center justify-center gap-8 text-sm font-medium flex-wrap">
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 bg-primary rounded-full"></div>
									<span>Real Analytics</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 bg-primary/80 rounded-full"></div>
									<span>Honest Feedback</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 bg-primary/60 rounded-full"></div>
									<span>Community Driven</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Problem Section */}
			<div className="py-16 bg-muted border max-w-5xl mx-auto">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h3 className="text-3xl md:text-4xl font-bold mb-6">
						80% of startups fail because founders build useless products
					</h3>
					<div className="grid md:grid-cols-3 gap-8 mt-12">
						<div className="flex flex-col items-center">
							<div className="text-4xl mb-3">🚀</div>
							<p className="text-muted-foreground">Launch new features</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="text-4xl mb-3">😐</div>
							<p className="text-muted-foreground">But nothing happens</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="text-4xl mb-3">😞</div>
							<p className="text-muted-foreground">Lose motivation and quit</p>
						</div>
					</div>
				</div>
			</div>

			{/* Solution Section */}
			<div className="py-16 bg-background max-w-5xl mx-auto">
				<div className="max-w-5xl mx-auto text-center">
					<h3 className="text-3xl md:text-4xl font-bold mb-6">
						Ship features users really want
					</h3>
					<p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
						Gather feedback from your community, prioritize what matters, and
						build products people actually use.
					</p>
				</div>

				<div className="flex gap-6 max-w-5xl mx-auto">
					{/* Collect Feedback Card */}
					<Card className="bg-primary text-primary-foreground w-full border">
						<CardContent className="p-8 text-left">
							<h4 className="text-2xl font-bold mb-4">Collect user feedback</h4>
							<p className="mb-6 opacity-90">
								See what new features, improvements, and bugs your users care
								about.
							</p>
							<div className="bg-card rounded-xl p-4 space-y-3 text-card-foreground">
								<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
									<span className="font-medium text-sm">
										Add timeline/journey integration to the Insighto
									</span>
									<span className="text-primary font-bold">💡</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
									<span className="font-medium text-sm">
										A one pricing plan for revenue billing
									</span>
									<span className="text-primary font-bold">💡</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Prioritize Features Card */}
					<Card className="bg-secondary text-secondary-foreground w-full border">
						<CardContent className="p-8 text-left">
							<h4 className="text-2xl font-bold mb-4">Prioritize features</h4>
							<p className="text-secondary-foreground/80 mb-6">
								See which features have the most demand and ship accordingly.
							</p>
							<div className="bg-card rounded-xl p-4 space-y-3">
								<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
									<span className="font-medium text-sm">
										Add timeline/journey integration
									</span>
									<span className="font-bold">↑ 42</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
									<span className="font-medium text-sm">
										One pricing plan for revenue
									</span>
									<span className="font-bold">↑ 28</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* How It Works Section */}
			<div className="py-16 bg-muted border">
				<div className="max-w-4xl mx-auto px-6">
					<h3 className="text-3xl md:text-4xl font-bold mb-12 text-center">
						How it works
					</h3>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<Card className="mb-4">
								<CardContent className="p-6">
									<HiRocketLaunch className="h-12 w-12 text-brand-yellow mx-auto" />
								</CardContent>
							</Card>
							<h4 className="text-xl font-bold mb-2">Share your idea</h4>
							<p className="text-muted-foreground">
								Post your concept and get it in front of real people
							</p>
						</div>

						<div className="text-center">
							<Card className="mb-4">
								<CardContent className="p-6">
									<HiUsers className="h-12 w-12 text-brand-orange mx-auto" />
								</CardContent>
							</Card>
							<h4 className="text-xl font-bold mb-2">Get feedback</h4>
							<p className="text-muted-foreground">
								Community votes and comments on what resonates
							</p>
						</div>

						<div className="text-center">
							<Card className="mb-4">
								<CardContent className="p-6">
									<HiChartBar className="h-12 w-12 text-brand-red mx-auto" />
								</CardContent>
							</Card>
							<h4 className="text-xl font-bold mb-2">Build with confidence</h4>
							<p className="text-muted-foreground">
								Ship features people want without the guesswork
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Closing CTA Section */}
			<div className="py-16">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h3 className="text-3xl md:text-4xl font-bold mb-4">
						Your idea deserves feedback—before reality gives it none.
					</h3>
					<p className="text-xl text-muted-foreground mb-8">
						Share your idea today and validate it with people who care.
					</p>
					<Button asChild size="lg" className="gap-2 px-10 py-6 text-lg">
						<Link href="/home">
							<span>Post your first idea</span>
							<HiSparkles className="h-5 w-5" />
						</Link>
					</Button>
				</div>
			</div>

			{/* Footer */}
			<div className="py-8 bg-background border-t">
				<div className="max-w-4xl mx-auto px-6 text-center text-muted-foreground">
					<p>
						&copy; 2025 Validuct | Built by{" "}
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
