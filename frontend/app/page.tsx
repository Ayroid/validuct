import Link from "next/link";
import Image from "next/image";
import {
	HiSparkles,
	HiRocketLaunch,
	HiUsers,
	HiChartBar,
	HiUser,
} from "react-icons/hi2";
import Navbar from "@/components/Navbar";

export default async function Home() {
	return (
		<div className="min-h-screen bg-[#eeeeee]">
			<Navbar />

			{/* Hero Section */}
			<div className="py-16">
				<div className="max-w-5xl mx-auto px-6">
					<div className="relative overflow-hidden rounded-3xl">
						<div className="relative px-8 py-12 md:py-16 text-center">
							<div className="flex justify-center mb-6">
								<Image
									src="/logo.svg"
									alt="Validuct Logo"
									width={200}
									height={200}
									className="object-contain"
								/>
							</div>

							<h2 className="text-4xl md:text-5xl font-bold mb-4">
								Validate your idea before you build it
							</h2>
							<p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
								Get honest feedback, votes, and insights from a focused
								community—so you don&apos;t ship something nobody wants.
							</p>

							<Link
								href="/register"
								className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform"
							>
								<span>Share Your Idea</span>
								<HiSparkles className="h-5 w-5" />
							</Link>
							<p className="mt-3 text-sm text-gray-600">
								Takes under 2 minutes
							</p>

							<div className="mt-8 flex items-center justify-center gap-8 text-gray-900 text-sm font-medium">
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 bg-red-500 rounded-full shadow-sm"></div>
									<span>Real Analytics</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 bg-orange-500 rounded-full shadow-sm"></div>
									<span>Honest Feedback</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 bg-yellow-500 rounded-full shadow-sm"></div>
									<span>Community Driven</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Overview Section */}
			<div className="py-12 bg-white">
				<div className="max-w-5xl mx-auto px-6">
					<div className="text-center max-w-3xl mx-auto">
						<h3 className="text-3xl md:text-4xl font-bold mb-6">
							VALIDUCT helps founders pressure-test ideas early—before code,
							capital, or confidence is wasted.
						</h3>
						<p className="text-xl text-gray-700">
							Share your idea, gather structured feedback, and see what
							resonates <span className="font-semibold">before</span> you
							commit.
						</p>
					</div>
				</div>
			</div>

			{/* Who is VALIDUCT for? Section */}
			<div className="py-16 bg-[#eeeeee]">
				<div className="max-w-5xl mx-auto px-6">
					<h3 className="text-3xl md:text-4xl font-bold mb-4 text-center">
						Who is VALIDUCT for?
					</h3>
					<p className="text-xl text-gray-700 mb-12 text-center max-w-3xl mx-auto">
						VALIDUCT creates a shared space where ideas are challenged, refined,
						and validated—openly.
					</p>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white rounded-2xl p-8 shadow-sm">
							<div className="text-4xl mb-4">🚀</div>
							<h4 className="text-xl font-bold mb-3">Creators</h4>
							<p className="text-gray-700">
								Test ideas publicly and learn what users actually want
							</p>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-sm">
							<div className="text-4xl mb-4">✅</div>
							<h4 className="text-xl font-bold mb-3">Validators</h4>
							<p className="text-gray-700">
								Influence early products and help shape better solutions
							</p>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-sm">
							<div className="text-4xl mb-4">🌍</div>
							<h4 className="text-xl font-bold mb-3">Everyone</h4>
							<p className="text-gray-700">
								Avoid building features—or startups—based on assumptions
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Key Features Section */}
			<div className="py-16 bg-white">
				<div className="max-w-5xl mx-auto px-6">
					<h3 className="text-3xl md:text-4xl font-bold mb-12 text-center">
						Features that drive validation
					</h3>

					<div className="space-y-12">
						{/* Feature 1 */}
						<div className="flex flex-col md:flex-row gap-8 items-start">
							<div className="shrink-0 bg-blue-50 rounded-xl p-4">
								<HiRocketLaunch className="h-12 w-12 text-blue-600" />
							</div>
							<div className="flex-1">
								<h4 className="text-2xl font-bold mb-3">
									From thought to traction
								</h4>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start gap-2">
										<span className="text-blue-600 mt-1">•</span>
										<span>Publish ideas with clarity and context</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-600 mt-1">•</span>
										<span>
											Track progress from{" "}
											<strong>Validated → WIP → Launched</strong>
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-600 mt-1">•</span>
										<span>Link real products to proven ideas</span>
									</li>
								</ul>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="flex flex-col md:flex-row gap-8 items-start">
							<div className="shrink-0 bg-purple-50 rounded-xl p-4">
								<HiUsers className="h-12 w-12 text-purple-600" />
							</div>
							<div className="flex-1">
								<h4 className="text-2xl font-bold mb-3">Signal, not noise</h4>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start gap-2">
										<span className="text-purple-600 mt-1">•</span>
										<span>Upvotes surface demand, not vanity</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-purple-600 mt-1">•</span>
										<span>
											Threaded discussions reveal <em>why</em> people care—or
											don&apos;t
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-purple-600 mt-1">•</span>
										<span>Engagement metrics help you spot momentum early</span>
									</li>
								</ul>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="flex flex-col md:flex-row gap-8 items-start">
							<div className="shrink-0 bg-green-50 rounded-xl p-4">
								<HiChartBar className="h-12 w-12 text-green-600" />
							</div>
							<div className="flex-1">
								<h4 className="text-2xl font-bold mb-3">
									See what matters now
								</h4>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">•</span>
										<span>
											<strong>HOT</strong>: What&apos;s gaining traction today
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">•</span>
										<span>
											<strong>NEW</strong>: Fresh ideas, zero bias
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-green-600 mt-1">•</span>
										<span>
											<strong>TRENDING</strong>: Ideas the community
											consistently believes in
										</span>
									</li>
								</ul>
							</div>
						</div>

						{/* Feature 4 */}
						<div className="flex flex-col md:flex-row gap-8 items-start">
							<div className="shrink-0 bg-orange-50 rounded-xl p-4">
								<HiUser className="h-12 w-12 text-orange-600" />
							</div>
							<div className="flex-1">
								<h4 className="text-2xl font-bold mb-3">
									Build credibility over time
								</h4>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start gap-2">
										<span className="text-orange-600 mt-1">•</span>
										<span>Showcase your thinking, not just outcomes</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-orange-600 mt-1">•</span>
										<span>Pin your strongest ideas</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-orange-600 mt-1">•</span>
										<span>Build a public validation track record</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Closing CTA Section */}
			<div className="py-16 bg-gray-900">
				<div className="max-w-3xl mx-auto px-6 text-center">
					<h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
						Your idea deserves feedback—before reality gives it none.
					</h3>
					<p className="text-xl text-gray-300 mb-8">
						Share your idea today and validate it with people who care.
					</p>
					<Link
						href="/register"
						className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform"
					>
						<span>Post your first idea</span>
						<HiSparkles className="h-5 w-5" />
					</Link>
				</div>
			</div>

			{/* Footer */}
			<div className="py-8 bg-[#eeeeee]">
				<div className="max-w-5xl mx-auto px-6 text-center text-gray-600">
					<p>&copy; 2025 VALIDUCT. Built for founders, by founders.</p>
				</div>
			</div>
		</div>
	);
}
