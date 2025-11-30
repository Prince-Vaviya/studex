import { auth } from '@clerk/nextjs/server';
import { hf, CHAT_MODEL } from '@/lib/huggingface';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Assignment from '@/models/Assignment';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // id is assignment googleId
) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const assignment = await Assignment.findOne({ googleId: id });

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            );
        }

        // Construct prompt
        const prompt = `
      You are an expert study planner.
      Break down the following assignment into a logical sequence of study steps.
      Return ONLY a valid JSON array of objects.
      Each object should have:
      - "stepNumber": number
      - "description": string (concise actionable step)
      - "estimatedTime": string (e.g., "30 mins")

      Assignment Title: ${assignment.title}
      Assignment Description: ${assignment.description || 'No description provided.'}
      Due Date: ${assignment.dueDate ? assignment.dueDate.toISOString() : 'None'}
    `;

        const response = await hf.chatCompletion({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.2 // Lower temperature for more deterministic JSON
        });

        const responseText = response.choices[0].message.content || '';

        // Extract JSON from response (handle potential markdown code blocks)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Failed to parse JSON from LLM response');
        }

        const studyPlan = JSON.parse(jsonMatch[0]);

        // Save to DB
        assignment.studyPlan = studyPlan;
        assignment.isDecomposed = true;
        await assignment.save();

        return NextResponse.json(studyPlan);
    } catch (error: any) {
        console.error('Decomposition failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: 'Failed to decompose assignment', details: error.message },
            { status: 500 }
        );
    }
}
