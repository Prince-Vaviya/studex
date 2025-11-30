import { auth } from '@clerk/nextjs/server';
import { ClassroomService } from '@/services/classroom';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        console.log(`[API] Fetching courses for userId: ${userId}`);

        // 1. Fetch from Google Classroom
        const service = await ClassroomService.getClientForUser(userId);
        const courses = await service.listCourses();

        console.log(`[API] Found ${courses.length} courses from Google`);

        // 2. Sync/Upsert to MongoDB
        const syncedCourses = [];
        for (const course of courses) {
            const syncedCourse = await Course.findOneAndUpdate(
                { googleId: course.id },
                {
                    userId: userId,
                    name: course.name,
                    section: course.section,
                    descriptionHeading: course.descriptionHeading,
                    alternateLink: course.alternateLink,
                    courseState: course.courseState,
                },
                { upsert: true, new: true }
            );
            syncedCourses.push(syncedCourse);
        }

        return NextResponse.json(syncedCourses);
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses', details: (error as Error).message },
            { status: 500 }
        );
    }
}
