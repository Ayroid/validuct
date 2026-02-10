import AppSidebar from "@/components/app-shell/AppSidebar";
import MobileBottomNav from "@/components/app-shell/MobileBottomNav";
import WalkthroughProvider from "@/components/WalkthroughProvider";

export default function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto flex max-w-325">
				{/* Left sidebar */}
				<AppSidebar />

				{/* Main feed column — centered between sidebar and spacer */}
				<main className="border-border/50 min-h-screen w-full min-w-0 max-w-300 pb-20 md:border-r md:pb-0">
					{children}
				</main>

				{/* Right spacer for visual balance */}
				<div className="hidden lg:block w-56 shrink-0" aria-hidden="true" />
			</div>
			<MobileBottomNav />
			<WalkthroughProvider />
		</div>
	);
}
