import Link from "next/link";
import Image from "next/image";
import { HiSparkles } from "react-icons/hi2";

const CTA = () => {
	return (
		<div className="py-16">
			<div className="max-w-5xl mx-auto px-6">
				<div className="relative overflow-hidden rounded-3xl ">
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
						<p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Get honest feedback, votes, and insights from a focused
							community—so you don't ship something nobody wants.
						</p>

						<Link
							href="/idea/new"
							className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform"
						>
							<span>Share Your Idea</span>
							<HiSparkles className="h-5 w-5" />
						</Link>

						<div className="mt-8 flex items-center justify-center gap-8 text-foreground text-sm font-medium">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-(--brand-red) rounded-full shadow-sm"></div>
								<span>Real Analytics</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-(--brand-orange) rounded-full shadow-sm"></div>
								<span>Team Collaboration</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 bg-(--brand-yellow) rounded-full shadow-sm"></div>
								<span>Community Support</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CTA;
