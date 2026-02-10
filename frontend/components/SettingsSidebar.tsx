"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
	HiBell,
	HiArrowRightOnRectangle,
	HiSwatch,
	HiQuestionMarkCircle,
	HiChevronRight,
} from "react-icons/hi2";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const settingsNav = [
	{
		label: "Notifications",
		href: "/settings/notifications",
		icon: HiBell,
	},
	{
		label: "Appearance",
		href: "/settings/appearance",
		icon: HiSwatch,
	},
];

export default function SettingsSidebar() {
	const pathname = usePathname();
	const [logoutOpen, setLogoutOpen] = useState(false);

	return (
		<aside className="flex w-full shrink-0 flex-col py-6 md:pr-6">
			<nav className="flex flex-col space-y-1">
				{settingsNav.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
								isActive
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-muted hover:text-foreground"
							}`}
						>
							<Icon className="h-5 w-5" />
							<span className="flex-1">{item.label}</span>
							<HiChevronRight className="h-4 w-4 text-muted-foreground/50 md:hidden" />
						</Link>
					);
				})}
				<button
					onClick={() =>
						window.dispatchEvent(
							new CustomEvent("validuct:open-walkthrough")
						)
					}
					className="text-muted-foreground hover:bg-muted hover:text-foreground flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
				>
					<HiQuestionMarkCircle className="h-5 w-5" />
					Walkthrough
				</button>
				</nav>
			<button
				onClick={() => setLogoutOpen(true)}
				className="text-destructive hover:bg-destructive/10 mt-auto flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
			>
				<HiArrowRightOnRectangle className="h-5 w-5" />
				Logout
			</button>

			<AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Log out?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to log out of your account?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="cursor-pointer">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => signOut({ callbackUrl: "/" })}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
						>
							Log out
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</aside>
	);
}
