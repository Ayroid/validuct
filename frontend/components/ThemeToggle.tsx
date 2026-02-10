"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";

	return (
		<div className="flex items-center gap-2">
			<Sun className="text-muted-foreground h-4 w-4" />
			<Switch
				checked={isDark}
				onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
				size="sm"
				aria-label="Toggle theme"
			/>
			<Moon className="text-muted-foreground h-4 w-4" />
		</div>
	);
};

export default ThemeToggle;
