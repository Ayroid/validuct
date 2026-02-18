"use client";

import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import {
	HiArrowPath,
	HiChevronLeft,
	HiChevronRight,
	HiLightBulb,
	HiArrowUp,
	HiArrowDown,
	HiCalendar,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { User, UserType } from "@/types";

type UserSort = "newest" | "oldest" | "most_ideas" | "least_ideas";

const USER_TABS: { label: string; value: UserType | "ALL" }[] = [
	{ label: "All",        value: "ALL" },
	{ label: "Real Users", value: "REAL" },
	{ label: "Dummy",      value: "DUMMY" },
];

export default function AdminUsersPage() {
	const [total, setTotal]           = useState(0);
	const [page, setPage]             = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [users, setUsers]           = useState<User[]>([]);
	const [loading, setLoading]       = useState(true);
	const [activeTab, setActiveTab]   = useState<UserType | "ALL">("ALL");
	const [sort, setSort]             = useState<UserSort>("newest");

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		try {
			const userType = activeTab === "ALL" ? undefined : activeTab;
			const result = await adminApi.getAllUsers(page, 20, userType, sort);
			setUsers(result.users);
			setTotalPages(result.pagination.total_pages || 1);
			setTotal(result.pagination.total);
		} catch {
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	}, [page, activeTab, sort]);

	useEffect(() => { fetchUsers(); }, [fetchUsers]);

	const handleTabChange  = (value: UserType | "ALL") => { setActiveTab(value); setPage(1); };
	const handleSortChange = (value: UserSort)         => { setSort(value);      setPage(1); };

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Users</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{total} total user{total !== 1 ? "s" : ""}
					</p>
				</div>
				<Button variant="ghost" size="icon-sm" onClick={fetchUsers} disabled={loading}>
					<HiArrowPath className={loading ? "animate-spin" : ""} />
				</Button>
			</div>

			{/* Filter + Sort row */}
			<div className="mt-6 flex flex-wrap items-center gap-3">
				{/* Type tabs */}
				<div className="border-border/50 bg-muted/30 flex gap-1 rounded-lg border p-1">
					{USER_TABS.map((tab) => (
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

				{/* Sort controls */}
				<div className="ml-auto flex items-center gap-2">
					<div className="flex items-center gap-1">
						<button onClick={() => handleSortChange("most_ideas")} title="Most ideas first"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "most_ideas" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiLightBulb className="h-3.5 w-3.5" /><HiArrowUp className="h-3 w-3" />
						</button>
						<button onClick={() => handleSortChange("least_ideas")} title="Fewest ideas first"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "least_ideas" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiLightBulb className="h-3.5 w-3.5" /><HiArrowDown className="h-3 w-3" />
						</button>
					</div>
					<div className="flex items-center gap-1">
						<button onClick={() => handleSortChange("newest")} title="Newest first"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "newest" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiCalendar className="h-3.5 w-3.5" /><HiArrowUp className="h-3 w-3" />
						</button>
						<button onClick={() => handleSortChange("oldest")} title="Oldest first"
							className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${sort === "oldest" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}>
							<HiCalendar className="h-3.5 w-3.5" /><HiArrowDown className="h-3 w-3" />
						</button>
					</div>
				</div>
			</div>

			{/* Users List */}
			<div className="mt-6 space-y-3">
				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="bg-card rounded-xl border p-5">
								<div className="flex items-center gap-4">
									<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-1/4 rounded" />
										<Skeleton className="h-3 w-1/3 rounded" />
									</div>
									<div className="hidden space-y-1.5 sm:block">
										<Skeleton className="h-3 w-16 rounded" />
										<Skeleton className="h-3 w-20 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : users.length === 0 ? (
					<div className="border-border/50 bg-card rounded-xl border p-12 text-center">
						<p className="text-muted-foreground text-sm">No users found</p>
					</div>
				) : (
					users.map((user) => (
						<div key={user.id} className="border-border/50 bg-card hover:border-border rounded-xl border p-5 transition-colors">
							<div className="flex items-center gap-4">
								{/* Avatar */}
								{user.profilePicture ? (
									<Image src={user.profilePicture} alt={user.username}
										width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
								) : (
									<div className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium">
										{user.username[0]?.toUpperCase()}
									</div>
								)}

								{/* Username + email */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<Link href={`/${user.username}`} target="_blank"
											className="text-foreground text-sm font-semibold hover:underline">
											{user.username}
										</Link>
										{user.isAdmin && (
											<span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
												Admin
											</span>
										)}
									</div>
									<p className="text-muted-foreground mt-0.5 truncate text-xs">{user.email}</p>
								</div>

								{/* Stats */}
								<div className="flex shrink-0 items-center gap-5">
									<div className="flex items-center gap-1.5">
										<HiLightBulb className={`h-3.5 w-3.5 ${sort === "most_ideas" || sort === "least_ideas" ? "text-primary" : "text-muted-foreground"}`} />
										<span className="text-foreground text-sm font-medium">{user.ideasCount ?? 0}</span>
										<span className="text-muted-foreground text-xs">idea{(user.ideasCount ?? 0) !== 1 ? "s" : ""}</span>
									</div>
									<div className={`text-xs ${sort === "newest" || sort === "oldest" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
										{new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
									</div>
								</div>
							</div>
						</div>
					))
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
	);
}
