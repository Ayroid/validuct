"use client";

import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useState, useCallback, useEffect } from "react";
import {
	HiArrowPath,
	HiChevronLeft,
	HiChevronRight,
	HiTrash,
	HiExclamationTriangle,
} from "react-icons/hi2";
import { TbRefresh } from "react-icons/tb";
import { toast } from "react-toastify";
import { EmailQueueEntry, EmailQueueStats, EmailStatus } from "@/types";

const STATUS_TABS: { label: string; value: EmailStatus | "ALL" }[] = [
	{ label: "All",     value: "ALL" },
	{ label: "Pending", value: "PENDING" },
	{ label: "Sent",    value: "SENT" },
	{ label: "Failed",  value: "FAILED" },
];

const STATUS_BADGES: Record<EmailStatus, { label: string; color: string }> = {
	PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
	SENT:    { label: "Sent",    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	FAILED:  { label: "Failed",  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const TYPE_LABELS: Record<string, string> = {
	UPVOTE: "Upvote", SIGNAL: "Signal", COMMENT: "Comment",
	REPLY: "Reply", MILESTONE: "Milestone",
};

export default function AdminEmailsPage() {
	const [entries, setEntries]       = useState<EmailQueueEntry[]>([]);
	const [stats, setStats]           = useState<EmailQueueStats | null>(null);
	const [total, setTotal]           = useState(0);
	const [page, setPage]             = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading]       = useState(true);
	const [activeTab, setActiveTab]   = useState<EmailStatus | "ALL">("ALL");
	const [retryingId, setRetryingId] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<EmailQueueEntry | null>(null);
	const [deleting, setDeleting]          = useState(false);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const status = activeTab === "ALL" ? undefined : activeTab;
			const [result, statsResult] = await Promise.all([
				adminApi.getAllEmailQueue(page, 20, status),
				adminApi.getEmailQueueStats(),
			]);
			setEntries(result.entries);
			setTotalPages(result.pagination.total_pages || 1);
			setTotal(result.pagination.total);
			setStats(statsResult);
		} catch {
			toast.error("Failed to load email queue");
		} finally {
			setLoading(false);
		}
	}, [page, activeTab]);

	useEffect(() => { fetchData(); }, [fetchData]);

	const handleTabChange = (value: EmailStatus | "ALL") => { setActiveTab(value); setPage(1); };

	const handleRetry = async (id: string) => {
		setRetryingId(id);
		try {
			const updated = await adminApi.retryEmail(id);
			setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
			toast.success("Email queued for retry");
		} catch {
			toast.error("Failed to retry email");
		} finally {
			setRetryingId(null);
		}
	};

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setDeleting(true);
		try {
			await adminApi.deleteEmailQueueEntry(pendingDelete.id);
			setEntries((prev) => prev.filter((e) => e.id !== pendingDelete.id));
			setTotal((t) => t - 1);
			toast.success("Entry deleted");
			setPendingDelete(null);
		} catch {
			toast.error("Failed to delete entry");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<>
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Email Queue</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{total} total email{total !== 1 ? "s" : ""}
					</p>
				</div>
				<Button variant="ghost" size="icon-sm" onClick={fetchData} disabled={loading}>
					<HiArrowPath className={loading ? "animate-spin" : ""} />
				</Button>
			</div>

			{/* Stats row */}
			{stats && (
				<div className="mt-6 grid grid-cols-3 gap-3">
					{[
						{ label: "Pending", value: stats.pending, color: "text-amber-600 dark:text-amber-400" },
						{ label: "Sent",    value: stats.sent,    color: "text-green-600 dark:text-green-400" },
						{ label: "Failed",  value: stats.failed,  color: "text-red-600 dark:text-red-400" },
					].map((s) => (
						<div key={s.label} className="border-border/50 bg-card rounded-xl border p-4 text-center">
							<p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
							<p className="text-muted-foreground mt-0.5 text-xs">{s.label}</p>
						</div>
					))}
				</div>
			)}

			{/* Filter Tabs */}
			<div className="border-border/50 bg-muted/30 mt-6 flex gap-1 rounded-lg border p-1">
				{STATUS_TABS.map((tab) => (
					<button key={tab.value} onClick={() => handleTabChange(tab.value)}
						className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === tab.value
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}>
						{tab.label}
					</button>
				))}
			</div>

			{/* List */}
			<div className="mt-6 space-y-3">
				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="bg-card rounded-xl border p-5">
								<div className="flex items-center gap-4">
									<Skeleton className="h-8 w-8 shrink-0 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-2/5 rounded" />
										<Skeleton className="h-3 w-3/5 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : entries.length === 0 ? (
					<div className="border-border/50 bg-card rounded-xl border p-12 text-center">
						<p className="text-muted-foreground text-sm">No emails found</p>
					</div>
				) : (
					entries.map((entry) => {
						const badge = STATUS_BADGES[entry.status];
						const isRetrying = retryingId === entry.id;

						return (
							<div key={entry.id} className="border-border/50 bg-card hover:border-border rounded-xl border p-5 transition-colors">
								<div className="flex items-start gap-4">
									{/* Status icon */}
									<div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
										entry.status === "FAILED" ? "bg-red-100 dark:bg-red-900/20" :
										entry.status === "SENT"   ? "bg-green-100 dark:bg-green-900/20" :
										"bg-amber-100 dark:bg-amber-900/20"
									}`}>
										{entry.status === "FAILED"
											? <HiExclamationTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
											: <span className="text-[10px] font-bold">{entry.type.slice(0, 2)}</span>
										}
									</div>

									{/* Content */}
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-foreground text-sm font-semibold line-clamp-1">{entry.subject}</span>
											<span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
												{badge.label}
											</span>
											<span className="text-muted-foreground rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
												{TYPE_LABELS[entry.type] ?? entry.type}
											</span>
										</div>
										<p className="text-muted-foreground mt-0.5 text-xs">
											To: <span className="font-medium">{entry.recipientEmail}</span>
											{" · "}@{entry.user.username}
										</p>
										{entry.errorMessage && (
											<p className="mt-1 line-clamp-1 text-xs text-red-500 dark:text-red-400">
												{entry.errorMessage}
											</p>
										)}
										<div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
											<span>Retries: {entry.retryCount}/{entry.maxRetries}</span>
											<span>·</span>
											<span>{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex shrink-0 items-center gap-2">
										{entry.status === "FAILED" && (
											<Button size="sm"
												className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
												variant="outline"
												onClick={() => handleRetry(entry.id)}
												disabled={isRetrying}>
												<TbRefresh className={isRetrying ? "animate-spin" : ""} />
												Retry
											</Button>
										)}
										<Button variant="ghost" size="icon-sm"
											className="hover:text-red-500"
											onClick={() => setPendingDelete(entry)}>
											<HiTrash />
										</Button>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-8 flex items-center justify-center gap-4">
					<Button variant="outline" size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1 || loading}>
						<HiChevronLeft /> Previous
					</Button>
					<span className="text-muted-foreground text-sm">Page {page} of {totalPages}</span>
					<Button variant="outline" size="sm"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages || loading}>
						Next <HiChevronRight />
					</Button>
				</div>
			)}
		</div>

		<AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open && !deleting) setPendingDelete(null); }}>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-red-100 dark:bg-red-900/20">
						<HiTrash className="text-red-600 dark:text-red-400" />
					</AlertDialogMedia>
					<AlertDialogTitle>Delete email entry?</AlertDialogTitle>
					<AlertDialogDescription>
						{pendingDelete
							? `Remove "${pendingDelete.subject}" sent to ${pendingDelete.recipientEmail} from the queue. This cannot be undone.`
							: ""}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={handleDelete} disabled={deleting}>
						{deleting
							? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							: <HiTrash />}
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		</>
	);
}
