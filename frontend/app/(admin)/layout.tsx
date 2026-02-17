import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AppSidebar from "@/components/app-shell/AppSidebar";
import MobileBottomNav from "@/components/app-shell/MobileBottomNav";
import RightSidebar from "@/components/app-shell/RightSidebar";
import NotFound from "@/app/not-found";

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	if (!session?.user?.isAdmin) {
		return (
			<div className="bg-background min-h-screen">
				<div className="mx-auto flex max-w-325">
					<AppSidebar />
					<main className="border-border/50 min-h-screen w-full min-w-0 max-w-300 pb-20 md:border-r md:pb-0">
						<NotFound />
					</main>
					<RightSidebar />
				</div>
				<MobileBottomNav />
			</div>
		);
	}

	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto flex max-w-325">
				{/* Left sidebar */}
				<AdminSidebar />

				{/* Main content */}
				<main className="border-border/50 min-h-screen w-full min-w-0 max-w-300 pb-20 md:border-r md:pb-0">
					{children}
				</main>

				{/* Right spacer for visual balance */}
				<div className="hidden w-72 shrink-0 lg:block" aria-hidden="true" />
			</div>
		</div>
	);
}
