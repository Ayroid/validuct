"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ideaWaitlistApi } from "@/lib/api/ideaWaitlist";
import { IdeaWaitlistStats } from "@/types";
import {
	HiEnvelope,
	HiUserGroup,
	HiCheckCircle,
	HiExclamationCircle,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IdeaWaitlistProps {
	ideaId: string;
	ideaOwnerId: string;
}

export default function IdeaWaitlist({
	ideaId,
	ideaOwnerId,
}: IdeaWaitlistProps) {
	const router = useRouter();
	const { user } = useAuth();
	const [stats, setStats] = useState<IdeaWaitlistStats | null>(null);
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [hasJoined, setHasJoined] = useState(false);
	const [error, setError] = useState("");

	const isOwner = user && user.id === ideaOwnerId;

	useEffect(() => {
		loadStats();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ideaId]);

	const loadStats = async () => {
		try {
			const data = await ideaWaitlistApi.getWaitlistStats(ideaId);
			setStats(data);
		} catch {
			// Silently fail
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email.trim()) {
			setError("Please enter your email");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError("Please enter a valid email address");
			return;
		}

		setIsSubmitting(true);
		try {
			await ideaWaitlistApi.joinWaitlist(ideaId, email);
			setHasJoined(true);
			setEmail("");
			// Refresh stats
			loadStats();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message || "Failed to join waitlist");
			} else {
				setError("Failed to join waitlist");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleViewWaitlist = () => {
		if (stats?.accessToken) {
			router.push(`/idea/${ideaId}/waitlist/${stats.accessToken}`);
		}
	};

	if (isLoading) {
		return (
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-5">
				<div className="bg-muted mb-3 h-4 w-24 animate-pulse rounded-md" />
				<div className="bg-muted/50 h-10 animate-pulse rounded-lg" />
			</div>
		);
	}

	// Owner View
	if (isOwner) {
		return (
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-5">
				<h3 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
					Waitlist
				</h3>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
							<HiUserGroup className="text-primary h-5 w-5" />
						</div>
						<div>
							<p className="text-foreground text-2xl font-bold">
								{stats?.count || 0}
							</p>
							<p className="text-muted-foreground text-sm">
								{stats?.count === 1 ? "person" : "people"} interested
							</p>
						</div>
					</div>
					{stats?.count && stats.count > 0 && (
						<Button
							onClick={handleViewWaitlist}
							variant="outline"
							size="sm"
							className="cursor-pointer gap-2"
						>
							View List
						</Button>
					)}
				</div>
			</div>
		);
	}

	// Non-owner View (Join Form)
	return (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-5">
			<h3 className="text-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
				Join Waitlist
			</h3>
			{hasJoined ? (
				<div className="flex items-center gap-3 text-green-600 dark:text-green-400">
					<HiCheckCircle className="h-5 w-5" />
					<span className="text-sm font-medium">
						You&apos;re on the waitlist!
					</span>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-3">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<HiEnvelope className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
							<Input
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									if (error) setError("");
								}}
								className="pl-10"
								disabled={isSubmitting}
								aria-invalid={!!error}
							/>
						</div>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							) : (
								"Join"
							)}
						</Button>
					</div>
					{error && (
						<div className="text-destructive flex items-center gap-2 text-sm">
							<HiExclamationCircle className="h-4 w-4 shrink-0" />
							<span>{error}</span>
						</div>
					)}
				</form>
			)}
			{stats && stats.count > 0 && !hasJoined && (
				<p className="text-muted-foreground mt-3 text-xs">
					{stats.count} {stats.count === 1 ? "person has" : "people have"}{" "}
					joined
				</p>
			)}
		</div>
	);
}
