# Validuct

**Know if people will pay before you build.**

Validuct is an idea validation platform for builders. Collect waitlist signups and real validation signals before investing months building something nobody wants.

## The Problem

Likes and upvotes don't pay bills.

| Platform | The Issue |
|----------|-----------|
| Product Hunt | Need a finished product. Upvotes come from makers, not customers. |
| Reddit | "Cool idea bro" isn't validation. No way to capture interested users. |
| Twitter/X | Likes ≠ willingness to pay. Engagement rarely converts to customers. |

## The Solution

Validuct gives you actual demand signals:

- **Waitlist Collection** — Capture emails from people who want your product
- **Validation Signals** — Know if the problem is real, if people would pay, and if it's ready to build
- **Shareable Pages** — Get a landing page for your idea in minutes
- **Analytics Dashboard** — Track signal trends and see which ideas are gaining traction

## Features

### Validation Signals
Four structured signals that tell you what matters:
- **Problem Real** — The problem actually exists and people feel it
- **Would Pay** — Real willingness to pay, not just interest
- **Ready to Build** — The idea is clear enough to execute
- **Needs Clarity** — More detail needed before validation

### Waitlist Collection
- Collect emails directly on your idea page
- Export your waitlist anytime (CSV)
- Track signups over time

### Validation Analytics
- Signal distribution charts
- Daily trend tracking (last 30 days)
- Ideas by validation state
- Top performing ideas

### Builder Profiles
- Personal profile with bio and avatar
- Validation summary across all ideas
- Pin up to 5 ideas to showcase
- Filter ideas by validation state (Needs Action, Ready to Build)

### Category-Based Comments
Structured feedback in specific areas:
- Problem Clarity
- Target Users
- Willingness to Pay
- Technical Feasibility
- Feature Suggestions
- Nested replies and "Helpful" voting

### Idea Lifecycle
Track progress: Draft → Validated → WIP → Launched

### Notifications
- In-app notifications for signals, comments, and replies
- Email notifications (configurable)
- Milestone alerts

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth with OAuth (Google, GitHub) + JWT
- **Caching**: Redis

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Redis (optional)

### Installation

```bash
# Clone
git clone https://github.com/Ayroid/Validuct.git
cd Validuct

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Backend (new terminal)
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Project Structure

```
Validuct/
├── frontend/
│   ├── app/                 # Next.js app router
│   ├── components/
│   │   ├── analytics/       # Charts and dashboard
│   │   ├── landing/         # Landing page sections
│   │   └── ui/              # Shared UI components
│   ├── lib/api/             # API client functions
│   └── types/               # TypeScript types
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   └── utils/           # Validation, helpers
│   └── prisma/              # Database schema
└── README.md
```

## API Overview

### Ideas
- `GET /api/v1/ideas` — List ideas (timeline: new, trending, top)
- `POST /api/v1/ideas` — Create idea
- `GET /api/v1/ideas/:id` — Get idea with signals
- `PATCH /api/v1/ideas/:id` — Update idea
- `DELETE /api/v1/ideas/:id` — Delete idea

### Signals
- `POST /api/v1/ideas/:id/signals` — Toggle signal
- `GET /api/v1/ideas/:id/signals` — Get idea signals

### Waitlist
- `POST /api/v1/ideas/:id/waitlist` — Join waitlist
- `GET /api/v1/ideas/:id/waitlist` — Get waitlist (owner only)

### Users
- `GET /api/v1/users/:username` — Profile
- `GET /api/v1/users/:username/ideas-with-signals` — Ideas with validation data
- `GET /api/v1/users/:username/validation-summary` — Aggregated signals
- `GET /api/v1/users/:username/validation-analytics` — Analytics data

### Notifications
- `GET /api/v1/notifications` — Get notifications
- `GET /api/v1/notifications/preferences` — Get preferences
- `PATCH /api/v1/notifications/preferences` — Update preferences

## Roadmap

- [ ] Payment intent capture ("I'd pay $X")
- [ ] AI-powered market analysis
- [ ] Public API for integrations

## Contributing

Contributions welcome. Open an issue or submit a PR.

## License

MIT

---

Built by [Ayroid](https://ayroid.in)
