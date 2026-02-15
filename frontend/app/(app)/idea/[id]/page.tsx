"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/CommentSection";
import ValidationSignals from "@/components/ValidationSignals";
import IdeaWaitlist from "@/components/IdeaWaitlist";
import IdeaDetailCard from "@/components/IdeaDetailCard";
import { HiArrowLeft } from "react-icons/hi2";
import { BarChart3 } from "lucide-react";
import { useNavBack } from "@/hooks/useNavBack";

export default function IdeaDetailPage() {
	const params = useParams();
	const router = useRouter();
	const back = useNavBack();
	const { user } = useAuth();
	const ideaId = params.id as string;

	const [idea, setIdea] = useState<Idea | null>(null);
	const [loading, setLoading] = useState(true);
	const [commentsCount, setCommentsCount] = useState(0);

	useEffect(() => {
		if (ideaId) {
			loadIdea();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ideaId]);

	const loadIdea = async () => {
		try {
			setLoading(true);
			const data = await ideasApi.getIdeaById(ideaId);
			setIdea(data);
			setCommentsCount(data.commentsCount);
		} catch (error) {
			console.error("Failed to load idea:", error);
			router.push("/");
		} finally {
			setLoading(false);
		}
	};

	const handleCommentsCountChange = useCallback((count: number) => {
		setCommentsCount(count);
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
			</div>
		);
	}

	if (!idea) {
		return null;
	}

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
					<h1 className="text-foreground text-lg font-bold">Idea</h1>
					{user && user.id === idea.userId && (
						<Link
							href={`/idea/${idea.id}/analytics`}
							className="text-muted-foreground hover:bg-muted hover:text-foreground ml-auto cursor-pointer rounded-full p-1.5 transition-colors"
						>
							<BarChart3 className="h-5 w-5" />
						</Link>
					)}
				</div>
				<div className="border-border/50 border-b" />
			</div>

			<div className="px-4 py-6 sm:px-6 flex flex-col gap-5">
				{/* Hero Card */}
				<IdeaDetailCard
					ideaId={ideaId}
					commentsCount={commentsCount}
				/>

				{/* Community Validation Section */}
				<section>
					<div className="bg-card border-border/50 shadow-card rounded-xl border">
						<div className="p-5">
							<ValidationSignals ideaId={idea.id} bare />
						</div>
						<div className="border-border/40 border-t" />
						<div className="p-5">
							<IdeaWaitlist ideaId={idea.id} ideaOwnerId={idea.userId} bare />
						</div>
					</div>
				</section>

				{/* Comments Section */}
				<section>
					<div className="bg-card border-border/50 shadow-card rounded-xl border p-5 sm:p-6">
						<CommentSection
							ideaId={idea.id}
							initialCommentsCount={idea.commentsCount}
							ideaOwnerId={idea.userId}
							onCommentsCountChange={handleCommentsCountChange}
						/>
					</div>
				</section>
			</div>
		</div>
	);
}
