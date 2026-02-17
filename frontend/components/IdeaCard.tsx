import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IdeaCardProps } from "@/types";
import { formatDistanceToNow } from "date-fns";
import VoteButtons from "./VoteButtons";
import PinButton from "./PinButton";
import { HiUserCircle } from "react-icons/hi2";
import { MessageSquareMore, Clock } from "lucide-react";
import ShareButton from "./ShareButton";
import { STATUS_BADGE_CONFIG } from "@/lib/config";

export default function IdeaCard({
	idea,
	showPinButton = false,
	onPinChange,
}: IdeaCardProps) {
	const router = useRouter();

	const getStatusBadgeStyles = (status: string) => STATUS_BADGE_CONFIG[status]?.className || STATUS_BADGE_CONFIG.DRAFT.className;
	const formatStatus = (status: string) => STATUS_BADGE_CONFIG[status]?.label || "Draft";

	const handleCardClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			!target.closest("a") &&
			!target.closest("button") &&
			!target.closest("[data-no-navigate]")
		) {
			router.push(`/idea/${idea.id}`);
		}
	};

	return (
		<article
			className="group dark:bg-card border-border/50 shadow-card hover:shadow-card-hover hover:border-border cursor-pointer overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
			onClick={handleCardClick}
		>
			{/* Top Meta Row: Avatar + Username + Time + Status */}
			<div className="bg-muted/80 dark:bg-muted/30 flex items-center justify-between gap-3 px-6 py-3">
				<div className="flex min-w-0 items-center gap-2 text-xs">
					<Link
						href={`/${idea.user.username}`}
						className="hover:text-foreground flex shrink-0 items-center gap-1.5 transition-colors"
						onClick={(e) => e.stopPropagation()}
					>
						{idea.user.profilePicture ? (
							<Image
								src={idea.user.profilePicture}
								alt={idea.user.username}
								width={22}
								height={22}
								className="rounded-full"
							/>
						) : (
							<HiUserCircle className="text-muted-foreground h-5.5 w-5.5" />
						)}
						<span className="font-medium hover:text-primary transition-colors">
							{idea.user.username}
						</span>
					</Link>
					<span className="text-muted-foreground/50">·</span>
					<span className="flex items-center gap-1 text-muted-foreground">
						<Clock className="h-3 w-3" />
						{formatDistanceToNow(new Date(idea.createdAt), {
							addSuffix: false,
						}).replace(/^(about|over|almost) /, "")}
					</span>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					{showPinButton && (
						<PinButton
							ideaId={idea.id}
							ideaUserId={idea.userId}
							initialIsPinned={idea.isPinned}
							onPinChange={onPinChange}
						/>
					)}
					<span
						className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyles(
							idea.status
						)}`}
					>
						{formatStatus(idea.status)}
					</span>
				</div>
			</div>

			{/* Separator */}
			<div className="border-border/40 border-t" />

			{/* Middle: Title & Description */}
			<div className="px-6 py-5">
				<h2 className="text-foreground line-clamp-2 text-base leading-snug font-semibold sm:text-lg">
					{idea.heading}
				</h2>
				<p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
					{idea.description}
				</p>
			</div>

			{/* Bottom Action Bar */}
			<div className="flex items-center gap-3 px-6 pb-2.5 text-xs">
				<VoteButtons
					ideaId={idea.id}
					initialUpvotesCount={idea.upvotesCount}
					initialDownvotesCount={idea.downvotesCount}
					initialUserVote={idea.userVote}
					orientation="horizontal"
				/>
				<button
					onClick={(e) => {
						e.stopPropagation();
						router.push(`/idea/${idea.id}#comments`);
					}}
					className="text-muted-foreground bg-muted/60 hover:bg-muted flex cursor-pointer flex-row items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-150"
				>
					<MessageSquareMore className="h-3.5 w-3.5" />
					<span className="font-mono">{idea.commentsCount}</span>
				</button>
				<ShareButton
					idea={idea}
					size={null}
					showLabel={true}
					variant="ghost"
					className="text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground h-auto cursor-pointer gap-1.5 rounded-full px-4 py-2 text-xs transition-colors duration-150"
				/>
			</div>
		</article>
	);
}
