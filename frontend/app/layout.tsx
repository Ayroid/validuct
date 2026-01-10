import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Slide, ToastContainer } from "react-toastify";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Validuct - Validate Your Ideas",
	description:
		"Community-driven idea validation platform with upvoting, commenting, and status tracking",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geist.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<head>
				<script
					defer
					src="https://cloud.umami.is/script.js"
					data-website-id="8ba55836-b4e2-484e-bd6a-4ec997829a6d"
				></script>
			</head>
			<body className="bg-background text-foreground min-h-screen font-sans antialiased">
				<SessionProvider>
					<AuthProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
							<ToastContainer
								position="bottom-right"
								autoClose={3000}
								hideProgressBar
								newestOnTop={false}
								closeOnClick={false}
								rtl={false}
								pauseOnFocusLoss
								draggable
								pauseOnHover
								theme="dark"
								transition={Slide}
								limit={3}
							/>
						</ThemeProvider>
					</AuthProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
