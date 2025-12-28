import Link from "next/link";
import {
	HiSparkles,
	HiRocketLaunch,
	HiUsers,
	HiChartBar,
} from "react-icons/hi2";
import Navbar from "@/components/Navbar";
import AnimatedLogo from "@/components/AnimatedLogo";

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
								<AnimatedLogo />
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

			{/* Problem Section */}
			<div className="py-16 bg-gray-900">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
						80% of startups fail because founders build useless products
					</h3>
					<div className="grid md:grid-cols-3 gap-8 mt-12">
						<div className="flex flex-col items-center">
							<div className="text-4xl mb-3">🚀</div>
							<p className="text-gray-300">Launch new features</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="text-4xl mb-3">😐</div>
							<p className="text-gray-300">But nothing happens</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="text-4xl mb-3">😞</div>
							<p className="text-gray-300">Lose motivation and quit</p>
						</div>
					</div>
				</div>
			</div>

			{/* Solution Section */}
			<div className="py-16 bg-white">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h3 className="text-3xl md:text-4xl font-bold mb-6">
						Ship features users really want
					</h3>
					<p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
						Gather feedback from your community, prioritize what matters, and
						build products people actually use.
					</p>

					<div className="grid md:grid-cols-2 gap-6">
						{/* Collect Feedback Card */}
						<div className="bg-yellow-400 rounded-2xl p-8 text-left">
							<h4 className="text-2xl font-bold mb-4">
								Collect user feedback
							</h4>
							<p className="text-gray-800 mb-6">
								See what new features, improvements, and bugs your users care
								about.
							</p>
							<div className="bg-white rounded-xl p-4 space-y-3">
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<span className="font-medium text-sm">
										Add timeline/journey integration to the Insighto
									</span>
									<span className="text-orange-500 font-bold">💡</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<span className="font-medium text-sm">
										A one pricing plan for revenue billing
									</span>
									<span className="text-orange-500 font-bold">💡</span>
								</div>
							</div>
						</div>

						{/* Prioritize Features Card */}
						<div className="bg-gray-900 rounded-2xl p-8 text-left text-white">
							<h4 className="text-2xl font-bold mb-4">Prioritize features</h4>
							<p className="text-gray-300 mb-6">
								See which features have the most demand and ship accordingly.
							</p>
							<div className="bg-white rounded-xl p-4 space-y-3">
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<span className="font-medium text-sm text-gray-900">
										Add timeline/journey integration
									</span>
									<span className="font-bold text-gray-900">↑ 42</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<span className="font-medium text-sm text-gray-900">
										One pricing plan for revenue
									</span>
									<span className="font-bold text-gray-900">↑ 28</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* How It Works Section */}
			<div className="py-16 bg-[#eeeeee]">
				<div className="max-w-4xl mx-auto px-6">
					<h3 className="text-3xl md:text-4xl font-bold mb-12 text-center">
						How it works
					</h3>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
								<HiRocketLaunch className="h-12 w-12 text-red-500 mx-auto" />
							</div>
							<h4 className="text-xl font-bold mb-2">Share your idea</h4>
							<p className="text-gray-700">
								Post your concept and get it in front of real people
							</p>
						</div>

						<div className="text-center">
							<div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
								<HiUsers className="h-12 w-12 text-orange-500 mx-auto" />
							</div>
							<h4 className="text-xl font-bold mb-2">Get feedback</h4>
							<p className="text-gray-700">
								Community votes and comments on what resonates
							</p>
						</div>

						<div className="text-center">
							<div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
								<HiChartBar className="h-12 w-12 text-yellow-500 mx-auto" />
							</div>
							<h4 className="text-xl font-bold mb-2">Build with confidence</h4>
							<p className="text-gray-700">
								Ship features people actually want and avoid wasting time
							</p>
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
					<p>
						&copy; 2025 Validuct | Built by{" "}
						<a
							href="https://ayroid.in"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 font-semibold hover:underline"
						>
							Ayroid
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
