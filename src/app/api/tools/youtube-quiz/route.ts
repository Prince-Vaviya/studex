import { NextResponse, NextRequest } from 'next/server';
import { ApifyService } from '@/services/apify';
import { hf, CHAT_MODEL } from '@/lib/huggingface';

export async function POST(req: NextRequest) {
    try {
        const { videoUrl } = await req.json();

        if (!videoUrl) {
            return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
        }

        // 1. Get Transcript from Apify
        const transcript = await ApifyService.getVideoTranscript(videoUrl);

        if (!transcript) {
            return NextResponse.json({ error: 'Could not fetch transcript. The video might not have captions.' }, { status: 400 });
        }

        // 2. Generate Quiz using LLM
        // Truncate transcript if too long (approx 15k chars for safety, though models vary)
        const truncatedTranscript = transcript.substring(0, 15000);

        const prompt = `
        Based on the following YouTube video transcript, generate a quiz with 5 multiple-choice questions.
        
        Transcript:
        "${truncatedTranscript}"

        Return ONLY a raw JSON object (no markdown formatting) with this structure:
        {
            "questions": [
                {
                    "question": "Question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0, // Index of correct option
                    "explanation": "Why this is correct"
                }
            ]
        }
        `;

        const response = await hf.chatCompletion({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant that generates quizzes from text.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.5
        });

        const content = response.choices[0].message.content;

        // Clean up markdown code blocks if present
        const jsonStr = content?.replace(/```json/g, '').replace(/```/g, '').trim();

        if (!jsonStr) {
            throw new Error('Failed to generate quiz JSON');
        }

        const quizData = JSON.parse(jsonStr);

        return NextResponse.json({ quiz: quizData });

    } catch (error: any) {
        console.error('YouTube Quiz Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz', details: error.message },
            { status: 500 }
        );
    }
}
