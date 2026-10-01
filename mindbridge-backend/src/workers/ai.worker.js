import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { analyzeVoiceAudio } from '../services/gemini.service.js';
const prisma = new PrismaClient();
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};
/**
 * The AI Worker processes computationally heavy AI tasks entirely in the background.
 * This guarantees the API server never blocks its Event Loop and handles high RPS easily.
 */
export const aiWorker = new Worker('AI_PROCESSING_QUEUE', async (job) => {
    console.log(`[Worker] Processing Job: ${job.id} - ${job.name}`);
    if (job.name === 'analyze-voice') {
        const { userId, audioBase64, mimeType } = job.data;
        // 1. Process Heavy AI Task (Takes 3-5 seconds typically)
        const metrics = await analyzeVoiceAudio(audioBase64, mimeType);
        // 2. Save results directly to DB or trigger a push notification
        // Note: In production, we'd fire an FCM notification to the user here
        // that their voice analysis is complete.
        await prisma.mentalStateLog.create({
            data: {
                userId,
                primaryState: metrics.vocalMetrics?.voiceQuality || 'Unknown',
                // Assuming we map metrics to MentalStateLog format
                severity: 0,
                crisisAlert: false
            }
        });
        console.log(`[Worker] Finished voice analysis for user ${userId}`);
        return metrics;
    }
    // Handle other heavy tasks like 'generate-weekly-report', 'process-video-scan', etc.
}, { connection, concurrency: 5 }); // Process up to 5 AI tasks simultaneously
aiWorker.on('completed', (job) => {
    console.log(`✅ [Worker] Job ${job.id} completed successfully`);
});
aiWorker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} failed:`, err);
});
//# sourceMappingURL=ai.worker.js.map