# Rate Limiting Implementation Guide

A comprehensive, line-by-line explanation of the rate limiting implementation using `express-rate-limit` with Redis as the backing store.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Dependencies](#dependencies)
3. [Redis Client Setup](#redis-client-setup)
4. [Rate Limiter Middleware](#rate-limiter-middleware)
5. [Route Integration](#route-integration)
6. [Health Check & Graceful Shutdown](#health-check--graceful-shutdown)
7. [Testing Rate Limits](#testing-rate-limits)
8. [Rate Limit Summary](#rate-limit-summary)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Incoming Request                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Express Middleware Stack                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    CORS     │→ │    JSON     │→ │   General   │→ │   Routes    │    │
│  │             │  │   Parser    │  │   Limiter   │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ Auth Routes │ │ Idea Routes │ │ Vote Routes │
            │ authLimiter │ │ createIdea  │ │ voteLimiter │
            │             │ │   Limiter   │ │             │
            └─────────────┘ └─────────────┘ └─────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                    ┌─────────────────────────────────┐
                    │            Redis                 │
                    │  ┌───────────────────────────┐  │
                    │  │ rl:auth:192.168.1.1 → 3   │  │
                    │  │ rl:vote:user:abc123 → 15  │  │
                    │  │ rl:general:10.0.0.1 → 42  │  │
                    │  └───────────────────────────┘  │
                    └─────────────────────────────────┘
```

### Why Redis?

- **Persistence**: Rate limit counters survive server restarts
- **Zero-downtime deploys**: New server instances share the same counters
- **Scalability**: Multiple server instances share rate limit state
- **Speed**: Redis is in-memory, so lookups are sub-millisecond

---

## Dependencies

```bash
npm install express-rate-limit rate-limit-redis ioredis
```

| Package | Purpose |
|---------|---------|
| `express-rate-limit` | Core rate limiting middleware for Express |
| `rate-limit-redis` | Redis store adapter for express-rate-limit |
| `ioredis` | Redis client with better TypeScript support than `redis` |

---

## Redis Client Setup

**File: `backend/src/config/redis.ts`**

### Full Code

```typescript
import Redis from 'ioredis';
import { config } from './env';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis: Max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

let isConnected = false;

redis.on('connect', () => {
  console.log('Redis: Connecting...');
});

redis.on('ready', () => {
  isConnected = true;
  console.log('Redis: Connected and ready');
});

redis.on('error', (err) => {
  isConnected = false;
  console.error('Redis: Connection error:', err.message);
});

redis.on('close', () => {
  isConnected = false;
  console.log('Redis: Connection closed');
});

export const isRedisConnected = (): boolean => isConnected;

export const closeRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log('Redis: Connection closed gracefully');
  } catch (err) {
    console.error('Redis: Error closing connection:', err);
    redis.disconnect();
  }
};
```

### Line-by-Line Explanation

#### Imports

```typescript
import Redis from 'ioredis';
import { config } from './env';
```

- **Line 1**: Import the `Redis` class from `ioredis`. This is the main client class.
- **Line 2**: Import our app config to get `REDIS_URL`.

#### Client Initialization

```typescript
export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis: Max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  enableReadyCheck: true,
  lazyConnect: false,
});
```

| Option | Value | Explanation |
|--------|-------|-------------|
| `maxRetriesPerRequest` | `3` | Each Redis command will retry up to 3 times if it fails |
| `retryStrategy` | function | Custom logic for reconnection delays |
| `enableReadyCheck` | `true` | Waits for Redis `READY` event before accepting commands |
| `lazyConnect` | `false` | Connects immediately when the client is created |

#### Retry Strategy Deep Dive

```typescript
retryStrategy: (times) => {
  // times = number of retry attempts so far
  if (times > 3) {
    console.error('Redis: Max retries reached, giving up');
    return null;  // null = stop retrying, give up
  }
  // Exponential backoff: 200ms, 400ms, 600ms (capped at 2000ms)
  return Math.min(times * 200, 2000);
}
```

This creates a **backoff pattern**:
- 1st retry: wait 200ms
- 2nd retry: wait 400ms
- 3rd retry: wait 600ms
- 4th attempt: give up (returns `null`)

#### Event Handlers

```typescript
let isConnected = false;

redis.on('connect', () => {
  console.log('Redis: Connecting...');
});

redis.on('ready', () => {
  isConnected = true;
  console.log('Redis: Connected and ready');
});

redis.on('error', (err) => {
  isConnected = false;
  console.error('Redis: Connection error:', err.message);
});

redis.on('close', () => {
  isConnected = false;
  console.log('Redis: Connection closed');
});
```

**Event Lifecycle:**

```
Client Created → 'connect' → 'ready' → [operational]
                                            │
                              'error' ←─────┘ (on failure)
                                │
                            'close' (connection terminated)
```

| Event | When it fires | What we do |
|-------|---------------|------------|
| `connect` | TCP connection established | Log status |
| `ready` | Redis fully operational | Set `isConnected = true` |
| `error` | Something went wrong | Set `isConnected = false`, log error |
| `close` | Connection closed | Set `isConnected = false` |

#### Exported Functions

```typescript
export const isRedisConnected = (): boolean => isConnected;
```

This function lets other parts of the app check if Redis is healthy (used in `/health` endpoint).

```typescript
export const closeRedis = async (): Promise<void> => {
  try {
    await redis.quit();  // Graceful: waits for pending commands
    console.log('Redis: Connection closed gracefully');
  } catch (err) {
    console.error('Redis: Error closing connection:', err);
    redis.disconnect();  // Forceful: closes immediately
  }
};
```

**`quit()` vs `disconnect()`:**
- `quit()`: Sends `QUIT` command to Redis, waits for pending operations
- `disconnect()`: Immediately closes the socket (use as fallback)

---

## Rate Limiter Middleware

**File: `backend/src/middleware/rateLimiter.ts`**

### Full Code

```typescript
import rateLimit, { Options } from 'express-rate-limit';
import RedisStore, { SendCommandFn } from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from '../config/redis';
import { AuthRequest } from '../types/index';

const rateLimitResponse = (
  _req: Request,
  res: Response,
  _next: unknown,
  options: Options
): void => {
  res.status(429).json({
    success: false,
    error: {
      message: options.message as string,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
  });
};

const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: ((...args: string[]) =>
      redis.call(args[0], ...args.slice(1))) as SendCommandFn,
    prefix: `rl:${prefix}:`,
  });

const ipKeyGenerator = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    'unknown'
  );
};

const userKeyGenerator = (req: Request): string => {
  const authReq = req as AuthRequest;
  if (authReq.userId) {
    return `user:${authReq.userId}`;
  }
  return `ip:${ipKeyGenerator(req)}`;
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('auth'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many authentication attempts, please try again later',
  handler: rateLimitResponse,
});

export const createIdeaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('create-idea'),
  keyGenerator: userKeyGenerator,
  message: 'Too many ideas created, please try again later',
  handler: rateLimitResponse,
});

export const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('vote'),
  keyGenerator: userKeyGenerator,
  message: 'Too many votes, please try again later',
  handler: rateLimitResponse,
});

export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('comment'),
  keyGenerator: userKeyGenerator,
  message: 'Too many comments, please try again later',
  handler: rateLimitResponse,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('general'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many requests, please try again later',
  handler: rateLimitResponse,
  skip: (req: Request) => req.method !== 'GET',
});
```

### Line-by-Line Explanation

#### Imports

```typescript
import rateLimit, { Options } from 'express-rate-limit';
import RedisStore, { SendCommandFn } from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from '../config/redis';
import { AuthRequest } from '../types/index';
```

| Import | Purpose |
|--------|---------|
| `rateLimit` | Factory function to create rate limit middleware |
| `Options` | TypeScript type for rate limiter configuration |
| `RedisStore` | Adapter that stores rate limit data in Redis |
| `SendCommandFn` | Type for the Redis command function |
| `Request, Response` | Express types for type safety |
| `redis` | Our Redis client instance |
| `AuthRequest` | Custom request type with `userId` property |

#### Custom Error Response Handler

```typescript
const rateLimitResponse = (
  _req: Request,
  res: Response,
  _next: unknown,
  options: Options
): void => {
  res.status(429).json({
    success: false,
    error: {
      message: options.message as string,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
  });
};
```

**Why custom handler?**

Default `express-rate-limit` returns plain text. We want:
1. Consistent JSON format matching our API style
2. Machine-readable error code (`RATE_LIMIT_EXCEEDED`)
3. `retryAfter` in seconds (not milliseconds) for client convenience

**Parameters:**
| Parameter | Type | Purpose |
|-----------|------|---------|
| `_req` | `Request` | Request object (unused, prefixed with `_`) |
| `res` | `Response` | Response object to send the error |
| `_next` | `unknown` | Next middleware (unused in error handler) |
| `options` | `Options` | The rate limiter's config (contains `message`, `windowMs`, etc.) |

**HTTP 429**: "Too Many Requests" - the standard status code for rate limiting.

#### Redis Store Factory

```typescript
const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: ((...args: string[]) =>
      redis.call(args[0], ...args.slice(1))) as SendCommandFn,
    prefix: `rl:${prefix}:`,
  });
```

**Line-by-line breakdown:**

| Line | Code | Explanation |
|------|------|-------------|
| 1 | `createRedisStore = (prefix: string)` | Factory function with unique prefix per limiter |
| 2 | `new RedisStore({...})` | Creates the Redis store adapter |
| 3 | `sendCommand: ((...args: string[]) =>` | Custom function to send raw Redis commands |
| 4 | `redis.call(args[0], ...args.slice(1))` | `args[0]` = command (GET/SET/INCR), rest = arguments |
| 5 | `as SendCommandFn` | Type assertion for TypeScript |
| 6 | `prefix: 'rl:${prefix}:'` | All keys will start with this prefix |

**Example Redis keys generated:**
```
rl:auth:192.168.1.1       → auth limiter, IP-based key
rl:vote:user:abc-123      → vote limiter, user-based key
rl:general:10.0.0.5       → general limiter, IP-based key
```

#### IP-Based Key Generator

```typescript
const ipKeyGenerator = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    'unknown'
  );
};
```

**Why this logic?**

When behind a proxy (Nginx, load balancer), the real client IP is in `X-Forwarded-For` header:

```
X-Forwarded-For: client_ip, proxy1_ip, proxy2_ip
```

| Step | Code | What it does |
|------|------|--------------|
| 1 | `req.headers['x-forwarded-for']` | Get the header value |
| 2 | `.split(',')[0]` | Get first IP (the actual client) |
| 3 | `.trim()` | Remove whitespace |
| 4 | `\|\| req.ip` | Fallback to Express's detected IP |
| 5 | `\|\| 'unknown'` | Final fallback (should never happen) |

#### User-Based Key Generator

```typescript
const userKeyGenerator = (req: Request): string => {
  const authReq = req as AuthRequest;
  if (authReq.userId) {
    return `user:${authReq.userId}`;
  }
  return `ip:${ipKeyGenerator(req)}`;
};
```

**Logic flow:**
```
Request comes in
       │
       ▼
Is userId present? ──Yes──► return "user:{userId}"
       │
       No
       │
       ▼
return "ip:{client_ip}"
```

**Why both?** Protected routes have `protect` middleware that sets `userId`. The rate limiter runs AFTER `protect`, so:
- Authenticated users → per-user limits (can't bypass by changing IP)
- Unauthenticated requests → IP-based limits (fallback)

#### Individual Rate Limiters

##### Auth Limiter (IP-based)

```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('auth'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many authentication attempts, please try again later',
  handler: rateLimitResponse,
});
```

| Option | Value | Explanation |
|--------|-------|-------------|
| `windowMs` | `900000` (15 min) | Time window for counting requests |
| `limit` | `10` | Max requests allowed in the window |
| `standardHeaders` | `'draft-7'` | Use latest RateLimit headers standard |
| `legacyHeaders` | `false` | Don't send old X-RateLimit-* headers |
| `store` | Redis store | Where to persist counters |
| `keyGenerator` | IP-based | How to identify unique clients |
| `message` | string | Error message when limit exceeded |
| `handler` | custom function | How to respond when limit exceeded |

**Response headers (draft-7 standard):**
```http
RateLimit-Limit: 10
RateLimit-Remaining: 7
RateLimit-Reset: 1704307200
```

##### Create Idea Limiter (User-based)

```typescript
export const createIdeaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('create-idea'),
  keyGenerator: userKeyGenerator,  // <-- User-based!
  message: 'Too many ideas created, please try again later',
  handler: rateLimitResponse,
});
```

**Key difference:** Uses `userKeyGenerator` so each authenticated user gets their own limit. User A creating 20 ideas doesn't affect User B's limit.

##### Vote Limiter (User-based)

```typescript
export const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('vote'),
  keyGenerator: userKeyGenerator,
  message: 'Too many votes, please try again later',
  handler: rateLimitResponse,
});
```

**60 votes/hour** allows users to browse and vote on multiple ideas without hitting limits, while preventing automated vote manipulation.

##### Comment Limiter (User-based)

```typescript
export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('comment'),
  keyGenerator: userKeyGenerator,
  message: 'Too many comments, please try again later',
  handler: rateLimitResponse,
});
```

**30 comments/hour** allows active discussion while preventing spam.

##### General Limiter (IP-based, GET only)

```typescript
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('general'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many requests, please try again later',
  handler: rateLimitResponse,
  skip: (req: Request) => req.method !== 'GET',  // <-- Only GET requests!
});
```

**`skip` function explained:**
```typescript
skip: (req: Request) => req.method !== 'GET'
```
| `req.method` | `!== 'GET'` | Result | Rate limited? |
|--------------|-------------|--------|---------------|
| `GET` | `false` | `false` | Yes |
| `POST` | `true` | `true` | No (skipped) |
| `PUT` | `true` | `true` | No (skipped) |
| `DELETE` | `true` | `true` | No (skipped) |

**Why only GET?** POST/PUT/DELETE have their own specific limiters. This prevents double-counting.

---

## Route Integration

### Middleware Order Matters!

For authenticated routes, the order is critical:

```
protect → rateLimiter → validate → controller
```

**Why this order?**
1. `protect` sets `req.userId` (needed by user-based limiters)
2. Rate limiter uses `userId` if available
3. Validation only runs if not rate-limited
4. Controller only runs if validation passes

### Auth Routes

**File: `backend/src/routes/authRoutes.ts`**

```typescript
import { authLimiter } from '../middleware/rateLimiter.js';

router.post('/oauth', authLimiter, validate(oauthSchema), AuthController.oauth);
```

**Flow:**
```
POST /oauth → authLimiter → validate → AuthController.oauth → Response
                  │
                  └─► 429 if limit exceeded (stops here)
```

### Idea Routes

**File: `backend/src/routes/ideaRoutes.ts`**

```typescript
import { createIdeaLimiter } from '../middleware/rateLimiter.js';

router.post('/', protect, createIdeaLimiter, validate(createIdeaSchema), IdeaController.createIdea);
```

**Flow:**
```
POST /ideas → protect → createIdeaLimiter → validate → IdeaController → Response
                │              │
                │              └─► 429 if limit exceeded
                └─► 401 if not authenticated
```

### Vote Routes

**File: `backend/src/routes/voteRoutes.ts`**

```typescript
import { voteLimiter } from '../middleware/rateLimiter.js';

router.post('/ideas/:id/vote', protect, voteLimiter, validate(voteSchema), VoteController.voteOnIdea);
```

### Comment Routes

**File: `backend/src/routes/commentRoutes.ts`**

```typescript
import { commentLimiter } from '../middleware/rateLimiter.js';

router.post(
  '/ideas/:id/comments',
  protect,
  commentLimiter,
  validate(createCommentSchema),
  CommentController.createComment
);
```

### Global Limiter in App

**File: `backend/src/app.ts`**

```typescript
import { generalLimiter } from './middleware/rateLimiter.js';

// Applied to ALL routes
app.use(generalLimiter);
```

Since `generalLimiter` has `skip: (req) => req.method !== 'GET'`, it only affects GET requests.

---

## Health Check & Graceful Shutdown

### Health Check

**File: `backend/src/app.ts`**

```typescript
import { isRedisConnected } from './config/redis.js';

app.get('/health', (_req, res) => {
  const redisStatus = isRedisConnected();
  res.status(redisStatus ? 200 : 503).json({
    success: redisStatus,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus ? 'connected' : 'disconnected',
    },
  });
});
```

**Response when healthy (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-03T10:30:00.000Z",
  "services": {
    "redis": "connected"
  }
}
```

**Response when Redis is down (503):**
```json
{
  "success": false,
  "message": "Server is running",
  "timestamp": "2024-01-03T10:30:00.000Z",
  "services": {
    "redis": "disconnected"
  }
}
```

**Why 503?** Load balancers use `/health` to decide if server can receive traffic. If Redis is down, rate limiting won't work → potential security risk.

### Graceful Shutdown

**File: `backend/src/server.ts`**

```typescript
import { closeRedis } from './config/redis.js';

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  server.close(async () => {
    await closeRedis();        // Close Redis FIRST
    await disconnectDatabase(); // Then close database
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

**Shutdown sequence:**
```
SIGTERM/SIGINT received
        │
        ▼
server.close() ─── Stop accepting new connections
        │          Wait for existing requests to finish
        ▼
closeRedis() ───── Send QUIT command to Redis
        │          Wait for pending commands
        ▼
disconnectDatabase() ── Close Prisma connection
        │
        ▼
process.exit(0) ── Clean exit
```

**Signals:**
| Signal | Source | Use case |
|--------|--------|----------|
| `SIGTERM` | Process managers (PM2, Docker, K8s) | Graceful stop |
| `SIGINT` | Ctrl+C in terminal | Development stop |

---

## Testing Rate Limits

### Manual Testing with cURL

**Test auth limiter (should block after 10 requests):**

```bash
# Run this in a loop
for i in {1..12}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/v1/auth/oauth \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","username":"test","provider":"google"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected output:**
```
Request 1: Status: 200
Request 2: Status: 200
...
Request 10: Status: 200
Request 11: Status: 429  # Rate limited!
Request 12: Status: 429
```

**Check rate limit headers:**

```bash
curl -I http://localhost:5000/api/v1/ideas
```

**Expected headers:**
```http
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1704307260
```

### Verify Redis Keys

```bash
# Connect to Redis CLI
redis-cli

# See all rate limit keys
KEYS rl:*

# Example output:
# 1) "rl:auth:127.0.0.1"
# 2) "rl:general:127.0.0.1"

# Check a specific key's TTL (time to live)
TTL rl:auth:127.0.0.1
# Output: 892 (seconds remaining in window)

# See the counter value
GET rl:auth:127.0.0.1
# Output: "5" (5 requests made so far)
```

### Testing User-Based Limits

```bash
# First, get a JWT token by logging in
TOKEN="your-jwt-token-here"

# Then make requests with the token
for i in {1..25}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/v1/ideas \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"heading":"Test Idea","description":"Testing rate limits"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

---

## Rate Limit Summary

| Endpoint | Limit | Window | Key Type | Purpose |
|----------|-------|--------|----------|---------|
| `POST /auth/oauth` | 10 | 15 min | IP | Prevent brute force login |
| `POST /ideas` | 20 | 1 hour | User ID | Prevent spam idea creation |
| `POST /ideas/:id/vote` | 60 | 1 hour | User ID | Prevent vote manipulation |
| `POST /ideas/:id/comments` | 30 | 1 hour | User ID | Prevent comment spam |
| All GET requests | 100 | 1 min | IP | Prevent scraping/enumeration |

---

## Environment Variables

Add to your `.env` file:

```bash
REDIS_URL=redis://localhost:6379
```

For production with authentication:

```bash
REDIS_URL=redis://:your_password@your-redis-host:6379
```

---

## Common Issues & Troubleshooting

### Redis Connection Failed

```
Redis: Connection error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis (Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Start Redis (systemd)
sudo systemctl start redis
```

### Rate Limits Not Working

1. **Check Redis connection**: `curl http://localhost:5000/health`
2. **Check Redis keys**: `redis-cli KEYS rl:*`
3. **Verify middleware order**: Rate limiter must be in the middleware chain

### Rate Limits Too Strict/Lenient

Edit values in `backend/src/middleware/rateLimiter.ts`:

```typescript
// More lenient
limit: 100,
windowMs: 60 * 60 * 1000, // 100 per hour

// More strict
limit: 5,
windowMs: 15 * 60 * 1000, // 5 per 15 minutes
```

---

## Production Checklist

- [ ] Redis is running with persistence (AOF enabled)
- [ ] Redis has authentication configured
- [ ] `REDIS_URL` is set in production environment
- [ ] Nginx/proxy is configured to pass `X-Forwarded-For` header
- [ ] Health check is monitored by load balancer
- [ ] Rate limit hits are logged/monitored
- [ ] Graceful shutdown is working (test with `kill -SIGTERM <pid>`)
