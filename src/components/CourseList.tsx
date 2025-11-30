'use client';

import { useEffect, useState } from 'react';
import { ICourse } from '@/models/Course';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CourseList() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (courseId: string) => {
    setSyncing(courseId);
    try {
      await fetch(`/api/courses/${courseId}/sync`, { method: 'POST' });
      await fetchCourses();
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="col-span-full flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="col-span-full text-center py-20 glass rounded-xl">
        <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
        <p className="text-gray-400">
          Make sure you are enrolled in a Google Classroom.
        </p>
      </div>
    );
  }

  return (
    <>
      {courses.map((course, index) => (
        <motion.div
          key={course.googleId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="glass glass-hover p-6 rounded-xl flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <span
                className={clsx(
                  'text-xs px-2 py-1 rounded-full border',
                  course.syncStatus === 'SYNCED'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : course.syncStatus === 'SYNCING'
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700/50 border-gray-600 text-gray-400'
                )}
              >
                {course.syncStatus}
              </span>
            </div>
            <Link
              href={`/dashboard/course/${course.googleId}`}
              className="block group-hover:translate-x-1 transition-transform"
            >
              <h3 className="text-xl font-bold mb-1 text-white group-hover:text-blue-400 transition-colors">
                {course.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {course.section || 'No section'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <button
              onClick={() => handleSync(course.googleId)}
              disabled={syncing === course.googleId}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-blue-500/20"
            >
              <RefreshCw
                className={clsx(
                  'w-4 h-4',
                  syncing === course.googleId && 'animate-spin'
                )}
              />
              {syncing === course.googleId ? 'Syncing...' : 'Sync Materials'}
            </button>
          </div>
        </motion.div>
      ))}
    </>
  );
}
