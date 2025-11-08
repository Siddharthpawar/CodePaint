import { GoogleGenAI } from "@google/genai";

export async function generateContent(
  prompt: string,
  images: { data: string; mimeType: string }[] = []
): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [{ text: prompt }];

  images.forEach(image => {
    parts.unshift({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "An unknown error occurred while contacting the Gemini API.";
  }
}
