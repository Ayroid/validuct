"use client";

import AnimatedCounter from "./AnimatedCounter";
import FadeIn from "./FadeIn";

const stats = [
	{
		value: 500,
		suffix: "+",
		label: "Ideas Validated",
		borderColor: "border-primary",
	},
	{
		value: 12,
		suffix: "K+",
		label: "Waitlist Signups",
		borderColor: "border-green-500",
	},
	{
		value: 8.5,
		suffix: "%",
		label: "Avg Conversion",
		borderColor: "border-amber-500",
		decimals: 1,
	},
	{
		value: 24,
		suffix: "hr",
		label: "Time to Validate",
		borderColor: "border-blue-500",
	},
];

export default function StatsSection() {
	return (
		<section className="bg-foreground px-4 py-12 sm:py-16 md:py-20 sm:px-6">
			<div className="mx-auto max-w-6xl">
				<div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">
					{stats.map((stat, index) => (
						<FadeIn key={stat.label} delay={index * 100} direction="up">
							<div className="flex flex-col items-center text-center">
								<div
									className={`relative mb-3 sm:mb-4 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 ${stat.borderColor} transition-transform duration-300 hover:scale-105`}
								>
									<span className="text-background text-xl sm:text-3xl font-bold">
										<AnimatedCounter
											end={stat.value}
											suffix={stat.suffix}
											decimals={stat.decimals || 0}
											duration={2000 + index * 200}
										/>
									</span>
								</div>
								<p className="text-background/60 text-xs sm:text-sm tracking-wider uppercase">
									{stat.label}
								</p>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}
