import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key_for_build';

const genAI = new GoogleGenerativeAI(apiKey);

export const embeddingModel = genAI.getGenerativeModel({
    model: 'embedding-001',
});

export const chatModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});
