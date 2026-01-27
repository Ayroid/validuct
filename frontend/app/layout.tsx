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
	metadataBase: new URL("https://validuct.com"),
	title: "Validuct - Stop Guessing. Start Validating.",
	description:
		"AI-powered idea validation platform that gives builders evidence, not just opinions. Validate your product ideas with AI analysis, community feedback, and real purchase signals.",
	keywords: [
		"idea validation",
		"startup validation",
		"product validation",
		"AI analysis",
		"market research",
		"competitor analysis",
		"entrepreneur tools",
		"build in public",
		"Validuct",
	],
	authors: [{ name: "Validuct" }],
	openGraph: {
		title: "Validuct - Stop Guessing. Start Validating.",
		description:
			"AI-powered idea validation platform that gives builders evidence, not just opinions. Validate your product ideas with AI analysis, community feedback, and real purchase signals.",
		url: "https://validuct.com",
		siteName: "Validuct",
		images: [
			{
				url: "/validuct_og.png",
				width: 1200,
				height: 630,
				alt: "Validuct - AI-Powered Idea Validation Platform",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Validuct - Stop Guessing. Start Validating.",
		description:
			"AI-powered idea validation platform that gives builders evidence, not just opinions. Validate your product ideas with AI analysis, community feedback, and real purchase signals.",
		images: ["/validuct_og.png"],
		creator: "@validuct",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geist.variable} ${geistMono.variable} scroll-smooth`}
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
							defaultTheme="light"
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
