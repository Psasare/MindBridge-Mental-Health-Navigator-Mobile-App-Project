export declare const redisClient: import("redis").RedisClientType<{}, {}, {}, 3, {}>;
export declare const connectCache: () => Promise<void>;
/**
 * Scalable Cache Wrapper
 * @param key Unique cache identifier
 * @param ttl Time to live in seconds
 * @param fetcher Async function to fetch fresh data on cache miss
 */
export declare function getOrSetCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T>;
//# sourceMappingURL=cache.d.ts.map