"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { HiHome, HiArrowLeft } from "react-icons/hi2";

export default function NotFound() {
	return (
		<div className="bg-background mx-auto min-h-screen max-w-5xl">
			<Navbar />

			<div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
				{/* Animated 404 Visual */}
				<div className="mb-8 flex items-center justify-center gap-4">
					<div className="relative">
						{/* First 4 */}
						<div className="text-brand-orange animate-pulse text-9xl font-bold opacity-80">
							4
						</div>
					</div>

					{/* Animated 0 with decorative shapes */}
					<div className="relative">
						<div className="text-brand-yellow text-9xl font-bold">0</div>
						<svg
							className="animate-spin-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
							width="120"
							height="120"
							viewBox="0 0 120 120"
						>
							<circle
								cx="60"
								cy="60"
								r="50"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeDasharray="8 8"
								className="text-primary opacity-30"
							/>
						</svg>
					</div>

					{/* Second 4 */}
					<div className="relative">
						<div className="text-brand-red animation-delay-300 animate-pulse text-9xl font-bold opacity-80">
							4
						</div>
					</div>
				</div>

				{/* Error Message */}
				<h1 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
					Page Not Found
				</h1>
				<p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg md:text-xl">
					Oops! The page you&apos;re looking for seems to have wandered off into
					the void. Let&apos;s get you back on track.
				</p>

				{/* Action Buttons */}
				<div className="flex flex-col gap-4 sm:flex-row">
					<Button asChild size="lg" className="gap-2">
						<Link href="/home">
							<HiHome className="h-5 w-5" />
							<span>Go to Home</span>
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline" className="gap-2">
						<Link href="javascript:history.back()">
							<HiArrowLeft className="h-5 w-5" />
							<span>Go Back</span>
						</Link>
					</Button>
				</div>

				{/* Helpful Links */}
				<div className="mt-12">
					<p className="text-muted-foreground mb-4 text-sm">
						Looking for something specific?
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<Link
							href="/home"
							className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
						>
							Timeline
						</Link>
						<span className="text-muted-foreground">•</span>
						<Link
							href="/signin"
							className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
						>
							Sign In
						</Link>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes spin-slow {
					from {
						transform: translate(-50%, -50%) rotate(0deg);
					}
					to {
						transform: translate(-50%, -50%) rotate(360deg);
					}
				}
				.animate-spin-slow {
					animation: spin-slow 8s linear infinite;
				}
				.animation-delay-300 {
					animation-delay: 300ms;
				}
			`}</style>
		</div>
	);
}
