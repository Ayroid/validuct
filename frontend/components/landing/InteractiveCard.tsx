"use client";

import { ReactNode } from "react";

interface InteractiveCardProps {
	children: ReactNode;
	className?: string;
	hoverEffect?: "lift" | "glow" | "scale" | "border";
	accentColor?: string;
}

export default function InteractiveCard({
	children,
	className = "",
	hoverEffect = "lift",
	accentColor,
}: InteractiveCardProps) {
	const getHoverClasses = () => {
		switch (hoverEffect) {
			case "lift":
				return "hover:-translate-y-1 hover:shadow-xl";
			case "glow":
				return "hover:shadow-[0_0_30px_rgba(255,189,89,0.15)]";
			case "scale":
				return "hover:scale-[1.02]";
			case "border":
				return "hover:border-primary/50";
			default:
				return "";
		}
	};

	return (
		<div
			className={`group border-border bg-card relative overflow-hidden rounded-2xl border transition-all duration-300 ${getHoverClasses()} ${className}`}
		>
			{accentColor && (
				<div
					className="absolute top-0 left-0 h-full w-1 transition-all duration-300 group-hover:w-1.5"
					style={{ backgroundColor: accentColor }}
				/>
			)}
			{children}
		</div>
	);
}
