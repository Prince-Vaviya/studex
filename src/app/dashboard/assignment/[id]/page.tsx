
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Assignment from '@/models/Assignment';
import AssignmentDecomposer from '@/components/AssignmentDecomposer';
import { Calendar, Link as LinkIcon } from 'lucide-react';

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/login');

  await dbConnect();
  const assignment = await Assignment.findOne({ googleId: id });

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          {assignment.alternateLink && (
            <a
              href={assignment.alternateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <LinkIcon className="w-4 h-4" /> Open in Classroom
            </a>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-gray-400 mb-6">
          {assignment.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Description */}
          <div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap">
                {assignment.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Right Column: Study Plan */}
          <div>
            <AssignmentDecomposer assignment={JSON.parse(JSON.stringify(assignment))} />
          </div>
        </div>
      </header>
    </div>
  );
}
