"use client";

import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { Button } from "@/components/ui/button";

const IdeaShare = () => {
	return (
		<>
			{/* Inline Composer - Desktop */}
			<div className="hidden px-6 py-4 md:block">
				<Link
					href="/idea/new"
					className="bg-card hover:border-primary/50 block rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md"
				>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<p className="text-muted-foreground text-lg">
								What&apos;s on your mind? Share your idea with the community.
							</p>
						</div>
						<Button
							size="lg"
							className="hover:bg-primary/80 cursor-pointer gap-2 px-10 py-6 text-lg text-foreground"
						>
							<HiSparkles className="h-5 w-5" />
							<span>Share</span>
						</Button>
					</div>
				</Link>
			</div>

			{/* FAB - Mobile */}
			<Link
				href="/idea/new"
				className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl md:hidden"
			>
				<HiSparkles className="h-6 w-6" />
			</Link>
		</>
	);
};

export default IdeaShare;
