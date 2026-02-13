"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsPage() {
	const params = useParams();
	const router = useRouter();
	const username = params.username as string;

	useEffect(() => {
		router.replace(`/${username}?tab=analytics`);
	}, [username, router]);

	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
		</div>
	);
}
