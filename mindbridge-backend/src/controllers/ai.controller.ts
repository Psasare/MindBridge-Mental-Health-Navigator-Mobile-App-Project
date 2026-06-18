import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateOracleResponse, generateProactiveInsights, analyzeVoiceAudio, generatePersonalizedAssessment, evaluatePersonalizedAssessment } from '../services/gemini.service.js';
import { analyzeCurrentState } from '../services/ai/mental-state-analyzer.service.js';
import { AiRepository } from '../repositories/ai.repository.js';

const prisma = new PrismaClient();
const proactiveInsightsCache = new Map<string, { time: number, data: any }>();

// High-risk keywords for safety screening
const CRISIS_KEYWORDS = [
  'suicide', 'self-harm', 'kill myself', 'end my life', 'better off dead',
  'hurt myself', 'cutting', 'overdose', 'hopeless', 'no reason to live'
];

export const getOracleContext = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

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

    // Note: suggestedResources logic has been moved to getProactiveInsights for AI-driven personalization
    let suggestedResources: any[] = [];

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
  } catch (error: any) {
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

export const chatWithOracle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
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

    const contextForOracle: any = {
      latestMood,
      recentMoods,
      recentJournal,
      onboarding,
      userName: user?.name || 'Friend',
      history,
      assessments,
      energy: latestMood?.energyLevel,
      sleep: { hours: latestMood?.sleepHours, quality: latestMood?.sleepQuality },
      social: latestMood?.socialSetting,
      symptoms: latestMood?.physicalSymptoms,
      weather: latestMood?.weather,
      steps: latestMood?.steps,
      location: latestMood?.location,
    };

    // 4. Analyze Current State
    const currentState = await analyzeCurrentState(message, contextForOracle);
    
    // Save the Mental State Log to DB
    try {
      if (currentState.primaryState && currentState.primaryState !== 'Unknown') {
        const isCrisis = currentState.actionRequired === 'immediate_support';
        currentState.crisisAlert = isCrisis; // set for legacy flow

        await prisma.mentalStateLog.create({
          data: {
            userId,
            primaryState: currentState.primaryState,
            subStates: [], // Optional now
            emotions: [], // Optional now
            triggers: currentState.triggers || [],
            crisisAlert: isCrisis,
            // @ts-ignore - Requires Prisma client regeneration
            severity: currentState.severity || 0,
            // @ts-ignore
            confidence: currentState.confidence || null,
            // @ts-ignore
            secondaryStates: currentState.secondaryStates || null,
            // @ts-ignore
            physicalIndicators: currentState.physicalIndicators || null,
            // @ts-ignore
            actionRequired: currentState.actionRequired || null,
            // @ts-ignore
            supportLevel: currentState.supportLevel || null,
          }
        });
      }
    } catch (e) {
      console.error('Failed to log Mental State to DB:', e);
    }
    
    if (currentState.crisisAlert) {
      return res.json({
        response: "I'm hearing a lot of pain in your words, and I'm very concerned about you. You don't have to carry this alone. Please reach out to one of the professionals on our Crisis Support page immediately — they are ready to help right now.",
        suggestCrisis: true,
        state: currentState
      });
    }

    // Pass the state into the context
    contextForOracle.currentState = currentState;

    // 5. Generate AI Response
    const aiResponse = await generateOracleResponse(message, contextForOracle, userId);

    // 6. Save AI Response
    await prisma.chatMessage.create({
      data: { userId, role: 'model', content: aiResponse }
    });

    res.json({ response: aiResponse, state: currentState });
  } catch (error) {
    console.error('Error in Oracle chat:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await AiRepository.clearChatHistory(userId);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};

export const deleteChatMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Message ID is required' });
      return;
    }
    await AiRepository.deleteChatMessage(userId, id);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

export const deleteBulkChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Message IDs list is required' });
      return;
    }
    await AiRepository.deleteChatMessages(userId, ids);
    res.json({ success: true, message: 'Messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting bulk chat messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
};

export const saveAssessmentResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
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
  } catch (error) {
    console.error('Error saving assessment result:', error);
    res.status(500).json({ error: 'Failed to save assessment result' });
  }
};

export const getProactiveInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const now = Date.now();
    
    // Check if we have valid cached insights (less than 1 hour old) to prevent Gemini API quota exhaustion
    if (proactiveInsightsCache.has(userId)) {
      const cached = proactiveInsightsCache.get(userId)!;
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
    
    // Fetch actual resources for the recommended categories
    let suggestedResources: any[] = [];
    if (insights.recommendedResourceCategories && Array.isArray(insights.recommendedResourceCategories)) {
      for (const cat of insights.recommendedResourceCategories) {
        const resources = await AiRepository.searchResources(cat);
        if (resources && resources.length > 0) {
          suggestedResources.push(resources[0]);
        }
      }
    }
    
    // Add fallback if empty
    if (suggestedResources.length === 0) {
      suggestedResources.push({ id: 'res-fallback', title: 'Daily Mindfulness Practice', type: 'audio', category: 'General' });
    }
    
    insights.suggestedResources = suggestedResources;
    proactiveInsightsCache.set(userId, { time: now, data: insights });
    res.json(insights);
  } catch (error) {
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

export const analyzeVoice = async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const metrics = await analyzeVoiceAudio(audioBase64, mimeType || 'audio/m4a');
    res.json(metrics);
  } catch (error) {
    console.error('Error analyzing voice:', error);
    res.status(500).json({ error: 'Failed to analyze voice tone' });
  }
};

export const getPersonalizedAssessment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const testType = req.query.type as string || 'general';
    
    const onboarding = await prisma.onboarding.findUnique({ where: { userId } });
    const recentMoods = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7
    });
    const recentJournal = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    const questions = await generatePersonalizedAssessment(userId, { onboarding, recentMoods, recentJournal }, testType);
    res.json({ questions });
  } catch (error) {
    console.error('Error getting personalized assessment:', error);
    res.status(500).json({ error: 'Failed to generate assessment' });
  }
};

export const submitPersonalizedAssessment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { answers, type } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Valid answers array is required' });
    }

    const testType = type || 'general';
    const onboarding = await prisma.onboarding.findUnique({ where: { userId } });
    
    const evaluation = await evaluatePersonalizedAssessment(userId, { onboarding }, answers, testType);
    res.json(evaluation);
  } catch (error) {
    console.error('Error submitting personalized assessment:', error);
    res.status(500).json({ error: 'Failed to evaluate assessment' });
  }
};
