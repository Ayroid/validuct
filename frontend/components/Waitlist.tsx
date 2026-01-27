"use client";

import React, { useState } from "react";
import {
	HiSparkles,
	HiCheckCircle,
	HiExclamationCircle,
	HiEnvelope,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { waitlistApi } from "@/lib/api/waitlist";

type WaitlistState = "idle" | "loading" | "success" | "error";

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
			<div className="text-center">
				<div className="bg-green-500/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24">
					<HiCheckCircle className="h-10 w-10 text-green-500 sm:h-12 sm:w-12" />
				</div>
				<h3 className="text-foreground mb-3 text-2xl font-bold sm:text-3xl">
					You&apos;re on the list!
				</h3>
				<p className="text-muted-foreground mx-auto max-w-md text-base sm:text-lg">
					We&apos;ll notify you when new features drop. Get ready to supercharge
					your validation journey.
				</p>
			</div>
		);
	}

	return (
		<div className="text-center">
			{/* Header */}
			<div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
				<HiEnvelope className="text-primary h-8 w-8 sm:h-10 sm:w-10" />
			</div>

			<h3 className="text-foreground mb-3 text-2xl font-bold sm:text-3xl md:text-4xl">
				Stay in the Loop
			</h3>
			<p className="text-muted-foreground mx-auto mb-8 max-w-lg text-base sm:text-lg">
				Get notified when we launch new features like payment intent capture and
				analytics dashboard.
			</p>

			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
			>
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
					className="bg-card border-border h-12 flex-1 text-base sm:h-14"
					disabled={state === "loading"}
					aria-invalid={state === "error"}
				/>
				<Button
					type="submit"
					size="lg"
					className="h-12 cursor-pointer gap-2 px-6 text-base transition-all sm:h-14 sm:px-8"
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
			</form>

			{/* Error message */}
			{state === "error" && errorMessage && (
				<div className="text-destructive mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-sm">
					<HiExclamationCircle className="h-4 w-4 shrink-0" />
					<span>{errorMessage}</span>
				</div>
			)}

			{/* Privacy note */}
			<p className="text-muted-foreground mt-4 text-xs sm:text-sm">
				No spam, ever. Unsubscribe anytime.
			</p>
		</div>
	);
};

export default Waitlist;
