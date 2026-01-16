import Link from "next/link";
import Image from "next/image";
import { HiUserCircle } from "react-icons/hi2";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { auth } from "@/auth";

const Navbar = async () => {
	const session = await auth();

	return (
		<header className="sticky top-0 z-50 w-full">
			<div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
				<nav className="bg-card/95 border-border/50 shadow-card flex items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-sm sm:px-6">
					<Link
						href={session?.user ? "/home" : "/landing"}
						className="flex items-center gap-3 transition-opacity hover:opacity-80"
					>
						<Image
							src="/logo.png"
							alt="Validuct Logo"
							width={36}
							height={36}
							className="object-contain"
						/>
						<span className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
							VALIDUCT
						</span>
					</Link>

					<div className="flex items-center gap-2">
						<ThemeToggle />

						{session?.user && <NotificationBell />}

						{session?.user ? (
							<Link
								href={`/${session.user.username}`}
								className="hover:bg-muted rounded-full p-1.5 transition-colors"
								title="Profile"
							>
								{session.user.profilePicture ? (
									<Image
										src={session.user.profilePicture}
										alt="User Avatar"
										width={32}
										height={32}
										className="ring-border h-8 w-8 rounded-full object-cover ring-2"
									/>
								) : (
									<HiUserCircle className="text-muted-foreground h-8 w-8" />
								)}
							</Link>
						) : (
							<Link
								href="/signin"
								className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
							>
								Sign In
							</Link>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
