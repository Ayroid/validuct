import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


type ChangeType = "feat" | "fix" | "style" | "update";

interface Change {
	type: ChangeType;
	text: string;
}

interface Version {
	version: string;
	date: string;
	changes: Change[];
}

const badgeStyles: Record<ChangeType, string> = {
	feat: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
	fix: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
	style: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
	update: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

const badgeLabels: Record<ChangeType, string> = {
	feat: "Feature",
	fix: "Fix",
	style: "Style",
	update: "Update",
};

const changelog: Version[] = [
	{
		version: "v0.6.0",
		date: "Feb 9 – 11, 2026",
		changes: [
			{ type: "feat", text: "Added changelog page" },
			{ type: "update", text: "Restructured app routes with sidebar shell" },
			{ type: "fix", text: "Fixed profile page showing 'not found' before loading" },
		],
	},
	{
		version: "v0.5.0",
		date: "Feb 7 – 8, 2026",
		changes: [
			{ type: "update", text: "Updated navbar design" },
			{ type: "fix", text: "Fixed comment helpful button state not persisting after refresh" },
			{ type: "feat", text: "Added idea selection filter to analytics" },
			{ type: "feat", text: "Added LinkedIn & Reddit share options" },
			{ type: "style", text: "Redesigned landing page with new analytics & settings pages" },
		],
	},
	{
		version: "v0.4.0",
		date: "Jan 17 – 27, 2026",
		changes: [
			{ type: "feat", text: "Added notifications system (in-app + service)" },
			{ type: "style", text: "Redesigned landing page" },
			{ type: "update", text: "Upgraded Prisma to v7.2.0" },
		],
	},
	{
		version: "v0.3.0",
		date: "Jan 9 – 13, 2026",
		changes: [
			{ type: "feat", text: "Added validation signals feature" },
			{ type: "feat", text: "Added category-based comments" },
			{ type: "feat", text: "Added idea waitlist with email notifications" },
			{ type: "feat", text: "Added social sharing (X / Twitter)" },
			{ type: "style", text: "Mobile responsiveness improvements" },
			{ type: "feat", text: "Umami analytics integration" },
			{ type: "update", text: "Rate limiting on API endpoints" },
		],
	},
	{
		version: "v0.2.0",
		date: "Jan 1 – 3, 2026",
		changes: [
			{ type: "feat", text: "Added GitHub sign-in option" },
			{ type: "feat", text: "Added Twitter / X sign-in option" },
			{ type: "update", text: "Rate limiting on API endpoints" },
			{ type: "feat", text: "Toast notifications" },
			{ type: "update", text: "Code formatting with Prettier" },
		],
	},
	{
		version: "v0.1.0",
		date: "Dec 27 – 30, 2025",
		changes: [
			{ type: "feat", text: "Initial platform launch" },
			{ type: "feat", text: "Google authentication" },
			{ type: "feat", text: "Idea creation and feed" },
			{ type: "feat", text: "Voting and commenting system (up to 5 levels deep)" },
			{ type: "feat", text: "User profiles" },
			{ type: "feat", text: "Dark / light theme support" },
			{ type: "style", text: "Landing page" },
		],
	},
];

export default function ChangeLogsPage() {
	return (
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<Link
						href="/home"
						className="text-foreground hover:bg-muted -ml-1 rounded-full p-1 transition-colors"
					>
						<HiArrowLeft className="h-5 w-5" />
					</Link>
					<h1 className="text-foreground text-lg font-bold">Changelog</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

		<main className="px-4 py-6 sm:px-6">

			{/* Version cards */}
			<div className="mt-10 space-y-6">
				{changelog.map((release) => (
					<Card key={release.version}>
						<CardHeader>
							<CardTitle className="flex items-baseline gap-3">
								<span className="font-mono text-lg">{release.version}</span>
								<span className="text-muted-foreground text-sm font-normal">
									{release.date}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{release.changes.map((change, i) => (
									<li key={i} className="flex items-start gap-3 text-sm">
										<span
											className={`mt-0.5 inline-flex w-[52px] shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${badgeStyles[change.type]}`}
										>
											{badgeLabels[change.type]}
										</span>
										<span className="text-foreground">{change.text}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				))}
			</div>
		</main>
		</div>
	);
}
