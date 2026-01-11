# VALIDUCT

**Stop guessing. Start validating.**

> The idea validation platform that gives builders real demand signals, not just opinions.

## Overview

Validuct is a validation platform that helps entrepreneurs and builders validate their product ideas with structured community feedback and real demand signals — before investing significant time and resources.

Unlike traditional forums where you just get opinions, Validuct provides **actionable validation**: real demand signals like "Would Pay" and "Problem Real", category-based feedback, and journey tracking from concept to launch.

## Why Validuct?

| Platform | What It Offers | What It Lacks |
|----------|----------------|---------------|
| Product Hunt | Launch showcase | Pre-launch validation, actionable feedback |
| Reddit | Discussion | Structure, data, follow-through tracking |
| Indie Hackers | Community stories | Systematic validation framework |
| Twitter/X | Viral reach | Depth, organized feedback, persistence |

**Validuct fills the gap:** Structured validation with real demand signals, not just opinions.

## Features

### Live Now

#### Validation Signals
- **Would Pay** — Real demand indicator showing willingness to pay
- **Problem Real** — Validates the problem actually exists
- **Ready to Build** — Signals the idea is clear enough to execute
- **Needs Clarity** — Feedback that more detail is needed

#### Category-Based Comments
- Problem Clarity feedback
- Target Users discussions
- Willingness to Pay insights
- Technical Feasibility assessments
- Feature Suggestions
- General discussions
- Nested replies for in-depth conversations
- "Helpful" voting on comments

#### Builder Profiles
- Personalized profiles with unique usernames and profile pictures
- View all ideas by a specific user
- Pin up to 5 favorite ideas for quick access
- Validation summary showing aggregated signals across all ideas

#### Idea Lifecycle
- Track your idea from Draft → Validated → WIP → Launched
- Add launch links when your idea ships
- Community engagement metrics

#### Discovery Timelines
- **NEW**: Latest ideas submitted to the platform
- **TRENDING**: Most upvoted ideas in the last 24 hours
- **TOP**: All-time top-ranked ideas

### Coming Soon

- AI-powered competitor & market analysis
- Waitlist collection for your ideas
- Validation analytics & insights dashboard

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with OAuth + JWT
- **Caching**: Redis for rate limiting

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Redis (optional, for rate limiting)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Ayroid/Validuct.git
cd Validuct
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Configure environment variables (see `.env.example` in each directory)

5. Run database migrations
```bash
cd backend
npx prisma migrate dev
```

6. Run the development servers

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

## Project Structure

```
Validuct/
├── frontend/          # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/           # Utilities and API clients
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   └── prisma/    # Database schema
└── README.md          # This file
```

## API Endpoints

### Ideas
- `GET /api/v1/ideas` — Get ideas with timeline filter
- `POST /api/v1/ideas` — Create new idea
- `GET /api/v1/ideas/:id` — Get single idea
- `PATCH /api/v1/ideas/:id` — Update idea
- `DELETE /api/v1/ideas/:id` — Delete idea

### Validation Signals
- `POST /api/v1/ideas/:id/signals` — Toggle validation signal
- `GET /api/v1/ideas/:id/signals` — Get signals for idea

### Comments
- `POST /api/v1/ideas/:id/comments` — Create comment
- `GET /api/v1/ideas/:id/comments` — Get comments
- `POST /api/v1/comments/:id/helpful` — Toggle helpful vote

### Users
- `GET /api/v1/users/:username` — Get user profile
- `GET /api/v1/users/:username/ideas` — Get user's ideas
- `GET /api/v1/users/:username/validation-summary` — Get validation summary

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

---

**Built by [Ayroid](https://ayroid.in)**
