import rateLimit, { Options } from 'express-rate-limit';
import RedisStore, { SendCommandFn } from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from '../config/redis.js';
import { AuthRequest } from '../types/index.js';

/**
 * Standard rate limit error response
 */
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

/**
 * Create Redis store for rate limiting
 */
const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: ((...args: string[]) => redis.call(args[0], ...args.slice(1))) as SendCommandFn,
    prefix: `rl:${prefix}:`,
  });

/**
 * Key generator for IP-based rate limiting
 */
const ipKeyGenerator = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
};

/**
 * Key generator for user-based rate limiting (falls back to IP if not authenticated)
 */
const userKeyGenerator = (req: Request): string => {
  const authReq = req as AuthRequest;
  if (authReq.userId) {
    return `user:${authReq.userId}`;
  }
  return `ip:${ipKeyGenerator(req)}`;
};

/**
 * Auth limiter - For OAuth login/registration endpoint
 * 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('auth'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many authentication attempts, please try again later',
  handler: rateLimitResponse,
  validate: false,
});

/**
 * Create idea limiter - For idea creation endpoint
 * 20 requests per hour per user
 */
export const createIdeaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('create-idea'),
  keyGenerator: userKeyGenerator,
  message: 'Too many ideas created, please try again later',
  handler: rateLimitResponse,
});

/**
 * Vote limiter - For voting endpoint
 * 60 requests per hour per user
 */
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

/**
 * Comment limiter - For comment creation endpoint
 * 30 requests per hour per user
 */
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

/**
 * Waitlist limiter - For waitlist join endpoint
 * 5 requests per hour per IP
 */
export const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('waitlist'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many waitlist requests, please try again later',
  handler: rateLimitResponse,
  validate: false,
});

/**
 * Idea Waitlist limiter - For idea waitlist join endpoint
 * 10 requests per hour per IP
 */
export const ideaWaitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('idea-waitlist'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many waitlist requests, please try again later',
  handler: rateLimitResponse,
  validate: false,
});

/**
 * Suggestion limiter - For suggestion submission endpoint
 * 10 requests per hour per user
 */
export const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('suggestion'),
  keyGenerator: userKeyGenerator,
  message: 'Too many suggestions submitted, please try again later',
  handler: rateLimitResponse,
});

/**
 * General API limiter - For all GET requests
 * 100 requests per minute per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createRedisStore('general'),
  keyGenerator: ipKeyGenerator,
  message: 'Too many requests, please try again later',
  handler: rateLimitResponse,
  skip: (req: Request) => req.method !== 'GET',
  validate: false,
});
