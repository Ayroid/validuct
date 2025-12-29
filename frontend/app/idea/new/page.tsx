"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ideasApi } from "@/lib/api/ideas";
import { HiSparkles } from "react-icons/hi2";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type IdeaStatus = "DRAFT" | "VALIDATED" | "WIP" | "LAUNCHED";

const statusOptions: {
	value: IdeaStatus;
	label: string;
	emoji: string;
	color: string;
}[] = [
	{
		value: "DRAFT",
		label: "Draft",
		emoji: "✏️",
		color: "bg-muted text-foreground hover:bg-muted/80",
	},
	{
		value: "VALIDATED",
		label: "Validated",
		emoji: "✅",
		color: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40",
	},
	{
		value: "WIP",
		label: "Work in Progress",
		emoji: "🚧",
		color: "bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/40",
	},
	{
		value: "LAUNCHED",
		label: "Launched",
		emoji: "🚀",
		color: "bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40",
	},
];

export default function NewIdeaPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		heading: "",
		description: "",
		status: "DRAFT" as IdeaStatus,
		launchedLink: "",
	});

	// Redirect to login if not authenticated
	if (status === "unauthenticated") {
		router.push("/login");
		return null;
	}

	if (status === "loading") {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setLoading(true);
			const idea = await ideasApi.createIdea({
				heading: formData.heading,
				description: formData.description,
				status: formData.status,
				launchedLink: formData.launchedLink || undefined,
			});

			router.push(`/idea/${idea.id}`);
		} catch (error) {
			console.error("Failed to create idea:", error);
			alert("Failed to create idea. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-2xl mx-auto px-4 py-12">
				{/* Header */}
				<div className="mb-10">
					<Link
						href="/home"
						className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-8 text-sm"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						<span>BACK</span>
					</Link>
					<h1 className="text-3xl font-bold mb-2">What&apos;s your idea?</h1>
				</div>

				{/* Form */}
				<div className="bg-card border rounded-lg p-8 md:p-10">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Heading */}
						<div className="space-y-2">
							<Label htmlFor="heading">
								Idea title <span className="text-red-500">*</span>
							</Label>
							<Input
								type="text"
								id="heading"
								name="heading"
								value={formData.heading}
								onChange={handleChange}
								required
								maxLength={100}
								placeholder="A tool that helps..."
							/>
							<div className="text-xs text-gray-400 text-right">
								{formData.heading.length}/100
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">
								Description <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								required
								rows={8}
								maxLength={500}
								placeholder="Describe your idea, the problem it solves, and who it's for..."
								className="resize-none"
							/>
							<div className="text-xs text-gray-400 text-right">
								{formData.description.length}/500
							</div>	
						</div>

						{/* Status */}
						<div className="space-y-3">
							<Label>Current status</Label>
							<div className="grid grid-cols-2 gap-3">
								{statusOptions.map((option) => (
									<Button
										key={option.value}
										type="button"
										onClick={() =>
											setFormData({ ...formData, status: option.value })
										}
										variant={
											formData.status === option.value ? "default" : "outline"
										}
										className="justify-start"
									>
										<span className="mr-2">{option.emoji}</span>
										{option.label}
									</Button>
								))}
							</div>
						</div>

						{/* Launched Link */}
						{(formData.status === "LAUNCHED" || formData.status === "WIP") && (
							<div className="space-y-2">
								<Label htmlFor="launchedLink">
									{formData.status === "LAUNCHED"
										? "Project link"
										: "Work in progress link"}
									{formData.status === "LAUNCHED" && (
										<span className="text-gray-400 ml-1">(optional)</span>
									)}
								</Label>
								<Input
									type="url"
									id="launchedLink"
									name="launchedLink"
									value={formData.launchedLink}
									onChange={handleChange}
									placeholder="https://your-project.com"
								/>
							</div>
						)}

						{/* Action Buttons */}
						<div className="space-y-4">
							<div className="flex gap-3">
								<Button
									type="button"
									variant="outline"
									className="flex-1"
									size="lg"
									asChild
								>
									<Link
										href="/home"
										className="block text-center text-sm"
									>
										Cancel
									</Link>
								</Button>
								<Button
									type="submit"
									disabled={
										loading || !formData.heading || !formData.description
									}
									className="flex-1"
									size="lg"
								>
									{loading ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											<span>Sharing...</span>
										</>
									) : (
										<>
											<HiSparkles className="h-5 w-5" />
											<span>Share idea</span>
										</>
									)}
								</Button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
