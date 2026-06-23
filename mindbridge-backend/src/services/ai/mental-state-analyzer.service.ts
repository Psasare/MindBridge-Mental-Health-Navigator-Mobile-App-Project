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
7. Return top 2-3 states with severity.

Output MUST be valid JSON and exactly match this schema, starting with the analysis steps to show your reasoning:
{
  "analysis": {
    "step1_keywords": ["string"],
    "step2_patterns": "string",
    "step3_sentiment": "string",
    "step4_sensorData": "string",
    "step5_baselineComparison": "string",
    "step6_scores": {
      "Depression": number,
      "Anxiety": number,
      "Stress": number,
      "Loneliness": number,
      "Academic_Pressure": number,
      "Burnout": number
    }
  },
  "primaryState": "string", // single dominant state from taxonomy
  "severity": number, // integer 0-10
  "confidence": number, // float 0.0-1.0
  "secondaryStates": [
    { "state": "string", "severity": number, "confidence": number }
  ],
  "triggers": ["string"],
  "physicalIndicators": {
    "sleepQuality": "string",
    "activityLevel": "string",
    "heartRate": "string"
  },
  "actionRequired": "string", // e.g. "immediate_support", "check_in", "monitor"
  "supportLevel": "string" // e.g. "high", "medium", "low"
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
  } catch (error: any) {
    if (error.status === 503) {
      console.warn(`[BACKEND] Warning: Gemini AI 503 Service Unavailable during analyzeCurrentState. Using fallback.`);
    } else {
      console.error(`[BACKEND] Error in analyzeCurrentState:`, error);
    }
    return {
      primaryState: "Unknown",
      severity: 0,
      confidence: 0,
      secondaryStates: [],
      triggers: [],
      physicalIndicators: { sleepQuality: "unknown", activityLevel: "unknown", heartRate: "unknown" },
      actionRequired: "monitor",
      supportLevel: "low"
    };
  }
};
