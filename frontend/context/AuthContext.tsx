'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut, signIn } from 'next-auth/react';
import { authApi } from '@/lib/api/auth';
import { User, LoginData, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  backendToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';

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

  const login = async (data: LoginData) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
      router.refresh();
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authApi.register(data);

      // After successful registration, log the user in
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
