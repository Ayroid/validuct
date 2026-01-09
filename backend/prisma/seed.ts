import { PrismaClient, IdeaStatus, VoteType, CommentCategory, SignalType } from '@prisma/client';
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
  {
    username: 'frank_founder',
    email: 'frank@example.com',
    bio: 'Tech startup founder with 3 successful exits',
    profilePicture: 'https://i.pravatar.cc/150?img=6',
  },
  {
    username: 'grace_product',
    email: 'grace@example.com',
    bio: 'Product manager focused on user growth and retention',
    profilePicture: 'https://i.pravatar.cc/150?img=7',
  },
  {
    username: 'henry_hacker',
    email: 'henry@example.com',
    bio: 'Ethical hacker and cybersecurity enthusiast',
    profilePicture: 'https://i.pravatar.cc/150?img=8',
  },
  {
    username: 'iris_investor',
    email: 'iris@example.com',
    bio: 'Angel investor interested in early-stage startups',
    profilePicture: 'https://i.pravatar.cc/150?img=9',
  },
  {
    username: 'jack_data',
    email: 'jack@example.com',
    bio: 'Data scientist passionate about ML and analytics',
    profilePicture: 'https://i.pravatar.cc/150?img=10',
  },
  {
    username: 'kate_creative',
    email: 'kate@example.com',
    bio: 'Creative director with expertise in brand storytelling',
    profilePicture: 'https://i.pravatar.cc/150?img=11',
  },
  {
    username: 'leo_backend',
    email: 'leo@example.com',
    bio: 'Backend engineer specializing in distributed systems',
    profilePicture: 'https://i.pravatar.cc/150?img=12',
  },
  {
    username: 'maya_mobile',
    email: 'maya@example.com',
    bio: 'iOS and Android developer, React Native expert',
    profilePicture: 'https://i.pravatar.cc/150?img=13',
  },
  {
    username: 'nathan_marketer',
    email: 'nathan@example.com',
    bio: 'Growth marketer with focus on viral campaigns',
    profilePicture: 'https://i.pravatar.cc/150?img=14',
  },
  {
    username: 'olivia_ops',
    email: 'olivia@example.com',
    bio: 'Site reliability engineer, Kubernetes certified',
    profilePicture: 'https://i.pravatar.cc/150?img=15',
  },
  {
    username: 'paul_pm',
    email: 'paul@example.com',
    bio: 'Technical project manager, agile practitioner',
    profilePicture: 'https://i.pravatar.cc/150?img=16',
  },
  {
    username: 'quinn_qa',
    email: 'quinn@example.com',
    bio: 'QA engineer obsessed with test automation',
    profilePicture: 'https://i.pravatar.cc/150?img=17',
  },
  {
    username: 'rachel_researcher',
    email: 'rachel@example.com',
    bio: 'UX researcher helping teams build better products',
    profilePicture: 'https://i.pravatar.cc/150?img=18',
  },
  {
    username: 'steve_sales',
    email: 'steve@example.com',
    bio: 'B2B sales professional with SaaS experience',
    profilePicture: 'https://i.pravatar.cc/150?img=19',
  },
  {
    username: 'tina_tech',
    email: 'tina@example.com',
    bio: 'Tech lead passionate about clean architecture',
    profilePicture: 'https://i.pravatar.cc/150?img=20',
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
  {
    heading: 'Blockchain-Based Supply Chain Tracker',
    description: 'Transparent tracking system for product journeys from manufacturer to consumer. Uses blockchain to ensure authenticity and ethical sourcing.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Mental Health Check-in App',
    description: 'Daily mood tracking with AI-powered insights and therapy recommendations. Connects users with licensed therapists for virtual sessions.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://mindcheck.io',
  },
  {
    heading: 'Smart Recipe Generator',
    description: 'Generate recipes based on ingredients you have at home. Includes nutritional information, cooking videos, and grocery delivery integration.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Freelancer Time Tracking Suite',
    description: 'Comprehensive time tracking with automated invoicing, client management, and productivity analytics. Perfect for independent contractors and agencies.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://tracktime.pro',
  },
  {
    heading: 'Pet Care Coordination Platform',
    description: 'Coordinate pet sitting, vet appointments, and pet care services. Includes health records, vaccination reminders, and emergency contacts.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Language Learning Through Games',
    description: 'Learn new languages by playing interactive story-based games. Uses spaced repetition and real conversation practice with native speakers.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://lingo-quest.app',
  },
  {
    heading: 'Carbon Footprint Calculator',
    description: 'Track your personal carbon emissions and get actionable suggestions to reduce your environmental impact. Gamified with monthly challenges.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Smart Parking Finder',
    description: 'Real-time parking availability in cities with reservation and payment features. Uses IoT sensors and crowdsourced data.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://parkease.city',
  },
  {
    heading: 'Subscription Management Hub',
    description: 'Track all your subscriptions in one place, get cancellation reminders, and find cheaper alternatives. Helps users save money on unused services.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Virtual Interior Designer',
    description: 'AR-powered app to visualize furniture and decor in your space before buying. Includes AI recommendations based on your style preferences.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://design-virtual.space',
  },
  {
    heading: 'Neighborhood Safety Network',
    description: 'Community-driven platform for sharing local safety updates, crime reports, and emergency alerts. Verified by local authorities.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Automated Meeting Scheduler',
    description: 'AI assistant that finds optimal meeting times across time zones, sends invites, and manages rescheduling. Integrates with all major calendar apps.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://schedulesmart.ai',
  },
  {
    heading: 'Plant Care Assistant',
    description: 'Identify plants, get care instructions, set watering reminders, and diagnose plant health issues using image recognition.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Podcast Discovery Engine',
    description: 'AI-powered podcast recommendations based on your interests and listening habits. Create custom playlists and discover niche content.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://podtune.fm',
  },
  {
    heading: 'Local Business Loyalty Platform',
    description: 'Unified loyalty program for local businesses. Customers earn points across multiple stores and redeem rewards anywhere in the network.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Senior Care Coordination App',
    description: 'Coordinate care for elderly family members across caregivers, doctors, and family. Includes medication reminders and emergency protocols.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Resume Builder with AI Optimization',
    description: 'Create ATS-friendly resumes with AI suggestions for improvements. Includes job-specific customization and cover letter generation.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://resume-ace.jobs',
  },
  {
    heading: 'Habit Stacking Companion',
    description: 'Build new habits by stacking them onto existing routines. Uses behavioral science and community support for accountability.',
    status: IdeaStatus.WIP,
    launchedLink: 'https://habitstack.life',
  },
  {
    heading: 'Group Gift Registry Platform',
    description: 'Coordinate group gifts for weddings, birthdays, and special occasions. Track contributions and suggest gift ideas based on recipient interests.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Skill Verification Marketplace',
    description: 'Platform where professionals can get their skills verified through practical challenges. Helps employers find genuinely qualified candidates.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
];

const commentTemplates = [
  { category: CommentCategory.PROBLEM_CLARITY, text: 'Can you clarify who exactly faces this problem? Is it a daily pain point?' },
  { category: CommentCategory.PROBLEM_CLARITY, text: 'How frequently do people encounter this issue? Is it worth solving?' },
  { category: CommentCategory.TARGET_USERS, text: 'Who is your primary target audience for this solution?' },
  { category: CommentCategory.TARGET_USERS, text: 'Have you talked to potential users about this problem?' },
  { category: CommentCategory.WILLINGNESS_TO_PAY, text: 'Would you actually pay for this? If so, how much?' },
  { category: CommentCategory.WILLINGNESS_TO_PAY, text: 'I\'d pay $10-20/month for this if it saves me time!' },
  { category: CommentCategory.TECHNICAL_FEASIBILITY, text: 'What technologies are you planning to use for the backend?' },
  { category: CommentCategory.TECHNICAL_FEASIBILITY, text: 'Have you considered using a microservices architecture for scalability?' },
  { category: CommentCategory.FEATURE_SUGGESTION, text: 'It would be great to have mobile app support from day one.' },
  { category: CommentCategory.FEATURE_SUGGESTION, text: 'Consider adding integration with popular tools like Slack and Discord.' },
  { category: CommentCategory.GENERAL, text: 'This is a brilliant idea! I would definitely use this.' },
  { category: CommentCategory.GENERAL, text: 'Interesting approach! Have you validated this with potential users?' },
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
  await prisma.ideaSignal.deleteMany();
  await prisma.commentHelpful.deleteMany();
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

      const commentTemplate = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];

      const comment = await prisma.comment.create({
        data: {
          userId: randomUser.id,
          ideaId: idea.id,
          content: commentTemplate.text,
          category: commentTemplate.category,
          helpfulCount: Math.floor(Math.random() * 15), // Random helpful count
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
 * Create helpful votes for comments
 * Users mark comments as helpful
 */
async function seedCommentHelpful(users: any[], comments: any[]) {
  console.log('👍 Seeding helpful votes...');

  const helpfulVotes = [];

  // Each comment has a 40% chance of getting helpful votes
  for (const comment of comments) {
    if (Math.random() < 0.4) {
      // 1-5 users mark it as helpful
      const numHelpful = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < numHelpful; i++) {
        // Pick a random user who didn't write the comment
        let randomUser;
        do {
          randomUser = users[Math.floor(Math.random() * users.length)];
        } while (randomUser.id === comment.userId && users.length > 1);

        try {
          const helpful = await prisma.commentHelpful.create({
            data: {
              userId: randomUser.id,
              commentId: comment.id,
            },
          });
          helpfulVotes.push(helpful);
        } catch (error) {
          // Skip if duplicate (user already marked as helpful)
          continue;
        }
      }

      // Update comment's helpful count
      const actualCount = helpfulVotes.filter(h => h.commentId === comment.id).length;
      await prisma.comment.update({
        where: { id: comment.id },
        data: { helpfulCount: actualCount },
      });
    }
  }

  console.log(`✅ Created ${helpfulVotes.length} helpful votes`);
  return helpfulVotes;
}

/**
 * Create validation signals for ideas
 * Users signal validation for ideas
 */
async function seedIdeaSignals(users: any[], ideas: any[]) {
  console.log('🎯 Seeding idea signals...');

  const signals = [];
  const signalTypes = [SignalType.PROBLEM_REAL, SignalType.WOULD_PAY, SignalType.READY_TO_BUILD, SignalType.NEEDS_CLARITY];

  for (const idea of ideas) {
    // Each idea gets signals from 2-8 random users
    const numSignalers = Math.floor(Math.random() * 7) + 2;

    for (let i = 0; i < numSignalers; i++) {
      // Pick a random user
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Each user gives 1-3 different signal types
      const numSignals = Math.floor(Math.random() * 3) + 1;
      const shuffledTypes = signalTypes.sort(() => Math.random() - 0.5).slice(0, numSignals);

      for (const signalType of shuffledTypes) {
        try {
          const signal = await prisma.ideaSignal.create({
            data: {
              userId: randomUser.id,
              ideaId: idea.id,
              signalType,
            },
          });
          signals.push(signal);
        } catch (error) {
          // Skip if duplicate (user already gave this signal type)
          continue;
        }
      }
    }
  }

  console.log(`✅ Created ${signals.length} validation signals`);
  return signals;
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
    const helpfulVotes = await seedCommentHelpful(users, comments);
    const signals = await seedIdeaSignals(users, ideas);

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Ideas: ${ideas.length}`);
    console.log(`   Votes: ${votes.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Pinned Ideas: ${pinnedIdeas.length}`);
    console.log(`   Helpful Votes: ${helpfulVotes.length}`);
    console.log(`   Validation Signals: ${signals.length}`);
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
