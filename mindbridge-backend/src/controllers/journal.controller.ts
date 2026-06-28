import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeJournalEntry } from '../services/gemini.service.js';
import { z } from 'zod';

const prisma = new PrismaClient();

const createEntrySchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().min(1, 'Journal content is required'),
  mood: z.string().optional().nullable(),
});

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
    const parsed = createEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
    }

    const { title, content, mood } = parsed.data;

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

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const existingEntry = await prisma.journal.findFirst({
      where: { id, userId },
    });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    await prisma.journal.delete({
      where: { id },
    });

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('[BACKEND] Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
};
