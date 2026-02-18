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
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import {
	HiArrowPath,
	HiChevronLeft,
	HiChevronRight,
	HiArrowUp,
	HiArrowDown,
	HiCalendar,
	HiChatBubbleLeft,
	HiTrash,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { AdminIdea } from "@/types";

type IdeaStatusFilter = "ALL" | "DRAFT" | "WIP" | "VALIDATED" | "LAUNCHED";
type IdeaSort = "newest" | "oldest" | "most_upvotes" | "most_comments";

const STATUS_TABS: { label: string; value: IdeaStatusFilter }[] = [
	{ label: "All",       value: "ALL" },
	{ label: "Draft",     value: "DRAFT" },
	{ label: "WIP",       value: "WIP" },
	{ label: "Validated", value: "VALIDATED" },
	{ label: "Launched",  value: "LAUNCHED" },
];

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
	DRAFT:     { label: "Draft",     color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
	WIP:       { label: "WIP",       color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	VALIDATED: { label: "Validated", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	LAUNCHED:  { label: "Launched",  color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

export default function AdminIdeasPage() {
	const [ideas, setIdeas]           = useState<AdminIdea[]>([]);
	const [total, setTotal]           = useState(0);
	const [page, setPage]             = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading]       = useState(true);
	const [activeTab, setActiveTab]   = useState<IdeaStatusFilter>("ALL");
	const [sort, setSort]             = useState<IdeaSort>("newest");
	const [pendingDelete, setPendingDelete] = useState<AdminIdea | null>(null);
	const [deleting, setDeleting]          = useState(false);

	const fetchIdeas = useCallback(async () => {
		setLoading(true);
		try {
			const status = activeTab === "ALL" ? undefined : activeTab;
			const result = await adminApi.getAllIdeas(page, 20, status, sort);
			setIdeas(result.ideas);
			setTotalPages(result.pagination.total_pages || 1);
			setTotal(result.pagination.total);
		} catch {
			toast.error("Failed to load ideas");
		} finally {
			setLoading(false);
		}
	}, [page, activeTab, sort]);

	useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

	const handleTabChange  = (value: IdeaStatusFilter) => { setActiveTab(value); setPage(1); };
	const handleSortChange = (value: IdeaSort)         => { setSort(value);      setPage(1); };

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setDeleting(true);
		try {
			await adminApi.adminDeleteIdea(pendingDelete.id);
			setIdeas((prev) => prev.filter((i) => i.id !== pendingDelete.id));
			setTotal((t) => t - 1);
			toast.success("Idea deleted");
			setPendingDelete(null);
		} catch {
			toast.error("Failed to delete idea");
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
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ideas</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{total} total idea{total !== 1 ? "s" : ""}
					</p>
				</div>
				<Button variant="ghost" size="icon-sm" onClick={fetchIdeas} disabled={loading}>
					<HiArrowPath className={loading ? "animate-spin" : ""} />
				</Button>
			</div>

			{/* Filter + Sort row */}
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<div className="border-border/50 bg-muted/30 flex gap-1 rounded-lg border p-1">
					{STATUS_TABS.map((tab) => (
						<button key={tab.value} onClick={() => handleTabChange(tab.value)}
							className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
								activeTab === tab.value
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}>
							{tab.label}
						</button>
					))}
				</div>

				{/* Sort controls */}
				<div className="ml-auto flex items-center gap-2">
					<div className="flex items-center gap-1">
						<button onClick={() => handleSortChange("most_upvotes")} title="Most upvotes"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "most_upvotes" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiArrowUp className="h-3.5 w-3.5" /><HiArrowUp className="h-3 w-3" />
						</button>
						<button onClick={() => handleSortChange("most_comments")} title="Most comments"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "most_comments" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiChatBubbleLeft className="h-3.5 w-3.5" /><HiArrowUp className="h-3 w-3" />
						</button>
					</div>
					<div className="flex items-center gap-1">
						<button onClick={() => handleSortChange("newest")} title="Newest first"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "newest" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiCalendar className="h-3.5 w-3.5" /><HiArrowDown className="h-3 w-3" />
						</button>
						<button onClick={() => handleSortChange("oldest")} title="Oldest first"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "oldest" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiCalendar className="h-3.5 w-3.5" /><HiArrowUp className="h-3 w-3" />
						</button>
					</div>
				</div>
			</div>

			{/* Ideas List */}
			<div className="mt-6 space-y-3">
				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="bg-card rounded-xl border p-5">
								<div className="flex items-start gap-4">
									<Skeleton className="h-8 w-8 shrink-0 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-2/5 rounded" />
										<Skeleton className="h-3 w-3/5 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : ideas.length === 0 ? (
					<div className="border-border/50 bg-card rounded-xl border p-12 text-center">
						<p className="text-muted-foreground text-sm">No ideas found</p>
					</div>
				) : (
					ideas.map((idea) => {
						const badge = STATUS_BADGES[idea.status];
						return (
							<div key={idea.id} className="border-border/50 bg-card hover:border-border rounded-xl border p-5 transition-colors">
								<div className="flex items-start gap-4">
									{/* Author avatar */}
									{idea.user.profilePicture ? (
										<Image src={idea.user.profilePicture} alt={idea.user.username}
											width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover mt-0.5" />
									) : (
										<div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium mt-0.5">
											{idea.user.username[0]?.toUpperCase()}
										</div>
									)}

									{/* Content */}
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<Link href={`/idea/${idea.id}`} target="_blank"
												className="text-foreground text-sm font-semibold hover:underline line-clamp-1">
												{idea.heading}
											</Link>
											<span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
												{badge.label}
											</span>
										</div>
										<p className="text-muted-foreground mt-1 line-clamp-1 text-xs">{idea.description}</p>
										<div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
											<Link href={`/${idea.user.username}`} target="_blank"
												className="text-muted-foreground hover:text-foreground transition-colors">
												@{idea.user.username}
											</Link>
											<span className="text-muted-foreground/50">·</span>
											<span className="text-muted-foreground">↑ {idea.upvotesCount}</span>
											<span className="text-muted-foreground">💬 {idea.commentsCount}</span>
											<span className="text-muted-foreground">⚡ {idea.signalsCount}</span>
											<span className="text-muted-foreground">📋 {idea.waitlistCount}</span>
											<span className="text-muted-foreground/50">·</span>
											<span className="text-muted-foreground">
												{new Date(idea.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
											</span>
										</div>
									</div>

									{/* Delete */}
									<Button variant="ghost" size="icon-sm"
										className="hover:text-red-500 shrink-0"
										onClick={() => setPendingDelete(idea)}>
										<HiTrash />
									</Button>
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
					<AlertDialogTitle>Delete idea?</AlertDialogTitle>
					<AlertDialogDescription>
						{pendingDelete
							? `"${pendingDelete.heading}" and all its votes, comments, and signals will be permanently removed.`
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
