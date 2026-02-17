import { useEffect, useRef } from "react";

/**
 * Hook that sets up an IntersectionObserver to trigger a callback
 * when a sentinel element becomes visible — used for infinite scroll.
 *
 * @param onLoadMore - Called when the sentinel enters the viewport
 * @param enabled - Whether the observer should be active (typically `!isLoading && hasMore`)
 * @returns ref to attach to the sentinel div
 */
export function useInfiniteScroll(
	onLoadMore: () => void,
	enabled: boolean
) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!enabled) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					onLoadMore();
				}
			},
			{ threshold: 0.1 }
		);

		const el = sentinelRef.current;
		if (el) {
			observer.observe(el);
		}

		return () => {
			if (el) {
				observer.unobserve(el);
			}
		};
	}, [onLoadMore, enabled]);

	return sentinelRef;
}
