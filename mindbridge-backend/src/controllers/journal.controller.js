import { PrismaClient } from '@prisma/client';
import { analyzeJournalEntry } from '../services/gemini.service.js';
import { z } from 'zod';
const prisma = new PrismaClient();
const createEntrySchema = z.object({
    title: z.string().optional().nullable(),
    content: z.string().min(1, 'Journal content is required'),
    mood: z.string().optional().nullable(),
});
const getEntriesQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20)
});
export const getEntries = async (req, res) => {
    try {
        const userId = req.userId;
        const parsed = getEntriesQuerySchema.parse(req.query);
        const entries = await prisma.journal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: parsed.limit + 1, // Fetch 1 extra to determine next page
            cursor: parsed.cursor ? { id: parsed.cursor } : undefined,
        });
        let nextCursor = null;
        if (entries.length > parsed.limit) {
            const nextItem = entries.pop(); // Remove the extra item
            nextCursor = nextItem.id;
        }
        res.json({
            data: entries,
            nextCursor
        });
    }
    catch (error) {
        console.error('[BACKEND] Error fetching journal entries:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
};
export const createEntry = async (req, res) => {
    try {
        const userId = req.userId;
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