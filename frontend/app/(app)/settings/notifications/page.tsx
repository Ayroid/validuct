"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NotificationSettingsPage from "@/components/NotificationSettingsPage";

export default function NotificationsSettingsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return <NotificationSettingsPage />;
}
