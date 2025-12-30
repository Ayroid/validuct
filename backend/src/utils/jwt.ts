import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * JWT payload structure
 */
interface JwtPayload {
  userId: string;
}

/**
 * Generate a JWT token for a user
 *
 * @param userId - The ID of the user to generate a token for
 * @returns JWT token string
 *
 * @remarks
 * Uses the JWT_SECRET and JWT_EXPIRE values from environment configuration
 * Token includes the userId in the payload
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  } as any);
};

/**
 * Verify and decode a JWT token
 *
 * @param token - The JWT token to verify
 * @returns Decoded JWT payload containing userId
 * @throws {Error} If the token is invalid or expired
 *
 * @remarks
 * Verifies the token using the JWT_SECRET from environment configuration
 * Throws an error if the token is invalid, expired, or malformed
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
