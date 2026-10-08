import { createClient } from 'redis';
// Initialize Redis Client (Connects to localhost in dev, ElastiCache in prod)
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('error', (err) => {
    // Only log if we are explicitly trying to use Redis to avoid spam
    if (process.env.USE_REDIS === 'true' || process.env.NODE_ENV === 'production') {
        console.error('[Redis Client Error]', err);
    }
});
export const connectCache = async () => {
    if (process.env.NODE_ENV !== 'production' && process.env.USE_REDIS !== 'true') {
        return;
    }
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log('✅ Connected to Redis Cache Layer');
        }
        catch (err) {
            console.error('Failed to connect to Redis', err);
        }
    }
};
// Simple in-memory cache for local dev fallback
const memoryCache = new Map();
export async function getOrSetCache(key, ttl, fetcher) {
    if (!redisClient.isOpen) {
        // Fallback if Redis is down (graceful degradation)
        const now = Date.now();
        const memCached = memoryCache.get(key);
        if (memCached && memCached.expiry > now) {
            return memCached.value;
        }
        const freshData = await fetcher();
        memoryCache.set(key, { value: freshData, expiry: now + (ttl * 1000) });
        return freshData;
    }
    try {
        const cached = await redisClient.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
    }
    catch (err) {
        console.error(`Cache read error for key ${key}`, err);
    }
    const freshData = await fetcher();
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(freshData));
    }
    catch (err) {
        console.error(`Cache write error for key ${key}`, err);
    }
    return freshData;
}
//# sourceMappingURL=cache.js.map