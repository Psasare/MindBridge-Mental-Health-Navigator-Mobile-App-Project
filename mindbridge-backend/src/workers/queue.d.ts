import { Queue } from 'bullmq';
export declare const aiQueue: Queue<any, any, string, any, any, string, import("bullmq").RedisQueueBackend, import("bullmq").ConnectionOptions>;
/**
 * Enqueue a heavy AI task to be processed asynchronously by the workers.
 */
export declare const dispatchAiTask: (jobName: string, data: any) => Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
//# sourceMappingURL=queue.d.ts.map