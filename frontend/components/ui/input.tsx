import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-11 w-full min-w-0 rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors",
				"placeholder:text-muted-foreground",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
				"disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
				"aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
				"file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
