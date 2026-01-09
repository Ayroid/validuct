import { SignInForm } from "@/components/SignInForm";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
	return (
		<div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link
					href="/"
					className="flex items-center gap-2 self-center text-3xl font-medium"
				>
					<Image
						src="/logo.svg"
						alt="Validuct Logo"
						width={56}
						height={56}
						className="object-contain"
					/>
					Validuct
				</Link>
				<SignInForm />
			</div>
		</div>
	);
}
