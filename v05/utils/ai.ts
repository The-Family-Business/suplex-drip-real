
import { GoogleGenAI, Type } from "@google/genai";

// Define the interface for our analysis result
export interface CompanyAnalysis {
  companyName: string;
  summary: string;
  targetAudience: string;
  suggestedLeads: string[];
  emailTemplate: {
    subject: string;
    body: string;
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCompany = async (url: string): Promise<CompanyAnalysis | null> => {
  try {
    // Clean URL
    const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the company at this website: ${cleanUrl}. 
      
      Extract or generate the following:
      1. Company Name: The official brand name.
      2. Summary: A 1-sentence description of what the business does.
      3. Target Audience: A short description of who they sell to (e.g., "HR Managers at Tech Companies").
      4. Suggested Leads: List 3 specific job titles to target.
      5. Cold Email: A short, punchy cold email draft.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING, description: "The brand name of the company" },
            summary: { type: Type.STRING, description: "One sentence business description" },
            targetAudience: { type: Type.STRING, description: "The ideal customer profile" },
            suggestedLeads: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            emailTemplate: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                body: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CompanyAnalysis;
    }
    return null;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
