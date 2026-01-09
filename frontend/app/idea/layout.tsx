import Navbar from "@/components/Navbar";

export default function IdeaLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto max-w-5xl">
				<Navbar />
			</div>
			{children}
		</div>
	);
}
