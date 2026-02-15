"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ideasApi } from "@/lib/api/ideas";
import { IdeaStatus } from "@/types";
import { HiSparkles, HiArrowLeft } from "react-icons/hi2";
import { useNavBack } from "@/hooks/useNavBack";
import ValidationProcessFlow from "@/components/analytics/ValidationProcessFlow";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Status = keyof IdeaStatus;

export default function NewIdeaPage() {
	const router = useRouter();
	const back = useNavBack();
	const { status } = useSession();
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		heading: "",
		description: "",
		status: "DRAFT" as Status,
		launchedLink: "",
	});

	if (status === "loading") {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setSubmitting(true);
			await ideasApi.createIdea({
				heading: formData.heading,
				description: formData.description,
				status: formData.status,
				launchedLink: formData.launchedLink || undefined,
			});

			router.push("/home");
		} catch (error) {
			console.error("Failed to create idea:", error);
			alert("Failed to create idea. Please try again.");
		} finally {
			setSubmitting(false);
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
		<div>
			{/* Sticky header */}
			<div className="bg-background/85 sticky top-0 z-10 backdrop-blur-lg">
				<div className="flex items-center gap-3 px-4 py-3">
					<button
						onClick={() => back()}
						className="text-foreground hover:bg-muted -ml-1 cursor-pointer rounded-full p-1 transition-colors"
					>
						<HiArrowLeft className="h-5 w-5" />
					</button>
					<h1 className="text-foreground text-lg font-bold">New Idea</h1>
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="px-4 py-6 sm:px-6">
				{/* Form */}
				<div className="bg-card rounded-xl border p-8 md:p-10">
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Heading */}
						<div className="space-y-2">
							<Label htmlFor="heading" className="text-sm font-semibold">
								Idea title <span className="text-red-500">*</span>
							</Label>
							<p className="text-muted-foreground text-xs">
								Give your idea a clear, catchy name.
							</p>
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
							<div className="text-muted-foreground text-right text-xs">
								{formData.heading.length}/100
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description" className="text-sm font-semibold">
								Description <span className="text-red-500">*</span>
							</Label>
							<p className="text-muted-foreground text-xs">
								What problem does it solve and who is it for?
							</p>
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
							<div className="text-muted-foreground text-right text-xs">
								{formData.description.length}/500
							</div>
						</div>

						{/* Status */}
						<div className="space-y-3">
							<Label className="text-sm font-semibold">Current status</Label>
							<p className="text-muted-foreground text-xs">
								Where is this idea in your journey?
							</p>
							<ValidationProcessFlow
								editable
								currentStatus={formData.status}
								onStatusChange={(s) =>
									setFormData({ ...formData, status: s })
								}
							/>
						</div>

						{/* Launched Link */}
						{(formData.status === "LAUNCHED" || formData.status === "WIP") && (
							<div className="animate-in fade-in slide-in-from-top-2 space-y-2 duration-200">
								<Label htmlFor="launchedLink" className="text-sm font-semibold">
									Project Link
									{formData.status === "LAUNCHED" && (
										<span className="text-muted-foreground ml-1 font-normal">(optional)</span>
									)}
								</Label>
								<p className="text-muted-foreground text-xs">
									Share a link to your live project or repo.
								</p>
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
						<div className="space-y-4 pt-3">
							<div className="flex gap-3">
								<Button
									type="button"
									variant="outline"
									className="flex-1 cursor-pointer transition-colors"
									size="lg"
									onClick={() => back()}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										submitting || !formData.heading || !formData.description
									}
									className="flex-1 cursor-pointer transition-colors"
									size="lg"
								>
									{submitting ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
