import Link from "next/link";
import Image from "next/image";
import {
	HiSparkles,
	HiRocketLaunch,
	HiEnvelope,
	HiChartBar,
	HiCurrencyDollar,
	HiUserGroup,
	HiArrowRight,
	HiCheckCircle,
	HiXCircle,
	HiCpuChip,
	HiEye,
	HiClipboardDocumentList,
	HiArrowTrendingUp,
} from "react-icons/hi2";
import { FaProductHunt, FaRedditAlien, FaXTwitter } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Waitlist from "@/components/Waitlist";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
	const session = await auth();
	const ctaLink = session ? "/home" : "/signin";

	return (
		<div className="bg-background min-h-screen">
			<Navbar />

			{/* Hero Section */}
			<section className="relative flex h-dvh flex-col items-center justify-center gap-48 overflow-hidden px-4 sm:px-6">
				{/* Floating Decorative Elements */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					{/* Top Left - Rating Badge */}
					<div className="absolute top-[18%] left-[3%] hidden lg:block">
						<div className="bg-card rounded-xl p-3 shadow-lg">
							<div className="flex items-center gap-2">
								<div className="flex">
									{[1, 2, 3, 4, 5].map((star) => (
										<svg
											key={star}
											className="h-4 w-4 text-amber-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<span className="text-foreground text-sm font-semibold">
									4.9
								</span>
							</div>
							<p className="text-muted-foreground mt-1 text-xs">500+ reviews</p>
						</div>
					</div>

					{/* Top Left Lower - Conversion Badge */}
					<div className="absolute top-[42%] left-[8%] hidden rotate-[-4deg] lg:block">
						<div className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 shadow-lg">
							<HiArrowTrendingUp className="h-4 w-4 text-white" />
							<span className="text-sm font-semibold text-white">+40%</span>
						</div>
					</div>

					{/* Top Right - Waitlist Card */}
					<div className="absolute top-[15%] right-[3%] hidden rotate-[3deg] lg:block">
						<div className="bg-card rounded-xl p-4 shadow-lg">
							<div className="mb-3 flex items-center gap-2">
								<HiClipboardDocumentList className="text-primary h-5 w-5" />
								<span className="text-sm font-semibold">Waitlist</span>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-8">
									<span className="text-muted-foreground text-xs">Today</span>
									<span className="text-foreground text-sm font-bold">47</span>
								</div>
								<div className="flex items-center justify-between gap-8">
									<span className="text-muted-foreground text-xs">
										This week
									</span>
									<span className="text-foreground text-sm font-bold">312</span>
								</div>
								<div className="flex items-center justify-between gap-8">
									<span className="text-muted-foreground text-xs">Total</span>
									<span className="text-primary text-sm font-bold">1,247</span>
								</div>
							</div>
						</div>
					</div>

					{/* Middle Right - Items Badge */}
					<div className="absolute top-[45%] right-[6%] hidden lg:block">
						<div className="bg-card rounded-xl p-3 shadow-lg">
							<p className="text-muted-foreground text-xs">Ideas this week</p>
							<div className="mt-1 flex items-baseline gap-1">
								<span className="text-foreground text-2xl font-bold">8</span>
								<span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-600">
									new
								</span>
							</div>
						</div>
					</div>

					{/* Bottom Left - Stats Chart */}
					<div className="absolute bottom-[22%] left-[5%] hidden lg:block">
						<div className="bg-card rounded-xl p-4 shadow-lg">
							<p className="text-muted-foreground mb-1 text-xs font-medium">
								Signups
							</p>
							<div className="flex items-end gap-1">
								<span className="text-foreground text-2xl font-bold">156</span>
								<span className="mb-1 text-xs text-green-600">+23%</span>
							</div>
							<div className="mt-3 flex items-end gap-1">
								{[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
									<div
										key={i}
										className="bg-primary/60 w-3 rounded-sm"
										style={{ height: `${h * 0.5}px` }}
									></div>
								))}
							</div>
						</div>
					</div>

					{/* Bottom Right - User Avatars */}
					<div className="absolute right-[5%] bottom-[18%] hidden lg:block">
						<div className="bg-card rounded-xl p-4 shadow-lg">
							<div className="flex -space-x-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<div
										key={i}
										className="border-card bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium"
									>
										{String.fromCharCode(64 + i)}
									</div>
								))}
								<div className="border-card bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium">
									+99
								</div>
							</div>
							<p className="text-muted-foreground mt-2 text-xs">
								Active builders
							</p>
						</div>
					</div>
				</div>

				{/* Main Hero Content */}
				<div className="relative mx-auto max-w-4xl text-center">
					{/* Headline */}
					<h1 className="text-foreground mb-8 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Validate Demand Before
						<br />
						<span className="text-primary">You Write Code</span>
					</h1>

					{/* Subheadline */}
					<p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl">
						Collect waitlist signups and payment intent for your idea. Know if
						people will pay before building a single feature.
					</p>

					{/* CTA Button */}
					<div className="mb-6">
						<Button asChild size="lg" className="gap-2 px-8 py-6 text-lg">
							<Link href={ctaLink}>
								<span>Test Your Idea</span>
								<HiSparkles className="h-5 w-5" />
							</Link>
						</Button>
					</div>
					<p className="text-muted-foreground text-sm">
						Free to start • No credit card required
					</p>
				</div>
				<div className="mx-auto max-w-6xl">
					<p className="text-muted-foreground mb-8 text-center text-sm font-medium tracking-wider uppercase">
						Trusted by builders from
					</p>
					<div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale">
						<span className="text-foreground text-xl font-bold">YC</span>
						<span className="text-foreground text-xl font-bold">
							Indie Hackers
						</span>
						<span className="text-foreground text-xl font-bold">
							Product Hunt
						</span>
						<span className="text-foreground text-xl font-bold">
							Hacker News
						</span>
						<span className="text-foreground text-xl font-bold">Twitter/X</span>
						<span className="text-foreground text-xl font-bold">Reddit</span>
					</div>
				</div>
			</section>


			{/* Stats Banner */}
			<section className="bg-foreground px-4 py-20 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{/* Stat 1 - Circular */}
						<div className="flex flex-col items-center text-center">
							<div className="border-primary relative mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4">
								<span className="text-background text-3xl font-bold">500+</span>
							</div>
							<p className="text-background/60 text-sm tracking-wider uppercase">
								Ideas Validated
							</p>
						</div>
						{/* Stat 2 - Circular */}
						<div className="flex flex-col items-center text-center">
							<div className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-green-500">
								<span className="text-background text-3xl font-bold">12K+</span>
							</div>
							<p className="text-background/60 text-sm tracking-wider uppercase">
								Waitlist Signups
							</p>
						</div>
						{/* Stat 3 - Circular */}
						<div className="flex flex-col items-center text-center">
							<div className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-500">
								<span className="text-background text-3xl font-bold">8.5%</span>
							</div>
							<p className="text-background/60 text-sm tracking-wider uppercase">
								Avg Conversion
							</p>
						</div>
						{/* Stat 4 - Circular */}
						<div className="flex flex-col items-center text-center">
							<div className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 border-blue-500">
								<span className="text-background text-3xl font-bold">24hr</span>
							</div>
							<p className="text-background/60 text-sm tracking-wider uppercase">
								Time to Validate
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Problem Section */}
			<section className="px-4 py-40 sm:px-6">
				<div className="mx-auto max-w-6xl">
					{/* Section Header */}
					<div className="mb-16 text-center">
						<span className="bg-destructive/10 text-destructive mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
							The Problem
						</span>
						<h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
							Likes and Upvotes Don&apos;t Pay Bills
						</h2>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
							Twitter polls, Reddit posts, and Product Hunt launches give you
							vanity metrics. None of them capture real buying intent.
						</p>
					</div>

					{/* Problem Cards - With Left Border Accents */}
					<div className="grid gap-6 md:grid-cols-3">
						{/* Product Hunt */}
						<div className="group border-border bg-card shadow-card hover:shadow-card-hover relative overflow-hidden rounded-2xl border transition-all">
							<div className="absolute top-0 left-0 h-full w-1 bg-[#DA552F]"></div>
							<div className="p-6 pl-8">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#DA552F]/10">
									<FaProductHunt className="h-7 w-7 text-[#DA552F]" />
								</div>
								<h3 className="text-foreground mb-2 text-xl font-semibold">
									Product Hunt
								</h3>
								<p className="text-muted-foreground mb-4">
									You need a finished product to launch. Upvotes come from other
									makers, not customers.
								</p>
								<div className="text-destructive flex items-center gap-2 text-sm">
									<HiXCircle className="h-4 w-4" />
									<span>No pre-launch validation</span>
								</div>
							</div>
						</div>

						{/* Reddit */}
						<div className="group border-border bg-card shadow-card hover:shadow-card-hover relative overflow-hidden rounded-2xl border transition-all">
							<div className="absolute top-0 left-0 h-full w-1 bg-[#FF4500]"></div>
							<div className="p-6 pl-8">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4500]/10">
									<FaRedditAlien className="h-7 w-7 text-[#FF4500]" />
								</div>
								<h3 className="text-foreground mb-2 text-xl font-semibold">
									Reddit
								</h3>
								<p className="text-muted-foreground mb-4">
									&quot;Cool idea bro&quot; comments don&apos;t validate demand.
									No way to capture or track interested users.
								</p>
								<div className="text-destructive flex items-center gap-2 text-sm">
									<HiXCircle className="h-4 w-4" />
									<span>No actionable data</span>
								</div>
							</div>
						</div>

						{/* Twitter */}
						<div className="group border-border bg-card shadow-card hover:shadow-card-hover relative overflow-hidden rounded-2xl border transition-all">
							<div className="bg-foreground absolute top-0 left-0 h-full w-1"></div>
							<div className="p-6 pl-8">
								<div className="bg-foreground/10 mb-4 flex h-14 w-14 items-center justify-center rounded-xl">
									<FaXTwitter className="text-foreground h-7 w-7" />
								</div>
								<h3 className="text-foreground mb-2 text-xl font-semibold">
									Twitter/X
								</h3>
								<p className="text-muted-foreground mb-4">
									Likes from followers who&apos;ll never become customers.
									Engagement ≠ willingness to pay.
								</p>
								<div className="text-destructive flex items-center gap-2 text-sm">
									<HiXCircle className="h-4 w-4" />
									<span>Vanity metrics only</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Solution Section */}
			<section className="px-4 py-40 sm:px-6">
				<div className="mx-auto max-w-6xl">
					{/* Section Header */}
					<div className="mb-16 text-center">
						<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
							The Solution
						</span>
						<h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
							Capture Real Buying Intent
						</h2>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
							Validuct gives you real demand signals — emails from interested
							users and payment intent from potential customers.
						</p>
					</div>

					{/* Two Column Bento Layout */}
					<div className="grid gap-6 lg:grid-cols-5">
						{/* Left Column - Feature Cards */}
						<div className="space-y-6 lg:col-span-3">
							{/* Waitlist Collection Card */}
							<div className="border-border bg-card shadow-card overflow-hidden rounded-2xl border">
								<div className="flex items-start gap-4 p-6">
									<div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
										<HiEnvelope className="text-primary h-6 w-6" />
									</div>
									<div>
										<h3 className="text-foreground mb-2 text-xl font-semibold">
											Waitlist Collection
										</h3>
										<p className="text-muted-foreground">
											Collect emails from people genuinely interested in your
											idea. Export anytime. Real commitment, not just a thumbs
											up.
										</p>
									</div>
								</div>
								<div className="border-border bg-muted/30 border-t px-6 py-4">
									<div className="flex flex-wrap gap-3">
										<span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
											<HiCheckCircle className="h-3.5 w-3.5" />
											Email capture
										</span>
										<span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
											<HiCheckCircle className="h-3.5 w-3.5" />
											CSV export
										</span>
										<span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
											<HiCheckCircle className="h-3.5 w-3.5" />
											Social proof
										</span>
									</div>
								</div>
							</div>

							{/* Two smaller cards in a row */}
							<div className="grid gap-6 sm:grid-cols-2">
								{/* Shareable Pages */}
								<div className="border-border bg-card shadow-card rounded-2xl border p-6">
									<div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiRocketLaunch className="text-primary h-6 w-6" />
									</div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">
										Shareable Pages
									</h3>
									<p className="text-muted-foreground text-sm">
										Get a beautiful landing page for your idea in minutes. Share
										anywhere — Twitter, Reddit, communities.
									</p>
								</div>

								{/* Community Feedback */}
								<div className="border-border bg-card shadow-card rounded-2xl border p-6">
									<div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiUserGroup className="text-primary h-6 w-6" />
									</div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">
										Community Feedback
									</h3>
									<p className="text-muted-foreground text-sm">
										Get structured feedback from other builders. Understand your
										target market better.
									</p>
								</div>
							</div>

							{/* Coming Soon Cards */}
							<div className="grid gap-6 sm:grid-cols-2">
								{/* Payment Intent */}
								<div className="border-border from-card to-muted/50 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6">
									<div className="absolute top-3 right-3 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
										Coming Soon
									</div>
									<div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiCurrencyDollar className="text-primary h-6 w-6" />
									</div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">
										Payment Intent
									</h3>
									<p className="text-muted-foreground text-sm">
										Capture &quot;I&apos;d pay $X&quot; signals. Know your
										potential revenue before building.
									</p>
								</div>

								{/* Analytics */}
								<div className="border-border from-card to-muted/50 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6">
									<div className="absolute top-3 right-3 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
										Coming Soon
									</div>
									<div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiChartBar className="text-primary h-6 w-6" />
									</div>
									<h3 className="text-foreground mb-2 text-lg font-semibold">
										Conversion Analytics
									</h3>
									<p className="text-muted-foreground text-sm">
										Track views vs signups. Understand your conversion rate.
										Data-driven decisions.
									</p>
								</div>
							</div>
						</div>

						{/* Right Column - Dark Stats Panel */}
						<div className="lg:col-span-2">
							<div className="bg-foreground text-background sticky top-24 rounded-2xl p-8">
								<h3 className="text-background/70 mb-8 text-lg font-medium">
									Platform Stats
								</h3>

								<div className="space-y-8">
									<div>
										<p className="text-4xl font-bold md:text-5xl">500+</p>
										<p className="text-background/60 mt-1 text-sm tracking-wider uppercase">
											Ideas Validated
										</p>
									</div>

									<div>
										<p className="text-4xl font-bold md:text-5xl">12K+</p>
										<p className="text-background/60 mt-1 text-sm tracking-wider uppercase">
											Waitlist Signups
										</p>
									</div>

									<div>
										<p className="text-4xl font-bold md:text-5xl">8.5%</p>
										<p className="text-background/60 mt-1 text-sm tracking-wider uppercase">
											Avg Conversion Rate
										</p>
									</div>

									<div className="flex items-center gap-3">
										<div className="bg-background/10 flex h-10 w-10 items-center justify-center rounded-lg">
											<HiArrowTrendingUp className="h-5 w-5" />
										</div>
										<p className="text-background/60 text-sm tracking-wider uppercase">
											Real Demand Signals
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="bg-muted/50 px-4 py-40 sm:px-6">
				<div className="mx-auto max-w-6xl">
					{/* Section Header */}
					<div className="mb-20 text-center">
						<span className="bg-card text-muted-foreground mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
							How It Works
						</span>
						<h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
							Validate in 3 Simple Steps
						</h2>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
							Go from idea to validated demand in minutes, not months.
						</p>
					</div>

					{/* Two Column Layout */}
					<div className="grid items-start gap-12 lg:grid-cols-2">
						{/* Left Column - Steps */}
						<div className="space-y-8">
							{/* Step 1 */}
							<div className="flex gap-6">
								<div className="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg">
									<span className="text-primary-foreground text-xl font-bold">
										1
									</span>
								</div>
								<div>
									<h3 className="text-foreground mb-2 text-xl font-semibold">
										Describe your idea
									</h3>
									<p className="text-muted-foreground">
										Post your concept with problem, solution, and target
										audience. Get a shareable page instantly.
									</p>
								</div>
							</div>

							{/* Connector */}
							<div className="bg-border ml-7 h-8 w-px"></div>

							{/* Step 2 */}
							<div className="flex gap-6">
								<div className="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg">
									<span className="text-primary-foreground text-xl font-bold">
										2
									</span>
								</div>
								<div>
									<h3 className="text-foreground mb-2 text-xl font-semibold">
										Share & collect
									</h3>
									<p className="text-muted-foreground">
										Share your page anywhere. Collect waitlist signups from
										people who actually want your product.
									</p>
								</div>
							</div>

							{/* Connector */}
							<div className="bg-border ml-7 h-8 w-px"></div>

							{/* Step 3 */}
							<div className="flex gap-6">
								<div className="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg">
									<span className="text-primary-foreground text-xl font-bold">
										3
									</span>
								</div>
								<div>
									<h3 className="text-foreground mb-2 text-xl font-semibold">
										Build or pivot
									</h3>
									<p className="text-muted-foreground">
										50 signups? Build it. Zero interest? Pivot. Let data guide
										your decisions, not opinions.
									</p>
								</div>
							</div>
						</div>

						{/* Right Column - Visual Preview */}
						<div className="border-border bg-card rounded-2xl border p-6 shadow-lg md:p-8">
							<div className="mb-6 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Image
										src="/logo.png"
										alt="Validuct"
										width={32}
										height={32}
									/>
									<span className="text-foreground font-semibold">
										Your Idea Dashboard
									</span>
								</div>
								<span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
									Live
								</span>
							</div>

							{/* Stats Grid */}
							<div className="grid gap-4 sm:grid-cols-3">
								<div className="bg-muted rounded-xl p-4">
									<div className="text-muted-foreground mb-1 flex items-center gap-2">
										<HiEye className="h-4 w-4" />
										<span className="text-xs">Page Views</span>
									</div>
									<p className="text-foreground text-2xl font-bold">1,247</p>
								</div>
								<div className="bg-muted rounded-xl p-4">
									<div className="text-muted-foreground mb-1 flex items-center gap-2">
										<HiClipboardDocumentList className="h-4 w-4" />
										<span className="text-xs">Waitlist</span>
									</div>
									<p className="text-foreground text-2xl font-bold">156</p>
								</div>
								<div className="bg-muted rounded-xl p-4">
									<div className="text-muted-foreground mb-1 flex items-center gap-2">
										<HiArrowTrendingUp className="h-4 w-4" />
										<span className="text-xs">Conversion</span>
									</div>
									<p className="text-foreground text-2xl font-bold">12.5%</p>
								</div>
							</div>

							{/* Sample Signups Preview */}
							<div className="border-border bg-background mt-6 rounded-xl border p-4">
								<p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
									Recent Signups
								</p>
								<div className="space-y-2">
									<div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
										<span className="text-foreground text-sm">
											john@example.com
										</span>
										<span className="text-muted-foreground text-xs">
											2m ago
										</span>
									</div>
									<div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
										<span className="text-foreground text-sm">
											sarah@startup.io
										</span>
										<span className="text-muted-foreground text-xs">
											5m ago
										</span>
									</div>
									<div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
										<span className="text-foreground text-sm">
											mike@company.com
										</span>
										<span className="text-muted-foreground text-xs">
											12m ago
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Coming Soon Section */}
			<section className="px-4 py-40 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="mb-16 text-center">
						<span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium shadow-sm">
							Roadmap
						</span>
						<h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
							Even More Powerful Features Coming
						</h2>
						<p className="text-muted-foreground mx-auto max-w-2xl text-lg">
							We&apos;re building the complete validation toolkit for builders.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{/* Payment Intent */}
						<div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg">
							<div className="absolute top-0 left-0 h-full w-1 bg-amber-500"></div>
							<div className="p-6 pl-8">
								<div className="mb-4 flex items-center justify-between">
									<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiCurrencyDollar className="text-primary h-6 w-6" />
									</div>
									<span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
										In Progress
									</span>
								</div>
								<h3 className="text-foreground mb-2 text-lg font-semibold">
									Payment Intent Capture
								</h3>
								<p className="text-muted-foreground text-sm">
									Let visitors express &quot;I&apos;d pay $X&quot; for your
									idea. See potential revenue before building.
								</p>
							</div>
						</div>

						{/* Analytics Dashboard */}
						<div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg">
							<div className="absolute top-0 left-0 h-full w-1 bg-blue-500"></div>
							<div className="p-6 pl-8">
								<div className="mb-4 flex items-center justify-between">
									<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiChartBar className="text-primary h-6 w-6" />
									</div>
									<span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
										Planned
									</span>
								</div>
								<h3 className="text-foreground mb-2 text-lg font-semibold">
									Analytics Dashboard
								</h3>
								<p className="text-muted-foreground text-sm">
									View trends, traffic sources, and conversion funnel. Make
									data-driven decisions.
								</p>
							</div>
						</div>

						{/* AI Analysis */}
						<div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg">
							<div className="absolute top-0 left-0 h-full w-1 bg-purple-500"></div>
							<div className="p-6 pl-8">
								<div className="mb-4 flex items-center justify-between">
									<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
										<HiCpuChip className="text-primary h-6 w-6" />
									</div>
									<span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600">
										Exploring
									</span>
								</div>
								<h3 className="text-foreground mb-2 text-lg font-semibold">
									AI Market Analysis
								</h3>
								<p className="text-muted-foreground text-sm">
									Get AI-powered competitor analysis and market insights for
									your idea.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Waitlist Section */}
			<section className="bg-muted/50 px-4 py-40 sm:px-6">
				<div className="mx-auto max-w-5xl">
					<Waitlist />
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="px-4 py-40 sm:px-6">
				<div className="mx-auto max-w-5xl">
					<div className="bg-foreground overflow-hidden rounded-3xl p-12 text-center md:p-16">
						<h2 className="text-background mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
							Stop Guessing. Start Validating.
						</h2>
						<p className="text-background/70 mx-auto mb-10 max-w-2xl text-lg">
							Join hundreds of builders who validate their ideas with real
							demand signals before investing months of development time.
						</p>
						<Button
							asChild
							size="lg"
							variant="secondary"
							className="gap-2 px-10 py-7 text-lg font-semibold"
						>
							<Link href={ctaLink}>
								<span>Test Your Idea Free</span>
								<HiArrowRight className="h-5 w-5" />
							</Link>
						</Button>
						<p className="text-background/50 mt-6 text-sm">
							Free to start • No credit card required
						</p>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-border bg-card border-t px-4 py-20 sm:px-6">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
						{/* Brand */}
						<div className="flex items-center gap-3">
							<Image
								src="/logo.png"
								alt="Validuct Logo"
								width={32}
								height={32}
							/>
							<div>
								<p className="text-foreground font-bold">Validuct</p>
								<p className="text-muted-foreground text-sm">
									Validate demand before you build
								</p>
							</div>
						</div>

						{/* Links */}
						<div className="text-muted-foreground flex items-center gap-6 text-sm">
							<Link
								href="/privacy"
								className="hover:text-foreground transition-colors"
							>
								Privacy
							</Link>
							<Link
								href="/terms"
								className="hover:text-foreground transition-colors"
							>
								Terms
							</Link>
							<a
								href="https://ayroid.in"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground transition-colors"
							>
								Built by Ayroid
							</a>
						</div>
					</div>

					<div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
						&copy; {new Date().getFullYear()} Validuct. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
