"use client";

import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import FadeIn from "./FadeIn";

const socialLinks = [
	{ icon: FaXTwitter, href: "https://twitter.com/validuct", label: "Twitter" },
	{ icon: FaGithub, href: "https://github.com/ayroid", label: "GitHub" },
];

const footerLinks = [
	{ label: "Privacy", href: "/privacy" },
	{ label: "Terms", href: "/terms" },
];

export default function Footer() {
	return (
		<footer className="border-border bg-card border-t px-4 py-12 sm:py-16 md:py-20 sm:px-6">
			<div className="mx-auto max-w-6xl">
				<FadeIn direction="up">
					<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
						{/* Brand */}
						<div className="flex items-center gap-3">
							<Image
								src="/logo.png"
								alt="Validuct Logo"
								width={32}
								height={32}
								className="transition-transform duration-300 hover:scale-110"
							/>
							<div>
								<p className="text-foreground font-bold">Validuct</p>
								<p className="text-muted-foreground text-sm">
									Validate demand before you build
								</p>
							</div>
						</div>

						{/* Social Links */}
						<div className="flex items-center gap-4">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
									aria-label={social.label}
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>

						{/* Links */}
						<div className="text-muted-foreground flex items-center gap-4 sm:gap-6 text-sm">
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

					<div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
						&copy; {new Date().getFullYear()} Validuct. All rights reserved.
					</div>
				</FadeIn>
			</div>
		</footer>
	);
}
