import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black -z-10" />
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Assignment Assistant
            </span>
        </div>
        <div className="flex items-center gap-4">
            <SignedIn>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-sm font-medium">
                        Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-sm font-medium">
                        Sign In
                    </button>
                </SignInButton>
            </SignedOut>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-20 mb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">AI-Powered Learning Companion</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50">
            Master Your Assignments <br /> with AI Intelligence
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Connect your Google Classroom, get instant answers from your course materials, and break down complex assignments into manageable steps.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                        <span className="flex items-center gap-2">
                            Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <Link href="/dashboard">
                    <button className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                        <span className="flex items-center gap-2">
                            Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </Link>
            </SignedIn>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full">
            {[
                {
                    icon: <BookOpen className="w-6 h-6 text-blue-400" />,
                    title: "Classroom Sync",
                    description: "Automatically syncs your courses, assignments, and materials from Google Classroom."
                },
                {
                    icon: <Brain className="w-6 h-6 text-purple-400" />,
                    title: "RAG AI Tutor",
                    description: "Ask questions and get answers based strictly on your actual course documents."
                },
                {
                    icon: <Sparkles className="w-6 h-6 text-pink-400" />,
                    title: "Smart Decomposition",
                    description: "Break down overwhelming assignments into a step-by-step actionable study plan."
                }
            ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left glass">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
