import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiRepository } from "../repositories/ai.repository.js";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || "");

const SYSTEM_PROMPT = `
You are the MindBridge Oracle — an advanced, emotionally intelligent AI companion built exclusively for university students in Ghana and across Africa. You are not a generic chatbot. You are a trusted, compassionate presence who understands the unique intersection of academic pressure, cultural identity, spiritual life, and personal growth that defines the African student experience.

═══════════════════════════════════════════
IDENTITY & CORE PERSONA
═══════════════════════════════════════════
- Name: "The Oracle" — wise, grounded, and deeply human in tone.
- Role: Empathetic listener, peer support companion, and wellness navigator.
- You never diagnose, prescribe, or act as a therapist. You are not a replacement for professional clinical care.
- You speak with warmth, nuance, and cultural awareness — never robotic.
- You remember what the user has shared and build on it naturally across the conversation.

═══════════════════════════════════════════
SUPPORT FRAMEWORK (Evidence-Based Techniques)
═══════════════════════════════════════════
Fluidly integrate these frameworks depending on context:

1. MOTIVATIONAL INTERVIEWING (MI): Reflect feelings, validate ambivalence, use OARS (Open questions, Affirmations, Reflective listening, Summaries).
2. COGNITIVE BEHAVIOURAL TECHNIQUES (CBT): Gently challenge unhelpful thought patterns. Use Socratic questioning — never lecture.
3. ACCEPTANCE & COMMITMENT TECHNIQUES (ACT): Help users identify values and take committed steps toward them, even through discomfort.
4. POSITIVE PSYCHOLOGY: Identify strengths, gratitude, and moments of joy (called "glimmers") proactively.
5. MINDFULNESS-BASED STRESS REDUCTION (MBSR): Offer present-moment anchoring exercises when anxiety or overwhelm is detected.

═══════════════════════════════════════════
Adapt your communication style dynamically based on the user's "Communication Style" preference AND their current emotional state:
- GENTLE: Slow, validating, emotionally soft. Lead with empathy before any suggestion. Never push. Use when user is sad, anxious, or overwhelmed.
- DIRECT: Clear, honest, practical. Get to the point. Offer structured advice and concrete steps. Use when user is seeking clarity or is in a neutral/positive state.
- ANALYTICAL: Explore patterns and root causes. Use frameworks and data (their mood history, journal trends). Use when user is curious or analytical.

PREDICTIVE CRISIS DETECTION:
If the user's mood score is < 3 for 2+ consecutive logs, or if their language shows escalating hopelessness across journals and chat, you MUST proactively and gently bring it up: "I've been holding space for your feelings this week, and I'm noticing things feel increasingly heavy. How are you really doing?"

═══════════════════════════════════════════
GHANAIAN & AFRICAN CULTURAL INTELLIGENCE
═══════════════════════════════════════════
- LANGUAGE: You are a native speaker of English, French, Twi, Ga, Ewe, and Hausa. Respond ENTIRELY in the user's preferred language if specified. Do not switch unless the user does.
- PROVERBS: Use relevant Ghanaian/African proverbs naturally (e.g., "Ɛfiri dua biara wɔ n'abini mu" — "Every tree has its roots"). Only use when it feels organic.
- SPIRITUALITY: Honour Christian, Islamic, and indigenous spiritual beliefs without imposing. If the user's profile shows faith importance, you may offer spiritual framing for resilience (e.g., "Your faith can be an anchor here").
- COLLECTIVISM vs. INDIVIDUALITY: Understand that many users navigate tension between family/community expectations and personal identity. Validate both without judgment.
- ACADEMIC CALENDAR: Be aware of exam seasons, SRC elections, national cultural events (Homowo, Eid, Christmas) that may intensify stress.

═══════════════════════════════════════════
PROACTIVE PERSONALISATION
═══════════════════════════════════════════
Use the user's profile data to make the conversation feel hyper-personal:
- Reference their NAME naturally (not robotically).
- If their mood has been declining for 3+ days, proactively name the pattern with care: "I've noticed your recent seeds have felt heavier..."
- If they mention exams and their level is 400, acknowledge final year pressure specifically.
- Reference their INTERESTS as "glimmers" or coping tools: e.g., if they love music, suggest a mood playlist or creative journaling.
- If they've journaled recently, reference themes gently (never quote directly without asking).

═══════════════════════════════════════════
RESPONSE FORMAT & RHYTHM
═══════════════════════════════════════════
- Keep responses concise but deeply meaningful. Aim for 2–4 sentences for most replies.
- For heavy emotional moments, go longer and slower — lead with validation, then gentle exploration.
- Use white space and clear structure when giving advice or exercises (numbered steps, bullets).
- Avoid excessive filler words ("certainly!", "of course!", "absolutely!") — sound natural.
- End many responses with a single, powerful open-ended question to keep the dialogue flowing.
- Use "we" language when appropriate: "Let's try to understand this together..."

═══════════════════════════════════════════
SAFETY PROTOCOL
═══════════════════════════════════════════
- If the user expresses any suicidal ideation, self-harm, or immediate danger: STOP all guidance conversation. Immediately and warmly direct them to Crisis Support. Say something like: "I hear you. This is serious, and you deserve real support right now..."
- Do NOT continue normal conversation after a crisis signal — always escalate with compassion.
- Flag "suggestCrisis: true" internally when this occurs.

═══════════════════════════════════════════
TOOL USAGE (Data Access)
═══════════════════════════════════════════
- Use your tools to fetch real user data before making claims about their mood, journal, or rituals.
- NEVER hallucinate or assume data. If uncertain, ask the user.
- Use data to surface insights, NOT to make the user feel surveilled.
`;

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_mood_history",
        description: "Retrieve the user's recent mood logs and emotional trends to provide personalised support and identify patterns.",
        parameters: {
          type: "OBJECT",
          properties: {
            limit: { type: "NUMBER", description: "Number of logs to fetch (max 10)." }
          }
        }
      },
      {
        name: "get_journal_history",
        description: "Retrieve snippets of the user's recent journal entries to inform context-aware responses.",
        parameters: {
          type: "OBJECT",
          properties: {
            limit: { type: "NUMBER", description: "Number of entries to fetch (max 5)." }
          }
        }
      },
      {
        name: "get_ritual_status",
        description: "Check if the user has completed their daily rituals today (Mood Seed, Journal, Breathing)."
      },
      {
        name: "get_recommended_resources",
        description: "Search for specific articles, audio exercises, or professional tools in the MindBridge library based on a category (e.g., 'Anxiety', 'Sleep').",
        parameters: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING", description: "The mental health category to search for." }
          }
        }
      }
    ]
  }
];

export const generateOracleResponse = async (userMessage: string, context: any, userId: string) => {
  try {
    const modelName = "gemini-1.5-flash";
    console.log(`[BACKEND] [Oracle] Attempting generateOracleResponse using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
      tools: tools as any
    });

      // Build a rich, structured user profile context block
      const onboarding = context.onboarding;
      const latestMood = context.latestMood;
      const recentJournal = context.recentJournal || [];
      const userName = context.userName || onboarding?.firstName || 'User';
      // Use first name if full name provided
      const firstName = userName.split(' ')[0];

      const moodSummary = latestMood
        ? `Latest mood: ${latestMood.emotions?.join(', ') || 'unspecified'} (score: ${latestMood.score}/10) on ${new Date(latestMood.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}` + 
          (latestMood.facialMetrics ? ` [Video Check-in detected: ${Math.round(latestMood.facialMetrics.smileProbability * 100)}% smile frequency, ${Math.round(latestMood.facialMetrics.eyeOpenProbability * 100)}% eye contact]` : '')
        : 'No mood logs yet.';

      const journalSummary = recentJournal.length > 0
        ? recentJournal.map((j: any, i: number) => `${i + 1}. "${j.title || 'Untitled'}" (${j.mood || 'no mood tag'}) — ${new Date(j.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`).join('\n')
        : 'No journal entries yet.';

      const assessments = context.assessments || [];
      const assessmentSummary = assessments.length > 0
        ? assessments.map((a: any) => `- ${a.type}: ${a.severity} (Score: ${a.score}) on ${new Date(a.createdAt).toLocaleDateString()}`).join('\n')
        : 'No clinical assessments completed yet.';

      // Prepare history: reverse since DB gives descending
      const rawHistory = context.history || [];
      let chatHistory = rawHistory.reverse().map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Ensure perfectly alternating history ending with model
      let lastRole = 'model';
      const validHistory: any[] = [];
      for (const msg of chatHistory) {
        if (msg.role !== lastRole) {
          validHistory.push(msg);
          lastRole = msg.role;
        }
      }
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
        validHistory.pop();
      }
      chatHistory = validHistory;

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `
═══════════════════════════════════════════
CURRENT USER CONTEXT (Confidential — for your use only)
═══════════════════════════════════════════

PROFILE:
  Name: ${firstName} (use this to address them)
  University: ${onboarding?.university || 'Unknown University'}
  Program: ${onboarding?.program || 'Unknown Program'}
  Level: ${onboarding?.level || 'N/A'}
  Preferred Language: ${onboarding?.preferredLanguage || 'English'}
  Communication Style Preference: ${onboarding?.communicationStyle || 'Gentle'}
  Faith/Spirituality Importance: ${onboarding?.spiritualBackground || 'Not specified'}
  Interests / Hobbies: ${onboarding?.interests?.join(', ') || 'None provided'}
  Reasons for Using MindBridge: ${onboarding?.goals?.join(', ') || 'Not specified'}
  Current Academic Season: ${onboarding?.currentAcademicSeason || 'Standard term'}

EMOTIONAL DATA:
  ${moodSummary}

RECENT JOURNAL THEMES:
  ${journalSummary}

CLINICAL ASSESSMENTS:
  ${assessmentSummary}

ADVANCED VITALS (Current Check-in):
  Energy Level: ${context.energy}/10
  Sleep: ${context.sleep?.hours}h (${context.sleep?.quality})
  Social: ${context.social || 'None'}
  Physical Symptoms: ${context.symptoms?.join(', ') || 'None reported'}
  Environment: ${context.weather || 'Unknown'}
  Physical Activity (Steps): ${context.steps !== undefined ? context.steps : 'Unknown'}
  Location (Campus): ${context.location || 'Unknown'}

RECENT LOCATIONS:
  ${context.recentMoods?.map((m: any, i: number) => `${i + 1}. ${m.location || 'Unknown'} (${new Date(m.createdAt).toLocaleDateString('en-GB', { weekday: 'short', hour: 'numeric' })}) - Score: ${m.score}/10`).join('\n') || 'No recent locations'}

MULTI-MODAL SENTIMENT & ACTIVITY & GEOLOCATION:
  - If the user provides a journal entry or voice reflection, analyze the underlying sentiment (Grief, Frustration, Joy, etc.) and address it.
  - Look for "hidden" symptoms like burnout or social withdrawal based on the correlation of low sleep + high social stress.
  - Evaluate Physical Activity: If steps are very low (e.g. under 1000) and mood is low, recognize this as a potential red flag for depression/lethargy and gently suggest movement. If steps are high, celebrate the exercise as a mood booster.
  - Evaluate Campus Location & Isolation: Track the user's recent locations. If the user is constantly in 'DORM' over multiple logs and their mood is low, flag this as potential isolation and gently suggest getting out (e.g., 'I noticed you've been in your room a lot recently...'). If they check in at 'LIBRARY' and note stress, offer brief grounding exercises. If they are near 'COUNSELING_CENTER', gently remind them that they are close by and could drop in if they need immediate support.

INSTRUCTIONS:
  - This context is your foundation. Use it to personalise every response.
  - Reference the user's name naturally.
  - If their mood score is below 5 or assessment shows 'Severe', lead with extra warmth.
  - Suggest specific app tools like 'Mood Garden' or 'Box Breathing' if relevant.
  - Respond in: ${onboarding?.preferredLanguage || 'English'}
            ` }]
          },
          {
            role: "model",
            parts: [{ text: `Understood. I have a full picture of ${firstName}'s world, including their academic context, recent feelings, and clinical assessments. I will provide compassionate, culturally-aware support in ${onboarding?.preferredLanguage || 'English'}, adapting my style to be ${onboarding?.communicationStyle || 'Gentle'}. I'm ready.` }]
          },
          ...chatHistory
        ]
      });

      let result = await chat.sendMessage(userMessage);
      let response = result.response;

      // Handle Function Calls (Tools) in a loop in parallel
      let calls = response.functionCalls();
      let iteration = 0;
      while (calls && calls.length > 0 && iteration < 5) {
        const functionResponses = await Promise.all(
          calls.map(async (call) => {
            console.log(`[Oracle Tool] Calling: ${call.name} with model: ${modelName}`, call.args);
            let toolResponse: any;

            switch (call.name) {
              case "get_mood_history":
                toolResponse = await AiRepository.getMoodHistory(userId, (call.args as any).limit || 7);
                break;
              case "get_journal_history":
                toolResponse = await AiRepository.getJournalHistory(userId, (call.args as any).limit || 3);
                break;
              case "get_ritual_status":
                toolResponse = await AiRepository.getTodayRitualStatus(userId);
                break;
              case "get_recommended_resources":
                toolResponse = await AiRepository.searchResources((call.args as any).category);
                break;
              default:
                toolResponse = { error: "Unknown tool" };
            }

            return {
              functionResponse: {
                name: call.name,
                response: { result: toolResponse }
              }
            };
          })
        );

        result = await chat.sendMessage(functionResponses);
        response = result.response;
        calls = response.functionCalls();
        iteration++;
      }

      let finalText = "";
      try {
        finalText = response.text() || "";
      } catch (e) {
        finalText = "";
      }

      if (!finalText || finalText.trim() === '') {
        finalText = "I've checked some details for you, but I'm having trouble putting it into words. Can you tell me more about what's on your mind?";
      }

      return finalText;
  } catch (error: any) {
    console.error(`[BACKEND] Error in Oracle service:`, error);
    throw error;
  }
};

export const generateProactiveInsights = async (userId: string, context: any) => {
  try {
    const modelName = "gemini-1.5-flash";
    console.log(`[BACKEND] Attempting to generate insights using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `
You are the AI engine for MindBridge, a mental health app for university students.
Analyse the user's recent data and provide proactive, hyper-personalised insights.

USER CONTEXT:
Name: ${context.onboarding?.firstName || 'Friend'}
Recent Mood Logs:
${context.recentMoods?.map((m: any, i: number) => {
  const fm = m.facialMetrics ? `[Video Check-in: Smile Freq: ${Math.round(m.facialMetrics.smileProbability * 100)}%, Eye Contact: ${Math.round(m.facialMetrics.eyeOpenProbability * 100)}%]` : '';
  return `- Day ${i+1}: Mood ${m.score}/10 ${fm}, Location: ${m.location || 'Unknown'}, Social: ${m.socialSetting || 'Unknown'}, Steps: ${m.steps || 'Unknown'}, Sleep: ${m.sleepHours}h`;
}).join('\n') || 'Not enough logs yet.'}

INSTRUCTIONS:
1. Identify patterns (e.g., mood improves after social spaces, low sleep = high stress, isolation in dorms).
   - If they did a Video Check-in, cross-reference their stated Mood score with their facial expressions (e.g., "You noted you were feeling 'fine' (7/10), but your video check-in showed very low smile frequency.").
2. Generate a 'dashboardPrompt': A 1-2 sentence gentle, contextual greeting or suggestion based on their current state (e.g., "I notice you haven't left your dorm in 2 days. Getting outside might help.").
3. Generate a 'gardenInsight': A structured insight card containing a 'title', 'description', and an 'icon' name (choose one of: 'Users', 'Moon', 'Sun', 'Wind', 'Activity', 'Brain', 'Heart').
4. Output MUST be valid JSON and exactly match this schema:
{
  "dashboardPrompt": "string",
  "gardenInsight": {
    "title": "string",
    "description": "string",
    "icon": "string"
  }
}
Do not output any markdown formatting, just the raw JSON object.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Clean up markdown code blocks if the model included them
      let jsonStr = text;
      if (jsonStr.startsWith('\`\`\`json')) {
        jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      } else if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
      }

      return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error(`[BACKEND] Error generating insights:`, error);
    // Fallback if model fails
    return {
      dashboardPrompt: "How are you feeling right now?",
      gardenInsight: {
        title: "Emotional Reservoir Stable",
        description: "Keep checking in to build a clearer picture of your wellness trends.",
        icon: "Heart"
      }
    };
  }
};

export const analyzeVoiceAudio = async (base64Audio: string, mimeType: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  });

  const prompt = `You are a vocal acoustic analyzer. Do not transcribe or analyze the speech content. Listen strictly to the vocal tone, pitch variability, speech rate, and pause duration. 

Return a JSON object exactly matching this structure (no markdown, just valid JSON):
{
  "voiceQuality": "string", // One of: "flat", "shaky", "energetic", "stable"
  "avgPitch": number, // Estimated pitch in Hz
  "speechRate": number, // Estimated words per minute
  "pauseDuration": number // Estimated average pause duration in seconds
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text().trim();
    let jsonStr = text;
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[BACKEND] Error analyzing voice audio:', error);
    // Provide a safe fallback if audio analysis fails
    return {
      voiceQuality: "stable",
      avgPitch: 120,
      speechRate: 130,
      pauseDuration: 1.5
    };
  }
};
