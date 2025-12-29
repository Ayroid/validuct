"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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

export default function EditIdeaPage() {
	const params = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [idea, setIdea] = useState<Idea | null>(null);
	const [formData, setFormData] = useState({
		heading: "",
		description: "",
		status: "DRAFT" as IdeaStatus,
		launchedLink: "",
		isPrivate: false,
	});

	useEffect(() => {
		// Redirect to login if not authenticated
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (params.id && status === "authenticated") {
			loadIdea();
		}
	}, [params.id, status]);

	const loadIdea = async () => {
		try {
			setLoading(true);
			const data = await ideasApi.getIdeaById(params.id as string);

			// Check if user owns this idea
			if (data.userId !== session?.user?.id) {
				alert("You do not have permission to edit this idea");
				router.push(`/idea/${params.id}`);
				return;
			}

			setIdea(data);
			setFormData({
				heading: data.heading,
				description: data.description,
				status: data.status,
				launchedLink: data.launchedLink || "",
				isPrivate: data.isPrivate ?? false,
			});
		} catch (error) {
			console.error("Failed to load idea:", error);
			router.push("/");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setSubmitting(true);
			await ideasApi.updateIdea(params.id as string, {
				heading: formData.heading,
				description: formData.description,
				status: formData.status,
				launchedLink: formData.launchedLink || undefined,
				isPrivate: formData.isPrivate,
			});

			router.push(`/idea/${params.id}`);
		} catch (error) {
			console.error("Failed to update idea:", error);
			alert("Failed to update idea. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this idea? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			await ideasApi.deleteIdea(params.id as string);
			router.push("/");
		} catch (error) {
			console.error("Failed to delete idea:", error);
			alert("Failed to delete idea. Please try again.");
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

	if (loading || status === "loading") {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!idea) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-2xl mx-auto px-4 py-12">
				{/* Header */}
				<div className="mb-10">
					<Link
						href={`/idea/${params.id}`}
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
					<h1 className="text-3xl font-bold mb-2">
						Edit your idea
					</h1>
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
								maxLength={200}
								placeholder="A tool that helps..."
							/>
							<div className="text-xs text-gray-400 text-right">
								{formData.heading.length}/200
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
								placeholder="Describe your idea, the problem it solves, and who it's for..."
								className="resize-none"
							/>
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
										variant={formData.status === option.value ? 'default' : 'outline'}
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

						{/* Privacy Toggle */}
						<div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
							<div className="flex-1">
								<Label htmlFor="isPrivate" className="text-base cursor-pointer">
									Make this idea private
								</Label>
								<p className="text-sm text-gray-500">
									{formData.isPrivate
										? "Only you can see this idea"
										: "Visible to everyone"}
								</p>
							</div>
							<Switch
								id="isPrivate"
								checked={formData.isPrivate}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, isPrivate: checked })
								}
							/>
						</div>

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
									<Link href={`/idea/${params.id}`}>
										Cancel
									</Link>
								</Button>
								<Button
									type="submit"
									disabled={
										submitting || !formData.heading || !formData.description
									}
									className="flex-1"
									size="lg"
								>
									{submitting ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											<span>Updating...</span>
										</>
									) : (
										<>
											<HiPencil className="h-4 w-4" />
											<span>Update</span>
										</>
									)}
								</Button>
							</div>

							{/* Delete Button */}
							<Button
								type="button"
								variant="destructive"
								onClick={handleDelete}
								className="w-full"
							>
								<HiTrash className="h-4 w-4" />
								<span>Delete idea</span>
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
