import 'dotenv/config';
import { generateOracleResponse } from '../src/services/gemini.service.js';
async function testOracleService() {
    console.log("--- Testing generateOracleResponse fallback mechanism ---");
    const context = {
        onboarding: {
            firstName: "Kwame",
            university: "KNUST",
            program: "Mechanical Engineering",
            level: "400",
            preferredLanguage: "English",
            communicationStyle: "Gentle",
            spiritualBackground: "Very important",
            interests: ["music", "sports"],
            goals: ["reduce academic stress"],
            currentAcademicSeason: "Mid-semester exams"
        },
        latestMood: {
            emotions: ["anxious", "tired"],
            score: 4,
            createdAt: new Date().toISOString(),
            energyLevel: 3,
            sleepHours: 5,
            sleepQuality: "poor",
            socialSetting: "alone",
            physicalSymptoms: ["headache"],
            weather: "sunny"
        },
        recentJournal: [
            {
                title: "Late night study",
                content: "Struggling to focus on the project thesis.",
                mood: "stressed",
                createdAt: new Date().toISOString()
            }
        ],
        history: [
            { role: "user", content: "Hi Oracle, I feel so overwhelmed today." },
            { role: "model", content: "Hello Kwame. I hear you. The mid-semester exams and level 400 thesis are heavy. Let's take a breath." }
        ],
        assessments: [],
        userName: "Kwame"
    };
    try {
        const response = await generateOracleResponse("I don't think I can pass this semester's project.", context, "test-user-id");
        console.log("\nOracle final response was successfully generated!");
        console.log("Response content:\n", response);
    }
    catch (error) {
        console.error("Test failed! Error:", error);
    }
}
testOracleService();
//# sourceMappingURL=test-oracle-service.js.map