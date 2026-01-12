import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"border-input bg-background flex h-11 w-full min-w-0 rounded-lg border px-4 py-2 text-sm transition-colors",
				"placeholder:text-muted-foreground",
				"focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:outline-none",
				"disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-1",
				"file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
