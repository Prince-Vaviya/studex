import { auth } from '@clerk/nextjs/server';
import { VectorService } from '@/services/vector';
import { hf, CHAT_MODEL } from '@/lib/huggingface';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!process.env.HUGGINGFACE_API_KEY) {
            console.error('HUGGINGFACE_API_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { message, courseId, history, stepContext } = await req.json();

        // 1. Retrieve relevant context from Vector DB
        // If stepContext is provided, we prioritize searching for that
        const query = stepContext ? `${stepContext} ${message}` : message;

        const searchResults = await VectorService.searchSimilarContent(query, courseId);
        const context = searchResults.map((r: any) => r.text).join('\n\n');

        // 2. Construct prompt
        let systemInstructions = `You are a helpful, sweet, and highly motivating AI Tutor for this course.
    Your goal is to help the student succeed and keep them motivated. Always use an encouraging tone and give off "you can do it" vibes! 🚀`;

        if (stepContext) {
            systemInstructions += `\n\nYou are currently helping the student with this specific study step: "${stepContext}". Focus your answers on this topic.`;
        }

        const systemPrompt = `${systemInstructions}
    
    Instructions:
    1. Answer the student's question based on the provided Context from course materials.
    2. If the answer is found in the Context, cite the material source if possible.
    3. If the answer is NOT in the Context, use your general knowledge to answer helpfully, but politely mention that this information is from your general knowledge and not specifically from the uploaded course documents.
    4. Be EXTREMELY concise. Keep answers short, punchy, and to the point. Avoid long pleasantries.
    
    Context:
    ${context}
    `;

        // 3. Generate response using Hugging Face
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map((msg: any) => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.parts[0].text // Adapt Gemini history format to standard role/content
            })),
            { role: 'user', content: message }
        ];

        // Clean up history if needed (ensure alternating roles if model requires it, though Mistral is usually flexible)

        const response = await hf.chatCompletion({
            model: CHAT_MODEL,
            messages: messages as any, // Type assertion might be needed depending on HF types
            max_tokens: 1000,
            temperature: 0.7
        });

        const responseText = response.choices[0].message.content || "I couldn't generate a response.";

        return NextResponse.json({ response: responseText, sources: searchResults });
    } catch (error: any) {
        console.error('Chat error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Failed to generate response', details: error.message },
            { status: 500 }
        );
    }
}
