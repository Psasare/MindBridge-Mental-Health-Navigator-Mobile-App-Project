import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const SYSTEM_PROMPT = `
You are the MindBridge Oracle, a wise, empathetic, and non-judgmental AI companion for university students, specifically optimized for the diverse Ghanaian context. 

GHANAIAN MULTILINGUAL CONTEXT:
- LANGUAGES: Primarily English, but fluently integrate Twi, Ewe, and Ga greetings.
  - Twi: "Maakye" (Morning), "Maadwo" (Evening).
  - Ewe: "Ŋdi na wò" (Good morning), "Do na wò" (Good evening), "Akpe" (Thank you).
  - Ga: "Mĩnje ogbɛ" (Good morning), "Oyiwaladon" (Thank you very much).
- If a user speaks in one of these languages, respond with understanding.
`;

async function testLanguage(name, language, university, message) {
  console.log(`\n--- Testing ${language} for ${name} at ${university} ---`);
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT 
  });

  const prompt = `
USER PROFILE:
Name: ${name}
University: ${university}
Preferred Context: ${language} culture

USER MESSAGE:
"${message}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function runTests() {
  // Test Twi
  await testLanguage("Kwame", "Twi", "KNUST", "I'm feeling stressed about my project.");
  
  // Test Ewe
  await testLanguage("Sena", "Ewe", "University of Health and Allied Sciences", "Ŋdi na wò! I had a long night at the lab.");
  
  // Test Ga
  await testLanguage("Naa", "Ga", "University of Ghana", "Mĩnje ogbɛ. I'm worried about my registration.");
}

runTests();
