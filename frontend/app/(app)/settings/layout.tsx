"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";
import SettingsSidebar from "@/components/SettingsSidebar";

export default function SettingsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isSubPage = pathname !== "/settings";

	return (
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<Link
						href={isSubPage ? "/settings" : "/home"}
						className="text-foreground hover:bg-muted -ml-1 rounded-full p-1 transition-colors md:hidden"
					>
						<HiArrowLeft className="h-5 w-5" />
					</Link>
					<Link
						href="/home"
						className="text-foreground hover:bg-muted -ml-1 hidden rounded-full p-1 transition-colors md:block"
					>
						<HiArrowLeft className="h-5 w-5" />
					</Link>
					<h1 className="text-foreground text-lg font-bold">
						Settings
					</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="flex flex-col gap-6 px-4 sm:px-6 md:flex-row">
				{/* Sidebar: always visible on desktop, only on /settings on mobile */}
				<div
					className={`border-border/50 md:w-56 md:shrink-0 md:border-r ${isSubPage ? "hidden md:block" : ""}`}
				>
					<div className="md:sticky md:top-[45px] md:h-[calc(100vh-45px)] md:overflow-y-auto">
						<SettingsSidebar />
					</div>
				</div>

				{/* Content: hidden on /settings on mobile (sidebar is shown instead) */}
				<main
					className={`flex-1 py-6 ${!isSubPage ? "hidden md:block" : ""}`}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
