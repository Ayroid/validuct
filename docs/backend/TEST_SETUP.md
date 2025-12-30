# Quick Test Setup Guide

## Prerequisites
- PostgreSQL running locally
- Node.js and npm installed

## Setup Steps

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Set Up Test Database

**Option A: Automatic Setup (Recommended)**
```bash
npm run setup-test-db
```

**Option B: Manual Setup**
```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE validuct_test;
\q

# Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/validuct_test" npx prisma migrate deploy
```

### 3. Update Database Credentials (if needed)

Edit `backend/.env.test` if your PostgreSQL credentials are different:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/validuct_test
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

## Expected Output

When tests run successfully, you should see:
```
PASS tests/ideas.test.ts
  Idea API Endpoints
    POST /api/v1/ideas
      ✓ should create a new idea when authenticated
      ✓ should return 401 when not authenticated
      ✓ should validate required fields
      ✓ should create idea with launched status and link
    GET /api/v1/ideas
      ✓ should get ideas with NEW timeline
      ✓ should get ideas with TRENDING timeline
      ✓ should get ideas with TOP timeline
      ✓ should return 400 for invalid timeline
      ✓ should support pagination
    GET /api/v1/ideas/:id
      ✓ should get a single idea by id
      ✓ should return 404 for non-existent idea
      ✓ should include user vote when authenticated
    PATCH /api/v1/ideas/:id
      ✓ should update own idea
      ✓ should not update other user's idea
      ✓ should return 401 when not authenticated
      ✓ should update launched link
    DELETE /api/v1/ideas/:id
      ✓ should delete own idea
      ✓ should not delete other user's idea
      ✓ should return 401 when not authenticated
      ✓ should return 404 for non-existent idea
    GET /api/v1/users/:username/ideas
      ✓ should get all ideas by a specific user
      ✓ should return 404 for non-existent user
      ✓ should support sorting by newest
      ✓ should support sorting by popular
      ✓ should support pagination

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
```

## Troubleshooting

### Error: Database does not exist
- Make sure you ran `npm run setup-test-db`
- Or manually create the database as shown above

### Error: Connection refused
- Check if PostgreSQL is running: `pg_isready`
- Start PostgreSQL if needed

### Error: Authentication failed
- Update credentials in `.env.test`
- Make sure the PostgreSQL user has permission to create/access databases

### Tests fail after changes
- Rebuild the backend: `npm run build`
- Make sure migrations are up to date: `npx prisma migrate deploy`
