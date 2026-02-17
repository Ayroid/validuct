import { auth } from "@/auth";
import { notFound } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	if (!session?.user?.isAdmin) {
		notFound();
	}

	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto flex">
				<AdminSidebar />
				<main className="min-h-screen w-full min-w-0 pb-20 md:pb-0">
					{children}
				</main>
			</div>
		</div>
	);
}
