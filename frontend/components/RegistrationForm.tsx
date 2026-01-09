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

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState("");

	const handleGoogleSignUp = async () => {
		try {
			setError("");
			setIsGoogleLoading(true);
			await signIn("google", { callbackUrl: "/home" });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error && "response" in err
					? (err as { response?: { data?: { error?: string } } }).response?.data
							?.error
					: undefined;
			setError(errorMessage || "Google sign-up failed");
			setIsGoogleLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create your account</CardTitle>
					<CardDescription>
						Sign up with your Google account to get started
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="mb-4 rounded-md border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
							{error}
						</div>
					)}
					<Button
						onClick={handleGoogleSignUp}
						disabled={isGoogleLoading}
						type="button"
						variant="outline"
						className="h-10 w-full"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							className="h-5 w-5"
						>
							<path
								d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
								fill="currentColor"
							/>
						</svg>
						{isGoogleLoading ? "Signing up..." : "Sign up with Google"}
					</Button>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<Link
							href="/login"
							className="hover:text-primary underline underline-offset-4"
						>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground hover:[&_a]:text-primary px-6 text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
				By clicking continue, you agree to our{" "}
				<a href="/terms">Terms of Service</a> and{" "}
				<a href="/privacy">Privacy Policy</a>.
			</div>
		</div>
	);
}
