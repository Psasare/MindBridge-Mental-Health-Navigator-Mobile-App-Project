import { PrismaClient } from '@prisma/client';
import { generateOracleResponse, generateProactiveInsights, analyzeVoiceAudio } from '../services/gemini.service.js';
import { AiRepository } from '../repositories/ai.repository.js';
const prisma = new PrismaClient();
const proactiveInsightsCache = new Map();
// High-risk keywords for safety screening
const CRISIS_KEYWORDS = [
    'suicide', 'self-harm', 'kill myself', 'end my life', 'better off dead',
    'hurt myself', 'cutting', 'overdose', 'hopeless', 'no reason to live'
];
export const getOracleContext = async (req, res) => {
    try {
        const userId = req.userId;
        // Get latest mood log & total count sequentially to reduce concurrent DB connections
        const latestMood = await prisma.moodLog.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const moodCount = await prisma.moodLog.count({ where: { userId } });
        // Get user name for fallback personalization
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });
        // Get 3 most recent journal entries & total count sequentially
        const recentJournal = await prisma.journal.findMany({
            where: { userId },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
                title: true,
                content: true,
                mood: true,
                createdAt: true,
            }
        });
        const journalCount = await prisma.journal.count({ where: { userId } });
        // Get onboarding data for personality matching
        const onboarding = await prisma.onboarding.findUnique({
            where: { userId }
        });
        // Get recent chat history
        const history = await AiRepository.getChatHistory(userId, 15);
        // Get clinical assessments
        const assessments = await AiRepository.getLatestAssessments(userId);
        // Get latest community post for dashboard snapshot
        const latestCommunityPost = await prisma.communityPost.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        // Generate contextual resource suggestions based on recent journal themes
        let suggestedResources = [];
        if (recentJournal && recentJournal.length > 0) {
            const combinedText = recentJournal.map(j => (j.title + ' ' + j.content).toLowerCase()).join(' ');
            if (combinedText.includes('stress') || combinedText.includes('exam') || combinedText.includes('pressure')) {
                suggestedResources.push({ id: 'res-1', title: '5-Minute Box Breathing', type: 'audio', category: 'Stress Relief' });
            }
            if (combinedText.includes('anxiety') || combinedText.includes('worry') || combinedText.includes('panic')) {
                suggestedResources.push({ id: 'res-2', title: 'Grounding Technique (5-4-3-2-1)', type: 'article', category: 'Anxiety' });
            }
            if (combinedText.includes('lonely') || combinedText.includes('friend') || combinedText.includes('isolate')) {
                suggestedResources.push({ id: 'res-3', title: 'Campus Support Groups', type: 'link', category: 'Community' });
            }
        }
        // Always provide at least one fallback resource if none matched
        if (suggestedResources.length === 0) {
            suggestedResources.push({ id: 'res-4', title: 'Daily Mindfulness Practice', type: 'audio', category: 'General' });
        }
        res.json({
            latestMood: latestMood || null,
            moodCount: moodCount || 0,
            recentJournal: recentJournal || [],
            journalCount: journalCount || 0,
            onboarding: onboarding || null,
            userName: user?.name || 'Friend',
            history: history || [],
            assessments: assessments || [],
            latestCommunityPost: latestCommunityPost || null,
            suggestedResources,
            dbStatus: 'online'
        });
    }
    catch (error) {
        console.error('Error fetching Oracle context:', error);
        // If it's a connection error (P1001), return empty context instead of 500
        if (error.code === 'P1001' || error.message.includes('Can\'t reach database server')) {
            return res.json({
                latestMood: null,
                recentJournal: [],
                onboarding: null,
                dbStatus: 'offline',
                warning: 'Database is momentarily sleeping. Please try again in a few seconds.'
            });
        }
        res.status(500).json({ error: 'Server error' });
    }
};
export const chatWithOracle = async (req, res) => {
    try {
        const userId = req.userId;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        // 1. Safety Screening (Pre-LLM)
        const lowerInput = message.toLowerCase();
        const isCrisis = CRISIS_KEYWORDS.some(kw => lowerInput.includes(kw));
        if (isCrisis) {
            return res.json({
                response: "I'm hearing a lot of pain in your words, and I'm very concerned about you. You don't have to carry this alone. Please reach out to one of the professionals on our Crisis Support page immediately — they are ready to help right now.",
                suggestCrisis: true
            });
        }
        // 2. Fetch Context
        const latestMood = await prisma.moodLog.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const recentMoods = await prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { location: true, createdAt: true, score: true }
        });
        const recentJournal = await prisma.journal.findMany({
            where: { userId },
            take: 3,
            orderBy: { createdAt: 'desc' },
        });
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });
        if (!user) {
            return res.status(401).json({ message: "Account not found. Please log out and back in." });
        }
        const onboarding = await prisma.onboarding.findUnique({
            where: { userId }
        });
        const history = await AiRepository.getChatHistory(userId, 10);
        const assessments = await AiRepository.getLatestAssessments(userId);
        // 3. Save User Message
        await prisma.chatMessage.create({
            data: { userId, role: 'user', content: message }
        });
        // 4. Generate AI Response
        const aiResponse = await generateOracleResponse(message, {
            latestMood,
            recentMoods,
            recentJournal,
            onboarding,
            userName: user?.name || 'Friend',
            history,
            assessments,
            // Add advanced dimensions
            energy: latestMood?.energyLevel,
            sleep: { hours: latestMood?.sleepHours, quality: latestMood?.sleepQuality },
            social: latestMood?.socialSetting,
            symptoms: latestMood?.physicalSymptoms,
            weather: latestMood?.weather,
            steps: latestMood?.steps,
            location: latestMood?.location,
        }, userId);
        // 5. Save AI Response
        await prisma.chatMessage.create({
            data: { userId, role: 'model', content: aiResponse }
        });
        res.json({ response: aiResponse });
    }
    catch (error) {
        console.error('Error in Oracle chat:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
export const clearChatHistory = async (req, res) => {
    try {
        const userId = req.userId;
        await AiRepository.clearChatHistory(userId);
        res.json({ success: true, message: 'Chat history cleared' });
    }
    catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
};
export const deleteChatMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ error: 'Message ID is required' });
            return;
        }
        await AiRepository.deleteChatMessage(userId, id);
        res.json({ success: true, message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting chat message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
export const deleteBulkChatMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ error: 'Message IDs list is required' });
            return;
        }
        await AiRepository.deleteChatMessages(userId, ids);
        res.json({ success: true, message: 'Messages deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting bulk chat messages:', error);
        res.status(500).json({ error: 'Failed to delete messages' });
    }
};
export const saveAssessmentResult = async (req, res) => {
    try {
        const userId = req.userId;
        const { type, score, severity } = req.body;
        if (!type || typeof score !== 'number' || !severity) {
            return res.status(400).json({ error: 'Type, score, and severity are required.' });
        }
        const result = await prisma.assessmentResult.create({
            data: {
                userId,
                type,
                score,
                severity
            }
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error saving assessment result:', error);
        res.status(500).json({ error: 'Failed to save assessment result' });
    }
};
export const getProactiveInsights = async (req, res) => {
    try {
        const userId = req.userId;
        const now = Date.now();
        // Check if we have valid cached insights (less than 1 hour old) to prevent Gemini API quota exhaustion
        if (proactiveInsightsCache.has(userId)) {
            const cached = proactiveInsightsCache.get(userId);
            if (now - cached.time < 3600000) {
                return res.json(cached.data);
            }
        }
        const onboarding = await prisma.onboarding.findUnique({
            where: { userId }
        });
        const recentMoods = await prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 14 // Last 14 logs for better pattern detection
        });
        const insights = await generateProactiveInsights(userId, { onboarding, recentMoods });
        proactiveInsightsCache.set(userId, { time: now, data: insights });
        res.json(insights);
    }
    catch (error) {
        console.error('Error fetching proactive insights:', error);
        // Fallback response if something fails
        res.json({
            dashboardPrompt: "How are you feeling right now?",
            gardenInsight: {
                title: "Emotional Reservoir Stable",
                description: "Keep checking in to build a clearer picture of your wellness trends.",
                icon: "Heart"
            }
        });
    }
};
export const analyzeVoice = async (req, res) => {
    try {
        const { audioBase64, mimeType } = req.body;
        if (!audioBase64) {
            return res.status(400).json({ error: 'audioBase64 is required' });
        }
        const metrics = await analyzeVoiceAudio(audioBase64, mimeType || 'audio/m4a');
        res.json(metrics);
    }
    catch (error) {
        console.error('Error analyzing voice:', error);
        res.status(500).json({ error: 'Failed to analyze voice tone' });
    }
};
//# sourceMappingURL=ai.controller.js.map