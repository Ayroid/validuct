"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isTwitterLoading, setIsTwitterLoading] = useState(false);
	const [isGithubLoading, setIsGithubLoading] = useState(false);
	const [error, setError] = useState("");

	const handleGoogleSignIn = async () => {
		try {
			setError("");
			setIsGoogleLoading(true);
			await signIn("google", { redirectTo: "/home" });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error && "response" in err
					? (err as { response?: { data?: { error?: string } } }).response?.data
							?.error
					: undefined;
			setError(errorMessage || "Google sign-in failed");
			setIsGoogleLoading(false);
		}
	};

	const handleTwitterSignIn = async () => {
		try {
			setError("");
			setIsTwitterLoading(true);
			await signIn("twitter", { redirectTo: "/home" });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error && "response" in err
					? (err as { response?: { data?: { error?: string } } }).response?.data
							?.error
					: undefined;
			setError(errorMessage || "Twitter sign-in failed");
			setIsTwitterLoading(false);
		}
	};

	const handleGithubSignIn = async () => {
		try {
			setError("");
			setIsGithubLoading(true);
			await signIn("github", { redirectTo: "/home" });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error && "response" in err
					? (err as { response?: { data?: { error?: string } } }).response?.data
							?.error
					: undefined;
			setError(errorMessage || "Github sign-in failed");
			setIsGithubLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>
						Sign in with your Google account to continue
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="mb-4 rounded-md border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
							{error}
						</div>
					)}
					<Button
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading}
						type="button"
						variant="outline"
						className="h-10 w-full text-sm"
					>
						<FaGoogle />
						{isGoogleLoading ? "Signing in..." : "Sign in with Google"}
					</Button>
					<Button
						onClick={handleTwitterSignIn}
						disabled={isTwitterLoading}
						type="button"
						variant="outline"
						className="mt-4 h-10 w-full text-sm"
					>
						{/* Twitter SVG Icon */}
						<FaXTwitter />
						{isTwitterLoading ? "Signing in..." : "Sign in with Twitter"}
					</Button>
					<Button
						onClick={handleGithubSignIn}
						disabled={isGithubLoading}
						type="button"
						variant="outline"
						className="mt-4 h-10 w-full text-sm"
					>
						<FaGithub />
						{isGithubLoading ? "Signing in..." : "Sign in with Github"}
					</Button>
					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="hover:text-primary underline underline-offset-4"
						>
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground hover:[&_a]:text-primary px-6 text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
				By clicking continue, you agree to our{" "}
				<Link href="/terms">Terms of Service</Link> and{" "}
				<Link href="/privacy">Privacy Policy</Link>.
			</div>
		</div>
	);
}
