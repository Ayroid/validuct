import { PrismaClient, IdeaStatus, VoteType, CommentCategory, SignalType } from './client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Production Database Seed Script
 * Populates database with realistic startup ideas and user profiles
 *
 * Execution order:
 * 1. Users (no dependencies)
 * 2. Ideas (depends on Users)
 * 3. Votes (depends on Users and Ideas)
 * 4. Comments (depends on Users and Ideas, self-referencing)
 * 5. PinnedIdeas (depends on Users and Ideas)
 * 6. IdeaSignals (depends on Users and Ideas)
 */

// Production users with realistic profiles
const userData = [
  {
    username: 'rahul_sharma',
    email: 'rahul.sharma@validuct.com',
    bio: 'Product manager at a fintech startup. Building tools to help indie hackers validate faster.',
    profilePicture: null,
  },
  {
    username: 'priya_menon',
    email: 'priya.menon@validuct.com',
    bio: 'Ex-McKinsey consultant turned startup founder. Passionate about B2B SaaS.',
    profilePicture: null,
  },
  {
    username: 'arjun_nair',
    email: 'arjun.nair@validuct.com',
    bio: 'Full-stack developer with 8 years experience. Currently exploring AI applications.',
    profilePicture: null,
  },
  {
    username: 'sneha_patel',
    email: 'sneha.patel@validuct.com',
    bio: 'UX researcher helping teams build products users actually want. Previously at Razorpay.',
    profilePicture: null,
  },
  {
    username: 'vikram_reddy',
    email: 'vikram.reddy@validuct.com',
    bio: 'Serial entrepreneur. 2 exits. Angel investor in early-stage startups.',
    profilePicture: null,
  },
  {
    username: 'ananya_krishnan',
    email: 'ananya.krishnan@validuct.com',
    bio: 'Growth marketer specializing in PLG strategies. Helping startups find PMF.',
    profilePicture: null,
  },
  {
    username: 'karthik_iyer',
    email: 'karthik.iyer@validuct.com',
    bio: 'Backend engineer at Flipkart. Building side projects on weekends.',
    profilePicture: null,
  },
  {
    username: 'meera_joshi',
    email: 'meera.joshi@validuct.com',
    bio: 'Design lead with 10+ years in consumer apps. Mentor at design bootcamps.',
    profilePicture: null,
  },
  {
    username: 'aditya_kumar',
    email: 'aditya.kumar@validuct.com',
    bio: 'ML engineer exploring GenAI applications. Building in public.',
    profilePicture: null,
  },
  {
    username: 'divya_singh',
    email: 'divya.singh@validuct.com',
    bio: 'Freelance consultant helping startups with go-to-market strategy.',
    profilePicture: null,
  },
  {
    username: 'rohan_mehta',
    email: 'rohan.mehta@validuct.com',
    bio: 'DevOps engineer passionate about developer tools and automation.',
    profilePicture: null,
  },
  {
    username: 'neha_gupta',
    email: 'neha.gupta@validuct.com',
    bio: 'Content strategist and indie maker. Writing about startup validation.',
    profilePicture: null,
  },
  {
    username: 'sanjay_verma',
    email: 'sanjay.verma@validuct.com',
    bio: 'CTO at a healthtech startup. Previously built products at Amazon.',
    profilePicture: null,
  },
  {
    username: 'pooja_rao',
    email: 'pooja.rao@validuct.com',
    bio: 'Mobile developer focused on React Native. Building apps for small businesses.',
    profilePicture: null,
  },
  {
    username: 'amit_shah',
    email: 'amit.shah@validuct.com',
    bio: 'Finance professional exploring fintech opportunities. MBA from IIM-A.',
    profilePicture: null,
  },
];

// Production ideas - realistic startup concepts
const ideaData = [
  {
    heading: 'AI-Powered Invoice Processing for SMBs',
    description: 'Small businesses spend hours manually entering invoice data. This tool uses OCR and LLMs to automatically extract invoice details, categorize expenses, and sync with accounting software like Tally and Zoho Books. Target market: Indian SMBs processing 50-500 invoices monthly.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Compliance Automation for Indian Startups',
    description: 'Indian startups struggle with GST filings, TDS compliance, and ROC filings. Building a platform that automates compliance tracking, sends reminders, and auto-generates required documents. Integration with popular accounting tools.',
    status: IdeaStatus.WIP,
    launchedLink: null,
  },
  {
    heading: 'Whitelabel Checkout for D2C Brands',
    description: 'D2C brands lose 60% of customers at checkout due to poor UX and limited payment options. Building a Shopify-like checkout widget that works with any platform, supports UPI, cards, BNPL, and reduces cart abandonment.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://checkoutpro.in',
  },
  {
    heading: 'Content Repurposing Tool for Creators',
    description: 'Content creators spend hours reformatting content for different platforms. This tool takes a YouTube video or blog post and automatically generates Twitter threads, LinkedIn posts, Instagram carousels, and newsletter content using AI.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Vendor Management for Restaurants',
    description: 'Restaurant owners juggle 20+ vendors for ingredients. Building a platform to consolidate vendor communication, compare prices, track orders, and manage payments. Reduces procurement costs by 15-20%.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Async Video Updates for Remote Teams',
    description: 'Remote teams waste hours in sync meetings that could be emails. This tool lets team members record quick video updates, automatically transcribes them, and creates a searchable knowledge base. Think Loom meets Notion.',
    status: IdeaStatus.WIP,
    launchedLink: null,
  },
  {
    heading: 'Fractional CFO Marketplace',
    description: 'Early-stage startups need financial expertise but cannot afford full-time CFOs. Building a marketplace connecting startups with experienced fractional CFOs for fundraising, financial modeling, and strategic planning.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'API Monitoring for Indie Hackers',
    description: 'Enterprise API monitoring tools are expensive and complex. Building a simple, affordable uptime monitoring solution specifically for indie hackers and small teams. $9/month for unlimited endpoints.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://pingpanda.dev',
  },
  {
    heading: 'Legal Document Templates for Startups',
    description: 'Startups pay thousands for basic legal documents. Building a library of India-specific legal templates (NDAs, employment contracts, SHA, ESOP policies) vetted by lawyers. One-time purchase model.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Customer Interview Scheduling Tool',
    description: 'Founders spend hours scheduling customer interviews for validation. This tool integrates with calendars, sends personalized outreach, handles timezone conversion, and records/transcribes calls automatically.',
    status: IdeaStatus.WIP,
    launchedLink: null,
  },
  {
    heading: 'Hiring Platform for Tier-2 City Talent',
    description: 'Great developers in tier-2 cities struggle to find remote opportunities. Building a curated job board connecting them with startups looking for affordable, quality talent. Focus on verified skills over pedigree.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Subscription Analytics Dashboard',
    description: 'SaaS founders need to track MRR, churn, LTV, and other metrics. Building a simple dashboard that connects to Stripe, Razorpay, and Chargebee to provide real-time subscription analytics without complex setup.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://metricsview.io',
  },
  {
    heading: 'AI Meeting Notes for Sales Teams',
    description: 'Sales reps forget to log call notes in CRM. Building an AI tool that joins sales calls, transcribes conversations, extracts action items, and auto-updates Salesforce/HubSpot records.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Influencer CRM for D2C Brands',
    description: 'D2C brands struggle to manage influencer relationships at scale. Building a CRM specifically for influencer marketing - track conversations, campaigns, payments, and ROI in one place.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Code Review Bot for Small Teams',
    description: 'Small engineering teams lack bandwidth for thorough code reviews. Building an AI-powered bot that reviews PRs, suggests improvements, catches security issues, and enforces coding standards.',
    status: IdeaStatus.WIP,
    launchedLink: null,
  },
  {
    heading: 'Customer Success Platform for SMB SaaS',
    description: 'Enterprise customer success tools cost $50k+/year. Building an affordable alternative for SMB SaaS companies to track customer health, automate onboarding, and reduce churn.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'No-Code Internal Tools Builder',
    description: 'Startups waste engineering time building internal dashboards. Building a Retool alternative focused on Indian market - supports Indian databases, rupee formatting, and local integrations.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Equity Management for Startups',
    description: 'Managing cap tables and ESOP grants is complex and error-prone. Building Carta for Indian startups - handle equity allocation, vesting schedules, and compliance with Indian regulations.',
    status: IdeaStatus.WIP,
    launchedLink: null,
  },
  {
    heading: 'Automated Social Proof Widgets',
    description: 'Showing recent purchases and reviews increases conversion by 15%. Building embeddable widgets that display real-time social proof - recent sales, customer reviews, and visitor counts.',
    status: IdeaStatus.LAUNCHED,
    launchedLink: 'https://proofstack.co',
  },
  {
    heading: 'Developer Portfolio Generator',
    description: 'Developers need portfolios but hate building them. This tool pulls data from GitHub, reads READMEs, and auto-generates a beautiful portfolio site. One-click deploy to custom domains.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Referral Program Infrastructure',
    description: 'Every SaaS wants referral programs but building one is complex. Building referral infrastructure as a service - handle tracking, rewards, fraud detection, and payouts.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Technical Writing as a Service',
    description: 'Startups need documentation but developers hate writing it. Marketplace connecting startups with technical writers who specialize in API docs, guides, and tutorials.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
  {
    heading: 'Slack Bot for Customer Feedback',
    description: 'Product teams miss customer feedback scattered across channels. Building a Slack bot that aggregates feedback from Intercom, emails, and social media, then categorizes and prioritizes it.',
    status: IdeaStatus.WIP,
    launchedLink: null,
  },
  {
    heading: 'Landing Page A/B Testing Tool',
    description: 'Most A/B testing tools require developer involvement. Building a no-code tool specifically for landing pages - visual editor, automatic traffic splitting, and conversion tracking.',
    status: IdeaStatus.DRAFT,
    launchedLink: null,
  },
  {
    heading: 'Founder Matching Platform',
    description: 'Solo founders struggle to find co-founders. Building a matching platform based on complementary skills, working styles, and startup interests. Think dating app for co-founders.',
    status: IdeaStatus.VALIDATED,
    launchedLink: null,
  },
];

// Realistic comments with proper categories
const commentTemplates = [
  { category: CommentCategory.PROBLEM_CLARITY, text: 'I have experienced this exact problem at my previous company. We used to spend 3+ hours weekly just on this task.' },
  { category: CommentCategory.PROBLEM_CLARITY, text: 'Can you share more about how often users face this issue? Is it a daily frustration or occasional inconvenience?' },
  { category: CommentCategory.PROBLEM_CLARITY, text: 'This resonates. I have talked to 5+ people in my network who deal with this regularly.' },
  { category: CommentCategory.PROBLEM_CLARITY, text: 'The problem is real, but I wonder if it is painful enough for people to switch from their current solution.' },
  { category: CommentCategory.TARGET_USERS, text: 'Have you considered focusing on a specific vertical first? Might help with GTM.' },
  { category: CommentCategory.TARGET_USERS, text: 'Who is your ideal customer profile? SMBs, enterprises, or startups?' },
  { category: CommentCategory.TARGET_USERS, text: 'I think this would work better for mid-market companies rather than early-stage startups.' },
  { category: CommentCategory.TARGET_USERS, text: 'The target audience seems too broad. Consider niching down to a specific industry initially.' },
  { category: CommentCategory.WILLINGNESS_TO_PAY, text: 'I would pay $50-100/month for this if it saves me 5+ hours weekly.' },
  { category: CommentCategory.WILLINGNESS_TO_PAY, text: 'This seems like a vitamin rather than a painkiller. Would people actually pay for this?' },
  { category: CommentCategory.WILLINGNESS_TO_PAY, text: 'At my company, we have budget for tools like this. Would definitely evaluate.' },
  { category: CommentCategory.WILLINGNESS_TO_PAY, text: 'Price sensitivity might be high in this market. Have you validated pricing with potential customers?' },
  { category: CommentCategory.TECHNICAL_FEASIBILITY, text: 'The core tech seems straightforward. Main challenge will be integrations.' },
  { category: CommentCategory.TECHNICAL_FEASIBILITY, text: 'Have you thought about the data privacy implications? GDPR compliance could be complex.' },
  { category: CommentCategory.TECHNICAL_FEASIBILITY, text: 'Building this as a browser extension might be easier to start with than a full platform.' },
  { category: CommentCategory.TECHNICAL_FEASIBILITY, text: 'AI accuracy will be crucial here. How are you planning to handle edge cases?' },
  { category: CommentCategory.FEATURE_SUGGESTION, text: 'Would love to see Slack integration - that is where my team lives.' },
  { category: CommentCategory.FEATURE_SUGGESTION, text: 'Consider adding a mobile app. A lot of decision-makers are on mobile.' },
  { category: CommentCategory.FEATURE_SUGGESTION, text: 'Team collaboration features would make this much more valuable for organizations.' },
  { category: CommentCategory.FEATURE_SUGGESTION, text: 'An API would be great for power users who want to integrate with their existing workflows.' },
  { category: CommentCategory.GENERAL, text: 'Solid idea. Have you talked to potential customers yet?' },
  { category: CommentCategory.GENERAL, text: 'Interesting approach. How is this different from existing solutions?' },
  { category: CommentCategory.GENERAL, text: 'Love the focus on a specific market. That will help with positioning.' },
  { category: CommentCategory.GENERAL, text: 'The timing feels right for this. Good luck with the build!' },
];

const replyTemplates = [
  'Great point! We are actually planning to add that in our v2 roadmap.',
  'Thanks for the feedback. This is exactly the kind of insight we need.',
  'We have validated this with 15+ potential customers and 80% said they would pay.',
  'Good question - we are starting with startups and expanding to SMBs later.',
  'We are building the MVP with this in mind. Early users will help us refine it.',
  'Appreciate the perspective. We will factor this into our pricing strategy.',
  'That is our hypothesis too. Planning to run a pilot program next month.',
  'The technical architecture supports this. Just a matter of prioritization.',
];

/**
 * Clear all existing data from the database
 */
async function clearDatabase() {
  console.log('Clearing existing data...');

  await prisma.pinnedIdea.deleteMany();
  await prisma.ideaSignal.deleteMany();
  await prisma.commentHelpful.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleared');
}

/**
 * Create users with secure passwords
 */
async function seedUsers() {
  console.log('Seeding users...');

  // In production, each user should have a unique secure password
  // This is a seed script - actual users will reset passwords on first login
  const defaultPassword = process.env.SEED_USER_PASSWORD || 'ValiductProd2024!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

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

  console.log(`Created ${users.length} users`);
  return users;
}

/**
 * Create ideas with realistic distribution
 */
async function seedIdeas(users: any[]) {
  console.log('Seeding ideas...');

  const ideas = [];

  for (let i = 0; i < ideaData.length; i++) {
    const userIndex = i % users.length;
    const user = users[userIndex];

    // Realistic engagement based on status
    let upvotes, downvotes;
    switch (ideaData[i].status) {
      case IdeaStatus.LAUNCHED:
        upvotes = Math.floor(Math.random() * 80) + 40;
        downvotes = Math.floor(Math.random() * 8);
        break;
      case IdeaStatus.VALIDATED:
        upvotes = Math.floor(Math.random() * 50) + 20;
        downvotes = Math.floor(Math.random() * 10);
        break;
      case IdeaStatus.WIP:
        upvotes = Math.floor(Math.random() * 30) + 10;
        downvotes = Math.floor(Math.random() * 8);
        break;
      default: // DRAFT
        upvotes = Math.floor(Math.random() * 15) + 3;
        downvotes = Math.floor(Math.random() * 5);
    }

    const idea = await prisma.idea.create({
      data: {
        ...ideaData[i],
        userId: user.id,
        upvotesCount: upvotes,
        downvotesCount: downvotes,
        commentsCount: 0,
      },
    });

    ideas.push(idea);
  }

  console.log(`Created ${ideas.length} ideas`);
  return ideas;
}

/**
 * Create votes for ideas
 */
async function seedVotes(users: any[], ideas: any[]) {
  console.log('Seeding votes...');

  const votes = [];

  for (const user of users) {
    const numVotes = Math.floor(Math.random() * 8) + 4;
    const votedIdeaIds = new Set<string>();

    for (let i = 0; i < numVotes; i++) {
      let randomIdea;
      let attempts = 0;

      do {
        randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
        attempts++;
      } while (
        (votedIdeaIds.has(randomIdea.id) || randomIdea.userId === user.id) &&
        attempts < 20
      );

      if (attempts >= 20) continue;

      votedIdeaIds.add(randomIdea.id);
      const voteType = Math.random() < 0.75 ? VoteType.UPVOTE : VoteType.DOWNVOTE;

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
        continue;
      }
    }
  }

  console.log(`Created ${votes.length} votes`);
  return votes;
}

/**
 * Create comments and replies
 */
async function seedComments(users: any[], ideas: any[]) {
  console.log('Seeding comments...');

  const comments = [];

  for (const idea of ideas) {
    // More comments on validated/launched ideas
    let numComments;
    switch (idea.status) {
      case IdeaStatus.LAUNCHED:
        numComments = Math.floor(Math.random() * 5) + 4;
        break;
      case IdeaStatus.VALIDATED:
        numComments = Math.floor(Math.random() * 4) + 3;
        break;
      default:
        numComments = Math.floor(Math.random() * 3) + 1;
    }

    for (let i = 0; i < numComments; i++) {
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
          helpfulCount: Math.floor(Math.random() * 12),
        },
      });

      comments.push(comment);
    }
  }

  // Create replies (40% of comments get author replies)
  const topLevelComments = [...comments];
  for (const comment of topLevelComments) {
    if (Math.random() < 0.4) {
      const idea = ideas.find(i => i.id === comment.ideaId);
      if (!idea) continue;

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

  // Update comment counts
  for (const idea of ideas) {
    const commentCount = comments.filter(c => c.ideaId === idea.id).length;
    await prisma.idea.update({
      where: { id: idea.id },
      data: { commentsCount: commentCount },
    });
  }

  console.log(`Created ${comments.length} comments`);
  return comments;
}

/**
 * Create pinned ideas
 */
async function seedPinnedIdeas(users: any[], ideas: any[]) {
  console.log('Seeding pinned ideas...');

  const pinnedIdeas = [];

  for (const user of users) {
    const userIdeas = ideas.filter(idea => idea.userId === user.id);
    if (userIdeas.length === 0) continue;

    // Pin 1-2 ideas per user
    const numToPin = Math.min(Math.floor(Math.random() * 2) + 1, userIdeas.length);
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

      await prisma.idea.update({
        where: { id: ideasToPin[i].id },
        data: { isPinned: true },
      });

      pinnedIdeas.push(pinnedIdea);
    }
  }

  console.log(`Created ${pinnedIdeas.length} pinned ideas`);
  return pinnedIdeas;
}

/**
 * Create helpful votes for comments
 */
async function seedCommentHelpful(users: any[], comments: any[]) {
  console.log('Seeding helpful votes...');

  const helpfulVotes = [];

  for (const comment of comments) {
    if (Math.random() < 0.35) {
      const numHelpful = Math.floor(Math.random() * 4) + 1;
      const helpfulUserIds = new Set<string>();

      for (let i = 0; i < numHelpful; i++) {
        let randomUser;
        let attempts = 0;
        do {
          randomUser = users[Math.floor(Math.random() * users.length)];
          attempts++;
        } while (
          (randomUser.id === comment.userId || helpfulUserIds.has(randomUser.id)) &&
          attempts < 10
        );

        if (attempts >= 10) continue;
        helpfulUserIds.add(randomUser.id);

        try {
          const helpful = await prisma.commentHelpful.create({
            data: {
              userId: randomUser.id,
              commentId: comment.id,
            },
          });
          helpfulVotes.push(helpful);
        } catch (error) {
          continue;
        }
      }

      const actualCount = helpfulVotes.filter(h => h.commentId === comment.id).length;
      await prisma.comment.update({
        where: { id: comment.id },
        data: { helpfulCount: actualCount },
      });
    }
  }

  console.log(`Created ${helpfulVotes.length} helpful votes`);
  return helpfulVotes;
}

/**
 * Create validation signals for ideas
 */
async function seedIdeaSignals(users: any[], ideas: any[]) {
  console.log('Seeding idea signals...');

  const signals = [];
  const signalTypes = [SignalType.PROBLEM_REAL, SignalType.WOULD_PAY, SignalType.READY_TO_BUILD, SignalType.NEEDS_CLARITY];

  for (const idea of ideas) {
    // More signals on validated/launched ideas
    let numSignalers;
    switch (idea.status) {
      case IdeaStatus.LAUNCHED:
        numSignalers = Math.floor(Math.random() * 6) + 5;
        break;
      case IdeaStatus.VALIDATED:
        numSignalers = Math.floor(Math.random() * 5) + 3;
        break;
      default:
        numSignalers = Math.floor(Math.random() * 3) + 1;
    }

    const signaledUserIds = new Set<string>();

    for (let i = 0; i < numSignalers; i++) {
      let randomUser;
      let attempts = 0;
      do {
        randomUser = users[Math.floor(Math.random() * users.length)];
        attempts++;
      } while (signaledUserIds.has(randomUser.id) && attempts < 10);

      if (attempts >= 10) continue;
      signaledUserIds.add(randomUser.id);

      // Each user gives 1-2 signal types
      const numSignals = Math.floor(Math.random() * 2) + 1;
      const selectedTypes = [...signalTypes].sort(() => Math.random() - 0.5).slice(0, numSignals);

      for (const signalType of selectedTypes) {
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
          continue;
        }
      }
    }
  }

  console.log(`Created ${signals.length} validation signals`);
  return signals;
}

/**
 * Main seed function
 */
async function main() {
  console.log('Starting production database seed...\n');

  try {
    await clearDatabase();

    const users = await seedUsers();
    const ideas = await seedIdeas(users);
    const votes = await seedVotes(users, ideas);
    const comments = await seedComments(users, ideas);
    const pinnedIdeas = await seedPinnedIdeas(users, ideas);
    const helpfulVotes = await seedCommentHelpful(users, comments);
    const signals = await seedIdeaSignals(users, ideas);

    console.log('\nSeed Summary:');
    console.log(`  Users: ${users.length}`);
    console.log(`  Ideas: ${ideas.length}`);
    console.log(`  Votes: ${votes.length}`);
    console.log(`  Comments: ${comments.length}`);
    console.log(`  Pinned Ideas: ${pinnedIdeas.length}`);
    console.log(`  Helpful Votes: ${helpfulVotes.length}`);
    console.log(`  Validation Signals: ${signals.length}`);
    console.log('\nDatabase seeded successfully!');
    console.log('\nNote: Default password is set via SEED_USER_PASSWORD env var or "ValiductProd2024!"');
    console.log('Users should reset their passwords on first login.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
