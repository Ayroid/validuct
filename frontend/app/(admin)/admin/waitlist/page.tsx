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
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { AdminIdeaWaitlistEntry, MainWaitlistEntry } from "@/types";
import Link from "next/link";

type WaitlistTab = "main" | "ideas";
type PendingDelete =
	| { type: "main"; entry: MainWaitlistEntry }
	| { type: "ideas"; entry: AdminIdeaWaitlistEntry }
	| null;

export default function AdminWaitlistPage() {
	const [activeTab, setActiveTab] = useState<WaitlistTab>("main");

	const [mainEntries, setMainEntries]       = useState<MainWaitlistEntry[]>([]);
	const [mainTotal, setMainTotal]           = useState(0);
	const [mainPage, setMainPage]             = useState(1);
	const [mainTotalPages, setMainTotalPages] = useState(1);

	const [ideaEntries, setIdeaEntries]       = useState<AdminIdeaWaitlistEntry[]>([]);
	const [ideaTotal, setIdeaTotal]           = useState(0);
	const [ideaPage, setIdeaPage]             = useState(1);
	const [ideaTotalPages, setIdeaTotalPages] = useState(1);

	const [loading, setLoading]           = useState(true);
	const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
	const [deleting, setDeleting]         = useState(false);

	const fetchMain = useCallback(async () => {
		setLoading(true);
		try {
			const result = await adminApi.getMainWaitlist(mainPage, 50);
			setMainEntries(result.entries);
			setMainTotal(result.pagination.total);
			setMainTotalPages(result.pagination.total_pages || 1);
		} catch {
			toast.error("Failed to load waitlist");
		} finally {
			setLoading(false);
		}
	}, [mainPage]);

	const fetchIdeas = useCallback(async () => {
		setLoading(true);
		try {
			const result = await adminApi.getAllIdeaWaitlists(ideaPage, 50);
			setIdeaEntries(result.entries);
			setIdeaTotal(result.pagination.total);
			setIdeaTotalPages(result.pagination.total_pages || 1);
		} catch {
			toast.error("Failed to load idea waitlists");
		} finally {
			setLoading(false);
		}
	}, [ideaPage]);

	useEffect(() => {
		if (activeTab === "main") fetchMain();
		else fetchIdeas();
	}, [activeTab, fetchMain, fetchIdeas]);

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setDeleting(true);
		try {
			if (pendingDelete.type === "main") {
				await adminApi.removeFromMainWaitlist(pendingDelete.entry.id);
				setMainEntries((prev) => prev.filter((e) => e.id !== pendingDelete.entry.id));
				setMainTotal((t) => t - 1);
			} else {
				await adminApi.removeFromIdeaWaitlist(pendingDelete.entry.id);
				setIdeaEntries((prev) => prev.filter((e) => e.id !== pendingDelete.entry.id));
				setIdeaTotal((t) => t - 1);
			}
			toast.success("Entry removed");
			setPendingDelete(null);
		} catch {
			toast.error("Failed to remove entry");
		} finally {
			setDeleting(false);
		}
	};

	const total   = activeTab === "main" ? mainTotal : ideaTotal;
	const refresh = activeTab === "main" ? fetchMain : fetchIdeas;

	const modalDescription = pendingDelete
		? pendingDelete.type === "main"
			? `Remove ${pendingDelete.entry.email} from the platform waitlist.`
			: `Remove ${pendingDelete.entry.email} from the waitlist for "${pendingDelete.entry.idea.heading}".`
		: "";

	return (
		<>
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Waitlist</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{total} total entr{total !== 1 ? "ies" : "y"}
					</p>
				</div>
				<Button variant="ghost" size="icon-sm" onClick={refresh} disabled={loading}>
					<HiArrowPath className={loading ? "animate-spin" : ""} />
				</Button>
			</div>

			{/* Tabs */}
			<div className="border-border/50 bg-muted/30 mt-6 flex gap-1 rounded-lg border p-1">
				<button onClick={() => setActiveTab("main")}
					className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "main" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
					}`}>
					Platform Waitlist
				</button>
				<button onClick={() => setActiveTab("ideas")}
					className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "ideas" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
					}`}>
					Idea Waitlists
				</button>
			</div>

			{/* List */}
			<div className="mt-6 space-y-2">
				{loading ? (
					<div className="space-y-2">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="bg-card rounded-xl border p-4">
								<div className="flex items-center justify-between">
									<Skeleton className="h-3.5 w-1/3 rounded" />
									<Skeleton className="h-3 w-24 rounded" />
								</div>
							</div>
						))}
					</div>
				) : activeTab === "main" ? (
					mainEntries.length === 0 ? (
						<div className="border-border/50 bg-card rounded-xl border p-12 text-center">
							<p className="text-muted-foreground text-sm">No waitlist entries</p>
						</div>
					) : (
						mainEntries.map((entry) => (
							<div key={entry.id} className="border-border/50 bg-card hover:border-border flex items-center justify-between rounded-xl border px-5 py-3.5 transition-colors">
								<div>
									<p className="text-foreground text-sm font-medium">{entry.email}</p>
									<p className="text-muted-foreground mt-0.5 text-xs">
										{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
									</p>
								</div>
								<Button variant="ghost" size="icon-sm"
									className="hover:text-red-500"
									onClick={() => setPendingDelete({ type: "main", entry })}>
									<HiTrash />
								</Button>
							</div>
						))
					)
				) : (
					ideaEntries.length === 0 ? (
						<div className="border-border/50 bg-card rounded-xl border p-12 text-center">
							<p className="text-muted-foreground text-sm">No idea waitlist entries</p>
						</div>
					) : (
						ideaEntries.map((entry) => (
							<div key={entry.id} className="border-border/50 bg-card hover:border-border rounded-xl border px-5 py-3.5 transition-colors">
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										<p className="text-foreground text-sm font-medium">{entry.email}</p>
										<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
											<Link href={`/idea/${entry.idea.id}`} target="_blank"
												className="hover:text-foreground line-clamp-1 max-w-[240px] transition-colors hover:underline">
												{entry.idea.heading}
											</Link>
											<span>·</span>
											<Link href={`/${entry.idea.user.username}`} target="_blank"
												className="hover:text-foreground transition-colors">
												@{entry.idea.user.username}
											</Link>
											<span>·</span>
											<span>{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
										</div>
									</div>
									<Button variant="ghost" size="icon-sm"
										className="hover:text-red-500 shrink-0"
										onClick={() => setPendingDelete({ type: "ideas", entry })}>
										<HiTrash />
									</Button>
								</div>
							</div>
						))
					)
				)}
			</div>

			{/* Pagination */}
			{((activeTab === "main" && mainTotalPages > 1) || (activeTab === "ideas" && ideaTotalPages > 1)) && (
				<div className="mt-8 flex items-center justify-center gap-4">
					<Button variant="outline" size="sm"
						onClick={() => activeTab === "main" ? setMainPage((p) => Math.max(1, p - 1)) : setIdeaPage((p) => Math.max(1, p - 1))}
						disabled={(activeTab === "main" ? mainPage : ideaPage) === 1 || loading}>
						<HiChevronLeft /> Previous
					</Button>
					<span className="text-muted-foreground text-sm">
						Page {activeTab === "main" ? mainPage : ideaPage} of {activeTab === "main" ? mainTotalPages : ideaTotalPages}
					</span>
					<Button variant="outline" size="sm"
						onClick={() => activeTab === "main" ? setMainPage((p) => Math.min(mainTotalPages, p + 1)) : setIdeaPage((p) => Math.min(ideaTotalPages, p + 1))}
						disabled={(activeTab === "main" ? mainPage : ideaPage) === (activeTab === "main" ? mainTotalPages : ideaTotalPages) || loading}>
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
					<AlertDialogTitle>Remove from waitlist?</AlertDialogTitle>
					<AlertDialogDescription>{modalDescription}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
					<Button variant="destructive" onClick={handleDelete} disabled={deleting}>
						{deleting
							? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							: <HiTrash />}
						Remove
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		</>
	);
}
