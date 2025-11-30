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
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="bg-red-500/10 p-2 rounded-lg text-red-400">
                🛠️
            </span>
            Study Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/dashboard/tools/youtube-quiz" className="group block p-6 bg-gray-800/50 hover:bg-gray-800 border border-white/5 hover:border-red-500/50 rounded-2xl transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-full text-gray-400 group-hover:text-white transition-colors">New</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">YouTube to Quiz</h3>
                <p className="text-sm text-gray-400">Generate interactive quizzes instantly from any educational YouTube video.</p>
            </a>
        </div>
      </section>

      <section>
        <header className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            My Courses
            </h1>
            <p className="text-gray-400 mt-2">Select a course to view assignments and study materials.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CourseList />
        </main>
      </section>
    </div>
  );
}
