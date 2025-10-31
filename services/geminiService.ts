import { GoogleGenAI, Type, Modality, Part } from "@google/genai";
import { SearchResult, Source, VocabularyItem } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Please set it to use the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function searchTheWeb(query: string, languageName: string, image?: { base64: string, mimeType: string }): Promise<SearchResult> {
    try {
        const systemInstruction = `You are "NOOR," an expert AI assistant dedicated to helping students understand the Arabic language and Islamic teachings in the simplest way possible. Your primary language is Arabic, secondary is English, and tertiary is Hausa. Based on the user's query, search the entire internet to provide a comprehensive, clear, and easy-to-understand explanation. Also, identify any relevant books or resources available online. You MUST respond in ${languageName}. Your tone should be encouraging, patient, and educational. Format your response using markdown for readability.`;
        
        const userParts: Part[] = [];
        if (query) {
            userParts.push({ text: query });
        }
        if (image) {
            userParts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
        }

        if (userParts.length === 0) {
            throw new Error("Cannot make a search with no query or image.");
        }

        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: [
             { role: "user", parts: userParts }
           ],
           config: {
             systemInstruction: systemInstruction,
             tools: [{googleSearch: {}}],
           },
        });

        const text = response.text;
        const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, sources };
    } catch (error) {
        console.error("Error calling Gemini API for search:", error);
        throw error;
    }
}


export async function getVocabularyForCategory(category: string, existingWords: string[] = []): Promise<VocabularyItem[]> {
    try {
        const systemInstruction = `You are a language expert specializing in Arabic, English, and Hausa. Your task is to generate a list of 10-15 vocabulary words and phrases related to a specific category. For each item, you must provide the translation in Arabic, English, and Hausa. Crucially, all Arabic words MUST be fully voweled (with Tashkeel/diacritics) to ensure correct pronunciation for learners.`;
        
        let userPrompt = `Generate vocabulary for the category: "${category}".`;
        if (existingWords.length > 0) {
            // Slice to keep prompt size manageable and prevent excessively long API calls
            userPrompt += ` Please provide new words that are not in the following list: ${existingWords.slice(-50).join(', ')}.`;
        }

        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: [
             { role: "user", parts: [{ text: userPrompt }] }
           ],
           config: {
             systemInstruction,
             responseMimeType: "application/json",
             responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    arabic: {
                      type: Type.STRING,
                      description: 'The word or phrase in Arabic, fully voweled with Tashkeel.',
                    },
                    english: {
                      type: Type.STRING,
                      description: 'The English translation.',
                    },
                    hausa: {
                        type: Type.STRING,
                        description: 'The Hausa translation.',
                    }
                  },
                  required: ["arabic", "english", "hausa"]
                },
              },
           },
        });

        const jsonStr = response.text.trim();
        const vocabList = JSON.parse(jsonStr);
        
        if (!Array.isArray(vocabList)) {
            throw new Error("AI did not return a valid list.");
        }

        return vocabList;

    } catch (error) {
        console.error("Error calling Gemini API for vocabulary:", error);
        throw error;
    }
}

export async function generateSpeech(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error calling Gemini API for speech generation:", error);
        throw error;
    }
}