"use client";

import { useState } from "react";
import {
	HiSparkles,
	HiLightBulb,
	HiChartBar,
	HiRocketLaunch,
	HiXMark,
	HiCheckBadge,
	HiChatBubbleLeftRight,
	HiHandThumbUp,
	HiArrowTrendingUp,
	HiUserGroup,
	HiShare,
} from "react-icons/hi2";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/* ── Step illustrations ─────────────────────────────────── */

function WelcomeVisual() {
	return (
		<div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
			{/* Decorative dots */}
			<div className="absolute top-4 left-6 size-2 rounded-full bg-amber-200 dark:bg-amber-800/50" />
			<div className="absolute top-10 right-10 size-1.5 rounded-full bg-orange-200 dark:bg-orange-800/50" />
			<div className="absolute bottom-6 left-12 size-1.5 rounded-full bg-amber-300/60 dark:bg-amber-700/40" />
			<div className="absolute right-8 bottom-8 size-2.5 rounded-full bg-orange-200/80 dark:bg-orange-800/40" />

			{/* Center icon cluster */}
			<div className="relative">
				<div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-amber-100 dark:bg-amber-950/60 dark:ring-amber-800/40">
					<HiSparkles className="size-10 text-amber-500" />
				</div>
				<div className="absolute -top-2 -right-3 flex size-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-orange-100 dark:bg-orange-950/60 dark:ring-orange-800/40">
					<HiCheckBadge className="size-5 text-orange-400" />
				</div>
				<div className="absolute -bottom-2 -left-4 flex size-7 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-amber-100 dark:bg-amber-950/60 dark:ring-amber-800/40">
					<HiHandThumbUp className="size-4 text-amber-400" />
				</div>
			</div>
		</div>
	);
}

function ShareIdeasVisual() {
	return (
		<div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20">
			{/* Floating stage pills */}
			<div className="absolute top-4 left-5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/40">
				Draft
			</div>
			<div className="absolute top-4 right-5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 shadow-sm ring-1 ring-emerald-200/60 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-800/40">
				Validated
			</div>
			<div className="absolute bottom-4 left-8 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-600 shadow-sm ring-1 ring-blue-200/60 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800/40">
				WIP
			</div>
			<div className="absolute right-7 bottom-4 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-600 shadow-sm ring-1 ring-violet-200/60 dark:bg-violet-900/40 dark:text-violet-400 dark:ring-violet-800/40">
				Launched
			</div>

			{/* Center icon */}
			<div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-amber-100 dark:bg-amber-950/60 dark:ring-amber-800/40">
				<HiLightBulb className="size-10 text-amber-500" />
			</div>
		</div>
	);
}

function ValidationVisual() {
	return (
		<div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20">
			{/* Decorative elements */}
			<div className="absolute top-5 left-6 size-2 rounded-full bg-blue-200 dark:bg-blue-800/50" />
			<div className="absolute right-6 bottom-5 size-1.5 rounded-full bg-indigo-200 dark:bg-indigo-800/50" />

			{/* Center icon with orbiting signal icons */}
			<div className="relative">
				<div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-blue-100 dark:bg-blue-950/60 dark:ring-blue-800/40">
					<HiChartBar className="size-10 text-blue-500" />
				</div>
				<div className="absolute -top-3 -left-4 flex size-9 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-blue-100 dark:bg-blue-950/60 dark:ring-blue-800/40">
					<HiHandThumbUp className="size-5 text-blue-400" />
				</div>
				<div className="absolute -top-2 -right-5 flex size-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-indigo-100 dark:bg-indigo-950/60 dark:ring-indigo-800/40">
					<HiChatBubbleLeftRight className="size-4 text-indigo-400" />
				</div>
				<div className="absolute -right-3 -bottom-2 flex size-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-blue-100 dark:bg-blue-950/60 dark:ring-blue-800/40">
					<HiCheckBadge className="size-4 text-blue-400" />
				</div>
			</div>
		</div>
	);
}

function AnalyticsVisual() {
	return (
		<div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
			{/* Decorative dots */}
			<div className="absolute top-5 right-8 size-2 rounded-full bg-emerald-200 dark:bg-emerald-800/50" />
			<div className="absolute bottom-6 left-6 size-1.5 rounded-full bg-teal-200 dark:bg-teal-800/50" />

			{/* Center icon cluster */}
			<div className="relative">
				<div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:ring-emerald-800/40">
					<HiRocketLaunch className="size-10 text-emerald-500" />
				</div>
				<div className="absolute -top-3 -right-4 flex size-8 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:ring-emerald-800/40">
					<HiArrowTrendingUp className="size-4 text-emerald-400" />
				</div>
				<div className="absolute -bottom-2 -left-5 flex size-9 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-teal-100 dark:bg-teal-950/60 dark:ring-teal-800/40">
					<HiUserGroup className="size-5 text-teal-400" />
				</div>
				<div className="absolute -bottom-3 -right-3 flex size-7 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:ring-emerald-800/40">
					<HiShare className="size-3.5 text-emerald-400" />
				</div>
			</div>
		</div>
	);
}

const stepVisuals = [WelcomeVisual, ShareIdeasVisual, ValidationVisual, AnalyticsVisual];

/* ── Steps data ─────────────────────────────────────────── */

const steps = [
	{
		title: "Welcome to Validuct",
		subtitle: "Your ideas deserve validation",
		description:
			"Validuct helps you validate startup ideas before investing time and money. Share your concepts, gather real feedback, and make data-driven decisions about what to build next.",
	},
	{
		title: "Share Your Ideas",
		subtitle: "From draft to launch",
		description:
			"Post your ideas and track their journey through validation stages — Draft, Validated, Work in Progress, and Launched. Each stage represents real progress backed by community feedback.",
	},
	{
		title: "Get Real Feedback",
		subtitle: "Validation signals that matter",
		description:
			"Collect votes, comments, and validation signals from the community. Understand problem fit, willingness to pay, and execution readiness — the metrics that actually predict success.",
	},
	{
		title: "Track Your Progress",
		subtitle: "Analytics & growth tools",
		description:
			"Monitor your ideas with detailed analytics, build a waitlist of interested users, and share your progress. Everything you need to go from idea to validated concept.",
	},
];

/* ── Component ──────────────────────────────────────────── */

interface WalkthroughModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function WalkthroughModal({
	open,
	onOpenChange,
}: WalkthroughModalProps) {
	const [currentStep, setCurrentStep] = useState(0);

	const step = steps[currentStep];
	const Visual = stepVisuals[currentStep];
	const isLast = currentStep === steps.length - 1;
	const isFirst = currentStep === 0;

	function handleClose() {
		onOpenChange(false);
		setTimeout(() => setCurrentStep(0), 200);
	}

	function handleNext() {
		if (isLast) {
			handleClose();
		} else {
			setCurrentStep((s) => s + 1);
		}
	}

	function handleBack() {
		if (!isFirst) {
			setCurrentStep((s) => s - 1);
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={handleClose}>
			<AlertDialogContent className="!max-w-lg gap-0 p-0">
				{/* Close button */}
				<button
					onClick={handleClose}
					className="text-muted-foreground hover:text-foreground absolute top-4 right-4 z-10 cursor-pointer transition-colors"
					aria-label="Close"
				>
					<HiXMark className="size-5" />
				</button>

				<div className="flex flex-col items-center px-5 pt-6 pb-5 text-center">
					{/* Step dots */}
					<div className="mb-5 flex items-center gap-2">
						{steps.map((_, i) => (
							<div
								key={i}
								className={`h-1.5 rounded-full transition-all duration-200 ${
									i === currentStep
										? "bg-primary w-6"
										: "bg-muted-foreground/25 w-1.5"
								}`}
							/>
						))}
					</div>

					{/* Visual illustration */}
					<div className="mb-5 w-full">
						<Visual />
					</div>

					{/* Title */}
					<AlertDialogTitle className="text-lg font-bold tracking-tight">
						{step.title}
					</AlertDialogTitle>

					{/* Subtitle */}
					<p className="text-muted-foreground mt-1 text-sm font-medium">
						{step.subtitle}
					</p>

					{/* Description */}
					<AlertDialogDescription className="text-muted-foreground mt-3 text-sm leading-relaxed text-balance">
						{step.description}
					</AlertDialogDescription>
				</div>

				{/* Footer: Back | Step X of 4 | Next */}
				<div className="border-border/50 grid grid-cols-3 items-center border-t px-4 py-3">
					<div className="flex justify-start">
						{!isFirst && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleBack}
								className="cursor-pointer"
							>
								Back
							</Button>
						)}
					</div>
					<span className="text-muted-foreground text-center text-xs">
						{currentStep + 1} of {steps.length}
					</span>
					<div className="flex justify-end">
						<Button
							size="sm"
							onClick={handleNext}
							className="cursor-pointer"
						>
							{isLast ? "Get Started" : "Next"}
						</Button>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
