"use client";

import React, { useState } from "react";
import {
	HiSparkles,
	HiCheckCircle,
	HiExclamationCircle,
	HiCpuChip,
	HiUserGroup,
	HiChartBar,
	HiBell,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { waitlistApi } from "@/lib/api/waitlist";

type WaitlistState = "idle" | "loading" | "success" | "error";

const upcomingFeatures = [
	{
		icon: HiCpuChip,
		title: "AI-powered analysis",
		description: "Competitor & market insights",
	},
	{
		icon: HiUserGroup,
		title: "Waitlist collection",
		description: "Gather signups for your ideas",
	},
	{
		icon: HiChartBar,
		title: "Analytics dashboard",
		description: "Track your validation metrics",
	},
];

const Waitlist = () => {
	const [email, setEmail] = useState("");
	const [state, setState] = useState<WaitlistState>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			setErrorMessage("Please enter your email");
			setState("error");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setErrorMessage("Please enter a valid email address");
			setState("error");
			return;
		}

		setState("loading");
		setErrorMessage("");

		try {
			await waitlistApi.joinWaitlist(email);
			setState("success");
			setEmail("");
		} catch (error) {
			setState("error");
			if (error instanceof Error) {
				setErrorMessage(
					error.message || "Something went wrong. Please try again."
				);
			} else {
				setErrorMessage("Something went wrong. Please try again.");
			}
		}
	};

	if (state === "success") {
		return (
			<Card className="bg-primary text-primary-foreground w-full border">
				<CardContent className="p-0">
					<div className="flex flex-col gap-8 md:flex-row">
						{/* Left Side - Features Preview */}
						<div className="flex-1 py-4 md:p-8">
							<div className="mb-4 flex items-center gap-2">
								<HiBell className="h-5 w-5" />
								<span className="bg-primary-foreground/20 rounded-full px-3 py-1 text-xs font-semibold">
									Coming Soon
								</span>
							</div>
							<h3 className="mb-2 text-2xl font-bold md:text-3xl">
								Don&apos;t miss what&apos;s next
							</h3>
							<p className="mb-6 opacity-90">
								Powerful features to supercharge your validation journey.
							</p>

							{/* Feature List */}
							<div className="space-y-3">
								{upcomingFeatures.map((feature, index) => (
									<div
										key={index}
										className="bg-muted text-card-foreground flex items-center gap-3 rounded-lg p-3 transition-colors"
									>
										<div className="bg-primary/20 border-primary text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2">
											<feature.icon className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold">{feature.title}</p>
											<p className="text-sm opacity-80">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Right Side - Success Message */}
						<div className="bg-card text-card-foreground flex flex-1 flex-col items-center justify-center rounded-xl p-6 text-center md:rounded-xl md:p-8">
							<div className="bg-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
								<HiCheckCircle className="text-primary h-10 w-10" />
							</div>
							<h3 className="mb-2 text-2xl font-bold">
								You&apos;re on the list!
							</h3>
							<p className="text-muted-foreground">
								We&apos;ll notify you when new features drop. Get ready!
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-primary text-primary-foreground w-full border">
			<CardContent className="p-0">
				<div className="flex flex-col gap-8 md:flex-row">
					{/* Left Side - Features Preview */}
					<div className="flex-1 py-4 md:p-8">
						<div className="mb-4 flex items-center gap-2">
							<HiBell className="h-5 w-5" />
							<span className="bg-primary-foreground/20 rounded-full px-3 py-1 text-xs font-semibold">
								Coming Soon
							</span>
						</div>
						<h3 className="mb-2 text-2xl font-bold md:text-3xl">
							Don&apos;t miss what&apos;s next
						</h3>
						<p className="mb-6 opacity-90">
							Powerful features to supercharge your validation journey.
						</p>

						{/* Feature List */}
						<div className="space-y-3">
							{upcomingFeatures.map((feature, index) => (
								<div
									key={index}
									className="bg-muted text-card-foreground flex items-center gap-3 rounded-lg p-3 transition-colors"
								>
									<div className="bg-primary/20 border-primary text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2">
										<feature.icon className="h-5 w-5" />
									</div>
									<div>
										<p className="font-semibold">{feature.title}</p>
										<p className="text-sm opacity-80">{feature.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right Side - Form */}
					<div className="bg-card text-card-foreground flex flex-1 flex-col justify-center rounded-xl p-6 md:rounded-xl md:p-8">
						<div className="mb-6">
							<h4 className="mb-2 text-xl font-bold">Get early access</h4>
							<p className="text-muted-foreground text-sm">
								Be the first to try new features when they launch.
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-3">
								<Input
									type="email"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (state === "error") {
											setState("idle");
											setErrorMessage("");
										}
									}}
									className="bg-muted w-full"
									disabled={state === "loading"}
									aria-invalid={state === "error"}
								/>
								<Button
									type="submit"
									size="lg"
									className="w-full gap-2"
									disabled={state === "loading"}
								>
									{state === "loading" ? (
										<>
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											<span>Subscribing...</span>
										</>
									) : (
										<>
											<span>Notify Me</span>
											<HiSparkles className="h-4 w-4" />
										</>
									)}
								</Button>
							</div>

							{state === "error" && errorMessage && (
								<div className="text-destructive flex items-center gap-2 text-sm">
									<HiExclamationCircle className="h-4 w-4 shrink-0" />
									<span>{errorMessage}</span>
								</div>
							)}
						</form>

						<p className="text-muted-foreground mt-4 text-center text-xs">
							No spam, ever. Unsubscribe anytime.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default Waitlist;
