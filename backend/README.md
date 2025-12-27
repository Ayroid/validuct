# Validuct Backend

Backend API for Validuct - Community-driven idea validation platform.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcrypt

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database running locally or remotely

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the following variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A strong random secret key for JWT tokens

3. Generate Prisma Client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Running the Server

Development mode with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (env, database)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware (auth, error handling)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions (jwt, bcrypt, validation)
│   ├── types/          # TypeScript types
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── prisma/
│   └── schema.prisma   # Database schema
└── tests/              # Test files
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

## Database Schema

The database includes the following tables:

- **users** - User accounts with authentication
- **ideas** - User-submitted ideas with status tracking
- **votes** - Upvotes/downvotes on ideas
- **comments** - Comments and replies on ideas
- **pinned_ideas** - User-pinned ideas (max 5 per user)

See [prisma/schema.prisma](prisma/schema.prisma) for full schema details.

## Development Status

### Phase 1: Setup & Authentication ✅

- [x] Setup project structure (frontend & backend)
- [x] Configure TypeScript, ESLint, Prettier
- [x] Setup PostgreSQL + Prisma
- [x] Implement database schema
- [x] Build authentication (register, login, JWT)
- [x] Create auth UI (login/register pages)

### Next Steps

- Phase 2: Core Idea Features
- Phase 3: Voting System
- Phase 4: Comments System
- Phase 5: User Profiles
- Phase 6: Polish & Testing
- Phase 7: Deployment

## Security

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens are used for authentication
- All API routes use proper validation with Zod
- Error handling middleware prevents information leakage
- CORS is configured for frontend origin only

## License

ISC
