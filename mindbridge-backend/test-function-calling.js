import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const SYSTEM_PROMPT = `
You are the MindBridge Oracle. You have tools to check user data.
Use them if the user asks about their history or rituals.
`;

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_ritual_status",
        description: "Check if the user has completed their daily rituals today.",
        parameters: { type: "object", properties: {} }
      }
    ]
  }
];

async function testFunctionCalling() {
  console.log("\n--- Testing Function Calling (Ritual Status) ---");
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    tools: tools
  });

  const chat = model.startChat();
  
  // Simulate user asking about rituals
  const userMessage = "Did I finish my rituals today?";
  console.log("User:", userMessage);

  try {
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const call = response.functionCalls()?.[0];

    if (call) {
      console.log("AI decided to call tool:", call.name);
      
      // Simulate tool result (e.g. Garden is done, Journal is not)
      const toolResult = { moodGarden: true, journalEntry: false };
      console.log("Simulated Tool Result:", toolResult);

      const finalResult = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: { result: toolResult }
        }
      }]);
      
      console.log("AI Final Response:", finalResult.response.text());
    } else {
      console.log("AI response (no tool call):", response.text());
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testFunctionCalling();
