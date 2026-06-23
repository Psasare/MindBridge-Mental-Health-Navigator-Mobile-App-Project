import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();
const RESOURCES_DIR = path.join(__dirname, 'resources');
// Define mock data to be written to files if they don't exist
const MOCK_DATA = {
    depression: {
        immediate: [
            {
                title: 'National Crisis Line',
                type: 'emergency',
                format: 'contact',
                urgency: 'immediate',
                effectiveness: 4.9,
                campusAvailability: ['KNUST', 'UG', 'UCC'],
                timeRequired: 'ongoing',
                languages: ['English', 'Twi'],
                url: 'tel:112',
                color: '#E60000',
            }
        ],
        coping: [
            {
                title: 'Sleep Hygiene Checklist',
                type: 'coping_strategy',
                format: 'text',
                urgency: 'short-term',
                effectiveness: 4.5,
                campusAvailability: [],
                timeRequired: '5 min',
                languages: ['English'],
                color: '#3B82F6',
            }
        ],
        education: [
            {
                title: 'Understanding Depression',
                type: 'educational',
                format: 'text',
                urgency: 'ongoing',
                effectiveness: 4.2,
                campusAvailability: [],
                timeRequired: '15 min',
                languages: ['English'],
                color: '#8B5CF6',
            }
        ],
        professional: [
            {
                title: 'KNUST Counseling Center',
                type: 'professional_help',
                format: 'contact',
                urgency: 'short-term',
                effectiveness: 4.8,
                campusAvailability: ['KNUST'],
                timeRequired: 'ongoing',
                languages: ['English', 'Twi'],
                url: 'tel:0322060021',
                color: '#10B981',
            }
        ],
        peer_support: [
            {
                title: 'Depression Support Group',
                type: 'peer_support',
                format: 'contact',
                urgency: 'ongoing',
                effectiveness: 4.6,
                campusAvailability: ['KNUST', 'UG'],
                timeRequired: '60 min',
                languages: ['English'],
                color: '#F59E0B',
            }
        ]
    },
    anxiety: {
        immediate: [
            {
                title: '4-7-8 Breathing Exercise',
                type: 'coping_strategy',
                format: 'exercise',
                urgency: 'immediate',
                effectiveness: 4.8,
                campusAvailability: [],
                timeRequired: '5 min',
                languages: ['English'],
                color: '#34D399',
            }
        ],
        coping: [
            {
                title: '5-4-3-2-1 Grounding Technique',
                type: 'coping_strategy',
                format: 'exercise',
                urgency: 'immediate',
                effectiveness: 4.7,
                campusAvailability: [],
                timeRequired: '5 min',
                languages: ['English'],
                color: '#60A5FA',
            }
        ],
        education: [
            {
                title: 'Anxiety Explained',
                type: 'educational',
                format: 'text',
                urgency: 'ongoing',
                effectiveness: 4.4,
                campusAvailability: [],
                timeRequired: '10 min',
                languages: ['English'],
                color: '#A78BFA',
            }
        ],
        professional: [
            {
                title: 'University Clinic - Therapy',
                type: 'professional_help',
                format: 'contact',
                urgency: 'short-term',
                effectiveness: 4.9,
                campusAvailability: ['UG'],
                timeRequired: 'ongoing',
                languages: ['English', 'Twi'],
                url: 'tel:0302500000',
                color: '#10B981',
            }
        ],
        peer_support: [
            {
                title: 'Anxiety Warriors Peer Group',
                type: 'peer_support',
                format: 'contact',
                urgency: 'ongoing',
                effectiveness: 4.5,
                campusAvailability: ['KNUST'],
                timeRequired: '60 min',
                languages: ['English'],
                color: '#FBBF24',
            }
        ]
    },
    stress: {
        immediate: [
            {
                title: 'Quick Wins for Stress Relief',
                type: 'coping_strategy',
                format: 'text',
                urgency: 'immediate',
                effectiveness: 4.3,
                campusAvailability: [],
                timeRequired: '5 min',
                languages: ['English'],
                color: '#F87171',
            }
        ],
        coping: [
            {
                title: 'Time Management Matrix',
                type: 'coping_strategy',
                format: 'exercise',
                urgency: 'short-term',
                effectiveness: 4.6,
                campusAvailability: [],
                timeRequired: '15 min',
                languages: ['English'],
                color: '#60A5FA',
            }
        ],
        education: [
            {
                title: 'Stress Management 101',
                type: 'educational',
                format: 'text',
                urgency: 'ongoing',
                effectiveness: 4.5,
                campusAvailability: [],
                timeRequired: '20 min',
                languages: ['English'],
                color: '#A78BFA',
            }
        ],
        professional: [
            {
                title: 'Counselor Booking',
                type: 'professional_help',
                format: 'link',
                urgency: 'short-term',
                effectiveness: 4.7,
                campusAvailability: ['KNUST', 'UG'],
                timeRequired: 'ongoing',
                languages: ['English'],
                url: 'https://counseling.example.com',
                color: '#10B981',
            }
        ],
        peer_support: [
            {
                title: 'Stress Relief Hangout',
                type: 'peer_support',
                format: 'link',
                urgency: 'ongoing',
                effectiveness: 4.2,
                campusAvailability: [],
                timeRequired: '30 min',
                languages: ['English'],
                color: '#FBBF24',
            }
        ]
    },
    academic_pressure: {
        immediate: [
            {
                title: 'Effective Study Breaks',
                type: 'coping_strategy',
                format: 'text',
                urgency: 'immediate',
                effectiveness: 4.6,
                campusAvailability: [],
                timeRequired: '5 min',
                languages: ['English'],
                color: '#34D399',
            }
        ],
        coping: [
            {
                title: 'Weekly Planning Template',
                type: 'coping_strategy',
                format: 'link',
                urgency: 'short-term',
                effectiveness: 4.8,
                campusAvailability: [],
                timeRequired: '15 min',
                languages: ['English'],
                url: 'https://templates.example.com/planning',
                color: '#60A5FA',
            }
        ],
        education: [
            {
                title: 'Top 10 Study Tips',
                type: 'educational',
                format: 'text',
                urgency: 'ongoing',
                effectiveness: 4.5,
                campusAvailability: [],
                timeRequired: '10 min',
                languages: ['English'],
                color: '#A78BFA',
            }
        ],
        professional: [
            {
                title: 'Academic Coaching Center',
                type: 'professional_help',
                format: 'contact',
                urgency: 'short-term',
                effectiveness: 4.9,
                campusAvailability: ['KNUST', 'UG'],
                timeRequired: 'ongoing',
                languages: ['English'],
                url: 'tel:0322061234',
                color: '#10B981',
            }
        ],
        peer_support: [
            {
                title: 'Study Buddies Forum',
                type: 'peer_support',
                format: 'link',
                urgency: 'ongoing',
                effectiveness: 4.4,
                campusAvailability: [],
                timeRequired: 'ongoing',
                languages: ['English', 'Twi'],
                url: 'https://forum.example.com/study',
                color: '#FBBF24',
            }
        ]
    }
};
async function ensureMockData() {
    if (!fs.existsSync(RESOURCES_DIR)) {
        fs.mkdirSync(RESOURCES_DIR, { recursive: true });
    }
    for (const [condition, categories] of Object.entries(MOCK_DATA)) {
        const conditionDir = path.join(RESOURCES_DIR, condition);
        if (!fs.existsSync(conditionDir)) {
            fs.mkdirSync(conditionDir, { recursive: true });
        }
        for (const [category, data] of Object.entries(categories)) {
            const filePath = path.join(conditionDir, `${category}.json`);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                console.log(`Created mock file: ${condition}/${category}.json`);
            }
        }
    }
}
async function main() {
    console.log('Ensuring resource mock data exists...');
    await ensureMockData();
    console.log('Seeding resources from JSON files...');
    const conditions = fs.readdirSync(RESOURCES_DIR);
    for (const condition of conditions) {
        const conditionPath = path.join(RESOURCES_DIR, condition);
        if (fs.statSync(conditionPath).isDirectory()) {
            const categoryFiles = fs.readdirSync(conditionPath).filter(f => f.endsWith('.json'));
            for (const file of categoryFiles) {
                const subcategory = file.replace('.json', '');
                const filePath = path.join(conditionPath, file);
                const fileData = fs.readFileSync(filePath, 'utf-8');
                try {
                    const resources = JSON.parse(fileData);
                    for (const res of resources) {
                        const resourceClient = prisma.resource;
                        // Check if exists
                        const existing = await resourceClient.findFirst({
                            where: {
                                title: res.title,
                                category: condition,
                                subcategory: subcategory
                            }
                        });
                        if (existing) {
                            await resourceClient.update({
                                where: { id: existing.id },
                                data: {
                                    type: res.type,
                                    urgency: res.urgency,
                                    format: res.format,
                                    effectiveness: res.effectiveness,
                                    campusAvailability: res.campusAvailability || [],
                                    timeRequired: res.timeRequired,
                                    languages: res.languages || [],
                                    color: res.color,
                                    url: res.url,
                                }
                            });
                        }
                        else {
                            await resourceClient.create({
                                data: {
                                    title: res.title,
                                    category: condition,
                                    subcategory: subcategory,
                                    type: res.type,
                                    urgency: res.urgency,
                                    format: res.format,
                                    effectiveness: res.effectiveness,
                                    campusAvailability: res.campusAvailability || [],
                                    timeRequired: res.timeRequired,
                                    languages: res.languages || [],
                                    color: res.color,
                                    url: res.url,
                                }
                            });
                        }
                    }
                    console.log(`Seeded ${resources.length} resources for ${condition}/${subcategory}`);
                }
                catch (e) {
                    console.error(`Error parsing or seeding ${filePath}:`, e);
                }
            }
        }
    }
    console.log('Seeding completed successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-resources.js.map