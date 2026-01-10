import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
	className,
	size = "default",
	...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
	return (
		<div
			data-slot="card"
			data-size={size}
			className={cn(
				"bg-card text-card-foreground group/card flex flex-col gap-6 overflow-hidden rounded-xl border border-border/50 p-6 shadow-card transition-all",
				"data-[size=sm]:gap-4 data-[size=sm]:p-4",
				className
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"@container/card-header grid auto-rows-min items-start gap-2",
				"has-data-[slot=card-action]:grid-cols-[1fr_auto]",
				"has-data-[slot=card-description]:grid-rows-[auto_auto]",
				"[.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
				className
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn(
				"text-base font-semibold leading-tight tracking-tight",
				"group-data-[size=sm]/card:text-sm",
				className
			)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn(
				"text-muted-foreground text-sm leading-relaxed",
				className
			)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className
			)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				"flex items-center gap-4 border-t border-border/50 pt-6",
				"group-data-[size=sm]/card:pt-4",
				className
			)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
};
