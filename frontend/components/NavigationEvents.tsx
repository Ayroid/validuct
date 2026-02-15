"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationEvents() {
	const pathname = usePathname();
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		sessionStorage.setItem("has_nav_history", "1");
	}, [pathname]);

	return null;
}
