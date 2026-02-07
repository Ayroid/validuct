"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface CTASectionProps {
	ctaLink: string;
}

export default function CTASection({ ctaLink }: CTASectionProps) {
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
			className={`relative px-6 py-[140px] text-center transition-all duration-600 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
		>
			{/* Subtle radial glow — matches hero */}
			<div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,var(--accent-glow)_0%,transparent_70%)]" />

			<div className="relative mx-auto max-w-[600px]">
				<div className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
					Get Started
				</div>
				<h2 className="mb-4 font-display text-[clamp(28px,4vw,44px)] leading-[1.2]">
					Stop building products
					<br />
					nobody wants
				</h2>
				<p className="mx-auto mb-10 max-w-[440px] text-base leading-relaxed text-muted-foreground">
					Join builders who validate ideas with real demand signals before
					wasting months of development time.
				</p>

				<div className="flex flex-wrap justify-center gap-4">
					<Link
						href={ctaLink}
						className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-3.5 text-[15px] font-semibold text-background transition-all hover:-translate-y-0.5 hover:opacity-85 hover:shadow-lg"
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
				</div>

				<div className="mt-5 font-mono text-[11px] tracking-wide text-[var(--text-muted-extra)]">
					Free forever &middot; No credit card required
				</div>
			</div>
		</section>
	);
}
