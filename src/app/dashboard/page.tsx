import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CourseList from '@/components/CourseList';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          My Courses
        </h1>
        <p className="text-gray-400 mt-2">Select a course to view assignments and study materials.</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CourseList />
      </main>
    </div>
  );
}
