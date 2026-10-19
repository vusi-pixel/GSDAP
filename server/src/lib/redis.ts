import Redis from 'ioredis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null; // stop retrying if Redis is unavailable
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => logger.info('Redis client connected'));
redis.on('error', (err) => {
  // Log redis connection warnings without crashing the app
  if ((err as any)?.code === 'ECONNREFUSED') {
    logger.warn('Redis connection refused (offline mode)');
  } else {
    logger.warn({ err }, 'Redis error');
  }
});
redis.on('reconnecting', () => logger.warn('Redis reconnecting'));

// Cache helpers - gracefully fall back when Redis is down
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status !== 'ready') return null;
      const val = await redis.get(key);
      if (!val) return null;
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // graceful fallback
    }
  },

  async del(key: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      await redis.del(key);
    } catch {
      // graceful fallback
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // graceful fallback
    }
  },
};

export default redis;
