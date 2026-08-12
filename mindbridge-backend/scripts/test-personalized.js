import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

async function testPersonalized() {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 800,
    }
  });

  const systemPrompt = `You are MindBridge AI, a mental health companion for Ghanaian university students.

User Profile:
- Name: Kwame
- University: KNUST
- Level: 400 (Final year)
- Program: Mechanical Engineering
- Concerns: Academic stress, thesis pressure
- Language: English with some Twi
- Faith: Very important

Response Style:
- Always use their name
- Be warm and culturally aware
- Reference their specific context
- Include Twi greeting if morning/afternoon/evening

Now respond to Kwame's message.`;

  const userMessage = "I'm feeling overwhelmed with my thesis and job applications.";

  const fullPrompt = `${systemPrompt}\n\nKwame: ${userMessage}\n\nMindBridge:`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n=== GEMINI RESPONSE ===\n");
    console.log(text);
  } catch (error) {
    console.error("Error during test:", error);
  }
}

testPersonalized();
