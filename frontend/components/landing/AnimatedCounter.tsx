"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
	end: number;
	duration?: number;
	suffix?: string;
	prefix?: string;
	decimals?: number;
}

export default function AnimatedCounter({
	end,
	duration = 2000,
	suffix = "",
	prefix = "",
	decimals = 0,
}: AnimatedCounterProps) {
	const [count, setCount] = useState(0);
	const [hasAnimated, setHasAnimated] = useState(false);
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasAnimated) {
						setHasAnimated(true);
						let startTime: number;
						const step = (timestamp: number) => {
							if (!startTime) startTime = timestamp;
							const progress = Math.min((timestamp - startTime) / duration, 1);
							const easeOut = 1 - Math.pow(1 - progress, 3);
							setCount(easeOut * end);
							if (progress < 1) {
								requestAnimationFrame(step);
							}
						};
						requestAnimationFrame(step);
					}
				});
			},
			{ threshold: 0.3 }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, [end, duration, hasAnimated]);

	const displayValue = decimals > 0
		? count.toFixed(decimals)
		: Math.floor(count).toLocaleString();

	return (
		<span ref={ref}>
			{prefix}{displayValue}{suffix}
		</span>
	);
}
