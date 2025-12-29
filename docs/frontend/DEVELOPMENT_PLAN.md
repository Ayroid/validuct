# VALIDUCT - Development Plan

## Project Overview

A community-driven idea validation platform with upvoting, commenting, and status tracking functionality.

---

## 1. Technology Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcrypt

### Database Choice: **PostgreSQL**

**Reasoning:**
- Relational data model fits well (users, ideas, comments, votes)
- ACID compliance for data integrity
- Strong support for complex queries (nested comments, sorting algorithms)
- Better for analytics (trending algorithms, vote counting)
- Mature ecosystem with excellent Node.js support (pg, Prisma, TypeORM)

### ORM: **Prisma**
- Type-safe database client
- Automatic migrations
- Excellent TypeScript integration
- Built-in query optimization

### Additional Tools
- **File Storage**: AWS S3 or Cloudinary (for profile pictures) | Store these locally in public directory in backend for MVP
- **Caching**: Redis (for hot/trending calculations)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest (backend), Jest + React Testing Library (frontend)

---

## 2. Database Schema

### Tables

#### 1. **users**
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
username          VARCHAR(50) UNIQUE NOT NULL
email             VARCHAR(255) UNIQUE NOT NULL
password_hash     VARCHAR(255) NOT NULL
profile_picture   VARCHAR(500)
bio               TEXT
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `username` (unique)
- `email` (unique)

---

#### 2. **ideas**
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
heading           VARCHAR(200) NOT NULL
description       TEXT NOT NULL
status            ENUM('validated', 'wip', 'launched', 'draft') DEFAULT 'draft'
launched_link     VARCHAR(500)
upvotes_count     INTEGER DEFAULT 0
downvotes_count   INTEGER DEFAULT 0
comments_count    INTEGER DEFAULT 0
is_pinned         BOOLEAN DEFAULT FALSE
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `user_id`
- `created_at` (for NEW timeline)
- `upvotes_count` (for TOP timeline)
- `(created_at, upvotes_count)` composite (for HOT timeline)

**Constraints:**
- Each user can pin max 5 ideas (enforced in application logic)

---

#### 3. **votes**
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
idea_id           UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE
vote_type         ENUM('upvote', 'downvote') NOT NULL
created_at        TIMESTAMP DEFAULT NOW()

UNIQUE(user_id, idea_id)
```

**Indexes:**
- `(user_id, idea_id)` composite unique
- `idea_id`

**Logic:**
- One vote per user per idea
- User can change vote (upvote → downvote or vice versa)

---

#### 4. **comments**
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
idea_id           UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE
parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE
content           TEXT NOT NULL
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idea_id`
- `parent_comment_id`
- `user_id`

**Logic:**
- Supports nested comments (replies)
- `parent_comment_id` is NULL for top-level comments

---

#### 5. **pinned_ideas** (Optional separate table for clarity)
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
idea_id           UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE
pin_order         INTEGER NOT NULL
created_at        TIMESTAMP DEFAULT NOW()

UNIQUE(user_id, idea_id)
UNIQUE(user_id, pin_order)
```

**Indexes:**
- `user_id`

**Constraints:**
- Max 5 pins per user (CHECK constraint or application logic)

---

## 3. API Endpoints Specification

### Base URL: `/api/v1`

### Authentication Endpoints

#### `POST /auth/register`
**Description:** Register a new user

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "profile_picture": "string | null",
      "created_at": "timestamp"
    },
    "token": "jwt_token"
  }
}
```

---

#### `POST /auth/login`
**Description:** Login existing user

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token"
  }
}
```

---

#### `GET /auth/me`
**Description:** Get current authenticated user
**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

---

### User Endpoints

#### `GET /users/:username`
**Description:** Get user profile by username

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "profile_picture": "string | null",
      "bio": "string | null",
      "created_at": "timestamp"
    },
    "ideas_count": 0,
    "pinned_ideas": [ /* array of idea objects */ ]
  }
}
```

---

#### `PATCH /users/me`
**Description:** Update current user profile
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "username": "string (optional)",
  "bio": "string (optional)",
  "profile_picture": "string (optional)"
}
```

**Response:** `200 OK`

---

#### `GET /users/:username/ideas`
**Description:** Get all ideas by a user

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (default: 'newest') - values: 'newest', 'oldest', 'popular'

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "ideas": [ /* array of idea objects */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

### Idea Endpoints

#### `POST /ideas`
**Description:** Create a new idea
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "heading": "string (max 200 chars)",
  "description": "string (required)",
  "status": "draft | validated | wip | launched (optional, default: draft)",
  "validated_link": "string (optional)",
  "launched_link": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "idea": { /* idea object */ }
  }
}
```

---

#### `GET /ideas/:id`
**Description:** Get a single idea with details

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "idea": {
      "id": "uuid",
      "user_id": "uuid",
      "heading": "string",
      "description": "string",
      "status": "string",
      "validated_link": "string | null",
      "launched_link": "string | null",
      "upvotes_count": 0,
      "downvotes_count": 0,
      "comments_count": 0,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "user": {
        "username": "string",
        "profile_picture": "string | null"
      },
      "user_vote": "upvote | downvote | null"
    }
  }
}
```

---

#### `PATCH /ideas/:id`
**Description:** Update an idea (only by owner)
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "heading": "string (optional)",
  "description": "string (optional)",
  "status": "string (optional)",
  "validated_link": "string (optional)",
  "launched_link": "string (optional)"
}
```

**Response:** `200 OK`

---

#### `DELETE /ideas/:id`
**Description:** Delete an idea (only by owner)
**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

#### `GET /ideas`
**Description:** Get ideas feed with timeline filters

**Query Parameters:**
- `timeline` (required) - values: 'hot', 'new', 'trending'
- `page` (default: 1)
- `limit` (default: 20)

**Timeline Logic:**
- **HOT**: Ideas with most upvotes in last 24 hours
- **NEW**: Ideas sorted by created_at DESC
- **TRENDING**: Ideas sorted by upvotes_count DESC (all time)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "ideas": [ /* array of idea objects */ ],
    "pagination": { /* pagination object */ }
  }
}
```

---

### Vote Endpoints

#### `POST /ideas/:id/vote`
**Description:** Upvote or downvote an idea
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vote_type": "upvote | downvote"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "vote": {
      "vote_type": "upvote | downvote"
    },
    "upvotes_count": 0,
    "downvotes_count": 0
  }
}
```

**Logic:**
- If user hasn't voted: create new vote
- If user has voted same type: remove vote
- If user has voted different type: update vote

---

#### `DELETE /ideas/:id/vote`
**Description:** Remove vote from an idea
**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### Comment Endpoints

#### `POST /ideas/:id/comments`
**Description:** Add a comment to an idea
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string (required)",
  "parent_comment_id": "uuid (optional, for nested replies)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "comment": { /* comment object */ }
  }
}
```

---

#### `GET /ideas/:id/comments`
**Description:** Get all comments for an idea

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "content": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "user": {
          "username": "string",
          "profile_picture": "string | null"
        },
        "replies": [ /* nested comment objects */ ]
      }
    ],
    "pagination": { /* pagination object */ }
  }
}
```

---

#### `PATCH /comments/:id`
**Description:** Update a comment (only by owner)
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:** `200 OK`

---

#### `DELETE /comments/:id`
**Description:** Delete a comment (only by owner)
**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### Pin Endpoints

#### `POST /ideas/:id/pin`
**Description:** Pin an idea (max 5)
**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pinned": true
  }
}
```

**Error:** `400 Bad Request` if user already has 5 pinned ideas

---

#### `DELETE /ideas/:id/pin`
**Description:** Unpin an idea
**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

#### `GET /users/me/pinned`
**Description:** Get current user's pinned ideas
**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pinned_ideas": [ /* array of idea objects */ ]
  }
}
```

---

## 4. Frontend Architecture

### Folder Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Home/Timeline
│   │   ├── idea/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Idea Detail
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx      # User Profile
│   │   └── idea/
│   │       └── new/
│   │           └── page.tsx      # Create Idea
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── IdeaCard.tsx
│   ├── CommentSection.tsx
│   ├── CommentItem.tsx
│   ├── VoteButtons.tsx
│   ├── Timeline.tsx
│   └── Navbar.tsx
├── lib/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── ideas.ts
│   │   ├── comments.ts
│   │   └── users.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useIdeas.ts
│   └── useComments.ts
├── context/
│   └── AuthContext.tsx
├── types/
│   └── index.ts
└── public/
```

### Key Pages/Routes

1. **`/`** - Home Timeline (HOT/NEW/TRENDING tabs)
2. **`/login`** - Login page
3. **`/register`** - Registration page
4. **`/idea/new`** - Create new idea (protected)
5. **`/idea/[id]`** - Idea detail with comments
6. **`/profile/[username]`** - User profile with their ideas

---

## 5. Backend Architecture

### Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── ideaController.ts
│   │   ├── voteController.ts
│   │   └── commentController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── models/
│   │   └── (Prisma handles this)
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── ideaRoutes.ts
│   │   ├── voteRoutes.ts
│   │   └── commentRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── ideaService.ts
│   │   ├── voteService.ts
│   │   └── commentService.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 6. Development Phases

### Phase 1: Setup & Authentication (Week 1) ✅
- [x] Setup project structure (frontend & backend)
- [x] Configure TypeScript, ESLint, Prettier
- [x] Setup PostgreSQL + Prisma
- [x] Implement database schema
- [x] Build authentication (register, login, JWT)
- [x] Create auth UI (login/register pages)
- [x] **Bonus:** OAuth (Google) authentication integration

### Phase 2: Core Idea Features (Week 2) ✅
- [x] CRUD operations for ideas
- [x] Ideas timeline API (HOT, NEW, TRENDING)
- [x] Idea listing UI with timeline tabs
- [x] Idea detail page
- [x] Create/Edit idea UI

### Phase 3: Voting System (Week 3)
- [x] Vote API endpoints
- [x] Vote UI components
- [x] Real-time vote count updates
- [x] Calculate trending/hot algorithms

### Phase 4: Comments System (Week 4) ✅
- [x] Comment CRUD APIs
- [x] Nested comments support
- [x] Comment UI with replies
- [x] Comment count tracking

### Phase 5: User Profiles (Week 5) ✅
- [x] User profile API
- [x] Profile page UI
- [x] User's ideas listing
- [x] Pin/Unpin functionality
- [x] Profile picture upload

### Phase 6: Polish & Testing (Week 6)
- [ ] Error handling & validation
- [ ] Loading states & optimistic UI
- [ ] Responsive design
- [ ] Unit & integration tests
- [ ] Performance optimization
- [ ] API documentation (Swagger)

### Phase 7: Deployment (Week 7)
- [ ] Setup production environment
- [ ] Deploy backend (Railway/Render/AWS)
- [ ] Deploy frontend (Vercel)
- [ ] Setup database (Supabase/Neon/AWS RDS)
- [ ] Configure environment variables
- [ ] Monitor & debug

---

## 7. Additional Features (Post-MVP)

1. **Search & Filters**
   - Search ideas by keywords
   - Filter by status (validated, WIP, launched)
   - Filter by category/tags

2. **Notifications**
   - Notify on comments
   - Notify on votes
   - Weekly digest

3. **Social Features**
   - Follow users
   - Share ideas on social media
   - Bookmark ideas

4. **Analytics**
   - Idea performance dashboard
   - User engagement metrics

5. **Moderation**
   - Report inappropriate content
   - Admin panel
   - Content guidelines

---

## 8. Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/validuct
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
AWS_S3_BUCKET=validuct-uploads
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. Security Considerations

1. **Authentication**
   - Secure password hashing (bcrypt, min 10 rounds)
   - HTTP-only cookies for token storage (optional)
   - Token expiration & refresh mechanism

2. **Authorization**
   - Verify ownership for update/delete operations
   - Rate limiting on API endpoints

3. **Input Validation**
   - Sanitize all user inputs
   - Validate on both frontend & backend
   - Prevent SQL injection (Prisma handles this)

4. **CORS**
   - Configure proper CORS origins
   - Protect against CSRF

5. **File Uploads**
   - Validate file types & sizes
   - Scan for malicious content
   - Use signed URLs for S3

---

## 10. Performance Optimization

1. **Database**
   - Proper indexing on frequently queried columns
   - Connection pooling
   - Query optimization

2. **Caching**
   - Redis for hot/trending calculations
   - Cache user sessions
   - Cache frequent queries

3. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization (Next.js Image)
   - Pagination for lists

4. **API**
   - Implement pagination
   - Rate limiting
   - Compression (gzip)

---

## Next Steps

1. ✅ Create README
2. ✅ Create Development Plan
3. **Setup backend project structure**
4. **Configure Prisma schema**
5. **Start with authentication implementation**

Let's get building! 🚀
