"use client";

import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import FadeIn from "./FadeIn";

const socialLinks = [
	{
		icon: FaXTwitter,
		href: "https://twitter.com/validuct",
		label: "Twitter",
	},
	{
		icon: FaGithub,
		href: "https://github.com/ayroid",
		label: "GitHub",
	},
];

const footerLinks = [
	{ label: "Privacy", href: "/privacy" },
	{ label: "Terms", href: "/terms" },
];

export default function Footer() {
	return (
		<footer className="border-border bg-card border-t px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl">
				<FadeIn direction="up">
					<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
						{/* Brand */}
						<div className="flex items-center gap-4">
							<Image
								src="/logo.png"
								alt="Validuct Logo"
								width={40}
								height={40}
								className="transition-transform duration-300 hover:scale-110"
							/>
							<div>
								<p className="text-foreground text-lg font-bold">Validuct</p>
								<p className="text-muted-foreground text-sm sm:text-base">
									Validate demand before you build
								</p>
							</div>
						</div>

						{/* Social Links */}
						<div className="flex items-center gap-3">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200"
									aria-label={social.label}
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>

						{/* Links */}
						<div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6 sm:text-base">
							{footerLinks.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									className="hover:text-foreground transition-colors"
								>
									{link.label}
								</Link>
							))}
							<a
								href="https://ayroid.in"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground transition-colors"
							>
								Built by Ayroid
							</a>
						</div>
					</div>

					<div className="border-border text-muted-foreground mt-10 border-t pt-8 text-center text-sm sm:text-base">
						&copy; {new Date().getFullYear()} Validuct. All rights reserved.
					</div>
				</FadeIn>
			</div>
		</footer>
	);
}
