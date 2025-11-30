import { HfInference } from '@huggingface/inference';

const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();

console.log('[HF] Initializing client');
console.log(`[HF] API Key present: ${!!apiKey}`);
if (apiKey) console.log(`[HF] API Key length: ${apiKey.length}`);

// Initialize the Hugging Face Inference client
export const hf = new HfInference(apiKey);

// Default model for chat and text generation
// Using Llama 3 8B Instruct as it is widely supported on the free tier
export const CHAT_MODEL = 'meta-llama/Meta-Llama-3-8B-Instruct';

// Embedding model for vector search
export const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
