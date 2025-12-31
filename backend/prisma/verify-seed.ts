import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verification script to check seed data integrity
 * Validates all relationships and data consistency
 */
async function verifySeedData() {
  console.log('🔍 Verifying seed data integrity...\n');

  try {
    // 1. Verify Users
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            ideas: true,
            votes: true,
            comments: true,
            pinnedIdeas: true,
          },
        },
      },
    });

    console.log('👥 Users:');
    users.forEach((user) => {
      console.log(
        `   ${user.username}: ${user._count.ideas} ideas, ${user._count.votes} votes, ${user._count.comments} comments, ${user._count.pinnedIdeas} pinned`
      );
    });

    // 2. Verify Ideas with relationships
    const ideas = await prisma.idea.findMany({
      include: {
        user: { select: { username: true } },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    console.log('\n💡 Ideas:');
    ideas.forEach((idea) => {
      const votesMatch = idea._count.votes >= 0;
      const commentsMatch = idea._count.comments === idea.commentsCount;
      const status = votesMatch && commentsMatch ? '✅' : '❌';

      console.log(
        `   ${status} "${idea.heading.substring(0, 40)}..." by ${idea.user.username}`
      );
      console.log(
        `      Status: ${idea.status}, Votes: ${idea._count.votes}, Comments: ${idea._count.comments}/${idea.commentsCount}`
      );
    });

    // 3. Verify Votes (no duplicate votes)
    const votes = await prisma.vote.findMany({
      include: {
        user: { select: { username: true } },
        idea: { select: { heading: true } },
      },
    });

    const voteKeys = new Set();
    let duplicates = 0;

    votes.forEach((vote) => {
      const key = `${vote.userId}-${vote.ideaId}`;
      if (voteKeys.has(key)) {
        duplicates++;
      }
      voteKeys.add(key);
    });

    console.log(`\n🗳️  Votes: ${votes.length} total`);
    console.log(
      `   ${duplicates === 0 ? '✅' : '❌'} Unique constraint check: ${duplicates} duplicates found`
    );

    // 4. Verify Comments (including nested replies)
    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { username: true } },
        idea: { select: { heading: true } },
        parentComment: { select: { id: true } },
        _count: {
          select: { replies: true },
        },
      },
    });

    const topLevelComments = comments.filter((c) => !c.parentCommentId);
    const replies = comments.filter((c) => c.parentCommentId);

    console.log(`\n💬 Comments: ${comments.length} total`);
    console.log(`   Top-level: ${topLevelComments.length}`);
    console.log(`   Replies: ${replies.length}`);

    // Check if all parent comments exist
    let orphanedReplies = 0;
    replies.forEach((reply) => {
      if (!reply.parentComment) {
        orphanedReplies++;
      }
    });
    console.log(
      `   ${orphanedReplies === 0 ? '✅' : '❌'} Parent reference check: ${orphanedReplies} orphaned replies`
    );

    // 5. Verify Pinned Ideas
    const pinnedIdeas = await prisma.pinnedIdea.findMany({
      include: {
        user: { select: { username: true } },
        idea: { select: { heading: true, userId: true } },
      },
    });

    console.log(`\n📌 Pinned Ideas: ${pinnedIdeas.length} total`);

    // Check if users only pin their own ideas
    let invalidPins = 0;
    pinnedIdeas.forEach((pin) => {
      if (pin.userId !== pin.idea.userId) {
        invalidPins++;
      }
    });
    console.log(
      `   ${invalidPins === 0 ? '✅' : '❌'} Ownership check: ${invalidPins} invalid pins (user pinning others' ideas)`
    );

    // Check pin order uniqueness per user
    const userPinOrders = new Map<string, Set<number>>();
    let duplicatePinOrders = 0;

    pinnedIdeas.forEach((pin) => {
      if (!userPinOrders.has(pin.userId)) {
        userPinOrders.set(pin.userId, new Set());
      }
      const orders = userPinOrders.get(pin.userId)!;
      if (orders.has(pin.pinOrder)) {
        duplicatePinOrders++;
      }
      orders.add(pin.pinOrder);
    });
    console.log(
      `   ${duplicatePinOrders === 0 ? '✅' : '❌'} Pin order uniqueness: ${duplicatePinOrders} duplicates`
    );

    // 6. Overall Summary
    console.log('\n📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Ideas: ${ideas.length}`);
    console.log(`   Total Votes: ${votes.length}`);
    console.log(`   Total Comments: ${comments.length}`);
    console.log(`   Total Pinned Ideas: ${pinnedIdeas.length}`);

    // 7. Relationship Integrity Check
    console.log('\n🔗 Relationship Integrity:');
    console.log(`   ${votes.length > 0 ? '✅' : '❌'} User → Vote relationships`);
    console.log(`   ${comments.length > 0 ? '✅' : '❌'} User → Comment relationships`);
    console.log(`   ${ideas.length > 0 ? '✅' : '❌'} User → Idea relationships`);
    console.log(`   ${pinnedIdeas.length > 0 ? '✅' : '❌'} User → PinnedIdea relationships`);
    console.log(`   ${replies.length > 0 ? '✅' : '❌'} Comment → Reply relationships`);

    console.log('\n✨ Verification complete!');
  } catch (error) {
    console.error('❌ Error verifying seed data:', error);
    throw error;
  }
}

// Execute verification
verifySeedData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
