'use client';

import { useState } from 'react';
import { X, MessageSquare, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface Quiz {
    questions: Question[];
    isCompleted: boolean;
    score?: number;
}

interface StudyStep {
    stepNumber: number;
    description: string;
    estimatedTime?: string;
    isCompleted: boolean;
    quiz?: Quiz;
}

interface StudyModeProps {
    isOpen: boolean;
    onClose: () => void;
    step: StudyStep;
    stepIndex: number;
    assignmentId: string;
    courseId: string; // Google Course ID for Chat
    onStepComplete: (index: number) => void;
}

export default function StudyMode({
    isOpen,
    onClose,
    step,
    stepIndex,
    assignmentId,
    courseId,
    onStepComplete
}: StudyModeProps) {
    const [activeTab, setActiveTab] = useState<'chat' | 'quiz'>('chat');
    const [quiz, setQuiz] = useState<Quiz | undefined>(step.quiz);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const generateQuiz = async () => {
        setLoadingQuiz(true);
        try {
            const res = await fetch(`/api/assignments/${assignmentId}/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stepIndex })
            });
            const data = await res.json();
            if (data.quiz) {
                setQuiz(data.quiz);
            }
        } catch (error) {
            console.error('Failed to generate quiz', error);
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (showExplanation) return;
        setSelectedOption(index);
        setShowExplanation(true);
        
        if (index === quiz?.questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (!quiz) return;
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setQuizCompleted(true);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gray-900 w-full max-w-6xl h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden"
                >
                    {/* Left Panel: Step Details */}
                    <div className="w-1/3 border-r border-white/10 p-8 flex flex-col bg-gray-900/50">
                        <div className="mb-8">
                            <span className="text-blue-400 text-sm font-medium tracking-wider uppercase">Step {step.stepNumber}</span>
                            <h2 className="text-2xl font-bold mt-2 text-white">{step.description}</h2>
                            {step.estimatedTime && (
                                <p className="text-gray-400 mt-2 text-sm flex items-center gap-2">
                                    ⏱ {step.estimatedTime}
                                </p>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <p className="text-gray-300 leading-relaxed">
                                Use the AI Tutor on the right to ask questions about this specific step. 
                                Once you feel confident, take the quiz to verify your knowledge!
                            </p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10">
                            <button 
                                onClick={() => {
                                    onStepComplete(stepIndex);
                                    onClose();
                                }}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark Step Complete
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Interactive Area */}
                    <div className="w-2/3 flex flex-col bg-gray-950">
                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button 
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5' : 'text-gray-400 hover:text-white'}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                AI Tutor
                            </button>
                            <button 
                                onClick={() => setActiveTab('quiz')}
                                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'quiz' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-gray-400 hover:text-white'}`}
                            >
                                <BrainCircuit className="w-4 h-4" />
                                Quiz
                            </button>
                            <button onClick={onClose} className="px-6 text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative">
                            {activeTab === 'chat' ? (
                                <div className="h-full">
                                    <ChatInterface 
                                        courseId={courseId} 
                                        stepContext={step.description} // Pass context to chat
                                    />
                                </div>
                            ) : (
                                <div className="h-full p-8 overflow-y-auto">
                                    {!quiz ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <BrainCircuit className="w-16 h-16 text-gray-600 mb-4" />
                                            <h3 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h3>
                                            <p className="text-gray-400 mb-8 max-w-md">
                                                Generate a 10-question quiz based specifically on this study step.
                                            </p>
                                            <button 
                                                onClick={generateQuiz}
                                                disabled={loadingQuiz}
                                                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {loadingQuiz ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                                Generate Quiz
                                            </button>
                                        </div>
                                    ) : quizCompleted ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6">
                                                <span className="text-4xl font-bold text-white">{Math.round((score / quiz.questions.length) * 100)}%</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                                            <p className="text-gray-400 mb-8">You got {score} out of {quiz.questions.length} correct.</p>
                                            <button 
                                                onClick={onClose}
                                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                                            >
                                                Close Study Mode
                                            </button>
                                        </div>
                                    ) : (!quiz.questions || quiz.questions.length === 0) ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <p className="text-red-400 mb-4">Error: No questions available.</p>
                                            <button 
                                                onClick={() => setQuiz(undefined)}
                                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="max-w-2xl mx-auto">
                                            <div className="flex justify-between items-center mb-8">
                                                <span className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                                                <span className="text-sm font-medium text-purple-400">Score: {score}</span>
                                            </div>
                                            
                                            <h3 className="text-xl font-semibold mb-6">{quiz.questions[currentQuestionIndex].question}</h3>
                                            
                                            <div className="space-y-3">
                                                {quiz.questions[currentQuestionIndex].options.map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleOptionSelect(idx)}
                                                        disabled={showExplanation}
                                                        className={`w-full p-4 rounded-xl text-left transition-all ${
                                                            showExplanation
                                                                ? idx === quiz.questions[currentQuestionIndex].correctAnswer
                                                                    ? 'bg-green-500/20 border-green-500 text-green-200'
                                                                    : idx === selectedOption
                                                                        ? 'bg-red-500/20 border-red-500 text-red-200'
                                                                        : 'bg-white/5 opacity-50'
                                                                : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
                                                        } border`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>

                                            {showExplanation && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                                >
                                                    <p className="text-blue-200 text-sm">
                                                        <span className="font-bold">Explanation:</span> {quiz.questions[currentQuestionIndex].explanation}
                                                    </p>
                                                    <button 
                                                        onClick={nextQuestion}
                                                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
