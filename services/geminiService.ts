
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiProcessedData } from "../types";

export const processDocument = async (base64Image: string): Promise<GeminiProcessedData | null> => {
  // Use the system-provided API key from environment variables
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    console.warn("Gemini API Key is not configured. Running in Basic Mode.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Analyze this document. Provide a professional title and extract all readable text via OCR. Return the result in a clean JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: 'A professional and concise title for the document' 
            },
            ocrContent: { 
              type: Type.STRING, 
              description: 'The complete extracted text from the document image' 
            },
            qualityScore: { 
              type: Type.NUMBER, 
              description: 'The confidence score of the scan from 0 to 1' 
            }
          },
          required: ['title', 'ocrContent', 'qualityScore'],
        },
      },
    });

    const result = response.text;
    if (!result) return null;
    
    return JSON.parse(result) as GeminiProcessedData;
  } catch (error) {
    console.error("Gemini AI Processing Error:", error);
    return null;
  }
};
