"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";

export default function WaitlistPage() {
	const params = useParams();
	const router = useRouter();
	const { status } = useSession();

	const [entries, setEntries] = useState<IdeaWaitlistEntry[]>([]);
	const [ideaHeading, setIdeaHeading] = useState("");
	const [totalCount, setTotalCount] = useState(0);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);
	const [page, setPage] = useState(1);

	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [error, setError] = useState(false);
	const [copied, setCopied] = useState(false);

	const ideaId = params.id as string;
	const accessToken = params.token as string;

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/signin");
			return;
		}

		if (status === "authenticated") {
			loadWaitlist(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, ideaId, accessToken]);

	const loadWaitlist = async (reset = false, pageOverride?: number) => {
		try {
			if (reset) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			const currentPage = reset ? 1 : (pageOverride ?? page);
			const result = await ideaWaitlistApi.getWaitlistByToken(
				ideaId,
				accessToken,
				{ page: currentPage, limit: 20 }
			);

			setIdeaHeading(result.ideaHeading);
			setTotalCount(result.totalCount);
			setPagination(result.pagination);

			if (reset) {
				setEntries(result.entries);
				setPage(1);
			} else {
				// Deduplicate entries
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

	const handleLoadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		loadWaitlist(false, nextPage);
	};

	const copyAllEmails = async () => {
		try {
			setExporting(true);
			const result = await ideaWaitlistApi.getAllWaitlistEmails(
				ideaId,
				accessToken
			);
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
			const result = await ideaWaitlistApi.getAllWaitlistEmails(
				ideaId,
				accessToken
			);

			const headers = ["Email", "Joined At"];
			const rows = result.entries.map((entry) => [
				entry.email,
				new Date(entry.createdAt).toISOString(),
			]);

			const csvContent = [
				headers.join(","),
				...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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

	if (status === "loading" || loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	// Show 404 for unauthorized access or invalid token
	if (error) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
			{/* Back Button */}
			<Link
				href={`/idea/${ideaId}`}
				className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
			>
				<HiArrowLeft className="h-4 w-4" />
				<span>IDEA</span>
			</Link>

			{/* Header */}
			<div className="bg-card border-border/50 shadow-card mb-8 flex flex-col items-stretch gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-foreground text-2xl font-bold sm:text-3xl">
						Waitlist for &quot;{ideaHeading}&quot;
					</h1>
					<p className="text-muted-foreground mt-2">
						{totalCount} {totalCount === 1 ? "person has" : "people have"}{" "}
						expressed interest
					</p>
				</div>

				{/* Actions */}
				{totalCount > 0 && (
					<div className="flex flex-1 flex-wrap gap-3">
						<Button
							onClick={copyAllEmails}
							variant="secondary"
							className="w-full gap-2 sm:w-auto cursor-pointer transition-colors"
							disabled={exporting}
						>
							{copied ? (
								<>
									<HiCheckCircle className="h-4 w-4 text-green-500" />
									Copied!
								</>
							) : (
								<>
									<HiClipboard className="h-4 w-4" />
									Copy All Emails
								</>
							)}
						</Button>
						<Button
							onClick={downloadCSV}
							variant="default"
							className="w-full gap-2 sm:w-auto cursor-pointer transition-colors"
							disabled={exporting}
						>
							<HiArrowDownTray className="h-4 w-4" />
							Download CSV
						</Button>
					</div>
				)}
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
									{formatDistanceToNow(new Date(entry.createdAt), {
										addSuffix: true,
									})}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Load More Button */}
			{hasMore && (
				<div className="flex justify-center py-8">
					<Button
						onClick={handleLoadMore}
						disabled={loadingMore}
						variant="outline"
						className="cursor-pointer transition-colors"
					>
						{loadingMore ? "Loading..." : "Load More"}
					</Button>
				</div>
			)}
		</div>
	);
}
