import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { GoalService } from '../services/goal.service.js';

const prisma = new PrismaClient();

const createMoodLogSchema = z.object({
  score: z.number().min(1).max(10),
  emotions: z.array(z.string()).min(1),
  energyLevel: z.number().min(1).max(5).optional().nullable(),
  sleepHours: z.number().min(0).max(24).optional().nullable(),
  sleepQuality: z.string().optional().nullable(),
  socialSetting: z.string().optional().nullable(),
  physicalSymptoms: z.array(z.string()).optional().nullable(),
  weather: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  steps: z.number().optional().nullable(),
  facialMetrics: z.any().optional().nullable(),
  vocalMetrics: z.any().optional().nullable(),
});

export const getMoodLogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const logs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 days
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createMoodLog = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const parsed = createMoodLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const { 
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
    } = parsed.data;

    const newLog = await prisma.moodLog.create({
      data: {
        userId: userId as string,
        score,
        emotions,
        energyLevel: energyLevel ?? undefined,
        sleepHours: sleepHours ?? undefined,
        sleepQuality: sleepQuality ?? undefined,
        socialSetting: socialSetting ?? undefined,
        physicalSymptoms: physicalSymptoms ?? undefined,
        weather: weather ?? undefined,
        location: location ?? undefined,
        audioUrl: audioUrl ?? undefined,
        note: note ?? undefined,
        steps: steps ?? undefined,
        facialMetrics: facialMetrics ?? undefined,
        vocalMetrics: vocalMetrics ?? undefined
      },
    });

    const checkInResult = await GoalService.recordDailyCheckIn(userId);

    res.status(201).json({ ...newLog, gamification: checkInResult });
  } catch (error) {
    console.error('Error creating mood log:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const logs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (logs.length === 0) return res.json({ message: 'Not enough data yet', hasData: false });

    // Calculate correlations
    const avgMood = logs.reduce((acc, l) => acc + (l.score || 0), 0) / logs.length;
    
    // Social Impact
    const socialMoods: Record<string, number[]> = {};
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
      const scores = socialMoods[key]!;
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
  } catch (error) {
    console.error('Error calculating insights:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
