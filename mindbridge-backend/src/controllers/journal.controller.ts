import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeJournalEntry } from '../services/gemini.service.js';

const prisma = new PrismaClient();

export const getEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const entries = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('[BACKEND] Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
};

export const createEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, content, mood } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Journal content is required' });
    }

    // Process the journal entry through the MindBridge Oracle
    const analysis = await analyzeJournalEntry(content);

    const newEntry = await prisma.journal.create({
      // @ts-ignore: Bypassing IDE cache for newly generated Prisma types
      data: {
        userId,
        title: title || 'Untitled Entry',
        content,
        mood: mood || analysis.primaryEmotion,
        aiAnalysis: analysis.analysis,
        aiFeedback: analysis.empatheticResponse,
      },
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('[BACKEND] Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
};
