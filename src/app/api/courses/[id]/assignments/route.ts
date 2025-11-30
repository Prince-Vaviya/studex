import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // id is course googleId
) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        // Find internal course ID
        const course = await Course.findOne({ googleId: id });
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const assignments = await Assignment.find({ courseId: course._id }).sort({
            dueDate: 1,
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Failed to fetch assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}
