import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Data required for OAuth authentication
 */
interface OAuthData {
  email: string;
  username: string;
  profilePicture?: string | null;
  provider: string;
}

/**
 * Authentication response containing user data and JWT token
 */
interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    profilePicture: string | null;
    createdAt: Date;
  };
  token: string;
}

/**
 * Service class for managing authentication-related operations
 */
export class AuthService {
  /**
   * Retrieve the current authenticated user's information
   *
   * @param userId - The ID of the authenticated user
   * @returns The user's profile information
   * @throws {AppError} If the user is not found (404)
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Authenticate or register a user via OAuth provider
   *
   * @param data - OAuth data including email, username, profile picture, and provider
   * @returns Object containing user information and JWT authentication token
   * @throws {AppError} If unable to generate a unique username after 10 attempts (400)
   *
   * @remarks
   * This method handles both login and registration:
   * - If user exists (matched by email): Returns existing user with new token
   * - If user doesn't exist: Creates new user account with random password
   *
   * For new users:
   * - Generates a unique username by appending random numbers if needed
   * - Creates a random password (OAuth users won't use it)
   * - Sets profile picture from OAuth provider if available
   *
   * Supported providers: Google, GitHub, Facebook
   */
  static async oauth(data: OAuthData): Promise<AuthResponse> {
    console.log('OAuth data received:', data);
    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        createdAt: true,
      },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      // Generate a random password for OAuth users (they won't use it)
      const randomPassword =
        Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const passwordHash = await hashPassword(randomPassword);

      // Ensure username is unique
      let username = data.username;
      let attempts = 0;
      let isUnique = false;

      while (!isUnique && attempts < 10) {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        if (!existingUser) {
          isUnique = true;
        } else {
          // Append random number to username
          username = `${data.username}_${Math.floor(Math.random() * 10000)}`;
          attempts++;
        }
      }

      if (!isUnique) {
        throw new AppError('Unable to generate unique username', 400);
      }

      user = await prisma.user.create({
        data: {
          username,
          email: data.email,
          passwordHash,
          profilePicture: data.profilePicture || null,
        },
        select: {
          id: true,
          username: true,
          email: true,
          profilePicture: true,
          bio: true,
          createdAt: true,
        },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}
