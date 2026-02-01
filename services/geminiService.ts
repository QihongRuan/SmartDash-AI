import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { DashboardData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview for a good balance of speed and large context window handling
const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeCsvData = async (csvContent: string): Promise<DashboardData> => {
  try {
    // We enforce the schema via the prompt mostly, but we can also use responseSchema for strictness.
    // However, for complex analytical objects with nested arrays and flexible keys (like key_metrics),
    // a standard JSON prompt often yields more flexible/creative results than a strict schema definition
    // which might require defining every possible key.
    
    // We will trust the prompt's explicit JSON structure instruction + Type.JSON output mode.
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Here is the CSV data to analyze:" },
            { text: csvContent }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        // Setting a reasonable token limit for the output analysis
        maxOutputTokens: 8192, 
        temperature: 0.2, // Low temperature for factual analysis
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    // Clean up potential markdown formatting if the model adds it despite MIME type
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data: DashboardData = JSON.parse(jsonString);
    return data;

  } catch (error) {
    console.error("Error analyzing CSV with Gemini:", error);
    throw error;
  }
};
