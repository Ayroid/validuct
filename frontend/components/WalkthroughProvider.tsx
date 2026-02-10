"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import WalkthroughModal from "@/components/WalkthroughModal";

function getStorageKey(userId: string) {
	return `validuct_walkthrough_seen_${userId}`;
}

export default function WalkthroughProvider() {
	const { user } = useAuth();
	const [open, setOpen] = useState(false);

	// Auto-show for first-time users
	useEffect(() => {
		if (!user?.id) return;

		const seen = localStorage.getItem(getStorageKey(user.id));
		if (!seen) {
			const timer = setTimeout(() => setOpen(true), 500);
			return () => clearTimeout(timer);
		}
	}, [user?.id]);

	// Mark as seen when closed
	useEffect(() => {
		if (!open && user?.id) {
			const seen = localStorage.getItem(getStorageKey(user.id));
			// Only set if it was previously opened (avoid setting on initial mount)
			if (seen === null) return;
		}
	}, [open, user?.id]);

	function handleOpenChange(isOpen: boolean) {
		setOpen(isOpen);
		if (!isOpen && user?.id) {
			localStorage.setItem(getStorageKey(user.id), "true");
		}
	}

	// Listen for custom event from Settings
	useEffect(() => {
		function handleEvent() {
			setOpen(true);
		}

		window.addEventListener("validuct:open-walkthrough", handleEvent);
		return () =>
			window.removeEventListener("validuct:open-walkthrough", handleEvent);
	}, []);

	return <WalkthroughModal open={open} onOpenChange={handleOpenChange} />;
}
