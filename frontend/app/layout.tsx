import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SessionProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-sans",
});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
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
		<html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-screen antialiased`}
			>
				<SessionProvider>
					<AuthProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
						</ThemeProvider>
					</AuthProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
