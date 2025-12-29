"use client";

import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { Button } from "@/components/ui/button";

const IdeaShare = () => {
	return (
		<>
			{/* Inline Composer - Desktop */}
			<div className="hidden md:block py-4">
				<div className="max-w-5xl mx-auto px-6">
					<Link
						href="/idea/new"
						className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
					>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<p className="text-gray-500 text-lg">
									What&apos;s on your mind? Share your idea with the community.
								</p>
							</div>
							<Button size="lg" className="gap-2 px-10 py-6 text-lg cursor-pointer hover:bg-primary/80">
								<HiSparkles className="h-5 w-5" />
								<span>Share</span>
							</Button>
						</div>
					</Link>
				</div>
			</div>

			{/* FAB - Mobile */}
			<Link
				href="/idea/new"
				className="md:hidden fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
			>
				<HiSparkles className="h-6 w-6" />
			</Link>
		</>
	);
};

export default IdeaShare;
