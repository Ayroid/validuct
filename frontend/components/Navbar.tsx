import Link from "next/link";
import Image from "next/image";
import { HiUserCircle } from "react-icons/hi2";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { auth } from "@/auth";

const Navbar = async () => {
	const session = await auth();

	return (
		<header className="border-border bg-background/85 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 sm:px-8">
				<Link
					href="/home"
					className="flex items-center justify-center gap-2.5 transition-opacity hover:opacity-80"
				>
					<Image
						src="/logo.png"
						alt="Validuct Logo"
						width={28}
						height={28}
						className="object-contain"
					/>
					<span className="text-primary text-[15px] font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-geist)' }}>
						Validuct
					</span>
				</Link>

				<div className="flex items-center gap-2">
					<ThemeToggle />

					{session?.user && <NotificationBell />}

					{session?.user ? (
						<Link
							href={`/${session.user.username}`}
							className="hover:bg-muted rounded-full p-1 transition-colors"
							title="Profile"
						>
							{session.user.profilePicture ? (
								<Image
									src={session.user.profilePicture}
									alt="User Avatar"
									width={30}
									height={30}
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
			</div>
		</header>
	);
};

export default Navbar;
