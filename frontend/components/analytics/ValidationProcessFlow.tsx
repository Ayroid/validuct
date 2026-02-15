"use client";

import { useState } from "react";
import { FileEdit, Hammer, BadgeCheck, Rocket } from "lucide-react";
import { ideasApi } from "@/lib/api/ideas";
import { IdeaStatus } from "@/types";

type Status = keyof IdeaStatus;

interface Step {
	status: Status;
	icon: typeof FileEdit;
	label: string;
	description: string;
}

const STEPS: Step[] = [
	{ status: "DRAFT", icon: FileEdit, label: "Draft", description: "Idea created" },
	{ status: "VALIDATED", icon: BadgeCheck, label: "Validated", description: "Idea validated" },
	{ status: "WIP", icon: Hammer, label: "In Progress", description: "Building it" },
	{ status: "LAUNCHED", icon: Rocket, label: "Launched", description: "Live & shipped" },
];

interface ValidationProcessFlowProps {
	currentStatus: Status;
	ideaId?: string;
	isOwner?: boolean;
	editable?: boolean;
	onStatusChange: (status: Status) => void;
}

export default function ValidationProcessFlow({
	currentStatus,
	ideaId,
	isOwner = false,
	editable = false,
	onStatusChange,
}: ValidationProcessFlowProps) {
	const [updating, setUpdating] = useState(false);

	const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

	const isClickable = editable || (isOwner && !!ideaId);

	const handleStepClick = async (step: Step) => {
		if (step.status === currentStatus) return;

		if (editable) {
			onStatusChange(step.status);
			return;
		}

		if (!isOwner || !ideaId || updating) return;

		const previousStatus = currentStatus;
		onStatusChange(step.status);
		setUpdating(true);

		try {
			await ideasApi.updateIdea(ideaId, { status: step.status });
		} catch (err) {
			console.error("Failed to update status:", err);
			onStatusChange(previousStatus);
		} finally {
			setUpdating(false);
		}
	};

	const stepper = (
		<>
			{!editable && (
				<span className="text-muted-foreground mb-5 block text-xs font-semibold tracking-widest uppercase">
					Validation Progress
				</span>
			)}

			<div className="grid grid-cols-4">
				{STEPS.map((step, index) => {
					const Icon = step.icon;
					const isCompleted = index < currentIndex;
					const isCurrent = index === currentIndex;
					const isActive = isCompleted || isCurrent;

					return (
						<div key={step.status} className="relative flex flex-col items-center">
							{/* Connector line */}
							{index > 0 && (
								<div
									className="absolute top-5 right-1/2 left-[-50%] h-0.5"
									style={{ zIndex: 0 }}
								>
									<div
										className={`h-full w-full transition-colors ${
											isActive ? "bg-primary" : "bg-border"
										}`}
									/>
								</div>
							)}

							{/* Icon circle */}
							<button
								type="button"
								disabled={!isClickable || updating}
								onClick={() => handleStepClick(step)}
								className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
									isActive
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								} ${
									isClickable && !updating
										? "cursor-pointer hover:ring-2 hover:ring-primary/30"
										: "cursor-default"
								}`}
							>
								<Icon className="h-5 w-5" />
							</button>

							{/* Label + description */}
							<span
								className={`mt-2.5 text-center text-sm leading-tight ${
									isActive
										? "text-foreground font-semibold"
										: "text-muted-foreground font-medium"
								}`}
							>
								{step.label}
							</span>
							<span className="text-muted-foreground mt-0.5 text-center text-xs leading-tight">
								{step.description}
							</span>
						</div>
					);
				})}
			</div>
		</>
	);

	if (editable) {
		return stepper;
	}

	return (
		<div className="bg-card border-border/50 rounded-xl border p-6">
			{stepper}
		</div>
	);
}
