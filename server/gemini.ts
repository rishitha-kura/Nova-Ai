import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI;

const getAiInstance = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateContent(prompt: string, history: { role: string, content: string }[] = []): Promise<string> {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const response = await getAiInstance().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      if (!response.text) {
          throw new Error('Empty response from model');
      }

      return response.text;
    } catch (error) {
      attempts++;
      console.error(`[Gemini API] Attempt ${attempts} failed.`);
      if (attempts >= MAX_RETRIES) {
        throw new Error("I'm temporarily unable to reach the AI service. Please try again in a moment.");
      }
      // Exponential backoff
      await delay(RETRY_DELAY_MS * Math.pow(2, attempts - 1));
    }
  }
  
  throw new Error("I'm temporarily unable to reach the AI service. Please try again in a moment.");
}
