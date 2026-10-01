import { Queue } from 'bullmq';
import { redisClient } from '../utils/cache.js';

// Setup connection options using the existing redis instance config
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const aiQueue = new Queue('AI_PROCESSING_QUEUE', { connection });

/**
 * Enqueue a heavy AI task to be processed asynchronously by the workers.
 */
export const dispatchAiTask = async (jobName: string, data: any) => {
  try {
    const job = await aiQueue.add(jobName, data, {
      attempts: 3, // Retry up to 3 times on API failure
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true, // Keep Redis clean
      removeOnFail: false,
    });
    console.log(`[Queue] Dispatched AI Job: ${job.id} - ${jobName}`);
    return job;
  } catch (error) {
    console.error(`[Queue Error] Failed to dispatch ${jobName}`, error);
    throw error;
  }
};
