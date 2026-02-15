import { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin } from "lucide-react";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";

const STATUS_BADGE: Record<string, string> = {
	DRAFT: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
	WIP: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
	VALIDATED:
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
	LAUNCHED:
		"bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
};

const STATUS_LABEL: Record<string, string> = {
	DRAFT: "Draft",
	WIP: "In Progress",
	VALIDATED: "Validated",
	LAUNCHED: "Launched",
};

interface IdeaHeroCardProps {
	heading: string;
	description: string;
	status: string;
	createdAt: string;
	isPinned?: boolean;
	launchedLink?: string | null;
	user?: {
		username: string;
		profilePicture: string | null;
	};
	children?: ReactNode;
	className?: string;
}

export default function IdeaHeroCard({
	heading,
	description,
	status,
	createdAt,
	isPinned,
	launchedLink,
	user,
	children,
	className,
}: IdeaHeroCardProps) {
	return (
		<article
			className={`bg-card border-border/50 shadow-card overflow-hidden rounded-xl border ${className ?? ""}`}
		>
			{/* Top Meta Row */}
			<div className="bg-muted/80 dark:bg-muted/30 flex items-center justify-between gap-3 px-6 py-3">
				<div className="flex min-w-0 items-center gap-2 text-xs">
					{user && (
						<>
							<Link
								href={`/${user.username}`}
								className="hover:text-foreground flex shrink-0 items-center gap-1.5 transition-colors"
							>
								{user.profilePicture ? (
									<Image
										src={user.profilePicture}
										alt={user.username}
										width={22}
										height={22}
										className="rounded-full"
									/>
								) : (
									<div className="bg-muted text-foreground flex h-5.5 w-5.5 items-center justify-center rounded-full text-[10px] font-semibold">
										{user.username
											.charAt(0)
											.toUpperCase()}
									</div>
								)}
								<span className="hover:text-primary font-medium transition-colors">
									{user.username}
								</span>
							</Link>
							<span className="text-muted-foreground/50">
								·
							</span>
						</>
					)}
					{isPinned && (
						<>
							<span className="text-primary">
								<Pin className="h-3.5 w-3.5" />
							</span>
							<span className="text-muted-foreground/50">
								·
							</span>
						</>
					)}
					<span className="text-muted-foreground">
						{formatDistanceToNow(new Date(createdAt), {
							addSuffix: false,
						}).replace(/^(about|over|almost) /, "")}
					</span>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<span
						className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? STATUS_BADGE.DRAFT}`}
					>
						{STATUS_LABEL[status] ?? status}
					</span>
					{launchedLink && (
						<Link
							href={launchedLink}
							target="_blank"
							rel="noopener noreferrer"
							className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${STATUS_BADGE.LAUNCHED} hover:opacity-80`}
						>
							Visit
							<HiArrowTopRightOnSquare className="h-3 w-3" />
						</Link>
					)}
				</div>
			</div>

			{/* Separator */}
			<div className="border-border/40 border-t" />

			{/* Content */}
			<div className="px-6 py-6">
				<h2 className="text-foreground text-xl leading-tight font-bold">
					{heading}
				</h2>
				<p className="text-foreground mt-2 leading-relaxed whitespace-pre-wrap">
					{description}
				</p>
			</div>

			{/* Footer slot */}
			{children}
		</article>
	);
}
