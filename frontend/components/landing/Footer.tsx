import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-border px-6 py-10">
			<div className="mx-auto flex max-w-[1080px] flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
				{/* Left: Logo + Copyright */}
				<div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
					<span className="font-mono text-[15px] font-medium uppercase tracking-wide text-primary">
						Validuct
						<span className="text-[var(--text-muted-extra)]">.com</span>
					</span>
					<span className="text-xs text-[var(--text-muted-extra)]">
						&copy; {new Date().getFullYear()} Validuct. All rights reserved.
					</span>
				</div>

				{/* Center: Links */}
				<div className="flex gap-5">
					<Link
						href="/privacy"
						className="text-[13px] text-[var(--text-muted-extra)] transition-colors hover:text-foreground"
					>
						Privacy
					</Link>
					<Link
						href="/terms"
						className="text-[13px] text-[var(--text-muted-extra)] transition-colors hover:text-foreground"
					>
						Terms
					</Link>
				</div>

				{/* Right: Socials */}
				<div className="flex gap-4">
					<a
						href="https://twitter.com/validuct"
						target="_blank"
						rel="noopener noreferrer"
						className="text-base text-[var(--text-muted-extra)] transition-colors hover:text-foreground"
						title="X / Twitter"
					>
						&#120143;
					</a>
					<a
						href="https://github.com/ayroid"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[var(--text-muted-extra)] transition-colors hover:text-foreground"
						title="GitHub"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
					</a>
				</div>
			</div>
		</footer>
	);
}
