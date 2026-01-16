import Navbar from "@/components/Navbar";
import NotificationsList from "@/components/NotificationsList";

export default function NotificationsPage() {
	return (
		<div className="bg-background mx-auto min-h-screen max-w-5xl">
			<Navbar />
			<main className="px-4 py-6 sm:px-6">
				<NotificationsList />
			</main>
		</div>
	);
}
