import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AssignmentList from '@/components/AssignmentList';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/login');

  await dbConnect();
  const course = await Course.findOne({ googleId: id });

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        <p className="text-gray-400">{course.section}</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Assignments</h2>
          <AssignmentList courseId={id} />
        </div>
      </div>
    </div>
  );
}
