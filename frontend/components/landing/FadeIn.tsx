"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface FadeInProps {
	children: ReactNode;
	delay?: number;
	direction?: "up" | "down" | "left" | "right" | "none";
	duration?: number;
	className?: string;
	once?: boolean;
}

export default function FadeIn({
	children,
	delay = 0,
	direction = "up",
	duration = 600,
	className = "",
	once = true,
}: FadeInProps) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true);
						if (once) observer.disconnect();
					} else if (!once) {
						setIsVisible(false);
					}
				});
			},
			{ threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, [once]);

	const getTransform = () => {
		switch (direction) {
			case "up": return "translateY(30px)";
			case "down": return "translateY(-30px)";
			case "left": return "translateX(30px)";
			case "right": return "translateX(-30px)";
			default: return "none";
		}
	};

	return (
		<div
			ref={ref}
			className={className}
			style={{
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "none" : getTransform(),
				transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
			}}
		>
			{children}
		</div>
	);
}
