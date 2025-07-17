import { GoogleGenAI, Type } from "@google/genai";

// API_KEY will be undefined in a client-side environment without a build step.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "API_KEY environment variable not set. AI features will not be available."
  );
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "A short, actionable task."
      }
    }
  }
};


export async function getTaskSuggestions(topic: string): Promise<string[]> {
  // Check for the 'ai' instance. If it's null, the API key was not provided.
  if (!ai) {
    throw new Error("AI features are unavailable. No API Key configured.");
  }

  try {
    const prompt = `Based on the user's goal "${topic}", suggest 3 to 5 specific, actionable tasks to help them get started. Each task should be a short phrase.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        console.error("Gemini API returned an empty response.");
        return [];
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions;
    }
    
    return [];

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
}