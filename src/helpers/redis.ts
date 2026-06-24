import Redis from 'ioredis';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';

const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  logger.info('🔑 Redis client connected successfully');
});

redisClient.on('error', (err) => {
  errorLogger.error('Redis client error:', err);
});

/**
 * Get item from cache
 */
const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await redisClient.get(key);
    if (!cachedData) return null;
    return JSON.parse(cachedData) as T;
  } catch (error) {
    errorLogger.error(`Redis get error for key "${key}":`, error);
    return null;
  }
};

/**
 * Set item in cache (with optional TTL in seconds)
 */
const setCache = async (key: string, data: any, ttlSeconds?: number): Promise<void> => {
  try {
    const serializedData = JSON.stringify(data);
    if (ttlSeconds && ttlSeconds > 0) {
      await redisClient.set(key, serializedData, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, serializedData);
    }
  } catch (error) {
    errorLogger.error(`Redis set error for key "${key}":`, error);
  }
};

/**
 * Delete specific key from cache
 */
const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    errorLogger.error(`Redis del error for key "${key}":`, error);
  }
};

/**
 * Delete keys matching a pattern using SCAN (non-blocking)
 */
const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    let cursor = '0';
    do {
      const reply = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply[0];
      const keys = reply[1];
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    errorLogger.error(`Redis del pattern error for "${pattern}":`, error);
  }
};

/**
 * Generate a deterministic cache key for a given prefix and query filters
 */
const generateQueryKey = (prefix: string, query: Record<string, any>): string => {
  const sortedKeys = Object.keys(query).sort();
  const queryString = sortedKeys
    .map((key) => `${key}=${JSON.stringify(query[key])}`)
    .join('&');
  return `${prefix}:${queryString || 'default'}`;
};

export const RedisHelper = {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  generateQueryKey,
};
