"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiSun, HiMoon, HiComputerDesktop } from "react-icons/hi2";

const themeOptions = [
	{
		value: "light",
		label: "Light",
		description: "Always use light mode",
		icon: HiSun,
		activeColor: "border-amber-500 bg-amber-500/5",
		iconActiveColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		textActiveColor: "text-amber-700 dark:text-amber-400",
	},
	{
		value: "dark",
		label: "Dark",
		description: "Always use dark mode",
		icon: HiMoon,
		activeColor: "border-purple-500 bg-purple-500/5",
		iconActiveColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
		textActiveColor: "text-purple-700 dark:text-purple-400",
	},
	{
		value: "system",
		label: "System",
		description: "Match your device settings",
		icon: HiComputerDesktop,
		activeColor: "border-blue-500 bg-blue-500/5",
		iconActiveColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		textActiveColor: "text-blue-700 dark:text-blue-400",
	},
];

export default function AppearanceSettingsPage() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-foreground text-lg font-semibold">Appearance</h2>
			<p className="text-muted-foreground mt-1 text-sm">
				Choose how Validuct looks to you.
			</p>

			<div className="mt-6 space-y-2">
				{themeOptions.map((option) => {
					const Icon = option.icon;
					const isSelected = theme === option.value;
					return (
						<button
							key={option.value}
							onClick={() => setTheme(option.value)}
							className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
								isSelected
									? "border-primary bg-primary/5"
									: "border-border/50 hover:bg-muted/50"
							}`}
						>
							<div
								className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
									isSelected
										? "bg-primary/10 text-primary"
										: "bg-muted text-muted-foreground"
								}`}
							>
								<Icon className="h-5 w-5" />
							</div>
							<div className="min-w-0 flex-1">
								<div
									className={`text-sm font-medium ${
										isSelected ? "text-primary" : "text-foreground"
									}`}
								>
									{option.label}
								</div>
								<div className="text-muted-foreground text-xs">
									{option.description}
								</div>
							</div>
							<div
								className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
									isSelected
										? "border-primary"
										: "border-muted-foreground/30"
								}`}
							>
								{isSelected && (
									<div className="h-2.5 w-2.5 rounded-full bg-primary" />
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
