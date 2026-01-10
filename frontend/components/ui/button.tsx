import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 select-none",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
				secondary:
					"bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 active:scale-[0.98]",
				outline:
					"border border-border bg-background hover:bg-muted hover:text-foreground active:scale-[0.98]",
				ghost:
					"hover:bg-muted hover:text-foreground active:scale-[0.98]",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
				link: "text-primary underline-offset-4 hover:underline",
				accent:
					"bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:scale-[0.98]",
			},
			size: {
				xs: "h-7 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 rounded-md px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
				default: "h-10 rounded-lg px-4 text-sm",
				lg: "h-11 rounded-lg px-5 text-base",
				xl: "h-12 rounded-xl px-6 text-base",
				icon: "size-10 rounded-lg",
				"icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
				"icon-lg": "size-11 rounded-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
