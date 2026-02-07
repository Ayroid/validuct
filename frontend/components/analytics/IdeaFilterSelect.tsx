"use client";

import { IdeaAnalytics } from "@/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface IdeaFilterSelectProps {
	ideas: IdeaAnalytics[];
	selectedIdeaId: string | null;
	onSelect: (id: string | null) => void;
}

export default function IdeaFilterSelect({
	ideas,
	selectedIdeaId,
	onSelect,
}: IdeaFilterSelectProps) {
	if (ideas.length === 0) return null;

	return (
		<Select
			value={selectedIdeaId ?? "all"}
			onValueChange={(value) => onSelect(value === "all" ? null : value)}
		>
			<SelectTrigger className="w-[260px] bg-card border-border/50 rounded-lg">
				<SelectValue placeholder="All Ideas" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Ideas</SelectItem>
				{ideas.map((idea) => (
					<SelectItem key={idea.id} value={idea.id}>
						{idea.heading}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
