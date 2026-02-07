import Navbar from "@/components/Navbar";
import NotificationsList from "@/components/NotificationsList";

export default function NotificationsPage() {
	return (
		<div className="bg-background min-h-screen">
			<Navbar />
			<main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
				<NotificationsList />
			</main>
		</div>
	);
}
