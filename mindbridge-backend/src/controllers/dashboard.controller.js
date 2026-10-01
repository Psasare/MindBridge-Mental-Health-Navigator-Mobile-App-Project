import { PrismaClient } from '@prisma/client';
import { AiRepository } from '../repositories/ai.repository.js';
import { GoalService } from '../services/goal.service.js';
import { generateProactiveInsights } from '../services/gemini.service.js';
import { recommendResources } from '../services/recommendation.service.js';
import { getOrSetCache } from '../utils/cache.js';
const prisma = new PrismaClient();
export const getDashboardAggregate = async (req, res) => {
    try {
        const userId = req.userId;
        // Run completely parallel execution of all previously separated endpoints
        const [latestMood, moodCount, user, recentJournal, journalCount, onboarding, history, assessments, latestCommunityPost, moodHistory, gamificationStatus, dailyStatus] = await Promise.all([
            // from getOracleContext
            prisma.moodLog.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.moodLog.count({ where: { userId } }),
            prisma.user.findUnique({ where: { id: userId }, select: { name: true, createdAt: true } }),
            prisma.journal.findMany({ where: { userId }, take: 3, orderBy: { createdAt: 'desc' }, select: { title: true, content: true, mood: true, createdAt: true } }),
            prisma.journal.count({ where: { userId } }),
            prisma.onboarding.findUnique({ where: { userId } }),
            AiRepository.getChatHistory(userId, 15).catch(() => []),
            AiRepository.getLatestAssessments(userId).catch(() => []),
            prisma.communityPost.findFirst({ orderBy: { createdAt: 'desc' } }),
            // from getMoodLogs
            prisma.moodLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 }),
            // from gamification
            GoalService.getGamificationStatus(userId).catch(() => null),
            // from daily goals
            GoalService.getDailyStatus(userId).catch(() => null)
        ]);
        // Calculate proactive insights with caching (copied from getProactiveInsights)
        const cacheKey = `insights:${userId}`;
        const TTL_SECONDS = 3600; // 1 hour
        const proactiveInsights = await getOrSetCache(cacheKey, TTL_SECONDS, async () => {
            try {
                const recentMoodsForInsight = await prisma.moodLog.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 14
                });
                const generatedInsights = await generateProactiveInsights(userId, { onboarding, recentMoods: recentMoodsForInsight });
                let suggestedResources = [];
                if (generatedInsights.severity && generatedInsights.primaryState) {
                    const severityScore = generatedInsights.severity === 'severe' || generatedInsights.severity === 'critical' ? 8 : (generatedInsights.severity === 'moderate' ? 6 : 4);
                    suggestedResources = await recommendResources(userId, generatedInsights.primaryState, severityScore);
                }
                else if (generatedInsights.recommendedResourceCategories && Array.isArray(generatedInsights.recommendedResourceCategories)) {
                    for (const cat of generatedInsights.recommendedResourceCategories) {
                        const resources = await AiRepository.searchResources(cat).catch(() => []);
                        if (resources && resources.length > 0) {
                            suggestedResources.push(resources[0]);
                        }
                    }
                }
                if (suggestedResources.length === 0) {
                    suggestedResources.push({ id: 'res-fallback', title: 'Daily Mindfulness Practice', type: 'audio', category: 'General' });
                }
                generatedInsights.suggestedResources = suggestedResources;
                return generatedInsights;
            }
            catch (e) {
                return {
                    dashboardPrompt: "How are you feeling right now?",
                    suggestedResources: []
                };
            }
        });
        res.json({
            oracleContext: {
                latestMood: latestMood || null,
                moodCount: moodCount || 0,
                recentJournal: recentJournal || [],
                journalCount: journalCount || 0,
                onboarding: onboarding || null,
                userName: user?.name || 'Friend',
                history: history || [],
                assessments: assessments || [],
                latestCommunityPost: latestCommunityPost || null,
                dbStatus: 'online'
            },
            moodHistory: moodHistory || [],
            proactiveInsights,
            gamification: gamificationStatus || { totalPoints: 0, currentStreak: 0 },
            dailyGoals: dailyStatus || { goals: [], completedIds: [] }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard aggregate:', error);
        res.status(500).json({ error: 'Server error fetching dashboard aggregate' });
    }
};
//# sourceMappingURL=dashboard.controller.js.map