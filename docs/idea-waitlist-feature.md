# Idea Waitlist Feature Documentation

## Overview

The Idea Waitlist feature allows users to express interest in an idea by submitting their email. Idea owners can view the list of interested users through a private, unique URL.

---

## Features

1. **Waitlist visible on each idea** - Displayed under validation signals
2. **Email submission** - Users can join the waitlist by providing their email
3. **Owner vs Non-owner views**:
   - **Non-owners**: See an email input form to join
   - **Owners**: See a count + "View List" button
4. **Private waitlist page** - Accessible only by the owner via unique URL (`/idea/:ideaId/waitlist/:accessToken`)
5. **Pagination** - Waitlist entries are paginated (20 per page) with "Load More"
6. **Export functionality** - Copy all emails or download as CSV

---

## Database Schema

### Prisma Model: `IdeaWaitlist`

**File:** `backend/prisma/schema.prisma`

```prisma
model IdeaWaitlist {
  id        String   @id @default(uuid())
  ideaId    String   @map("idea_id")
  email     String   @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")

  idea Idea @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  @@unique([ideaId, email])
  @@index([ideaId])
  @@map("idea_waitlist")
}
```

### Idea Model Addition

```prisma
model Idea {
  // ... existing fields ...
  waitlistAccessToken String? @unique @map("waitlist_access_token")

  // Relations
  waitlist IdeaWaitlist[]
}
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/ideas/:ideaId/waitlist` | Public | Join waitlist (rate limited: 10/hour per IP) |
| `GET` | `/api/v1/ideas/:ideaId/waitlist` | Optional | Get waitlist stats (count + accessToken for owner) |
| `GET` | `/api/v1/ideas/:ideaId/waitlist/:accessToken` | Required | Get paginated waitlist (owner only) |
| `GET` | `/api/v1/ideas/:ideaId/waitlist/:accessToken/export` | Required | Get all emails for export (owner only) |

### Query Parameters

**Paginated endpoint:**
- `page` (default: 1)
- `limit` (default: 20, max: 50)

### Response Examples

**Join Waitlist (POST)**
```json
{
  "success": true,
  "data": { "id": "uuid", "joined": true },
  "message": "Successfully joined the waitlist"
}
```

**Get Stats (GET)**
```json
{
  "success": true,
  "data": {
    "count": 42,
    "accessToken": "uuid-or-null",
    "isOwner": true
  }
}
```

**Get Paginated Waitlist (GET)**
```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "ideaHeading": "My Idea",
    "totalCount": 42,
    "entries": [
      { "id": "uuid", "email": "user@example.com", "createdAt": "2024-01-01T00:00:00Z" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "total_pages": 3
    }
  }
}
```

**Export All Emails (GET)**
```json
{
  "success": true,
  "data": {
    "ideaId": "uuid",
    "ideaHeading": "My Idea",
    "totalCount": 42,
    "entries": [
      { "email": "user@example.com", "createdAt": "2024-01-01T00:00:00Z" }
    ]
  }
}
```

---

## Backend Files

### Service Layer

**File:** `backend/src/services/ideaWaitlistService.ts`

```typescript
export class IdeaWaitlistService {
  static async joinWaitlist(ideaId: string, email: string)
  static async getWaitlistStats(ideaId: string, userId?: string)
  static async getWaitlistByToken(ideaId, accessToken, userId, page, limit)
  static async getAllWaitlistEmails(ideaId, accessToken, userId)
  private static async verifyOwnerAccess(ideaId, accessToken, userId)
}
```

### Controller

**File:** `backend/src/controllers/ideaWaitlistController.ts`

```typescript
export class IdeaWaitlistController {
  static async joinWaitlist(req, res, next)
  static async getWaitlistStats(req, res, next)
  static async getWaitlistByToken(req, res, next)
  static async getAllWaitlistEmails(req, res, next)
}
```

### Routes

**File:** `backend/src/routes/ideaWaitlistRoutes.ts`

```typescript
router.post('/ideas/:ideaId/waitlist', ideaWaitlistLimiter, validate(ideaWaitlistSchema), joinWaitlist)
router.get('/ideas/:ideaId/waitlist', optionalProtect, getWaitlistStats)
router.get('/ideas/:ideaId/waitlist/:accessToken', protect, getWaitlistByToken)
router.get('/ideas/:ideaId/waitlist/:accessToken/export', protect, getAllWaitlistEmails)
```

### Validation Schema

**File:** `backend/src/utils/validation.ts`

```typescript
export const ideaWaitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

### Rate Limiter

**File:** `backend/src/middleware/rateLimiter.ts`

```typescript
export const ideaWaitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  store: createRedisStore('idea-waitlist'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many waitlist requests, please try again later',
});
```

---

## Frontend Files

### TypeScript Types

**File:** `frontend/types/index.ts`

```typescript
export interface IdeaWaitlistStats {
  count: number;
  accessToken: string | null;
  isOwner: boolean;
}

export interface IdeaWaitlistEntry {
  id: string;
  email: string;
  createdAt: string;
}

export interface IdeaWaitlistData {
  ideaId: string;
  ideaHeading: string;
  totalCount: number;
  entries: IdeaWaitlistEntry[];
  pagination: PaginationMeta;
}

export interface IdeaWaitlistExport {
  ideaId: string;
  ideaHeading: string;
  totalCount: number;
  entries: { email: string; createdAt: string }[];
}
```

### API Layer

**File:** `frontend/lib/api/ideaWaitlist.ts`

```typescript
export const ideaWaitlistApi = {
  joinWaitlist: async (ideaId: string, email: string)
  getWaitlistStats: async (ideaId: string)
  getWaitlistByToken: async (ideaId, accessToken, { page, limit })
  getAllWaitlistEmails: async (ideaId, accessToken)
}
```

### Components

**IdeaWaitlist Component**

**File:** `frontend/components/IdeaWaitlist.tsx`

Props:
- `ideaId: string`
- `ideaOwnerId: string`

Behavior:
- **Owner view**: Shows count + "View List" button
- **Non-owner view**: Shows email input form

**Waitlist Detail Page**

**File:** `frontend/app/idea/[id]/waitlist/[token]/page.tsx`

Features:
- Protected route (redirects if unauthenticated)
- Paginated list with "Load More" button
- "Copy All Emails" button (fetches all via export endpoint)
- "Download CSV" button (fetches all via export endpoint)
- Returns 404 for non-owners or invalid tokens

---

## Security Considerations

| Concern | Solution |
|---------|----------|
| URL privacy | Unique `accessToken` UUID in URL, not guessable |
| Ownership verification | Backend verifies both userId match AND accessToken match |
| Unauthorized access | Returns 404 (not 403) to prevent enumeration |
| Spam prevention | Rate limit: 10 requests/hour per IP |
| Duplicate emails | Database unique constraint on `[ideaId, email]` |

---

## Integration Points

### Idea Detail Page

**File:** `frontend/app/idea/[id]/page.tsx`

```tsx
import IdeaWaitlist from "@/components/IdeaWaitlist";

// After ValidationSignals section
<section className="mt-4">
  <IdeaWaitlist ideaId={idea.id} ideaOwnerId={idea.userId} />
</section>
```

### App Routes Registration

**File:** `backend/src/app.ts`

```typescript
import ideaWaitlistRoutes from './routes/ideaWaitlistRoutes.js';
app.use('/api/v1', ideaWaitlistRoutes);
```

---

## File Summary

### Backend (Created)
- `backend/src/services/ideaWaitlistService.ts`
- `backend/src/controllers/ideaWaitlistController.ts`
- `backend/src/routes/ideaWaitlistRoutes.ts`

### Backend (Modified)
- `backend/prisma/schema.prisma` - Added IdeaWaitlist model + waitlistAccessToken field
- `backend/src/utils/validation.ts` - Added ideaWaitlistSchema
- `backend/src/middleware/rateLimiter.ts` - Added ideaWaitlistLimiter
- `backend/src/app.ts` - Registered routes

### Frontend (Created)
- `frontend/lib/api/ideaWaitlist.ts`
- `frontend/components/IdeaWaitlist.tsx`
- `frontend/app/idea/[id]/waitlist/[token]/page.tsx`

### Frontend (Modified)
- `frontend/types/index.ts` - Added waitlist types
- `frontend/app/idea/[id]/page.tsx` - Integrated IdeaWaitlist component

---

## Database Migration

Run after schema changes:

```bash
cd backend
npx prisma db push
# OR for production
npx prisma migrate dev --name add_idea_waitlist
```
