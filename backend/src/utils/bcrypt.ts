import bcrypt from 'bcrypt';

/**
 * Number of salt rounds for bcrypt hashing
 */
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 *
 * @param password - The plain text password to hash
 * @returns Hashed password string
 *
 * @remarks
 * Uses 10 salt rounds for hashing
 * Generates a unique salt for each password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password
 *
 * @param password - The plain text password to compare
 * @param hashedPassword - The hashed password to compare against
 * @returns True if passwords match, false otherwise
 *
 * @remarks
 * Uses bcrypt's secure comparison algorithm
 * Handles timing attacks by using constant-time comparison
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
