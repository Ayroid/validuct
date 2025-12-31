import NextAuth, { DefaultSession } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import { API_URL } from "@/lib/constants";
import { AuthResponse } from "@/types";

// Extend NextAuth types for type safety
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			username: string;
			email: string;
			profilePicture: string | null;
			bio: string | null;
			createdAt: string;
		};
		backendToken: string;
	}

	interface User {
		id: string;
		email: string;
		username: string;
		profilePicture: string | null;
		bio: string | null;
		createdAt: string;
		backendToken: string;
	}
}

// Extended JWT type
interface ExtendedJWT extends JWT {
	id: string;
	username: string;
	email: string;
	profilePicture: string | null;
	bio: string | null;
	createdAt: string;
	backendToken: string;
	provider: string;
}

/**
 * Handles OAuth authentication with the backend
 * Creates or retrieves user account based on OAuth provider data
 */
async function handleOAuthBackend(
	email: string,
	username: string,
	profilePicture: string | null,
	provider: "google" | "twitter"
): Promise<AuthResponse> {
	const response = await fetch(`${API_URL}/auth/oauth`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email,
			username,
			profilePicture,
			provider,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || "Failed to authenticate with backend");
	}

	const data: { success: boolean; data: AuthResponse } = await response.json();

	if (!data.success || !data.data) {
		throw new Error("Backend authentication failed");
	}

	return data.data;
}

/**
 * NextAuth configuration
 * Follows Auth.js v5 best practices
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
	// Provider configuration
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
		TwitterProvider({
			clientId: process.env.TWITTER_CLIENT_ID!,
			clientSecret: process.env.TWITTER_CLIENT_SECRET!,
		}),
	],

	// Callbacks for handling session and JWT
	callbacks: {
		/**
		 * Authorized callback - runs on middleware requests
		 * Controls access to protected routes
		 */
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnProtectedRoute =
				nextUrl.pathname.startsWith("/home") ||
				nextUrl.pathname.startsWith("/idea/new") ||
				nextUrl.pathname.endsWith("/edit");

			if (isOnProtectedRoute && !isLoggedIn) {
				return false; // Redirect to login
			}

			return true;
		},

		/**
		 * JWT callback - runs when a JWT is created or updated
		 * Adds custom fields to the token
		 */
		async jwt({ token, user, account, profile }) {
			// Initial sign in - user object is available
			if (user) {
				// Google & Twitter OAuth sign-in
				if (account?.provider === "google" && profile?.email) {
					try {
						// Generate username from Google profile
						const username =
							profile.email.split("@")[0] ||
							profile.name?.replace(/\s+/g, "_").toLowerCase() ||
							"user";

						const googleProfile = profile as { picture?: string };
						const profilePicture = googleProfile.picture || null;

						// Authenticate with backend
						const backendAuth = await handleOAuthBackend(
							profile.email,
							username,
							profilePicture,
							"google"
						);

						// Populate token with backend user data
						const extendedToken = token as ExtendedJWT;
						extendedToken.id = backendAuth.user.id;
						extendedToken.email = backendAuth.user.email;
						extendedToken.username = backendAuth.user.username;
						extendedToken.profilePicture = backendAuth.user.profilePicture;
						extendedToken.bio = backendAuth.user.bio ?? null;
						extendedToken.createdAt = backendAuth.user.createdAt;
						extendedToken.backendToken = backendAuth.token;
						extendedToken.provider = "google";
					} catch (error) {
						console.error("OAuth backend error:", error);
						throw new Error("Failed to complete Google sign-in");
					}
				}

				console.log("Account provider:", account?.provider);
				console.log("Profile data:", profile);
				if (account?.provider === "twitter" && profile) {
					try {
						// Generate username from Twitter profile
						const twitterProfile = profile.data as { username?: string; profile_image_url?: string };
						const username =
							twitterProfile.username?.toLowerCase() ||
							"user";

						const email = `${twitterProfile.username}@twitter.oauth`;
						const profilePicture = twitterProfile.profile_image_url || null;

						// Authenticate with backend
						const backendAuth = await handleOAuthBackend(
							email,
							username,
							profilePicture,
							"twitter"
						);

						// Populate token with backend user data
						const extendedToken = token as ExtendedJWT;
						extendedToken.id = backendAuth.user.id;
						extendedToken.email = backendAuth.user.email;
						extendedToken.username = backendAuth.user.username;
						extendedToken.profilePicture = backendAuth.user.profilePicture;
						extendedToken.bio = backendAuth.user.bio ?? null;
						extendedToken.createdAt = backendAuth.user.createdAt;
						extendedToken.backendToken = backendAuth.token;
						extendedToken.provider = "twitter";
					} catch (error) {
						console.error("OAuth backend error:", error);
						throw new Error("Failed to complete Twitter sign-in");
					}
				}
			}

			return token;
		},

		/**
		 * Session callback - runs when session is checked
		 * Adds custom fields from JWT to session
		 */
		async session({ session, token }): Promise<Session> {
			const extendedToken = token as ExtendedJWT;

			// Populate session with token data
			if (extendedToken.id) {
				session.user.id = extendedToken.id;
				session.user.email = extendedToken.email;
				session.user.username = extendedToken.username;
				session.user.profilePicture = extendedToken.profilePicture;
				session.user.bio = extendedToken.bio;
				session.user.createdAt = extendedToken.createdAt;
				session.backendToken = extendedToken.backendToken;
			}

			return session;
		},
	},

	// Custom pages
	pages: {
		signIn: "/login",
	},

	// Session configuration
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},

	// Security
	secret: process.env.NEXTAUTH_SECRET,

	// Enable debug in development
	debug: process.env.NODE_ENV === "development",
});
