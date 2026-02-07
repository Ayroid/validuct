"use client";

import Link from "next/link";
import { useState } from "react";
import {
	HiCheckBadge,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
} from "react-icons/hi2";

interface HeroSectionProps {
	ctaLink: string;
}

const demoSignals = [
	{
		icon: HiCheckBadge,
		label: "Problem feels real",
		count: 31,
		activeText: "text-signal-problem",
		activeBg: "bg-signal-problem",
		activeBorder: "border-signal-problem",
	},
	{
		icon: HiCurrencyDollar,
		label: "Would pay for this",
		count: 23,
		activeText: "text-signal-pay",
		activeBg: "bg-signal-pay",
		activeBorder: "border-signal-pay",
	},
	{
		icon: HiRocketLaunch,
		label: "Ready to build",
		count: 18,
		activeText: "text-signal-build",
		activeBg: "bg-signal-build",
		activeBorder: "border-signal-build",
	},
	{
		icon: HiExclamationTriangle,
		label: "Needs more clarity",
		count: 5,
		activeText: "text-signal-clarity",
		activeBg: "bg-signal-clarity",
		activeBorder: "border-signal-clarity",
	},
];

export default function HeroSection({ ctaLink }: HeroSectionProps) {
	const [counts, setCounts] = useState(demoSignals.map((s) => s.count));
	const [clicked, setClicked] = useState<boolean[]>(
		demoSignals.map(() => false)
	);

	const handleSignalClick = (idx: number) => {
		setCounts((prev) => {
			const next = [...prev];
			next[idx] = clicked[idx] ? next[idx] - 1 : next[idx] + 1;
			return next;
		});
		setClicked((prev) => {
			const next = [...prev];
			next[idx] = !next[idx];
			return next;
		});
	};

	return (
		<section className="relative flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
			{/* Subtle radial glow */}
			<div className="pointer-events-none absolute top-20 left-1/2 h-[500px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,var(--accent-glow)_0%,transparent_70%)]" />

			<div className="relative mx-auto max-w-[1080px]">
				{/* Badge */}
				<div className="border-primary/15 text-primary mb-8 inline-flex animate-[fadeUp_0.6s_ease_both] items-center gap-2 rounded-full border bg-[var(--accent-glow)] px-4 py-1.5 font-mono text-xs tracking-widest uppercase">
					<span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
					Live &amp; Free
				</div>

				{/* Headline */}
				<h1 className="font-display mx-auto mb-6 max-w-[700px] animate-[fadeUp_0.6s_ease_0.1s_both] text-[clamp(42px,6vw,72px)] leading-[1.1]">
					<span className="text-muted-foreground line-through decoration-[var(--red)] decoration-[3px]">
						Opinions
					</span>{" "}
					won&apos;t tell you if people will{" "}
					<em className="text-primary">pay</em>
				</h1>

				{/* Subtitle */}
				<p className="text-muted-foreground mx-auto mb-10 max-w-[520px] animate-[fadeUp_0.6s_ease_0.2s_both] text-lg leading-relaxed">
					Validuct gives builders real demand signals — not upvotes, not
					&quot;cool idea bro.&quot; Know if people will actually pay before you
					write a single line of code.
				</p>

				{/* Actions */}
				<div className="mb-16 flex animate-[fadeUp_0.6s_ease_0.3s_both] flex-wrap justify-center gap-4">
					<Link
						href={ctaLink}
						className="bg-foreground text-background inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-[15px] font-semibold transition-all hover:-translate-y-0.5 hover:opacity-85 hover:shadow-lg"
					>
						Test Your Idea Free
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="5" y1="12" x2="19" y2="12" />
							<polyline points="12 5 19 12 12 19" />
						</svg>
					</Link>
					<a
						href="#how"
						className="border-border text-muted-foreground hover:bg-card hover:text-foreground inline-flex items-center gap-2 rounded-lg border bg-transparent px-8 py-3.5 text-[15px] font-medium transition-all hover:border-[var(--border-light)]"
					>
						See How It Works &darr;
					</a>
				</div>

				{/* ── Interactive Product Demo ── */}
				<div className="mx-auto max-w-[680px] animate-[fadeUp_0.8s_ease_0.4s_both]">
					<div className="border-border bg-card overflow-hidden rounded-xl border shadow-lg">
						{/* App chrome bar */}
						<div className="border-border bg-muted/50 flex items-center gap-1.5 border-b px-4 py-2.5">
							<span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted-extra)]/30" />
							<span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted-extra)]/30" />
							<span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted-extra)]/30" />
							<span className="ml-3 font-mono text-[10px] text-[var(--text-muted-extra)]">
								validuct.com/idea/ai-writing-assistant
							</span>
						</div>

						{/* Idea header */}
						<div className="border-border flex items-center justify-between border-b px-6 py-5">
							<div className="flex items-center gap-2.5">
								<div className="from-accent to-primary grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br text-sm font-semibold text-white">
									A
								</div>
								<div className="text-muted-foreground text-[13px]">
									<strong className="text-foreground">@ayroid</strong> &middot;
									2 days ago
								</div>
							</div>
							<span className="rounded-full border border-[var(--green)]/15 bg-[var(--green-light)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--green)]">
								Validated &#10003;
							</span>
						</div>

						{/* Idea body */}
						<div className="px-6 py-6 text-left">
							<div className="font-display mb-2 text-[22px]">
								AI Writing Assistant for Developers
							</div>
							<div className="text-muted-foreground mb-5 text-sm leading-relaxed">
								Technical documentation tool that understands your codebase and
								generates contextual docs, READMEs, and API references — not
								generic filler text.
							</div>

							{/* Interactive signal buttons */}
							<h3 className="text-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
								Validation Signals
							</h3>
							<div className="grid grid-cols-2 gap-3">
								{demoSignals.map((signal, idx) => {
									const isActive = clicked[idx];
									const IconComponent = signal.icon;
									return (
										<button
											key={signal.label}
											onClick={() => handleSignalClick(idx)}
											className={`group flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all duration-200 sm:px-4 sm:py-3 ${
												isActive
													? `${signal.activeBorder} ${signal.activeBg}`
													: "border-border/50 bg-background hover:border-border hover:bg-muted/50"
											}`}
										>
											<span className="flex items-center gap-2 text-sm sm:gap-2.5">
												<IconComponent
													className={`h-5 w-5 shrink-0 ${isActive ? signal.activeText : "text-muted-foreground"}`}
												/>
												<span
													className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
												>
													{signal.label}
												</span>
											</span>
											<span
												className={`min-w-5 text-right font-mono text-sm font-semibold ${
													isActive ? signal.activeText : "text-muted-foreground"
												}`}
											>
												{counts[idx]}
											</span>
										</button>
									);
								})}
							</div>

							<p className="mt-4 text-center font-mono text-[11px] text-[var(--text-muted-extra)]">
								Try clicking the signals above — this is the real experience
								&uarr;
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
