import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"border-input bg-background flex min-h-24 w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors",
				"placeholder:text-muted-foreground",
				"focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:outline-none",
				"disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-1",
				className
			)}
			{...props}
		/>
	);
}

export { Textarea };
