import { Worker } from 'bullmq';
/**
 * The AI Worker processes computationally heavy AI tasks entirely in the background.
 * This guarantees the API server never blocks its Event Loop and handles high RPS easily.
 */
export declare const aiWorker: Worker<any, any, string, import("bullmq").RedisQueueBackend, import("bullmq").JobProgress, import("bullmq").ConnectionOptions>;
//# sourceMappingURL=ai.worker.d.ts.map