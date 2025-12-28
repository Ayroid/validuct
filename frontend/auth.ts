import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { API_URL } from '@/lib/constants';
import { AuthResponse, LoginData, ExtendedJWT } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      profilePicture: string | null;
      bio?: string | null;
      createdAt: string;
    };
    backendToken: string;
  }

  interface User {
    id: string;
    email: string;
    username: string;
    profilePicture: string | null;
    bio?: string | null;
    createdAt: string;
    backendToken: string;
  }
}

// Helper function to handle OAuth login/registration with backend
async function handleOAuthBackend(email: string, username: string, profilePicture?: string | null) {
  try {
    // Try to login/register with OAuth
    const response = await fetch(`${API_URL}/auth/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
        profilePicture,
        provider: 'google',
      }),
    });

    if (!response.ok) {
      throw new Error('OAuth backend authentication failed');
    }

    const data: { success: boolean; data: AuthResponse } = await response.json();

    if (!data.success || !data.data) {
      throw new Error('OAuth backend authentication failed');
    }

    return data.data;
  } catch (error) {
    console.error('OAuth backend error:', error);
    throw error;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            } as LoginData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Invalid credentials');
          }

          const data: { success: boolean; data: AuthResponse } = await response.json();

          if (!data.success || !data.data) {
            throw new Error('Login failed');
          }

          const { user, token } = data.data;

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            createdAt: user.createdAt,
            backendToken: token,
          };
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      const extendedToken = token as ExtendedJWT;

      if (user) {
        // Check if this is a Google OAuth sign-in
        if (account?.provider === 'google' && profile?.email) {
          try {
            // Generate username from Google profile
            const username = profile.email.split('@')[0] || profile.name?.replace(/\s+/g, '_').toLowerCase() || 'user';
            const googleProfile = profile as { picture?: string };
            const profilePicture = googleProfile.picture || null;

            // Authenticate with backend
            const backendAuth = await handleOAuthBackend(
              profile.email,
              username,
              profilePicture
            );

            extendedToken.id = backendAuth.user.id;
            extendedToken.email = backendAuth.user.email;
            extendedToken.username = backendAuth.user.username;
            extendedToken.profilePicture = backendAuth.user.profilePicture;
            extendedToken.bio = backendAuth.user.bio;
            extendedToken.createdAt = backendAuth.user.createdAt;
            extendedToken.backendToken = backendAuth.token;
            extendedToken.provider = 'google';
          } catch (error) {
            console.error('Failed to authenticate with backend:', error);
            throw new Error('Failed to complete Google sign-in');
          }
        } else {
          // Credentials login
          extendedToken.id = user.id;
          extendedToken.email = user.email;
          extendedToken.username = user.username;
          extendedToken.profilePicture = user.profilePicture;
          extendedToken.bio = user.bio;
          extendedToken.createdAt = user.createdAt;
          extendedToken.backendToken = user.backendToken;
          extendedToken.provider = 'credentials';
        }
      }
      return token;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      if (extendedToken.id && extendedToken.email && extendedToken.username && extendedToken.createdAt && extendedToken.backendToken) {
        session.user.id = extendedToken.id;
        session.user.email = extendedToken.email;
        session.user.username = extendedToken.username;
        session.user.profilePicture = extendedToken.profilePicture ?? null;
        session.user.bio = extendedToken.bio ?? null;
        session.user.createdAt = extendedToken.createdAt;
        session.backendToken = extendedToken.backendToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
