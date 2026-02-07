"use client";

import { useEffect, useRef, useState } from "react";

export default function ProblemSection() {
	const ref = useRef<HTMLElement>(null);
	const [visible, setVisible] = useState(false);

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

	return (
		<section
			ref={ref}
			className={`mx-auto max-w-[1080px] px-6 py-[140px] transition-all duration-600 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
		>
			<div className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
				The Problem
			</div>
			<h2 className="mb-4 font-display text-[clamp(28px,4vw,44px)] leading-[1.2]">
				Likes and upvotes
				<br />
				don&apos;t pay your bills
			</h2>
			<p className="mb-12 max-w-[560px] text-base text-muted-foreground">
				You posted on Reddit. Got 200 upvotes. Built for 3 months. Launched
				to crickets. Sound familiar?
			</p>

			<div className="grid gap-5 md:grid-cols-2">
				{/* Guessing Column */}
				<div className="rounded-2xl border border-border border-t-[3px] border-t-[var(--red)] bg-card p-9 shadow-sm">
					<div className="mb-7 flex items-center gap-2.5">
						<div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--red-light)] text-base font-bold text-[var(--red)]">
							&#10007;
						</div>
						<div className="font-mono text-[13px] uppercase tracking-wide text-[var(--red)]">
							Guessing
						</div>
					</div>
					<ul className="flex flex-col gap-4">
						{[
							'"Cool idea!" — then silence forever',
							"Vanity metrics that don't translate to revenue",
							"Unstructured feedback you can't act on",
							"No way to track idea-to-launch journey",
						].map((text) => (
							<li
								key={text}
								className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
							>
								<span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--red-light)] text-[11px] font-bold text-[var(--red)]">
									&#10007;
								</span>
								<span>{text}</span>
							</li>
						))}
					</ul>
					<div className="mt-5 flex flex-wrap gap-1.5">
						{["Reddit", "Twitter/X", "Product Hunt", "Indie Hackers"].map(
							(tag) => (
								<span
									key={tag}
									className="rounded border border-border bg-muted px-2.5 py-1 font-mono text-[11px] text-[var(--text-muted-extra)]"
								>
									{tag}
								</span>
							)
						)}
					</div>
				</div>

				{/* Validating Column */}
				<div className="rounded-2xl border border-border border-t-[3px] border-t-[var(--green)] bg-card p-9 shadow-sm">
					<div className="mb-7 flex items-center gap-2.5">
						<div className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--green-light)] text-base font-bold text-[var(--green)]">
							&#10003;
						</div>
						<div className="font-mono text-[13px] uppercase tracking-wide text-[var(--green)]">
							Validating
						</div>
					</div>
					<ul className="flex flex-col gap-4">
						{[
							'"Would Pay" — real demand, not politeness',
							"Structured signals: problem real, ready to build",
							"Category-based comments (pricing, users, tech)",
							"Track your idea from draft \u2192 validated \u2192 launched",
						].map((text) => (
							<li
								key={text}
								className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
							>
								<span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--green-light)] text-[11px] font-bold text-[var(--green)]">
									&#10003;
								</span>
								<span>{text}</span>
							</li>
						))}
					</ul>
					<div className="mt-5 flex flex-wrap gap-1.5">
						<span className="rounded border border-[var(--green)]/25 bg-[var(--green-light)] px-2.5 py-1 font-mono text-[11px] text-[var(--green)]">
							Validuct
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
