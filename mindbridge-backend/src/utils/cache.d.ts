export declare const redisClient: import("redis").RedisClientType<{}, {}, {}, 3, {}>;
export declare const connectCache: () => Promise<void>;
export declare function getOrSetCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T>;
//# sourceMappingURL=cache.d.ts.map