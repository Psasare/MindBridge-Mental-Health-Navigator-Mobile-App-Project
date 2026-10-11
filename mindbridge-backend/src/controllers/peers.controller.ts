import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getPeers = async (req: Request, res: Response) => {
  try {
    const peers = await (prisma as any).peerSupportProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
            studentId: true,
          }
        }
      },
      orderBy: { rating: 'desc' }
    });
    
    res.json(peers);
  } catch (error) {
    console.warn('Database unreachable. Returning empty array for peers.');
    res.json([]);
  }
};

export const seedPeers = async (req: Request, res: Response) => {
  try {
    // Check if we have at least one user to attach to
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(400).json({ error: 'No user found to associate peer profiles with. Please create a user first.' });
    }

    const defaultPeers = [
      {
        userId: user.id,
        bio: 'Hi, I am a trained peer listener specializing in academic stress and time management. Feel free to reach out!',
        specialties: ['Academic Stress', 'Time Management', 'General Anxiety'],
        isAvailable: true,
        rating: 4.9
      }
    ];

    // Delete existing to avoid unique constraint error on userId
    await (prisma as any).peerSupportProfile.deleteMany({});

    const created = await (prisma as any).peerSupportProfile.createMany({ data: defaultPeers });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error seeding peers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
