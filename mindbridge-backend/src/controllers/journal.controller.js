import { PrismaClient } from '@prisma/client';
import { analyzeJournalEntry } from '../services/gemini.service.js';
const prisma = new PrismaClient();
export const getEntries = async (req, res) => {
    try {
        const userId = req.userId;
        const entries = await prisma.journal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(entries);
    }
    catch (error) {
        console.error('[BACKEND] Error fetching journal entries:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
};
export const createEntry = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('[BACKEND] Error creating journal entry:', error);
        res.status(500).json({ error: 'Failed to save journal entry' });
    }
};
export const deleteEntry = async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
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
    }
    catch (error) {
        console.error('[BACKEND] Error deleting journal entry:', error);
        res.status(500).json({ error: 'Failed to delete journal entry' });
    }
};
//# sourceMappingURL=journal.controller.js.map