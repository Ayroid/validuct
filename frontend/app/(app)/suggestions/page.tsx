"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { suggestionsApi } from "@/lib/api/suggestions";
import {
	SuggestionTypeBadge,
	TYPE_CONFIG,
} from "@/components/app-shell/RightSidebar";
import type {
	Suggestion,
	SuggestionType,
	SuggestionStatus,
	PaginationMeta,
} from "@/types";
import { ArrowLeft, Check, Loader2, Pin } from "lucide-react";
import { HiUserCircle } from "react-icons/hi2";
import { formatDistanceToNow } from "date-fns";
import { useNavBack } from "@/hooks/useNavBack";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/* ── Status badge ──────────────────────────────────────── */

const STATUS_STYLES: Record<SuggestionStatus, { label: string; cls: string }> =
	{
		PENDING: {
			label: "Pending",
			cls: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
		},
		APPROVED: {
			label: "Approved",
			cls: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
		},
		REJECTED: {
			label: "Rejected",
			cls: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40",
		},
	};

function StatusBadge({ status }: { status: SuggestionStatus }) {
	const s = STATUS_STYLES[status];
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}
		>
			{s.label}
		</span>
	);
}

/* ── Type selector ─────────────────────────────────────── */

const TYPES: { value: SuggestionType; label: string }[] = [
	{ value: "FEATURE_REQUEST", label: "Feature Request" },
	{ value: "BUG_REPORT", label: "Bug Report" },
	{ value: "IMPROVEMENT", label: "Improvement" },
	{ value: "OTHER", label: "Other" },
];

function TypeSelector({
	value,
	onChange,
}: {
	value: SuggestionType;
	onChange: (v: SuggestionType) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2">
			{TYPES.map((t) => {
				const config = TYPE_CONFIG[t.value];
				const Icon = config.icon;
				const active = value === t.value;
				return (
					<button
						key={t.value}
						type="button"
						onClick={() => onChange(t.value)}
						className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
							active
								? "border-primary bg-primary/10 text-primary"
								: "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
						}`}
					>
						<Icon className="size-3.5" />
						{t.label}
					</button>
				);
			})}
		</div>
	);
}

/* ── Main page ─────────────────────────────────────────── */

export default function SuggestionsPage() {
	const { isAuthenticated } = useAuth();
	const back = useNavBack();

	// Form state
	const [type, setType] = useState<SuggestionType>("FEATURE_REQUEST");
	const [suggestion, setSuggestion] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	// My submissions
	const [mySuggestions, setMySuggestions] = useState<Suggestion[]>([]);

	// Approved suggestions
	const [approved, setApproved] = useState<Suggestion[]>([]);
	const [approvedLoading, setApprovedLoading] = useState(true);
	const [approvedPagination, setApprovedPagination] =
		useState<PaginationMeta | null>(null);
	const [approvedPage, setApprovedPage] = useState(1);

	const loadApproved = useCallback(async (page: number) => {
		setApprovedLoading(true);
		try {
			const res = await suggestionsApi.getApprovedSuggestions(page, 10);
			setApproved(res.suggestions);
			setApprovedPagination(res.pagination);
		} catch {
			// silent
		} finally {
			setApprovedLoading(false);
		}
	}, []);

	const loadMine = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			const res = await suggestionsApi.getMySuggestions(1, 50);
			setMySuggestions(res.suggestions);
		} catch {
			// silent
		}
	}, [isAuthenticated]);

	useEffect(() => {
		loadApproved(approvedPage);
	}, [approvedPage, loadApproved]);

	useEffect(() => {
		loadMine();
	}, [loadMine]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");


		if (!suggestion.trim()) {
			setError("Suggestion is required");
			return;
		}

		try {
			setSubmitting(true);
			await suggestionsApi.createSuggestion({ type, suggestion });
			setSubmitted(true);
			setSuggestion("");
			setType("FEATURE_REQUEST");
			// Reload my suggestions
			loadMine();
			// Reset success message after 4s
			setTimeout(() => setSubmitted(false), 4000);
		} catch (err: any) {
			setError(
				err?.response?.data?.error?.message ||
					err?.response?.data?.error ||
					"Failed to submit. Please try again."
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => back("/home")}
						className="text-foreground hover:bg-muted/60 -ml-1 cursor-pointer rounded-full p-1 transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-foreground text-lg font-bold">
						Suggestions & Feedback
					</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">

				{/* ─── Submission form ──────────────────────── */}
				{isAuthenticated ? (
					<div className="bg-card border-border/50 mt-10 rounded-xl border p-6 sm:p-10">
						<p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
							Submit feedback
						</p>

						{submitted ? (
							<div className="mt-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
								<Check className="size-5 shrink-0 text-emerald-600" />
								<div>
									<p className="text-[14px] font-medium text-emerald-800 dark:text-emerald-300">
										Thanks for your feedback!
									</p>
									<p className="text-[13px] text-emerald-700 dark:text-emerald-400">
										Your suggestion has been submitted and
										will be reviewed by our team.
									</p>
								</div>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="mt-6 space-y-5">
								<div>
									<Label className="text-[13px] font-medium">
										Type
									</Label>
									<div className="mt-2">
										<TypeSelector
											value={type}
											onChange={setType}
										/>
									</div>
								</div>

								<div>
									<Label
										htmlFor="suggestion-title"
										className="text-[13px] font-medium"
									>
										Suggestion
									</Label>
									<Textarea
										id="suggestion-title"
										value={suggestion}
										onChange={(e) =>
											setSuggestion(
												e.target.value.slice(0, 2000)
											)
										}
										placeholder="Describe your suggestion in detail..."
										rows={5}
										className="mt-1.5 resize-none"
										maxLength={2000}
									/>
									<p className="mt-1 text-right text-[11px] text-muted-foreground">
										{suggestion.length}/2000
									</p>
								</div>

								{error && (
									<p className="text-[13px] text-red-600 dark:text-red-400">
										{error}
									</p>
								)}

								<Button
									type="submit"
									disabled={
										submitting ||
										!suggestion.trim()
									}
									className="w-full sm:w-auto"
								>
									{submitting ? (
										<>
											<Loader2 className="mr-2 size-4 animate-spin" />
											Submitting...
										</>
									) : (
										"Submit suggestion"
									)}
								</Button>
							</form>
						)}
					</div>
				) : (
					<div className="bg-card border-border/50 mt-10 rounded-xl border p-6 text-center">
						<p className="text-muted-foreground text-[14px]">
							<Link
								href="/signin"
								className="text-primary font-medium hover:underline"
							>
								Sign in
							</Link>{" "}
							to submit a suggestion.
						</p>
					</div>
				)}

				{/* ─── My submissions ──────────────────────── */}
				{isAuthenticated && mySuggestions.length > 0 && (
					<div className="mt-10">
						<p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
							My Submissions
						</p>
						<div className="mt-4 space-y-3">
							{mySuggestions.map((s) => (
								<div
									key={s.id}
									className="bg-card border-border/50 flex items-start justify-between gap-4 rounded-xl border p-4"
								>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<SuggestionTypeBadge
												type={s.type}
											/>
											<StatusBadge status={s.status} />
										</div>
										<p className="mt-1.5 text-[14px] font-medium text-foreground">
											{s.description}
										</p>
										<p className="mt-0.5 text-[12px] text-muted-foreground">
											{formatDistanceToNow(
												new Date(s.createdAt),
												{ addSuffix: true }
											)}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ─── Approved community suggestions ──────── */}
				<div className="mt-12">
					<p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
						Community Suggestions
					</p>

					{approvedLoading && approved.length === 0 ? (
						<div className="mt-6 flex justify-center py-10">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : approved.length === 0 ? (
						<div className="bg-card border-border/50 mt-4 rounded-xl border p-10 text-center">
							<p className="text-muted-foreground text-[14px]">
								No approved suggestions yet. Be the first to
								share your feedback!
							</p>
						</div>
					) : (
						<>
							<div className="mt-4 space-y-3">
								{approved.map((s) => (
									<div
										key={s.id}
										className="bg-card border-border/50 relative rounded-xl border p-5"
									>
										<Pin className="absolute top-3.5 right-4 size-4 rotate-45 text-amber-400/70" />
										<div className="flex items-start justify-between gap-4 pr-5">
											<div className="min-w-0 flex-1">
												<SuggestionTypeBadge
													type={s.type}
												/>
												<p className="mt-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
													{s.description}
												</p>
											</div>
										</div>
										<div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
											{s.user.profilePicture ? (
												<Image
													src={s.user.profilePicture}
													alt={s.user.username}
													width={18}
													height={18}
													className="rounded-full"
												/>
											) : (
												<HiUserCircle className="size-[18px]" />
											)}
											<span>{s.user.username}</span>
											<span className="text-muted-foreground/50">
												·
											</span>
											<span>
												{formatDistanceToNow(
													new Date(s.createdAt),
													{ addSuffix: true }
												)}
											</span>
										</div>
									</div>
								))}
							</div>

							{/* Pagination */}
							{approvedPagination &&
								approvedPagination.total_pages > 1 && (
									<div className="mt-6 flex items-center justify-center gap-3">
										<button
											onClick={() =>
												setApprovedPage((p) =>
													Math.max(1, p - 1)
												)
											}
											disabled={approvedPage <= 1}
											className="rounded-lg border border-border/60 px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
										>
											Previous
										</button>
										<span className="text-[13px] text-muted-foreground">
											Page {approvedPage} of{" "}
											{approvedPagination.total_pages}
										</span>
										<button
											onClick={() =>
												setApprovedPage((p) => p + 1)
											}
											disabled={
												approvedPage >=
												approvedPagination.total_pages
											}
											className="rounded-lg border border-border/60 px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
										>
											Next
										</button>
									</div>
								)}
						</>
					)}
				</div>
			</div>
		</>
	);
}
