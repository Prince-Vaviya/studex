
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IAssignment, IStudyStep } from '@/models/Assignment';
import { Sparkles, Loader2, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import StudyMode from './StudyMode';
import clsx from 'clsx';

export default function AssignmentDecomposer({
  assignment,
}: {
  assignment: IAssignment;
}) {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [studyPlan, setStudyPlan] = useState<any[]>(assignment.studyPlan || []);
    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

    const handleDecompose = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/assignments/${assignment.googleId}/decompose`, {
                method: 'POST',
            });
            const data = await res.json();
            if (data.studyPlan) {
                setStudyPlan(data.studyPlan);
                router.refresh();
            }
        } catch (error) {
            console.error('Decomposition failed', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStepComplete = (index: number) => {
        // Optimistic update - in real app, save to DB
        const newPlan = [...studyPlan];
        newPlan[index].isCompleted = true;
        setStudyPlan(newPlan);
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Study Plan</h2>
                {!studyPlan.length && (
                    <button
                        onClick={handleDecompose}
                        disabled={isGenerating}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" /> Generate Plan
                            </>
                        )}
                    </button>
                )}
            </div>

            {studyPlan.length > 0 ? (
                <div className="space-y-4">
                    {studyPlan.map((step, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedStepIndex(index)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                                step.isCompleted
                                    ? 'bg-green-900/20 border-green-500/30'
                                    : 'bg-gray-800 border-gray-700 hover:border-blue-500/50'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${
                                        step.isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-700 text-gray-300'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-lg font-semibold ${step.isCompleted ? 'text-green-400' : 'text-white'}`}>
                                        {step.description}
                                    </h3>
                                    {step.estimatedTime && (
                                        <p className="text-base text-gray-400 mt-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {step.estimatedTime}
                                        </p>
                                    )}
                                </div>
                                <div className="text-gray-500 self-center">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
                    <p className="text-gray-400">
                        No study plan yet. Click "Generate Plan" to break this assignment down!
                    </p>
                </div>
            )}

            {selectedStepIndex !== null && (
                <StudyMode
                    isOpen={true}
                    onClose={() => setSelectedStepIndex(null)}
                    step={studyPlan[selectedStepIndex]}
                    stepIndex={selectedStepIndex}
                    assignmentId={assignment.googleId}
                    courseId={assignment.courseId.toString()}
                    onStepComplete={handleStepComplete}
                />
            )}
        </div>
    );
}
