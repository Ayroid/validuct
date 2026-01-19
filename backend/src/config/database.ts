import { PrismaClient } from '../../prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma Client instance for database operations
 *
 * @remarks
 * Configured with logging based on environment:
 * - Development: logs queries, errors, and warnings
 * - Production: logs only errors
 */

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

/**
 * Establish connection to the database
 *
 * @remarks
 * Attempts to connect to the database using Prisma
 * Logs success message if connection succeeds
 * Logs error and exits process if connection fails
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from the database
 *
 * @remarks
 * Gracefully closes the Prisma database connection
 * Should be called during application shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};
