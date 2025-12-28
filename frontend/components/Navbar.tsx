import Link from "next/link";
import Image from "next/image";
import { HiUserCircle } from "react-icons/hi2";

const Navbar = () => {
	return (
		<div className="bg-[#eeeeee] sticky top-0 z-50">
			<div className="max-w-5xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between bg-white rounded-full px-6 py-3 shadow-sm">
					<div className="flex-1"></div>
					<div className="flex items-center gap-3">
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
								<p className="text-xs text-gray-500">
									Validate your ideas to create successful products
								</p>
							</div>
						</div>
					</div>
					<div className="flex-1 flex justify-end">
						<Link
							href="/settings/profile"
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
							title="Profile"
						>
							<HiUserCircle className="h-8 w-8 text-gray-700" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
