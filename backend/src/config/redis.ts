import Redis from 'ioredis';
import { config } from './env.js';

/**
 * Redis client instance for rate limiting and caching
 */
export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
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

redis.on('error', (err: Error) => {
  isConnected = false;
  console.error('Redis: Connection error:', err.message);
});

redis.on('close', () => {
  isConnected = false;
  console.log('Redis: Connection closed');
});

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => isConnected;

/**
 * Graceful shutdown for Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    console.log('Redis: Connection closed gracefully');
  } catch (err) {
    console.error('Redis: Error closing connection:', err);
    redis.disconnect();
  }
};
