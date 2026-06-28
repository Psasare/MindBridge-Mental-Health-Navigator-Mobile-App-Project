import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || "");
export const generateCBTReframe = async (negativeThought, context) => {
    try {
        const modelName = "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `
You are a compassionate CBT (Cognitive Behavioral Therapy) assistant.
The user is having a negative thought and needs help reframing it.

USER'S NEGATIVE THOUGHT:
"${negativeThought}"

USER CONTEXT:
Name: ${context.name || 'Friend'}

INSTRUCTIONS:
1. Identify 1 or 2 Cognitive Distortions in their thought (e.g., Catastrophizing, All-or-Nothing Thinking, Mind Reading, Emotional Reasoning).
2. Provide a compassionate "Reframe" - a more balanced, realistic way to view the situation.
3. Suggest a small, actionable "Next Step" to break the rumination cycle.
4. Output MUST be valid JSON exactly matching this schema:
{
  "distortions": ["string"],
  "reframe": "string",
  "nextStep": "string"
}
Do not output any markdown formatting, just the raw JSON object.`;
        const result = await model.generateContent(prompt);
        let jsonStr = result.response.text().trim();
        if (jsonStr.startsWith('\`\`\`json')) {
            jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        }
        else if (jsonStr.startsWith('\`\`\`')) {
            jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
        }
        return JSON.parse(jsonStr);
    }
    catch (error) {
        console.error('[BACKEND] Error generating CBT reframe:', error);
        return {
            distortions: ["Negative Filtering"],
            reframe: "This is a difficult moment, but it does not define my entire day or my worth.",
            nextStep: "Take three deep breaths and focus on one small thing I can control right now."
        };
    }
};
//# sourceMappingURL=self-help.service.js.map