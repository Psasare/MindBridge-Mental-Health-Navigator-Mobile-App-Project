import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateCBTReframe } from '../services/self-help.service.js';

const prisma = new PrismaClient();

export const processCBTWorksheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { negativeThought } = req.body;

    if (!negativeThought) {
      return res.status(400).json({ error: 'Negative thought is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    const context = {
      name: user?.name
    };

    const reframeData = await generateCBTReframe(negativeThought, context);

    res.json(reframeData);
  } catch (error) {
    console.error('Error processing CBT worksheet:', error);
    res.status(500).json({ error: 'Failed to process worksheet' });
  }
};
