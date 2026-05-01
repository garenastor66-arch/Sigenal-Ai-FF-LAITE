import { GoogleGenAI } from "@google/genai";
import { Message, MessageRole } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const aiService = {
  async chat(messages: Message[], userMemory: string, onUpdate?: (text: string) => void) {
    const model = ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTION: You are Sigenal AI. You have a special feature: you remember things about the user. 
          Here is what you current know about the user: "${userMemory || 'Nothing yet.'}"
          Use this knowledge to provide a personalized experience. 
          When you learn something significant about the user, acknowledge it if relevant.
          Keep your tone helpful, intelligent, and slightly futuristic.
          Output responses in Markdown.` }]
        },
        ...messages.map(m => ({
          role: m.role as string,
          parts: [{ text: m.content }]
        }))
      ]
    });

    let fullText = "";
    for await (const chunk of await model) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onUpdate?.(fullText);
      }
    }
    return fullText;
  },

  async extractMemory(chatHistory: Message[], currentMemory: string) {
    // This function analyzes the chat and extracts facts about the user to store in memory
    const historyText = chatHistory.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a memory distillation unit. 
      Analyze the following chat history and the current user memory profile.
      Update and return a concise, structured memory profile (facts about the user, preferences, name, goals, etc.).
      
      Current Memory: "${currentMemory}"
      
      Recent Chat:
      ${historyText}
      
      ONLY return the updated memory string. No other text.`
    });

    return response.text?.trim() || currentMemory;
  },

  async generateTitle(firstMessage: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a very short title (max 4 words) for a chat that starts with: "${firstMessage}". Return ONLY the title.`
    });
    return response.text?.trim() || "New Chat";
  }
};
