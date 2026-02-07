import { APP_URL } from "./constants";
import { Idea } from "@/types";

/**
 * Formats idea content for sharing
 */
export const formatShareContent = (idea: Idea): ShareContent => {
	const ideaUrl = `${APP_URL}/idea/${idea.id}`;
	const authorHandle = `@${idea.user.username}`;

	// Truncate description if too long for tweets
	const shortDescription =
		idea.description.length > 100
			? idea.description.substring(0, 97) + "..."
			: idea.description;

	return {
		title: idea.heading,
		description: idea.description,
		shortDescription,
		url: ideaUrl,
		author: idea.user.username,
		authorHandle,
	};
};

export interface ShareContent {
	title: string;
	description: string;
	shortDescription: string;
	url: string;
	author: string;
	authorHandle: string;
}

/**
 * Generate Twitter/X share URL
 * Character limit: 280 characters
 */
export const getTwitterShareUrl = (content: ShareContent): string => {
	const text = `💡 ${content.title}

${content.shortDescription}

I've shared this idea on @validuct — check it out and let me know what you think!`;

	const params = new URLSearchParams({
		text,
		url: content.url,
	});

	return `https://twitter.com/intent/tweet?${params.toString()}`;
};

/**
 * Generate LinkedIn share URL
 */
export const getLinkedInShareUrl = (content: ShareContent): string => {
	const text = `💡 ${content.title}

${content.shortDescription}

I've shared this idea on Validuct — check it out and share your feedback!

${content.url}`;

	const params = new URLSearchParams({ text });

	return `https://www.linkedin.com/feed/?shareActive=true&${params.toString()}`;
};

/**
 * Generate Reddit share URL
 */
export const getRedditShareUrl = (content: ShareContent): string => {
	const params = new URLSearchParams({
		url: content.url,
		title: `💡 ${content.title} — ${content.shortDescription} | Shared on Validuct, would love your feedback!`,
	});

	return `https://reddit.com/submit?${params.toString()}`;
};

/**
 * Copy link to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback for older browsers
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.left = "-999999px";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			document.execCommand("copy");
			document.body.removeChild(textArea);
			return true;
		} catch (err) {
			document.body.removeChild(textArea);
			console.error("Failed to copy:", err);
			return false;
		}
	}
};

/**
 * Open share URL in a new tab (full screen)
 */
export const openShareWindow = (url: string) => {
	window.open(url, "_blank", "noopener,noreferrer");
};
