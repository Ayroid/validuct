"use client";

import { useEffect, useRef, useState } from "react";
import {
	HiCheckBadge,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
} from "react-icons/hi2";

const signals = [
	{
		icon: HiCheckBadge,
		name: "Problem Real",
		desc: "The pain point actually exists",
		colorClass: "text-signal-problem",
	},
	{
		icon: HiCurrencyDollar,
		name: "Would Pay",
		desc: "Real willingness to spend money on this",
		colorClass: "text-signal-pay",
	},
	{
		icon: HiRocketLaunch,
		name: "Ready to Build",
		desc: "Clear enough to start executing",
		colorClass: "text-signal-build",
	},
	{
		icon: HiExclamationTriangle,
		name: "Needs Clarity",
		desc: "More detail needed before deciding",
		colorClass: "text-signal-clarity",
	},
];

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

export default function SolutionSection() {
	const ref = useRef<HTMLElement>(null);
	const demoRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [demoVisible, setDemoVisible] = useState(false);
	const [counts, setCounts] = useState(
		demoSignals.map((s) => s.count)
	);
	const [clicked, setClicked] = useState<boolean[]>(
		demoSignals.map(() => false)
	);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setVisible(true);
			},
			{ threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const el = demoRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setDemoVisible(true);
			},
			{ threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

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
		<section
			ref={ref}
			className={`mx-auto max-w-[1080px] px-6 py-[140px] transition-all duration-600 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
		>
			{/* Header */}
			<div className="mb-16 text-center">
				<div className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
					Core Feature
				</div>
				<h2 className="mb-3 font-display text-[clamp(28px,4vw,44px)] leading-[1.2]">
					Four signals that
					<br />
					actually matter
				</h2>
				<p className="mx-auto max-w-[480px] text-base text-muted-foreground">
					Not a like button. Not a comment count. Structured demand signals
					that tell you what&apos;s real.
				</p>
			</div>

			{/* Signal Cards Grid */}
			<div className="mx-auto mb-12 grid max-w-[600px] grid-cols-2 gap-4">
				{signals.map((signal) => (
					<div
						key={signal.name}
						className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<signal.icon
							className={`mx-auto mb-4 h-8 w-8 ${signal.colorClass}`}
						/>
						<div className="mb-2 font-mono text-[13px] font-medium tracking-tight">
							{signal.name}
						</div>
						<div className="text-[13px] leading-relaxed text-[var(--text-muted-extra)]">
							{signal.desc}
						</div>
					</div>
				))}
			</div>

			{/* Demo Card */}
			<div
				ref={demoRef}
				className={`mx-auto max-w-[680px] overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-600 ${demoVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
			>
				{/* Demo Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-5">
					<div className="flex items-center gap-2.5">
						<div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-sm font-semibold text-white">
							A
						</div>
						<div className="text-[13px] text-muted-foreground">
							<strong className="text-foreground">@ayroid</strong> &middot; 2
							days ago
						</div>
					</div>
					<span className="rounded-full border border-[var(--green)]/15 bg-[var(--green-light)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--green)]">
						Validated &#10003;
					</span>
				</div>

				{/* Demo Body */}
				<div className="px-6 py-6">
					<div className="mb-2 font-display text-[22px]">
						AI Writing Assistant for Developers
					</div>
					<div className="mb-5 text-sm leading-relaxed text-muted-foreground">
						Technical documentation tool that understands your codebase and
						generates contextual docs, READMEs, and API references — not
						generic filler text.
					</div>

					{/* Validation Signals - 2x2 grid matching real app */}
					<h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
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
											isActive
												? signal.activeText
												: "text-muted-foreground"
										}`}
									>
										{counts[idx]}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
