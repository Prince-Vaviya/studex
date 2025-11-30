import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import { hf, CHAT_MODEL } from '@/lib/huggingface';
import { VectorService } from '@/services/vector';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { stepIndex } = await req.json();

        if (typeof stepIndex !== 'number') {
            return NextResponse.json({ error: 'Step index is required' }, { status: 400 });
        }

        await dbConnect();
        const assignment = await Assignment.findOne({ googleId: id });

        if (!assignment) {
            return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        const step = assignment.studyPlan?.[stepIndex];
        if (!step) {
            return NextResponse.json({ error: 'Step not found' }, { status: 404 });
        }

        // Check if quiz already exists
        if (step.quiz && step.quiz.questions.length > 0) {
            return NextResponse.json({ quiz: step.quiz });
        }

        // Fetch context for the quiz
        const course = await Course.findById(assignment.courseId);
        let context = '';
        if (course) {
            // Search for relevant content in the vector DB based on the step description
            // We use the googleId to look up the course in VectorService (as per previous fix)
            const searchResults = await VectorService.searchSimilarContent(step.description, course.googleId, 3);
            context = searchResults.map((r: any) => r.text).join('\n\n');
        }

        // Generate Quiz using HF
        const prompt = `
        You are an expert teacher. Create a multiple-choice quiz with exactly 10 questions to test a student's understanding of the following topic:
        "${step.description}"

        Use the following course material context if relevant:
        ${context}

        Output MUST be a valid JSON array of objects with this structure:
        [
            {
                "question": "Question text here",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0, // Index of the correct option (0-3)
                "explanation": "Brief explanation of why this is correct"
            }
        ]
        
        Do not include any markdown formatting (like \`\`\`json). Just the raw JSON array.
        `;

        const response = await hf.chatCompletion({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant that outputs strictly JSON.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.3
        });

        const responseText = response.choices[0].message.content || '[]';

        // Clean up response if it contains markdown
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let questions = [];
        try {
            questions = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse quiz JSON:', responseText);
            return NextResponse.json({ error: 'Failed to generate valid quiz' }, { status: 500 });
        }

        // Save to database
        step.quiz = {
            questions,
            isCompleted: false
        };

        // Mongoose might not detect deep changes in arrays
        assignment.markModified('studyPlan');
        await assignment.save();

        return NextResponse.json({ quiz: step.quiz });

    } catch (error: any) {
        console.error('Quiz generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz', details: error.message },
            { status: 500 }
        );
    }
}
