"use client";

import { useState } from "react";
import {
	ShareableIdea,
	formatShareContent,
	getTwitterShareUrl,
	getLinkedInShareUrl,
	getRedditShareUrl,
	copyToClipboard,
	openShareWindow,
} from "@/lib/share";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FaXTwitter, FaLinkedinIn, FaRedditAlien } from "react-icons/fa6";
import { IoCheckmarkCircle } from "react-icons/io5";
import { Share } from "lucide-react";
import { HiLink } from "react-icons/hi2";

interface ShareButtonProps {
	idea: ShareableIdea;
	variant?: "default" | "ghost" | "outline";
	size?: "default" | "sm" | "lg" | "icon" | null;
	showLabel?: boolean;
	className?: string;
}

export default function ShareButton({
	idea,
	variant = "ghost",
	size = "sm",
	showLabel = true,
	className = "cursor-pointer transition-colors",
}: ShareButtonProps) {
	const [copied, setCopied] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const shareContent = formatShareContent(idea);

	const handleShare = (platform: string) => {
		let shareUrl = "";

		switch (platform) {
			case "twitter":
				shareUrl = getTwitterShareUrl(shareContent);
				break;
			case "linkedin":
				shareUrl = getLinkedInShareUrl(shareContent);
				break;
			case "reddit":
				shareUrl = getRedditShareUrl(shareContent);
				break;
		}

		if (shareUrl) {
			openShareWindow(shareUrl);
			setIsOpen(false);
		}
	};

	const handleCopyLink = async () => {
		const success = await copyToClipboard(shareContent.url);
		if (success) {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
				setIsOpen(false);
			}, 2000);
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant={variant} size={size ?? undefined} className={className}>
					<Share className="h-3.5 w-3.5" />
					{showLabel && <span>Share</span>}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-auto p-2">
				<div className="flex items-center gap-1">
					<button
						onClick={() => handleShare("twitter")}
						className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
					>
						<FaXTwitter className="h-4 w-4" />
					</button>
					<button
						onClick={() => handleShare("linkedin")}
						className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
					>
						<FaLinkedinIn className="h-4 w-4" />
					</button>
					<button
						onClick={() => handleShare("reddit")}
						className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
					>
						<FaRedditAlien className="h-4 w-4" />
					</button>
					<button
						onClick={handleCopyLink}
						className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
					>
						{copied ? (
							<IoCheckmarkCircle className="h-4 w-4 text-green-500" />
						) : (
							<HiLink className="h-4 w-4" />
						)}
					</button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
