import Timeline from "@/components/Timeline";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-white">
			{/* Navbar Island */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-5xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between bg-white border border-gray-300 rounded-full px-6 py-3 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="text-2xl">💡</span>
								<div>
									<h1 className="text-xl font-bold text-gray-900">VALIDUCT</h1>
									<p className="text-xs text-gray-500">
										Validate your ideas to create successful products
									</p>
								</div>
							</div>
						</div>
						<Link
							href="/settings/profile"
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
							title="Profile"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 text-gray-700"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</Link>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-white py-12 border-b border-gray-200">
				<div className="max-w-5xl mx-auto px-6 text-center">
					<h2 className="text-4xl font-bold text-gray-900 mb-3">Don&apos;t wait!</h2>
					<p className="text-xl text-gray-600 mb-6">Throw in that idea now!</p>
					<Link
						href="/new-idea"
						className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-medium"
					>
						IDEA
					</Link>
				</div>
			</div>

			{/* Timeline */}
			<div className="max-w-5xl mx-auto px-6 py-8">
				<Timeline />
			</div>
		</div>
	);
}
