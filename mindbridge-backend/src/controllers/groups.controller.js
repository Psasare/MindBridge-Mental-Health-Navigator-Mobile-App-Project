import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const getGroups = async (req, res) => {
    try {
        const groups = await prisma.supportGroup.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(groups);
    }
    catch (error) {
        console.warn('Database unreachable. Returning empty array for groups.');
        res.json([]);
    }
};
export const seedGroups = async (req, res) => {
    try {
        const defaultGroups = [
            { name: 'Final Year Stress', description: 'A safe space to discuss the pressures of final year projects, exams, and post-grad life.', color: '#9EB4CC', members: 1200 },
            { name: 'Anxiety Support', description: 'Share coping strategies, mindfulness techniques, and general support for anxiety.', color: '#C49E9E', members: 3400 },
            { name: 'Meditation Group', description: 'Daily mindful breathing techniques and meditation practices.', color: '#C2D8C4', members: 850 },
            { name: 'International Students', description: 'Navigating culture shock, homesickness, and studying abroad.', color: '#E8B49A', members: 500 },
            { name: 'ADHD / Neurodivergent', description: 'Study hacks, productivity tips, and mutual support for neurodivergent minds.', color: '#A0A4C0', members: 950 }
        ];
        const created = await prisma.supportGroup.createMany({
            data: defaultGroups
        });
        res.status(201).json(created);
    }
    catch (error) {
        console.error('Error seeding support groups:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
//# sourceMappingURL=groups.controller.js.map