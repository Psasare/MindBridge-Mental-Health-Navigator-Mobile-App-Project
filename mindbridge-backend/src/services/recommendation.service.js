import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const recommendResources = async (userId, primaryState, severity) => {
    const resourceClient = prisma.resource;
    const historyClient = prisma.userResourceHistory;
    // 1. Get all resources matching condition
    // In our DB, condition is mapped to 'category' (e.g., 'anxiety', 'depression')
    const matchingResources = await resourceClient.findMany({
        where: {
            category: primaryState.toLowerCase(),
        }
    });
    // 2. Get user's effectiveness history
    const userHistory = await historyClient.findMany({
        where: { userId }
    });
    // Create a map for fast lookup
    const historyMap = userHistory.reduce((acc, curr) => {
        acc[curr.resourceId] = curr;
        return acc;
    }, {});
    // 3. Score each resource
    const scoredResources = matchingResources.map((resource) => {
        let score = 100; // Base score
        // Add user effectiveness history
        if (historyMap[resource.id]) {
            const history = historyMap[resource.id];
            // userRating is 1-5, convert to a boost (up to 100 max)
            const rating = history.userRating || 3;
            score += (rating * 20); // 0-100 rating boost
            score += (history.timesUsed * 2); // Familiarity bonus
            // Recency - recent wins ranked higher
            if (history.lastUsedAt) {
                const daysAgo = (Date.now() - new Date(history.lastUsedAt).getTime()) / (1000 * 3600 * 24);
                if (daysAgo < 7) {
                    score += 20;
                }
            }
        }
        // High baseline effectiveness boost
        if (resource.effectiveness) {
            score += (resource.effectiveness * 5); // Boost by up to 25 points
        }
        // Emergency/Immediate urgency boost if severity is high
        if (severity >= 8 && resource.urgency === 'immediate') {
            score += 50; // Massively prioritize immediate interventions
        }
        else if (severity < 5 && resource.urgency === 'ongoing') {
            score += 20; // Prioritize ongoing education when stable
        }
        return { ...resource, score };
    });
    // 4. Sort by score
    const ranked = scoredResources.sort((a, b) => b.score - a.score);
    // 5. Return top 5
    return ranked.slice(0, 5);
};
export const updateUserPersonalization = async (userId, interaction) => {
    const historyClient = prisma.userResourceHistory;
    const { resourceId, outcomeRating, mentalState } = interaction;
    // Check if history exists
    const existingHistory = await historyClient.findUnique({
        where: {
            userId_resourceId: {
                userId,
                resourceId
            }
        }
    });
    if (existingHistory) {
        // Calculate new rolling average rating
        const totalPreviousRating = (existingHistory.userRating || 0) * existingHistory.timesUsed;
        const newTimesUsed = existingHistory.timesUsed + 1;
        const newRating = (totalPreviousRating + outcomeRating) / newTimesUsed;
        await historyClient.update({
            where: { id: existingHistory.id },
            data: {
                timesUsed: newTimesUsed,
                userRating: newRating,
                lastUsedAt: new Date(),
                condition: mentalState
            }
        });
    }
    else {
        // Create new history
        await historyClient.create({
            data: {
                userId,
                resourceId,
                timesUsed: 1,
                userRating: outcomeRating,
                lastUsedAt: new Date(),
                condition: mentalState
            }
        });
    }
};
//# sourceMappingURL=recommendation.service.js.map