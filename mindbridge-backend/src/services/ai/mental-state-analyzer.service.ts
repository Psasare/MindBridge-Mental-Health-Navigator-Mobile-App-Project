import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || "");

export const analyzeCurrentState = async (userMessage: string, context: any) => {
  try {
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Convert history for context
    const recentHistory = context.history?.slice(0, 10).map((m: any) => `${m.role}: ${m.content}`).join('\n') || 'None';
    
    const prompt = `
You are the Real-Time State Analyzer for MindBridge. Your job is to analyze the user's latest message and recent context to determine exactly what Mental State they are currently experiencing.

You MUST map their state strictly to the following taxonomy:
- **Depression**: Persistent sadness, Loss of interest, Hopelessness, Fatigue
- **Anxiety**: Worry, Panic, Social anxiety, Performance anxiety
- **Stress**: Overwhelm, Time pressure, Multiple demands, Tension
- **Loneliness**: Social isolation, Lack of support, Feeling misunderstood, Disconnection
- **Academic Pressure**: Exam anxiety, Grade worry, Thesis stress, Workload overload
- **Burnout**: Exhaustion, Cynicism, Reduced performance, Disengagement

RECENT CONTEXT:
Latest Mood Log: ${context.latestMood?.score}/10, emotions: ${context.latestMood?.emotions?.join(', ')}
Recent History:
${recentHistory}

LATEST MESSAGE:
"${userMessage}"

INSTRUCTIONS - 7-STEP DETECTION LOGIC:
Before deciding on the final state, you MUST perform this internal 7-step analysis:
1. Extract emotional keywords from the message.
2. Check messaging patterns (e.g. rapid pacing, short answers).
3. Analyze sentiment (positive, negative, volatile).
4. Cross-reference sensor data (sleep, energy, context).
5. Compare to historical baseline (recent moods and history).
6. Score each of the 6 core conditions from 0-10 based on evidence.
7. Select the top 2-3 highest scoring states as the "primaryStates".

Output MUST be valid JSON and exactly match this schema:
{
  "reasoning": "string", // A 1-2 sentence summary of your 7-step analysis
  "conditionScores": {
    "Depression": number, // 0-10
    "Anxiety": number, // 0-10
    "Stress": number, // 0-10
    "Loneliness": number, // 0-10
    "Academic Pressure": number, // 0-10
    "Burnout": number // 0-10
  },
  "primaryStates": ["string"], // up to 3 highest scoring categories
  "subStates": ["string"], // specific symptoms from the taxonomy
  "severity": "string", // MUST be one of: "mild", "moderate", "severe", "critical"
  "emotions": ["string"],
  "triggers": ["string"], // e.g. ["exam prep", "poor sleep"]
  "crisisAlert": boolean // true ONLY if there is immediate risk of self-harm, suicide, or severe crisis
}
Do not output any markdown formatting, just the raw JSON object.`;

    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
    }
    
    const parsedState = JSON.parse(jsonStr);
    return parsedState;
  } catch (error) {
    console.error(`[BACKEND] Error in analyzeCurrentState:`, error);
    return {
      reasoning: "Failed to parse state",
      conditionScores: { Depression: 0, Anxiety: 0, Stress: 0, Loneliness: 0, "Academic Pressure": 0, Burnout: 0 },
      primaryStates: ["Unknown"],
      subStates: [],
      severity: "mild",
      emotions: ["unknown"],
      triggers: [],
      crisisAlert: false
    };
  }
};
