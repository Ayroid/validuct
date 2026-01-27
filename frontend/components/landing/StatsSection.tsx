"use client";

import { HiLightBulb, HiClock, HiCurrencyDollar, HiUserGroup } from "react-icons/hi2";
import FadeIn from "./FadeIn";

const valueProps = [
	{
		icon: HiLightBulb,
		title: "Test Before You Build",
		description: "Validate demand before writing a single line of code",
		color: "text-amber-500",
		bgColor: "bg-amber-500/10",
	},
	{
		icon: HiClock,
		title: "Minutes, Not Months",
		description: "Get your idea page live and collecting signups instantly",
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
	},
	{
		icon: HiCurrencyDollar,
		title: "Real Buying Signals",
		description: "Know if people would actually pay, not just \"like\" your idea",
		color: "text-green-500",
		bgColor: "bg-green-500/10",
	},
	{
		icon: HiUserGroup,
		title: "Built for Builders",
		description: "By indie hackers, for indie hackers and solopreneurs",
		color: "text-purple-500",
		bgColor: "bg-purple-500/10",
	},
];

export default function StatsSection() {
	return (
		<section className="bg-foreground px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
					{valueProps.map((prop, index) => (
						<FadeIn key={prop.title} delay={index * 100} direction="up">
							<div className="flex flex-col items-center text-center">
								<div
									className={`${prop.bgColor} mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-110 sm:h-20 sm:w-20`}
								>
									<prop.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${prop.color}`} />
								</div>
								<h3 className="text-background mb-2 text-lg font-semibold sm:text-xl">
									{prop.title}
								</h3>
								<p className="text-background/60 text-sm sm:text-base">
									{prop.description}
								</p>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}
