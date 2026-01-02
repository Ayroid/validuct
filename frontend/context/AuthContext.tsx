"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const loading = status === "loading";

	const user: User | null = session?.user
		? {
				id: session.user.id,
				username: session.user.username,
				email: session.user.email,
				profilePicture: session.user.profilePicture,
				bio: session.user.bio,
				createdAt: session.user.createdAt,
			}
		: null;

	const backendToken = session?.backendToken || null;

	const logout = async () => {
		await nextAuthSignOut({ redirect: false });
		router.push("/login");
		router.refresh();
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				logout,
				isAuthenticated: !!user,
				backendToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
