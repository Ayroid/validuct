"use client";

import { useState } from "react";
import { Idea } from "@/types";
import {
	formatShareContent,
	getTwitterShareUrl,
	copyToClipboard,
	openShareWindow,
} from "@/lib/share";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FaXTwitter } from "react-icons/fa6";
import { IoShareSocial, IoCheckmarkCircle } from "react-icons/io5";
import { HiLink } from "react-icons/hi2";

interface ShareButtonProps {
	idea: Idea;
	variant?: "default" | "ghost" | "outline";
	size?: "default" | "sm" | "lg" | "icon";
	showLabel?: boolean;
	className?: string;
}

export default function ShareButton({
	idea,
	variant = "ghost",
	size = "sm",
	showLabel = true,
	className = "",
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
				<Button variant={variant} size={size} className={className}>
					<IoShareSocial className="h-4 w-4" />
					{showLabel && <span className="ml-2">Share</span>}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<div className="px-2 py-1.5">
					<p className="text-sm font-semibold">Share this idea</p>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => handleShare("twitter")}
					className="cursor-pointer"
				>
					<FaXTwitter className="mr-3 h-4 w-4" />
					<span>Share on X</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
					{copied ? (
						<IoCheckmarkCircle className="mr-3 h-4 w-4 text-green-500" />
					) : (
						<HiLink className="mr-3 h-4 w-4" />
					)}
					<span>{copied ? "Link copied!" : "Copy link"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
