import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

interface OAuthData {
  email: string;
  username: string;
  profilePicture?: string | null;
  provider: string;
}

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

export class AuthService {
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

  static async oauth(data: OAuthData): Promise<AuthResponse> {
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
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
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
