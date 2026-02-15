"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { ideaWaitlistApi } from "@/lib/api/ideaWaitlist";
import { IdeaWaitlistEntry, PaginationMeta } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
	HiArrowLeft,
	HiEnvelope,
	HiClipboard,
	HiArrowDownTray,
	HiCheckCircle,
} from "react-icons/hi2";
import { useNavBack } from "@/hooks/useNavBack";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WaitlistPage() {
	const params = useParams();
	const router = useRouter();
	const back = useNavBack();
	const { status } = useSession();

	const [entries, setEntries] = useState<IdeaWaitlistEntry[]>([]);
	const [ideaHeading, setIdeaHeading] = useState("");
	const [totalCount, setTotalCount] = useState(0);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);
	const [page, setPage] = useState(1);

	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const observerRef = useRef<HTMLDivElement>(null);
	const [exporting, setExporting] = useState(false);
	const [error, setError] = useState(false);
	const [copied, setCopied] = useState(false);

	const ideaId = params.id as string;

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/signin");
			return;
		}

		if (status === "authenticated") {
			loadWaitlist(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, ideaId]);

	const loadWaitlist = async (reset = false, pageOverride?: number) => {
		try {
			if (reset) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			const currentPage = reset ? 1 : (pageOverride ?? page);
			const result = await ideaWaitlistApi.getWaitlistEntries(ideaId, {
				page: currentPage,
				limit: 20,
			});

			setIdeaHeading(result.ideaHeading);
			setTotalCount(result.totalCount);
			setPagination(result.pagination);

			if (reset) {
				setEntries(result.entries);
				setPage(1);
			} else {
				setEntries((prev) => {
					const existingIds = new Set(prev.map((e) => e.id));
					const newEntries = result.entries.filter(
						(e) => !existingIds.has(e.id)
					);
					return [...prev, ...newEntries];
				});
			}
		} catch {
			setError(true);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleLoadMore = useCallback(() => {
		if (!loadingMore && !loading) {
			const nextPage = page + 1;
			setPage(nextPage);
			loadWaitlist(false, nextPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadingMore, loading, page]);

	const copyAllEmails = async () => {
		try {
			setExporting(true);
			const result = await ideaWaitlistApi.exportWaitlistEmails(ideaId);
			const emails = result.entries.map((e) => e.email).join(", ");
			await navigator.clipboard.writeText(emails);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Silently fail
		} finally {
			setExporting(false);
		}
	};

	const downloadCSV = async () => {
		try {
			setExporting(true);
			const result = await ideaWaitlistApi.exportWaitlistEmails(ideaId);

			const headers = ["Email", "Joined At"];
			const rows = result.entries.map((entry) => [
				entry.email,
				new Date(entry.createdAt).toISOString(),
			]);

			const csvContent = [
				headers.join(","),
				...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");

			const blob = new Blob([csvContent], {
				type: "text/csv;charset=utf-8;",
			});
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`waitlist-${result.ideaHeading.slice(0, 30).replace(/[^a-z0-9]/gi, "-")}.csv`
			);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch {
			// Silently fail
		} finally {
			setExporting(false);
		}
	};

	const hasMore = pagination ? page < pagination.total_pages : false;

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					!loadingMore &&
					!loading &&
					hasMore
				) {
					handleLoadMore();
				}
			},
			{ threshold: 0.1 }
		);

		const currentObserverRef = observerRef.current;
		if (currentObserverRef) {
			observer.observe(currentObserverRef);
		}

		return () => {
			if (currentObserverRef) {
				observer.unobserve(currentObserverRef);
			}
		};
	}, [loadingMore, loading, hasMore, handleLoadMore]);

	if (status === "loading" || loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (error) {
		notFound();
	}

	return (
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => back(`/idea/${params.id}`)}
						className="text-foreground hover:bg-muted -ml-1 cursor-pointer rounded-full p-1 transition-colors"
					>
						<HiArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-foreground text-lg font-bold">
						Waitlist
					</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="px-4 py-6 sm:px-6">
				{/* Header */}
				<div className="bg-card border-border/50 shadow-card mb-8 rounded-xl border p-6">
					<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
						{ideaHeading}
					</h1>
					<div className="mt-1.5 flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							{totalCount}{" "}
							{totalCount === 1
								? "person has"
								: "people have"}{" "}
							expressed interest
						</p>
						{totalCount > 0 && (
							<TooltipProvider delayDuration={200}>
								<div className="flex items-center gap-1">
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={copyAllEmails}
												disabled={exporting}
												className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg p-2 transition-colors disabled:opacity-50"
											>
												{copied ? (
													<HiCheckCircle className="h-4.5 w-4.5 text-green-500" />
												) : (
													<HiClipboard className="h-4.5 w-4.5" />
												)}
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												{copied
													? "Copied!"
													: "Copy all emails"}
											</p>
										</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={downloadCSV}
												disabled={exporting}
												className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg p-2 transition-colors disabled:opacity-50"
											>
												<HiArrowDownTray className="h-4.5 w-4.5" />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Download CSV</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</TooltipProvider>
						)}
					</div>
				</div>

				{/* Waitlist Entries */}
				<div className="bg-card border-border/50 shadow-card rounded-xl border">
					{entries.length === 0 ? (
						<div className="text-muted-foreground p-8 text-center">
							No one has joined the waitlist yet.
						</div>
					) : (
						<ul className="divide-border divide-y">
							{entries.map((entry) => (
								<li
									key={entry.id}
									className="flex items-center justify-between p-4"
								>
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
											<HiEnvelope className="text-primary h-5 w-5" />
										</div>
										<span className="text-foreground font-medium">
											{entry.email}
										</span>
									</div>
									<span className="text-muted-foreground text-sm">
										{formatDistanceToNow(
											new Date(entry.createdAt),
											{ addSuffix: true }
										)}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Infinite Scroll Observer Target */}
				{hasMore && (
					<div
						ref={observerRef}
						className="flex justify-center py-8"
					>
						{loadingMore && (
							<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
