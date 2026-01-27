"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
	HiArrowTrendingUp,
	HiClipboardDocumentList,
	HiSparkles,
} from "react-icons/hi2";

interface FloatingWidgetProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	tooltip?: string;
	onClick?: () => void;
	parallaxIntensity?: number;
}

function FloatingWidget({
	children,
	className = "",
	delay = 0,
	tooltip,
	onClick,
	parallaxIntensity = 20,
}: FloatingWidgetProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const deltaX = (e.clientX - centerX) / window.innerWidth;
			const deltaY = (e.clientY - centerY) / window.innerHeight;
			setOffset({
				x: deltaX * parallaxIntensity,
				y: deltaY * parallaxIntensity,
			});
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [parallaxIntensity]);

	useEffect(() => {
		if (isHovered && tooltip) {
			const timer = setTimeout(() => setShowTooltip(true), 500);
			return () => clearTimeout(timer);
		} else {
			setShowTooltip(false);
		}
	}, [isHovered, tooltip]);

	return (
		<div
			ref={ref}
			className={`animate-float cursor-pointer transition-all duration-300 ${className}`}
			style={{
				animationDelay: `${delay}s`,
				transform: `translate(${offset.x}px, ${offset.y}px) scale(${isHovered ? 1.08 : 1})`,
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
		>
			<div
				className={`relative rounded-lg transition-shadow duration-300 ${isHovered ? "shadow-lg" : ""}`}
			>
				{children}
				{showTooltip && tooltip && (
					<div className="bg-foreground text-background absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg">
						{tooltip}
						<div className="bg-foreground absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45" />
					</div>
				)}
			</div>
		</div>
	);
}

function AnimatedNumber({
	value,
	suffix = "",
}: {
	value: number;
	suffix?: string;
}) {
	const [displayValue, setDisplayValue] = useState(0);
	const [hasAnimated, setHasAnimated] = useState(false);
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !hasAnimated) {
					setHasAnimated(true);
					const duration = 1500;
					const startTime = performance.now();

					const animate = (currentTime: number) => {
						const elapsed = currentTime - startTime;
						const progress = Math.min(elapsed / duration, 1);
						const easeOut = 1 - Math.pow(1 - progress, 3);
						setDisplayValue(Math.floor(easeOut * value));
						if (progress < 1) requestAnimationFrame(animate);
					};
					requestAnimationFrame(animate);
				}
			},
			{ threshold: 0.5 }
		);

		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [value, hasAnimated]);

	return (
		<span ref={ref}>
			{displayValue.toLocaleString()}
			{suffix}
		</span>
	);
}

function InteractiveStars() {
	const [hoveredStar, setHoveredStar] = useState<number | null>(null);
	const [rating, setRating] = useState(5);

	return (
		<div className="flex">
			{[1, 2, 3, 4, 5].map((star) => (
				<svg
					key={star}
					className={`h-4 w-4 cursor-pointer transition-all duration-200 ${
						star <= (hoveredStar || rating)
							? "scale-110 text-amber-400"
							: "text-amber-400/40"
					}`}
					fill="currentColor"
					viewBox="0 0 20 20"
					onMouseEnter={() => setHoveredStar(star)}
					onMouseLeave={() => setHoveredStar(null)}
					onClick={() => setRating(star)}
				>
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
			))}
		</div>
	);
}

function InteractiveChart() {
	const [hoveredBar, setHoveredBar] = useState<number | null>(null);
	const data = [40, 65, 45, 80, 60, 90, 75];
	const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	return (
		<div className="mt-3 flex items-end gap-1">
			{data.map((h, i) => (
				<div key={i} className="group relative">
					<div
						className={`w-3 cursor-pointer rounded-sm transition-all duration-300 ${
							hoveredBar === i ? "bg-primary scale-110" : "bg-primary/60"
						}`}
						style={{ height: `${h * 0.5}px` }}
						onMouseEnter={() => setHoveredBar(i)}
						onMouseLeave={() => setHoveredBar(null)}
					/>
					{hoveredBar === i && (
						<div className="bg-foreground text-background absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded px-2 py-1 text-[10px] font-medium whitespace-nowrap">
							{days[i]}: {h}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

function InteractiveAvatars() {
	const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
	const names = ["Alex", "Beth", "Carl", "Dana", "Erik"];

	return (
		<div className="flex -space-x-2">
			{names.map((name, i) => (
				<div
					key={i}
					className={`border-card bg-primary/20 text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-300 ${
						hoveredAvatar === i
							? "bg-primary text-primary-foreground z-20 scale-125"
							: "hover:z-10"
					}`}
					onMouseEnter={() => setHoveredAvatar(i)}
					onMouseLeave={() => setHoveredAvatar(null)}
					title={name}
				>
					{name[0]}
				</div>
			))}
			<div className="border-card bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-medium transition-colors">
				+99
			</div>
		</div>
	);
}

export default function FloatingElements() {
	const [mounted, setMounted] = useState(false);
	const [clickedWidget, setClickedWidget] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleWidgetClick = useCallback((widgetName: string) => {
		setClickedWidget(widgetName);
		setTimeout(() => setClickedWidget(null), 1000);
	}, []);

	if (!mounted) return null;

	return (
		<div className="absolute inset-0 overflow-hidden">
			{/* Sparkle effect on click */}
			{clickedWidget && (
				<div className="pointer-events-none fixed inset-0 z-50">
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<HiSparkles className="text-primary h-8 w-8 animate-ping" />
					</div>
				</div>
			)}

			{/* Top Left - Rating Badge */}
			<FloatingWidget
				className="absolute top-[18%] left-[3%] hidden md:block"
				delay={0}
				tooltip="Rated by 500+ builders"
				onClick={() => handleWidgetClick("rating")}
				parallaxIntensity={15}
			>
				<div
					className={`bg-card rounded-xl p-3 transition-all duration-300 ${clickedWidget === "rating" ? "ring-primary ring-2" : ""}`}
				>
					<div className="flex items-center gap-2">
						<InteractiveStars />
						<span className="text-foreground text-sm font-semibold">4.9</span>
					</div>
					<p className="text-muted-foreground mt-1 text-xs">
						<AnimatedNumber value={500} suffix="+ reviews" />
					</p>
				</div>
			</FloatingWidget>

			{/* Top Left Lower - Conversion Badge */}
			<FloatingWidget
				className="absolute top-[42%] left-[8%] hidden lg:block"
				delay={0.5}
				tooltip="Average conversion increase"
				onClick={() => handleWidgetClick("conversion")}
				parallaxIntensity={25}
			>
				<div
					className={`flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 transition-all duration-300 ${clickedWidget === "conversion" ? "ring-2 ring-white ring-offset-2" : ""}`}
				>
					<HiArrowTrendingUp className="h-4 w-4 animate-pulse text-white" />
					<span className="text-sm font-semibold text-white">+40%</span>
				</div>
			</FloatingWidget>

			{/* Top Right - Waitlist Card */}
			<FloatingWidget
				className="absolute top-[15%] right-[3%] hidden md:block"
				delay={0.2}
				tooltip="Real-time waitlist stats"
				onClick={() => handleWidgetClick("waitlist")}
				parallaxIntensity={18}
			>
				<div
					className={`bg-card rounded-xl p-4 transition-all duration-300 ${clickedWidget === "waitlist" ? "ring-primary ring-2" : ""}`}
				>
					<div className="mb-3 flex items-center gap-2">
						<HiClipboardDocumentList className="text-primary h-5 w-5" />
						<span className="text-sm font-semibold">Waitlist</span>
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
							<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
						</span>
					</div>
					<div className="space-y-2">
						<div className="group flex cursor-pointer items-center justify-between gap-8">
							<span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
								Today
							</span>
							<span className="text-foreground text-sm font-bold">
								<AnimatedNumber value={47} />
							</span>
						</div>
						<div className="group flex cursor-pointer items-center justify-between gap-8">
							<span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
								This week
							</span>
							<span className="text-foreground text-sm font-bold">
								<AnimatedNumber value={312} />
							</span>
						</div>
						<div className="group flex cursor-pointer items-center justify-between gap-8">
							<span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
								Total
							</span>
							<span className="text-primary text-sm font-bold">
								<AnimatedNumber value={1247} suffix="" />
							</span>
						</div>
					</div>
				</div>
			</FloatingWidget>

			{/* Middle Right - Items Badge */}
			<FloatingWidget
				className="absolute top-[45%] right-[6%] hidden lg:block"
				delay={0.7}
				tooltip="Ideas submitted this week"
				onClick={() => handleWidgetClick("ideas")}
				parallaxIntensity={22}
			>
				<div
					className={`bg-card rounded-xl p-3 transition-all duration-300 ${clickedWidget === "ideas" ? "ring-primary ring-2" : ""}`}
				>
					<p className="text-muted-foreground text-xs">Ideas this week</p>
					<div className="mt-1 flex items-baseline gap-1">
						<span className="text-foreground text-2xl font-bold">
							<AnimatedNumber value={8} />
						</span>
						<span className="animate-pulse rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-600">
							new
						</span>
					</div>
				</div>
			</FloatingWidget>

			{/* Bottom Left - Stats Chart */}
			<FloatingWidget
				className="absolute bottom-[22%] left-[5%] hidden lg:block"
				delay={0.4}
				tooltip="Weekly signup trends"
				onClick={() => handleWidgetClick("chart")}
				parallaxIntensity={20}
			>
				<div
					className={`bg-card rounded-xl p-4 transition-all duration-300 ${clickedWidget === "chart" ? "ring-primary ring-2" : ""}`}
				>
					<p className="text-muted-foreground mb-1 text-xs font-medium">
						Signups
					</p>
					<div className="flex items-end gap-1">
						<span className="text-foreground text-2xl font-bold">
							<AnimatedNumber value={156} />
						</span>
						<span className="mb-1 text-xs text-green-600">+23%</span>
					</div>
					<InteractiveChart />
				</div>
			</FloatingWidget>

			{/* Bottom Right - User Avatars */}
			<FloatingWidget
				className="absolute right-[5%] bottom-[18%] hidden lg:block"
				delay={0.6}
				tooltip="Active community members"
				onClick={() => handleWidgetClick("avatars")}
				parallaxIntensity={18}
			>
				<div
					className={`bg-card rounded-xl p-4 transition-all duration-300 ${clickedWidget === "avatars" ? "ring-primary ring-2" : ""}`}
				>
					<InteractiveAvatars />
					<p className="text-muted-foreground mt-2 text-xs">Active builders</p>
				</div>
			</FloatingWidget>
		</div>
	);
}
