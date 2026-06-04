import { PrismaClient } from '@prisma/client';
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
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const createEntry = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, content, mood, audioUrl, vocalMetrics } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const newEntry = await prisma.journal.create({
            data: {
                userId,
                title,
                content,
                mood,
                audioUrl,
                vocalMetrics,
            },
        });
        res.status(201).json(newEntry);
    }
    catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const deleteEntry = async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
        const entry = await prisma.journal.findFirst({
            where: { id, userId }
        });
        if (!entry) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        await prisma.journal.delete({
            where: { id }
        });
        res.json({ message: 'Entry deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
//# sourceMappingURL=journal.controller.js.map