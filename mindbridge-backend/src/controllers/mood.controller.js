import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const getMoodLogs = async (req, res) => {
    try {
        const userId = req.userId;
        const logs = await prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30, // Last 30 days
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching mood logs:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const createMoodLog = async (req, res) => {
    try {
        const userId = req.userId;
        const { score, emotions, energyLevel, sleepHours, sleepQuality, socialSetting, physicalSymptoms, weather, location, audioUrl, note, steps, facialMetrics, vocalMetrics } = req.body;
        if (score === undefined || !emotions) {
            return res.status(400).json({ error: 'Score and emotions are required' });
        }
        const newLog = await prisma.moodLog.create({
            data: {
                userId,
                score,
                emotions,
                energyLevel,
                sleepHours,
                sleepQuality,
                socialSetting,
                physicalSymptoms,
                weather,
                location,
                audioUrl,
                note,
                steps,
                facialMetrics,
                vocalMetrics
            },
        });
        res.status(201).json(newLog);
    }
    catch (error) {
        console.error('Error creating mood log:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const getInsights = async (req, res) => {
    try {
        const userId = req.userId;
        const logs = await prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        if (logs.length === 0)
            return res.json({ message: 'Not enough data yet', hasData: false });
        // Calculate correlations
        const avgMood = logs.reduce((acc, l) => acc + (l.score || 0), 0) / logs.length;
        // Social Impact
        const socialMoods = {};
        logs.forEach(l => {
            if (l.socialSetting) {
                const setting = l.socialSetting;
                let list = socialMoods[setting];
                if (!list) {
                    list = [];
                    socialMoods[setting] = list;
                }
                list.push(l.score);
            }
        });
        const socialInsights = Object.keys(socialMoods).map(key => {
            const scores = socialMoods[key];
            return {
                setting: key,
                avg: scores.reduce((a, b) => a + b, 0) / scores.length
            };
        }).sort((a, b) => b.avg - a.avg);
        // Recent Trend (Last 7 logs)
        const trend = logs.slice(0, 7).reverse().map(l => ({
            day: new Date(l.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
            score: l.score
        }));
        res.json({
            hasData: true,
            avgMood: Math.round(avgMood * 10) / 10,
            bestSocialSetting: socialInsights[0] || null,
            trend,
            totalLogs: logs.length,
            voiceJournals: logs.filter(l => l.audioUrl).length
        });
    }
    catch (error) {
        console.error('Error calculating insights:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
//# sourceMappingURL=mood.controller.js.map