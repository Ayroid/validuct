"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ideasApi } from "@/lib/api/ideas";
import { userApi } from "@/lib/api/users";
import { Idea, PinButtonProps } from "@/types";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PinButton({
	ideaId,
	ideaUserId,
	initialIsPinned = false,
	onPinChange,
}: PinButtonProps) {
	const { data: session } = useSession();
	const [isPinned, setIsPinned] = useState(initialIsPinned);

	// Fetch pinned status on mount
	useEffect(() => {
		const checkPinStatus = async () => {
			try {
				const pinnedIdeas = await userApi.getPinnedIdeas();
				const pinned = pinnedIdeas.some((idea: Idea) => idea.id === ideaId);
				setIsPinned(pinned);
			} catch {
				// Silently fail
			}
		};

		checkPinStatus();
	}, [ideaId]);

	// Only show pin button if the current user is the idea owner
	if (!session?.user || session.user.id !== ideaUserId) {
		return null;
	}

	const handlePin = async (e: React.MouseEvent) => {
		e.stopPropagation();

		// Save previous state for rollback
		const prevIsPinned = isPinned;

		// Optimistically update UI
		setIsPinned(!isPinned);
		onPinChange?.();

		try {
			if (prevIsPinned) {
				await ideasApi.unpinIdea(ideaId);
			} else {
				await ideasApi.pinIdea(ideaId);
			}
		} catch {
			// Revert on error
			setIsPinned(prevIsPinned);
			onPinChange?.();
		}
	};

	return (
		<Tooltip delayDuration={250}>
			<TooltipTrigger asChild>
				<button
					onClick={handlePin}
					className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium cursor-pointer transition-colors ${
						isPinned
							? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
							: "bg-muted text-muted-foreground hover:bg-muted/80"
					}`}
				>
					<svg
						className={`h-4 w-4 ${isPinned ? "fill-current" : "fill-none"}`}
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
						/>
					</svg>
					{isPinned ? "Pinned" : "Pin"}
				</button>
			</TooltipTrigger>
			<TooltipContent
				className="animate-in fade-in-0 duration-200 data-open:zoom-in-100 data-closed:zoom-out-100"
			>
				<p>{isPinned ? "Unpin this idea" : "Pin to your profile (max 5)"}</p>
			</TooltipContent>
		</Tooltip>
	);
}
