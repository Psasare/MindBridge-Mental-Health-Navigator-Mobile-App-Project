import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../utils/prisma.js';

export const saveOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      firstName,
      university,
      program,
      level,
      preferredLanguage,
      communicationStyle,
      spiritualBackground,
      interests,
      currentAcademicSeason,
      primaryGoals,
      currentMood,
      sleepPattern,
      stressLevel,
      stressSources,
      supportTypes
    } = req.body;

    const onboarding = await prisma.onboarding.upsert({
      where: { userId },
      update: {
        firstName,
        university,
        program,
        level,
        preferredLanguage,
        communicationStyle,
        spiritualBackground,
        interests,
        currentAcademicSeason,
        primaryGoals,
        currentMood,
        sleepPattern,
        stressLevel: stressLevel || 5,
        stressSources,
        supportTypes,
        completedAt: new Date()
      },
      create: {
        userId,
        firstName,
        university,
        program,
        level,
        preferredLanguage,
        communicationStyle,
        spiritualBackground,
        interests,
        currentAcademicSeason,
        primaryGoals,
        currentMood,
        sleepPattern,
        stressLevel: stressLevel || 5,
        stressSources,
        supportTypes
      }
    });

    res.status(200).json({ success: true, onboarding });
  } catch (error) {
    console.error('Error saving onboarding:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
};
