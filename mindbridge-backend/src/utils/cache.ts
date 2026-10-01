import { createClient } from 'redis';

// Initialize Redis Client (Connects to localhost in dev, ElastiCache in prod)
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('[Redis Client Error]', err));

export const connectCache = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('✅ Connected to Redis Cache Layer');
    } catch (err) {
      console.error('Failed to connect to Redis', err);
    }
  }
};

/**
 * Scalable Cache Wrapper
 * @param key Unique cache identifier
 * @param ttl Time to live in seconds
 * @param fetcher Async function to fetch fresh data on cache miss
 */
export async function getOrSetCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redisClient.isOpen) {
    // Fallback if Redis is down (graceful degradation)
    return fetcher(); 
  }

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.error(`Cache read error for key ${key}`, err);
  }

  const freshData = await fetcher();
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(freshData));
  } catch (err) {
    console.error(`Cache write error for key ${key}`, err);
  }
  
  return freshData;
}
