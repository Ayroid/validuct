import Navbar from "@/components/Navbar";
import SettingsSidebar from "@/components/SettingsSidebar";

export default function SettingsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="bg-background min-h-screen">
			<Navbar />
			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
				<div className="flex flex-col gap-10 md:flex-row">
					<SettingsSidebar />
					<main className="flex-1">{children}</main>
				</div>
			</div>
		</div>
	);
}
