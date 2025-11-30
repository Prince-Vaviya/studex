import { auth } from '@clerk/nextjs/server';
import { ClassroomService } from '@/services/classroom';
import { VectorService } from '@/services/vector';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Material from '@/models/Material';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email from session claims for VectorService (if needed, or switch VectorService to use userId)
    // For now, let's assume VectorService needs userId too
    // const userEmail = sessionClaims?.email as string; 

    try {
        await dbConnect();

        // Update status to SYNCING
        await Course.findOneAndUpdate(
            { googleId: id },
            { syncStatus: 'SYNCING' }
        );

        const service = await ClassroomService.getClientForUser(userId);
        const courseWorkList = await service.listCourseWork(id);

        // Find the internal Course ID
        const course = await Course.findOne({ googleId: id });
        if (!course) throw new Error('Course not found');

        let materialCount = 0;

        // Upsert Assignments
        for (const work of courseWorkList) {
            await Assignment.findOneAndUpdate(
                { googleId: work.id },
                {
                    courseId: course._id,
                    title: work.title,
                    description: work.description,
                    dueDate:
                        work.dueDate &&
                            work.dueDate.year &&
                            work.dueDate.month &&
                            work.dueDate.day
                            ? new Date(
                                work.dueDate.year,
                                work.dueDate.month - 1,
                                work.dueDate.day
                            )
                            : undefined,
                    status: 'ASSIGNED', // Default
                },
                { upsert: true, new: true }
            );

            // 2. Sync Materials from Assignments
            if (work.materials) {
                for (const mat of work.materials) {
                    if (mat.driveFile && mat.driveFile.driveFile) {
                        const driveFile = mat.driveFile.driveFile;
                        await Material.findOneAndUpdate(
                            { googleId: driveFile.id },
                            {
                                courseId: course._id,
                                title: driveFile.title,
                                mimeType: 'application/pdf', // Simplified
                                alternateLink: driveFile.alternateLink,
                                isVectorized: false,
                            },
                            { upsert: true }
                        );
                        materialCount++;
                    }
                }
            }
        }

        // 3. Trigger Processing (Background-ish)
        // We process the first 5 unvectorized materials to avoid timeout
        const unvectorizedMaterials = await Material.find({
            courseId: course._id,
            isVectorized: false,
            mimeType: { $in: ['application/pdf', 'text/plain'] },
        }).limit(5);

        for (const mat of unvectorizedMaterials) {
            // Pass userId to VectorService
            await VectorService.processMaterial(mat, userId);
        }

        // Update status to SYNCED
        await Course.findOneAndUpdate(
            { googleId: id },
            { syncStatus: 'SYNCED', lastSyncedAt: new Date() }
        );

        return NextResponse.json({
            success: true,
            message: `Synced ${courseWorkList.length} assignments and ${materialCount} materials.Processed ${unvectorizedMaterials.length} files.`,
        });
    } catch (error) {
        console.error('Sync failed:', error);
        await Course.findOneAndUpdate(
            { googleId: id },
            { syncStatus: 'ERROR' }
        );
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
