import { PrismaClient, IdeaStatus, VoteType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Database Seed Script
 * Populates all database schemas systematically while respecting relationships
 *
 * Execution order:
 * 1. Users (no dependencies)
 * 2. Ideas (depends on Users)
 * 3. Votes (depends on Users and Ideas)
 * 4. Comments (depends on Users and Ideas, self-referencing)
 * 5. PinnedIdeas (depends on Users and Ideas)
 */

// Sample data arrays
const userData = [
  {
    username: 'alice_innovator',
    email: 'alice@example.com',
    bio: 'Full-stack developer passionate about building SaaS products',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
  },
  {
    username: 'bob_creator',
    email: 'bob@example.com',
    bio: 'Serial entrepreneur and startup advisor',
    profilePicture: 'https://i.pravatar.cc/150?img=2',
  },
  {
    username: 'charlie_dev',
    email: 'charlie@example.com',
    bio: 'Mobile app developer exploring AI and ML',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
  },
  {
    username: 'diana_designer',
    email: 'diana@example.com',
    bio: 'UI/UX designer with a passion for user-centric design',
    profilePicture: 'https://i.pravatar.cc/150?img=4',
  },
  {
    username: 'evan_engineer',
    email: 'evan@example.com',
    bio: 'DevOps engineer interested in cloud infrastructure',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
  },
];

const ideaData = [
  {
    heading: 'AI-Powered Code Review Assistant',
    description: 'A tool that uses AI to automatically review code changes, suggest improvements, and catch potential bugs before they make it to production. Integrates with GitHub, GitLab, and Bitbucket.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Sustainable Shopping Marketplace',
    description: 'An e-commerce platform focused on eco-friendly and sustainable products. Includes carbon footprint tracking for purchases and rewards users for making environmentally conscious choices.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://sustainable-shop-demo.com',
  },
  {
    heading: 'Remote Team Collaboration Hub',
    description: 'A virtual workspace combining video conferencing, project management, and real-time collaboration tools. Designed specifically for distributed teams working across time zones.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://remotehub.io',
  },
  {
    heading: 'Personal Finance AI Coach',
    description: 'An intelligent financial advisor app that learns your spending habits and provides personalized budgeting advice, investment suggestions, and savings goals.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Fitness Gamification Platform',
    description: 'Turn your fitness journey into an RPG game. Complete workouts to level up your character, join guilds with friends, and compete in fitness challenges. Integrates with popular fitness trackers.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Local Skill-Sharing Network',
    description: 'A community platform where people can exchange skills and services without money. Learn guitar from a neighbor in exchange for teaching them to cook, for example.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Smart Home Energy Optimizer',
    description: 'IoT system that analyzes energy consumption patterns and automatically adjusts smart home devices to minimize electricity bills while maintaining comfort.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://energysmart.tech',
  },
  {
    heading: 'Educational Content Aggregator',
    description: 'Platform that curates and organizes free educational content from across the internet. Uses AI to create personalized learning paths based on user goals and skill levels.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Micro-Investment App for Students',
    description: 'Investment platform designed for students with limited funds. Start investing with as little as $1, learn about the stock market through interactive lessons.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://studentinvest.app',
  },
  {
    heading: 'Virtual Event Networking Assistant',
    description: 'AI-powered tool that matches attendees at virtual conferences based on interests and goals, facilitating meaningful connections in online events.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
];

const commentTemplates = [
  'This is a brilliant idea! I would definitely use this.',
  'Have you considered adding {feature}? It could really enhance the user experience.',
  'I love the concept, but I wonder about the monetization strategy.',
  'This reminds me of {similarProduct}, but with a unique twist. Great work!',
  'What technologies are you planning to use for the backend?',
  'How do you plan to handle scalability as the user base grows?',
  'This could solve a real problem I\'ve been facing. When do you expect to launch?',
  'Interesting approach! Have you validated this with potential users?',
  'I\'d be happy to beta test this when it\'s ready.',
  'The market for this is huge. Have you looked into competitors?',
];

const replyTemplates = [
  'Thanks for the feedback! I\'ll definitely consider that.',
  'Great question! I\'m currently exploring different options for that.',
  'I appreciate your interest! I\'ll keep you updated on the progress.',
  'That\'s a valid concern. Let me think about how to address it.',
  'You\'re right, I need to do more research on that aspect.',
];

/**
 * Clear all existing data from the database
 * Deletes in reverse dependency order to avoid foreign key constraints
 */
async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  await prisma.pinnedIdea.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');
}

/**
 * Create users with hashed passwords
 */
async function seedUsers() {
  console.log('👥 Seeding users...');

  const defaultPassword = 'password123'; // In production, use individual secure passwords
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const users = [];

  for (const user of userData) {
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        passwordHash: hashedPassword,
      },
    });
    users.push(createdUser);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

/**
 * Create ideas for users
 * Distributes ideas among users in a realistic pattern
 */
async function seedIdeas(users: any[]) {
  console.log('💡 Seeding ideas...');

  const ideas = [];

  for (let i = 0; i < ideaData.length; i++) {
    // Distribute ideas among users
    const userIndex = i % users.length;
    const user = users[userIndex];

    const idea = await prisma.idea.create({
      data: {
        ...ideaData[i],
        userId: user.id,
        // Add some realistic engagement counts
        upvotesCount: Math.floor(Math.random() * 50) + 5,
        downvotesCount: Math.floor(Math.random() * 10),
        commentsCount: 0, // Will be updated when comments are created
      },
    });

    ideas.push(idea);
  }

  console.log(`✅ Created ${ideas.length} ideas`);
  return ideas;
}

/**
 * Create votes for ideas
 * Each user votes on random ideas (excluding their own)
 */
async function seedVotes(users: any[], ideas: any[]) {
  console.log('🗳️  Seeding votes...');

  const votes = [];

  for (const user of users) {
    // Each user votes on 3-7 random ideas
    const numVotes = Math.floor(Math.random() * 5) + 3;
    const votedIdeaIds = new Set<string>();

    for (let i = 0; i < numVotes; i++) {
      // Pick a random idea that the user hasn't voted on and didn't create
      let randomIdea;
      let attempts = 0;

      do {
        randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
        attempts++;
      } while (
        (votedIdeaIds.has(randomIdea.id) || randomIdea.userId === user.id) &&
        attempts < 20
      );

      if (attempts >= 20) continue; // Skip if we can't find a suitable idea

      votedIdeaIds.add(randomIdea.id);

      // 70% upvote, 30% downvote
      const voteType = Math.random() < 0.7 ? VoteType.UPVOTE : VoteType.DOWNVOTE;

      try {
        const vote = await prisma.vote.create({
          data: {
            userId: user.id,
            ideaId: randomIdea.id,
            voteType,
          },
        });
        votes.push(vote);
      } catch (error) {
        // Skip if duplicate vote (shouldn't happen, but just in case)
        continue;
      }
    }
  }

  console.log(`✅ Created ${votes.length} votes`);
  return votes;
}

/**
 * Create comments and replies
 * Creates both top-level comments and nested replies
 */
async function seedComments(users: any[], ideas: any[]) {
  console.log('💬 Seeding comments...');

  const comments = [];

  // Create top-level comments
  for (const idea of ideas) {
    // Each idea gets 2-5 comments
    const numComments = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numComments; i++) {
      // Pick a random user who didn't create the idea
      let randomUser;
      do {
        randomUser = users[Math.floor(Math.random() * users.length)];
      } while (randomUser.id === idea.userId && users.length > 1);

      const commentText = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];

      const comment = await prisma.comment.create({
        data: {
          userId: randomUser.id,
          ideaId: idea.id,
          content: commentText,
        },
      });

      comments.push(comment);
    }
  }

  // Create replies to some comments (30% of comments get a reply)
  const topLevelComments = [...comments];
  for (const comment of topLevelComments) {
    if (Math.random() < 0.3) {
      // Get the idea to find its author
      const idea = ideas.find(i => i.id === comment.ideaId);
      if (!idea) continue;

      // Idea author replies to the comment
      const replyText = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

      const reply = await prisma.comment.create({
        data: {
          userId: idea.userId,
          ideaId: idea.id,
          parentCommentId: comment.id,
          content: replyText,
        },
      });

      comments.push(reply);
    }
  }

  // Update comment counts for ideas
  for (const idea of ideas) {
    const commentCount = comments.filter(c => c.ideaId === idea.id).length;
    await prisma.idea.update({
      where: { id: idea.id },
      data: { commentsCount: commentCount },
    });
  }

  console.log(`✅ Created ${comments.length} comments (including replies)`);
  return comments;
}

/**
 * Create pinned ideas for users
 * Each user pins 1-3 of their own ideas
 */
async function seedPinnedIdeas(users: any[], ideas: any[]) {
  console.log('📌 Seeding pinned ideas...');

  const pinnedIdeas = [];

  for (const user of users) {
    // Get user's ideas
    const userIdeas = ideas.filter(idea => idea.userId === user.id);

    if (userIdeas.length === 0) continue;

    // Pin 1-3 ideas (or all if user has fewer)
    const numToPin = Math.min(
      Math.floor(Math.random() * 3) + 1,
      userIdeas.length
    );

    // Shuffle user's ideas and take the first numToPin
    const shuffled = userIdeas.sort(() => Math.random() - 0.5);
    const ideasToPin = shuffled.slice(0, numToPin);

    for (let i = 0; i < ideasToPin.length; i++) {
      const pinnedIdea = await prisma.pinnedIdea.create({
        data: {
          userId: user.id,
          ideaId: ideasToPin[i].id,
          pinOrder: i + 1,
        },
      });

      // Update idea to mark it as pinned
      await prisma.idea.update({
        where: { id: ideasToPin[i].id },
        data: { isPinned: true },
      });

      pinnedIdeas.push(pinnedIdea);
    }
  }

  console.log(`✅ Created ${pinnedIdeas.length} pinned ideas`);
  return pinnedIdeas;
}

/**
 * Main seed function
 * Orchestrates the seeding process in the correct order
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data
    await clearDatabase();

    // Seed data in dependency order
    const users = await seedUsers();
    const ideas = await seedIdeas(users);
    const votes = await seedVotes(users, ideas);
    const comments = await seedComments(users, ideas);
    const pinnedIdeas = await seedPinnedIdeas(users, ideas);

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Ideas: ${ideas.length}`);
    console.log(`   Votes: ${votes.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Pinned Ideas: ${pinnedIdeas.length}`);
    console.log('\n✨ Database seeded successfully!');
    console.log('\n📝 Default password for all users: password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Execute seed
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
