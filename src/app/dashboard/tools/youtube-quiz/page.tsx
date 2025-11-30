'use client';

import { useState } from 'react';
import { Youtube, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function YouTubeQuizPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quiz, setQuiz] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setQuiz(null);

        try {
            const res = await fetch('/api/tools/youtube-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: url }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate quiz');
            }

            setQuiz(data.quiz);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-6">
                    <Youtube className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">YouTube to Quiz</h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Turn any educational YouTube video into an interactive quiz instantly. 
                    Just paste the URL below.
                </p>
            </div>

            <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-8 mb-12">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-red-500 transition-colors text-lg"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg whitespace-nowrap"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Youtube className="w-6 h-6" />
                                Generate Quiz
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {quiz && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-400" />
                            Generated Quiz
                        </h2>
                        <span className="px-4 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                            {quiz.questions.length} Questions Ready
                        </span>
                    </div>

                    <div className="grid gap-6">
                        {quiz.questions.map((q: any, idx: number) => (
                            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                                <div className="flex gap-4 mb-6">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-white pt-1">{q.question}</h3>
                                </div>

                                <div className="grid gap-3 pl-12">
                                    {q.options.map((option: string, optIdx: number) => (
                                        <div 
                                            key={optIdx}
                                            className={`p-4 rounded-xl border ${
                                                optIdx === q.correctAnswer 
                                                    ? 'bg-green-500/10 border-green-500/50 text-green-200' 
                                                    : 'bg-gray-900/50 border-gray-700 text-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                    optIdx === q.correctAnswer ? 'border-green-500' : 'border-gray-600'
                                                }`}>
                                                    {optIdx === q.correctAnswer && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                                </div>
                                                {option}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pl-12 pt-6 border-t border-gray-700">
                                    <p className="text-sm text-blue-300 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span className="font-bold">Explanation:</span> {q.explanation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
