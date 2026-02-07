"use client";

import { useEffect, useRef, useState } from "react";
import {
	HiCheckBadge,
	HiCurrencyDollar,
	HiRocketLaunch,
	HiExclamationTriangle,
} from "react-icons/hi2";

/* ─── App Frame wrapper ─── */
function AppFrame({ children }: { children: React.ReactNode }) {
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
			{/* Browser chrome dots */}
			<div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
				<span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted-extra)]/30" />
				<span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted-extra)]/30" />
				<span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted-extra)]/30" />
				<span className="ml-3 font-mono text-[10px] text-[var(--text-muted-extra)]">
					validuct.com
				</span>
			</div>
			<div className="p-5">{children}</div>
		</div>
	);
}

/* ─── Demo 1: Idea creation form ─── */
function IdeaFormDemo() {
	return (
		<AppFrame>
			<div className="space-y-4">
				<div>
					<label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-[var(--text-muted-extra)]">
						Title
					</label>
					<div className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground">
						AI Writing Assistant for Developers
					</div>
				</div>
				<div>
					<label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-[var(--text-muted-extra)]">
						Description
					</label>
					<div className="min-h-[80px] rounded-lg border border-border bg-background px-4 py-2.5 text-sm leading-relaxed text-foreground">
						Technical documentation tool that understands your codebase and
						generates contextual docs, READMEs, and API references — not
						generic filler text.
					</div>
				</div>
				<div>
					<label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-[var(--text-muted-extra)]">
						Status
					</label>
					<div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm">
						<span className="h-2 w-2 rounded-full bg-primary" />
						<span className="text-foreground">Open for Validation</span>
					</div>
				</div>
				<button className="w-full rounded-lg bg-foreground py-2.5 text-center text-sm font-semibold text-background">
					Post Idea &rarr;
				</button>
			</div>
		</AppFrame>
	);
}

/* ─── Demo 2: Signal buttons (interactive) ─── */
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

function SignalDemo() {
	const [counts, setCounts] = useState(demoSignals.map((s) => s.count));
	const [clicked, setClicked] = useState<boolean[]>(
		demoSignals.map(() => false)
	);

	const handleClick = (idx: number) => {
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
		<AppFrame>
			{/* Mini idea header */}
			<div className="mb-4 flex items-center gap-2.5">
				<div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-semibold text-white">
					A
				</div>
				<div className="text-[13px]">
					<strong className="text-foreground">AI Writing Assistant</strong>
					<span className="text-muted-foreground"> · @ayroid</span>
				</div>
			</div>

			<h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
				Validation Signals
			</h3>
			<div className="grid grid-cols-2 gap-2.5">
				{demoSignals.map((signal, idx) => {
					const isActive = clicked[idx];
					const IconComponent = signal.icon;
					return (
						<button
							key={signal.label}
							onClick={() => handleClick(idx)}
							className={`group flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
								isActive
									? `${signal.activeBorder} ${signal.activeBg}`
									: "border-border/50 bg-background hover:border-border hover:bg-muted/50"
							}`}
						>
							<span className="flex items-center gap-2 text-sm">
								<IconComponent
									className={`h-4 w-4 shrink-0 ${isActive ? signal.activeText : "text-muted-foreground"}`}
								/>
								<span
									className={`text-xs font-medium sm:text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}
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
			<p className="mt-3 text-center font-mono text-[11px] text-[var(--text-muted-extra)]">
				Try clicking a signal &uarr;
			</p>
		</AppFrame>
	);
}

/* ─── Demo 3: Analytics dashboard preview ─── */
function AnalyticsDemo() {
	const metrics = [
		{ label: "Total Ideas", value: "47" },
		{ label: "Total Signals", value: "312" },
		{ label: "Avg Signals/Idea", value: "6.6" },
	];

	const distribution = [
		{
			label: "Problem Real",
			pct: 40,
			colorVar: "var(--signal-problem)",
		},
		{
			label: "Would Pay",
			pct: 30,
			colorVar: "var(--signal-pay)",
		},
		{
			label: "Ready to Build",
			pct: 23,
			colorVar: "var(--signal-build)",
		},
		{
			label: "Needs Clarity",
			pct: 7,
			colorVar: "var(--signal-clarity)",
		},
	];

	return (
		<AppFrame>
			{/* Summary cards */}
			<div className="mb-5 grid grid-cols-3 gap-3">
				{metrics.map((m) => (
					<div
						key={m.label}
						className="rounded-lg border border-border bg-background p-3 text-center"
					>
						<div className="font-display text-xl">{m.value}</div>
						<div className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted-extra)]">
							{m.label}
						</div>
					</div>
				))}
			</div>

			{/* Signal distribution */}
			<h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
				Signal Distribution
			</h4>

			{/* Stacked bar */}
			<div className="mb-4 flex h-5 overflow-hidden rounded-full">
				{distribution.map((d) => (
					<div
						key={d.label}
						style={{
							width: `${d.pct}%`,
							backgroundColor: d.colorVar,
						}}
						className="transition-all duration-500"
					/>
				))}
			</div>

			{/* Legend */}
			<div className="grid grid-cols-2 gap-2">
				{distribution.map((d) => (
					<div key={d.label} className="flex items-center gap-2 text-xs">
						<span
							className="h-2.5 w-2.5 shrink-0 rounded-sm"
							style={{ backgroundColor: d.colorVar }}
						/>
						<span className="text-muted-foreground">{d.label}</span>
						<span className="ml-auto font-mono font-semibold text-foreground">
							{d.pct}%
						</span>
					</div>
				))}
			</div>
		</AppFrame>
	);
}

/* ─── Signal explanations for Step 2 ─── */
const signalExplanations = [
	{
		icon: HiCheckBadge,
		name: "Problem Real",
		desc: "The pain point actually exists",
		colorClass: "text-signal-problem",
	},
	{
		icon: HiCurrencyDollar,
		name: "Would Pay",
		desc: "Real willingness to spend money",
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

/* ─── Steps data ─── */
const steps = [
	{
		num: "01",
		title: "Describe your idea",
		desc: "Post your concept with the problem, target audience, and what you're building. Takes under 2 minutes.",
		detail: "Shareable idea page created instantly",
		Demo: IdeaFormDemo,
		extra: null,
	},
	{
		num: "02",
		title: "Collect real signals",
		desc: "Not a like button. Not a comment count. Four structured demand signals that tell you what's real:",
		detail: "Structured, actionable feedback",
		Demo: SignalDemo,
		extra: "signals" as const,
	},
	{
		num: "03",
		title: "Build or pivot",
		desc: 'Got strong "Would Pay" signals? Build with confidence. Weak signals? Pivot early — before wasting months.',
		detail: "Data-driven decisions, not gut feelings",
		Demo: AnalyticsDemo,
		extra: null,
	},
];

/* ─── Main Section ─── */
export default function HowItWorksSection() {
	const ref = useRef<HTMLElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setVisible(true);
			},
			{ threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<section
			id="how"
			ref={ref}
			className={`bg-muted px-6 py-[140px] transition-all duration-600 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
		>
			<div className="mx-auto max-w-[1080px]">
				{/* Header */}
				<div className="mb-20 text-center">
					<div className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
						How It Works
					</div>
					<h2 className="mb-3 font-display text-[clamp(28px,4vw,44px)] leading-[1.2]">
						Validate in minutes,
						<br />
						not months
					</h2>
					<p className="text-base text-muted-foreground">
						Three steps. Real signals. No wasted time.
					</p>
				</div>

				{/* Steps — vertical layout */}
				<div className="space-y-20">
					{steps.map((step, idx) => {
						const isEven = idx % 2 === 0;
						return (
							<div key={step.num} className="relative">
								{/* Vertical connector line */}
								{idx < steps.length - 1 && (
									<div className="absolute left-1/2 -bottom-10 hidden h-10 w-px -translate-x-1/2 bg-border md:block" />
								)}

								<div
									className={`flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-16 ${
										isEven ? "" : "md:flex-row-reverse"
									}`}
								>
									{/* Text side */}
									<div className="flex-1 text-center md:text-left">
										<div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
											Step {step.num}
										</div>
										<h3 className="mb-3 font-display text-[clamp(24px,3vw,32px)] leading-tight">
											{step.title}
										</h3>
										<p className="mb-4 max-w-[420px] text-sm leading-relaxed text-muted-foreground md:max-w-none">
											{step.desc}
										</p>

										{/* Signal explanations (Step 2 only) */}
										{step.extra === "signals" && (
											<div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
												{signalExplanations.map((s) => {
													const Icon = s.icon;
													return (
														<div
															key={s.name}
															className="flex items-start gap-2 text-left"
														>
															<Icon
																className={`mt-0.5 h-4 w-4 shrink-0 ${s.colorClass}`}
															/>
															<div>
																<div className="text-xs font-medium text-foreground">
																	{s.name}
																</div>
																<div className="text-[11px] leading-snug text-[var(--text-muted-extra)]">
																	{s.desc}
																</div>
															</div>
														</div>
													);
												})}
											</div>
										)}

										<div className="font-mono text-xs text-primary">
											&rarr; {step.detail}
										</div>
									</div>

									{/* Demo side */}
									<div className="w-full max-w-[480px] flex-1">
										<step.Demo />
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
