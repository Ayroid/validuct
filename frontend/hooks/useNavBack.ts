"use client";
import { useRouter } from "next/navigation";

export function useNavBack() {
	const router = useRouter();

	const back = (fallback = "/home") => {
		if (sessionStorage.getItem("has_nav_history")) {
			router.back();
		} else {
			router.push(fallback);
		}
	};

	return back;
}
