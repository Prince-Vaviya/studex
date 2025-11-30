'use client';

import { useEffect, useState } from 'react';
import { IAssignment } from '@/models/Assignment';
import { Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function AssignmentList({ courseId }: { courseId: string }) {
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/assignments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading assignments...</div>;

  if (assignments.length === 0) {
    return (
      <div className="text-center py-10 glass rounded-xl border-dashed border-gray-700">
        <p className="text-gray-400">No assignments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => (
        <motion.div
          key={assignment.googleId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="glass glass-hover p-4 rounded-xl flex flex-col group"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
              {assignment.title}
            </h3>
            <span
              className={clsx(
                'text-xs px-2 py-1 rounded-full border',
                assignment.status === 'TURNED_IN'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              )}
            >
              {assignment.status}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            {assignment.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {assignment.isDecomposed && (
              <div className="flex items-center gap-1 text-purple-400">
                <CheckCircle className="w-4 h-4" />
                <span>Study Plan Ready</span>
              </div>
            )}
          </div>

          <Link
            href={`/dashboard/assignment/${assignment.googleId}`}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium mt-auto"
          >
            View Details & Study Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
