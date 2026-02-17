"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminApi } from "@/lib/api/admin";
import { Suggestion, SuggestionStatus } from "@/types";
import { toast } from "react-toastify";
import {
	HiCheck,
	HiXMark,
	HiArrowPath,
	HiChevronLeft,
	HiChevronRight,
} from "react-icons/hi2";

const STATUS_TABS: { label: string; value: SuggestionStatus | "ALL" }[] = [
	{ label: "All", value: "ALL" },
	{ label: "Pending", value: "PENDING" },
	{ label: "Approved", value: "APPROVED" },
	{ label: "Rejected", value: "REJECTED" },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
	FEATURE_REQUEST: {
		label: "Feature",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	BUG_REPORT: {
		label: "Bug",
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
	IMPROVEMENT: {
		label: "Improvement",
		color:
			"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	OTHER: {
		label: "Other",
		color:
			"bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
	},
};

const STATUS_BADGES: Record<
	SuggestionStatus,
	{ label: string; color: string }
> = {
	PENDING: {
		label: "Pending",
		color:
			"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
	APPROVED: {
		label: "Approved",
		color:
			"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	REJECTED: {
		label: "Rejected",
		color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
};

export default function AdminSuggestionsPage() {
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<SuggestionStatus | "ALL">("ALL");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const fetchSuggestions = useCallback(async () => {
		setLoading(true);
		try {
			const status = activeTab === "ALL" ? undefined : activeTab;
			const result = await adminApi.getAllSuggestions(page, 20, status);
			setSuggestions(result.suggestions);
			setTotalPages(result.pagination.total_pages || 1);
			setTotal(result.pagination.total);
		} catch {
			toast.error("Failed to load suggestions");
		} finally {
			setLoading(false);
		}
	}, [activeTab, page]);

	useEffect(() => {
		fetchSuggestions();
	}, [fetchSuggestions]);

	const handleStatusUpdate = async (
		id: string,
		status: "APPROVED" | "REJECTED"
	) => {
		setUpdatingId(id);
		try {
			const updated = await adminApi.updateSuggestionStatus(id, status);
			setSuggestions((prev) =>
				prev.map((s) => (s.id === id ? updated : s))
			);
			toast.success(
				`Suggestion ${status === "APPROVED" ? "approved" : "rejected"}`
			);
		} catch {
			toast.error("Failed to update suggestion");
		} finally {
			setUpdatingId(null);
		}
	};

	const handleTabChange = (tab: SuggestionStatus | "ALL") => {
		setActiveTab(tab);
		setPage(1);
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Suggestions
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{total} total suggestion{total !== 1 ? "s" : ""}
					</p>
				</div>
				<button
					onClick={fetchSuggestions}
					disabled={loading}
					className="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
				>
					<HiArrowPath
						className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
					/>
				</button>
			</div>

			{/* Filter Tabs */}
			<div className="mt-6 flex gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
				{STATUS_TABS.map((tab) => (
					<button
						key={tab.value}
						onClick={() => handleTabChange(tab.value)}
						className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === tab.value
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Suggestions List */}
			<div className="mt-8 space-y-3">
				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="bg-card animate-pulse rounded-xl border p-6"
							>
								<div className="h-4 w-1/3 rounded bg-muted" />
								<div className="mt-3 h-3 w-2/3 rounded bg-muted" />
							</div>
						))}
					</div>
				) : suggestions.length === 0 ? (
					<div className="rounded-xl border border-border/50 bg-card p-12 text-center">
						<p className="text-muted-foreground text-sm">
							No suggestions found
						</p>
					</div>
				) : (
					suggestions.map((suggestion) => {
						const typeMeta = TYPE_LABELS[suggestion.type];
						const statusMeta = STATUS_BADGES[suggestion.status];
						const isUpdating = updatingId === suggestion.id;

						return (
							<div
								key={suggestion.id}
								className="rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-border"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										{/* Type badge + Status badge */}
										<div className="flex items-center gap-2">
											<span
												className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeMeta.color}`}
											>
												{typeMeta.label}
											</span>
											<span
												className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMeta.color}`}
											>
												{statusMeta.label}
											</span>
										</div>

										{/* Title */}
										<h3 className="mt-2.5 text-sm font-semibold text-foreground">
											{suggestion.title}
										</h3>

										{/* Description */}
										<p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
											{suggestion.description}
										</p>

										{/* Author + Date */}
										<div className="mt-3 flex items-center gap-3">
											<div className="flex items-center gap-2">
												{suggestion.user
													.profilePicture ? (
													<Image
														src={
															suggestion.user
																.profilePicture
														}
														alt={
															suggestion.user
																.username
														}
														width={20}
														height={20}
														className="rounded-full"
													/>
												) : (
													<div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
														{suggestion.user.username[0]?.toUpperCase()}
													</div>
												)}
												<span className="text-xs text-muted-foreground">
													{suggestion.user.username}
												</span>
											</div>
											<span className="text-xs text-muted-foreground/50">
												{new Date(
													suggestion.createdAt
												).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex shrink-0 items-center gap-2">
										{suggestion.status !== "APPROVED" && (
											<button
												onClick={() =>
													handleStatusUpdate(
														suggestion.id,
														"APPROVED"
													)
												}
												disabled={isUpdating}
												className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
											>
												<HiCheck className="h-3.5 w-3.5" />
												Approve
											</button>
										)}
										{suggestion.status !== "REJECTED" && (
											<button
												onClick={() =>
													handleStatusUpdate(
														suggestion.id,
														"REJECTED"
													)
												}
												disabled={isUpdating}
												className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
											>
												<HiXMark className="h-3.5 w-3.5" />
												Reject
											</button>
										)}
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
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1 || loading}
						className="flex items-center gap-1 rounded-lg border border-border/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
					>
						<HiChevronLeft className="h-4 w-4" />
						Previous
					</button>
					<span className="text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<button
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
						disabled={page === totalPages || loading}
						className="flex items-center gap-1 rounded-lg border border-border/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
					>
						Next
						<HiChevronRight className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
}
