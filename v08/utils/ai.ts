
import { GoogleGenAI } from "@google/genai";

// Define the interface for our analysis result
export interface CompanyAnalysis {
  companyName: string;
  location: string;
  summaries: string[];
  targetAudiences: string[];
  suggestedLeads: string[];
  emailTemplate: {
    subject: string;
    body: string;
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCompany = async (url: string, previousData?: CompanyAnalysis | null): Promise<CompanyAnalysis | null> => {
  try {
    const searchTarget = url.trim();

    let userPrompt = `
      Research the company at this URL: "${searchTarget}"
      
      1. Use Google Search to find their official website, landing pages, and social profiles.
      2. Extract the following details:
         - Brand Name
         - Location (City/State)
         - Core Value Proposition
         - Target Audience
      
      3. OUTPUT STRICT JSON ONLY. No Markdown. No Code Blocks.
      
      Required JSON format:
      {
        "companyName": "Exact Brand Name",
        "location": "City, State",
        "summaries": [
           "1-sentence pitch (Punchy)",
           "1-sentence pitch (Formal)",
           "1-sentence pitch (Benefit-focused)"
        ],
        "targetAudiences": [
           "Audience Segment 1",
           "Audience Segment 2",
           "Audience Segment 3"
        ],
        "suggestedLeads": [
           "Job Title 1",
           "Job Title 2",
           "Job Title 3"
        ],
        "emailTemplate": {
          "subject": "Compelling Subject Line",
          "body": "Short, personalized cold email body..."
        }
      }
    `;

    if (previousData) {
        userPrompt += `
        \n(REROLL REQUEST: Generate 3 completely different variations from previous analysis.)
        `;
    }

    // gemini-3-flash-preview is faster and better at tool use
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: userPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        // We do not use responseMimeType: 'application/json' here to avoid tool conflict errors.
        // We rely on the model's intelligence to output JSON as requested.
      }
    });

    if (response.text) {
      try {
          let cleanText = response.text.trim();
          // Remove potential markdown code blocks
          cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
          
          // Find the JSON object
          const firstBrace = cleanText.indexOf('{');
          const lastBrace = cleanText.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1) {
              cleanText = cleanText.substring(firstBrace, lastBrace + 1);
          }

          const data = JSON.parse(cleanText) as CompanyAnalysis;
          return {
              companyName: data.companyName || searchTarget,
              location: data.location || "Global",
              summaries: data.summaries || [],
              targetAudiences: data.targetAudiences || [],
              suggestedLeads: data.suggestedLeads || [],
              emailTemplate: data.emailTemplate || { subject: "Hello", body: "I saw your website..." }
          };
      } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          return null;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
