# Database Seed Script

This seed script populates the Validuct database with realistic sample data for development and testing purposes.

## Features

- **Systematic Population**: Respects all database relationships and foreign key constraints
- **Realistic Data**: Creates meaningful sample data including users, ideas, votes, comments, and pinned ideas
- **Safe Execution**: Clears existing data before seeding to prevent conflicts
- **Comprehensive Coverage**: Populates all models in the database schema

## Database Models Populated

The seed script populates data in the following order to respect dependencies:

1. **Users** (5 sample users)
   - Unique usernames and emails
   - Hashed passwords (default: `password123`)
   - Profile pictures and bios

2. **Ideas** (10 sample ideas)
   - Various statuses: DRAFT, VALIDATED, WIP, LAUNCHED
   - Realistic descriptions and headings
   - Distributed among users

3. **Votes** (15-35 votes depending on randomization)
   - Each user votes on 3-7 random ideas
   - 70% upvotes, 30% downvotes
   - Cannot vote on own ideas

4. **Comments** (20-50 comments including replies)
   - Top-level comments (2-5 per idea)
   - Nested replies (30% of comments get a reply from idea author)
   - Realistic comment templates

5. **PinnedIdeas** (5-15 pinned ideas)
   - Users pin 1-3 of their own ideas
   - Proper pin order maintained

## Usage

### Run the seed script

```bash
# Option 1: Using npm script
npm run seed

# Option 2: Using the db:seed alias
npm run db:seed

# Option 3: Using Prisma directly (after migration)
npx prisma db seed

# Option 4: Run directly with tsx
npx tsx prisma/seed.ts
```

### Prerequisites

1. Ensure your `.env` file has the correct `DATABASE_URL`
2. Run migrations to create the database schema:
   ```bash
   npx prisma migrate dev
   ```

### Full Database Reset + Seed

If you want to completely reset your database and seed fresh data:

```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# The seed will run automatically after reset
# Or run it manually
npm run seed
```

## Sample Data

### Users Created

| Username | Email | Default Password |
|----------|-------|-----------------|
| alice_innovator | alice@example.com | password123 |
| bob_creator | bob@example.com | password123 |
| charlie_dev | charlie@example.com | password123 |
| diana_designer | diana@example.com | password123 |
| evan_engineer | evan@example.com | password123 |

### Ideas Created

The seed creates 10 diverse ideas covering various domains:
- AI-Powered Code Review Assistant
- Sustainable Shopping Marketplace
- Remote Team Collaboration Hub
- Personal Finance AI Coach
- Fitness Gamification Platform
- And more...

Each idea has:
- Different statuses (DRAFT, VALIDATED, WIP, LAUNCHED)
- Realistic engagement metrics
- Associated comments and votes

## Customization

You can customize the seed data by modifying `/backend/prisma/seed.ts`:

- **userData**: Add/modify user profiles
- **ideaData**: Add/modify idea samples
- **commentTemplates**: Customize comment messages
- **replyTemplates**: Customize reply messages

### Example: Adding More Users

```typescript
const userData = [
  // ... existing users
  {
    username: 'new_user',
    email: 'newuser@example.com',
    bio: 'Your custom bio',
    profilePicture: 'https://i.pravatar.cc/150?img=6',
  },
];
```

## Seed Script Structure

The seed script follows this execution flow:

```
main()
  ├── clearDatabase()      // Delete existing data
  ├── seedUsers()          // Create users
  ├── seedIdeas()          // Create ideas for users
  ├── seedVotes()          // Create votes from users on ideas
  ├── seedComments()       // Create comments and replies
  └── seedPinnedIdeas()    // Pin ideas for users
```

## Important Notes

⚠️ **Warning**: This script will DELETE ALL existing data before seeding. Only use in development environments!

✅ **Safe for**:
- Local development
- Testing environments
- Demo setups

❌ **Never use in**:
- Production environments
- Environments with real user data

## Troubleshooting

### Error: "Invalid `prisma.user.create()` invocation"

**Solution**: Make sure you've run migrations first:
```bash
npx prisma migrate dev
```

### Error: "Unique constraint violation"

**Solution**: The seed script should clear data first, but if you encounter this, manually reset:
```bash
npx prisma migrate reset
```

### Error: "Cannot find module '@prisma/client'"

**Solution**: Generate the Prisma client:
```bash
npx prisma generate
```

## Development Tips

1. **Quick Reset**: During development, use `npx prisma migrate reset` to quickly reset and reseed
2. **Test Different Scenarios**: Modify the randomization percentages to test edge cases
3. **Add Custom Data**: Add specific test cases you need to the data arrays
4. **Verify Seeded Data**: Use Prisma Studio to inspect seeded data:
   ```bash
   npx prisma studio
   ```

## Relationship Integrity

The seed script ensures all relationships are properly maintained:

- ✅ All foreign keys are valid
- ✅ Unique constraints are respected (userId + ideaId for votes, userId + pinOrder for pinned ideas)
- ✅ Cascading deletes work correctly
- ✅ Self-referencing relationships (comment replies) are properly structured
- ✅ Counts are accurately updated (upvotesCount, commentsCount, etc.)

## Support

For issues or questions about the seed script, please check:
1. This README
2. The Prisma schema: `prisma/schema.prisma`
3. The seed script: `prisma/seed.ts`
