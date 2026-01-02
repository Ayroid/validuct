import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration interface
 */
interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  CORS_ORIGIN: string;
  REDIS_URL: string;
}

/**
 * Get an environment variable with optional default value
 *
 * @param key - The environment variable name
 * @param defaultValue - Optional default value if environment variable is not set
 * @returns The environment variable value
 * @throws {Error} If the environment variable is not defined and no default is provided
 */
const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

/**
 * Application environment configuration
 *
 * @remarks
 * Loads configuration from environment variables with defaults:
 * - NODE_ENV: defaults to 'development'
 * - PORT: defaults to 5000
 * - DATABASE_URL: required, no default
 * - JWT_SECRET: required, no default
 * - JWT_EXPIRE: defaults to '7d'
 * - CORS_ORIGIN: defaults to '*'
 */
export const config: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  DATABASE_URL: getEnvVariable('DATABASE_URL'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRE: getEnvVariable('JWT_EXPIRE', '7d'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', '*'),
  REDIS_URL: getEnvVariable('REDIS_URL', 'redis://localhost:6379'),
};
