import Link from "next/link";
import Image from "next/image";
import { HiUserCircle } from "react-icons/hi2";
import { auth } from "@/auth";

const Navbar = async () => {
	const session = await auth();

	return (
		<div className="sticky top-0 z-50">
			<div className="max-w-5xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between bg-white rounded-full px-6 py-3 shadow-sm">
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
							<div className="flex flex-col leading-tight justify-center">
								<h1 className="text-xl font-bold text-gray-900">VALIDUCT</h1>
							</div>
						</div>
					</Link>
					<div className="flex-1 flex justify-end">
						{session?.user ? (
							<Link
								href={`/${session.user.username}`}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors"
								title="Profile"
							>
								{session.user.profilePicture ? (
									<Image
										src={session.user.profilePicture}
										alt="User Avatar"
										width={32}
										height={32}
										className="rounded-full"
									/>
								) : (
									<HiUserCircle className="h-8 w-8 text-gray-600" />
								)}
							</Link>
						) : (
							<Link
								href="/login"
								className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
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
