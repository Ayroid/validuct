# Backend API Tests

This directory contains comprehensive tests for the Validuct backend API.

## Setup

### 1. Create Test Database

You need to create a test database before running tests. You can do this manually or use the setup script:

**Using the setup script:**
```bash
npm run setup-test-db
```

**Manual setup:**
```bash
# Create test database
psql -U postgres -c "CREATE DATABASE validuct_test;"

# Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/validuct_test" npx prisma migrate deploy
```

### 2. Configure Environment

The test environment is configured in `.env.test`. Update the DATABASE_URL if your PostgreSQL credentials are different:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/validuct_test
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/ideas.test.ts
```

## Test Structure

```
tests/
├── setup.ts              # Test environment setup
├── helpers/
│   └── testUtils.ts     # Test utilities and helpers
└── ideas.test.ts        # Idea API endpoint tests
```

## Writing Tests

Test utilities are available in `tests/helpers/testUtils.ts`:

- `createTestUser(username, email)` - Create a test user and get auth token
- `createTestIdea(userId, data)` - Create a test idea
- `cleanupDatabase()` - Clean all test data

Example:
```typescript
import { createTestUser, createTestIdea } from './helpers/testUtils';

const user = await createTestUser();
const idea = await createTestIdea(user.id, {
  heading: 'Test Idea',
  description: 'Test description',
});
```

## Test Coverage

The test suite covers:

### Idea Endpoints
- ✅ POST /api/v1/ideas - Create idea (with auth)
- ✅ GET /api/v1/ideas - Get ideas with timeline filtering (hot/new/trending)
- ✅ GET /api/v1/ideas/:id - Get single idea
- ✅ PATCH /api/v1/ideas/:id - Update idea (owner only)
- ✅ DELETE /api/v1/ideas/:id - Delete idea (owner only)
- ✅ GET /api/v1/users/:username/ideas - Get user's ideas

### Test Scenarios
- Authentication/authorization checks
- Input validation
- Timeline algorithms (HOT, NEW, TRENDING)
- Pagination
- Ownership validation
- Error handling
