import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoalService } from '../services/goal.service.js';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        onboarding: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found. Session invalid.', code: 'USER_NOT_FOUND' });
    }

    // Don't send password
    const { password, ...userProfile } = user;

    // Calculate Stats
    const moodLogs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch true gamification stats using the service to ensure streaks are validated and reset if broken
    const gamification = await GoalService.getGamificationStatus(userId);
    const streak = gamification?.currentStreak || 0;
    const points = gamification?.totalPoints || 0;

    // 7 Day Mood Trend
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      const dayLogs = moodLogs.filter(l => new Date(l.createdAt).toDateString() === dayStr);
      const avgScore = dayLogs.length > 0 ? dayLogs.reduce((acc, curr) => acc + curr.score, 0) / dayLogs.length : 0;
      return { day: d.toLocaleDateString('en-US', { weekday: 'narrow' }), score: avgScore };
    });

    res.json({
      ...userProfile,
      stats: {
        streak,
        points,
        seeds: journals.length,
        badges: Math.floor(points / 500),
        trend: last7Days
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, username, phoneNumber, profileImage, studentId, university, program, level } = req.body;

    // Update User table
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        phoneNumber,
        profileImage,
        studentId,
      } as any,
    });

    // Update Onboarding table if university/program/level provided
    if (university || program || level) {
      await prisma.onboarding.update({
        where: { userId },
        data: {
          university,
          program,
          level,
        },
      });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
