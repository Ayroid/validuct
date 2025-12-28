import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";

const CTA = () => {
	return (
		<div className="py-16">
			<div className="max-w-5xl mx-auto px-6">
				<div className="relative overflow-hidden rounded-3xl">
					<div className="relative px-8 py-12 md:py-16 text-center">
						<div className="flex justify-center mb-4">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white">
								<HiSparkles className="text-yellow-400 h-5 w-5" />
								<span className="text-sm font-medium">
									Start Building Today
								</span>
							</div>
						</div>

						<h2 className="text-4xl md:text-5xl font-bold mb-4">
							Don&apos;t wait!
						</h2>
						<p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
							Turn your vision into reality. Share your idea and get valuable
							feedback from the community.
						</p>

						<Link
							href="/new-idea"
							className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform"
						>
							<span>Share Your Idea</span>
							<HiSparkles className="h-5 w-5" />
						</Link>

						<div className="mt-8 flex items-center justify-center gap-8 text-gray-900 text-sm">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-green-400 rounded-full"></div>
								<span>Free Forever</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-blue-400 rounded-full"></div>
								<span>Community Driven</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-purple-400 rounded-full"></div>
								<span>Real Feedback</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CTA;
