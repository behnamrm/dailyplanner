
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API_KEY is available in the environment.
// In a real build process, this would be replaced.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY environment variable not set. AI features will not work."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
  if (!API_KEY) {
      return Promise.resolve([]);
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
