import Link from "next/link";
import Image from "next/image";
import { HiSparkles } from "react-icons/hi2";

const CTA = () => {
	return (
		<div className="py-16">
			<div className="mx-auto max-w-5xl px-6">
				<div className="relative overflow-hidden rounded-3xl">
					<div className="relative px-8 py-12 text-center md:py-16">
						<div className="mb-6 flex justify-center">
							<Image
								src="/logo.png"
								alt="Validuct Logo"
								width={200}
								height={200}
								className="object-contain"
							/>
						</div>

						<h2 className="mb-4 text-4xl font-bold md:text-5xl">
							Validate your idea before you build it
						</h2>
						<p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
							Get honest feedback, votes, and insights from a focused
							community—so you don&apos;t ship something nobody wants.
						</p>

						<Link
							href="/idea/new"
							className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex transform items-center gap-2 rounded-full px-10 py-4 text-lg font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
						>
							<span>Share Your Idea</span>
							<HiSparkles className="h-5 w-5" />
						</Link>

						<div className="text-foreground mt-8 flex items-center justify-center gap-8 text-sm font-medium">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-(--brand-red) shadow-sm"></div>
								<span>Real Analytics</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-brand-orange shadow-sm"></div>
								<span>Team Collaboration</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-brand-yellow shadow-sm"></div>
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
