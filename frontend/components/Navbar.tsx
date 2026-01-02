import Link from "next/link";
import Image from "next/image";
import { HiUserCircle } from "react-icons/hi2";
import ThemeToggle from "@/components/ThemeToggle";
import { auth } from "@/auth";

const Navbar = async () => {
	const session = await auth();

	return (
		<div className="sticky top-0 z-50">
			<div className="mx-auto max-w-5xl px-6 py-4">
				<div className="bg-card flex items-center justify-between rounded-full border px-6 py-3 shadow-sm">
					<Link
						href={session?.user ? "/home" : "/landing"}
						className="flex items-center gap-3"
					>
						<div className="flex items-center gap-3">
							<Image
								src="/logo.svg"
								alt="Validuct Logo"
								width={40}
								height={40}
								className="object-contain"
							/>
							<div className="flex flex-col justify-center leading-tight">
								<h1 className="text-foreground text-xl font-bold">VALIDUCT</h1>
							</div>
						</div>
					</Link>

					<div className="flex flex-1 items-center justify-end gap-2">
						<ThemeToggle />

						{session?.user ? (
							<Link
								href={`/${session.user.username}`}
								className="hover:bg-muted rounded-full p-2 transition-colors"
								title="Profile"
							>
								{session.user.profilePicture ? (
									<Image
										src={session.user.profilePicture}
										alt="User Avatar"
										width={32}
										height={32}
										className="h-8 w-8 rounded-full object-cover"
									/>
								) : (
									<HiUserCircle className="text-muted-foreground h-8 w-8" />
								)}
							</Link>
						) : (
							<Link
								href="/login"
								className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 py-2 font-medium transition-colors"
							>
								Sign In
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
