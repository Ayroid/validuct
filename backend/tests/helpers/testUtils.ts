import { prisma } from '../../src/config/database.js';
import { hashPassword } from '../../src/utils/bcrypt.js';
import { generateToken } from '../../src/utils/jwt.js';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  token: string;
}

export const createTestUser = async (
  username = 'testuser',
  email = 'test@example.com'
): Promise<TestUser> => {
  const passwordHash = await hashPassword('testpass123');

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  });

  const token = generateToken(user.id);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  };
};

export const createTestIdea = async (
  userId: string,
  data: {
    heading?: string;
    description?: string;
    status?: 'DRAFT' | 'VALIDATED' | 'WIP' | 'LAUNCHED';
    launchedLink?: string;
  } = {}
) => {
  return await prisma.idea.create({
    data: {
      userId,
      heading: data.heading || 'Test Idea',
      description: data.description || 'This is a test idea',
      status: data.status || 'DRAFT',
      launchedLink: data.launchedLink || null,
    },
  });
};

export const cleanupDatabase = async () => {
  // Delete in order to respect foreign key constraints
  await prisma.comment.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.pinnedIdea.deleteMany({});
  await prisma.idea.deleteMany({});
  await prisma.user.deleteMany({});
};
