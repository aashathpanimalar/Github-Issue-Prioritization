'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Send, CheckCircle2, Plus, Sparkles, Code2, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Idea {
    id: number;
    title: string;
    description: string;
    category: 'FEATURE' | 'IMPROVEMENT' | 'BUG';
    votes: number;
}

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([
        { id: 1, title: 'Integration with Jira', description: 'Automatically sync prioritized GitHub issues with Jira projects.', category: 'FEATURE', votes: 12 },
        { id: 2, title: 'Slack Notifications', description: 'Get real-time alerts on Slack when a high-priority issue is detected.', category: 'FEATURE', votes: 8 },
        { id: 3, title: 'Custom ML Models', description: 'Allow users to train models on their own repository history.', category: 'IMPROVEMENT', votes: 15 },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCategory, setNewCategory] = useState<'FEATURE' | 'IMPROVEMENT' | 'BUG'>('FEATURE');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIdea: Idea = {
            id: Date.now(),
            title: newTitle,
            description: newDesc,
            category: newCategory,
            votes: 0
        };
        setIdeas([newIdea, ...ideas]);
        setNewTitle('');
        setNewDesc('');
        setIsAdding(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-500/20 p-2 rounded-lg">
                                <Lightbulb className="w-6 h-6 text-amber-400" />
                            </div>
                            <h1 className="text-4xl font-bold">Implementation Ideas</h1>
                        </div>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Help us shape the future of GitHub Issue Prioritization. Suggest new features or improvements.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 shrink-0"
                    >
                        {isAdding ? 'Close Form' : <><Plus className="w-5 h-5" /> Submit Idea</>}
                    </button>
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Idea Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. VS Code Extension"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value as any)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    >
                                        <option value="FEATURE" className="bg-gray-900">NEW FEATURE</option>
                                        <option value="IMPROVEMENT" className="bg-gray-900">IMPROVEMENT</option>
                                        <option value="BUG" className="bg-gray-900">BUG REPORT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label>
                                    <textarea
                                        required
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder="Describe your idea in detail..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-xl font-bold transition-all"
                                >
                                    <Send className="w-5 h-5" /> Submit for Review
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Thanks for your contribution! Your idea has been submitted.
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {ideas.map((idea, index) => (
                        <motion.div
                            key={idea.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 group hover:bg-white/[0.07] transition-all hover:border-white/20"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded border uppercase",
                                            idea.category === 'FEATURE' ? 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10' :
                                                idea.category === 'IMPROVEMENT' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                    'text-rose-400 border-rose-400/20 bg-rose-400/10'
                                        )}>
                                            {idea.category}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-200 group-hover:text-white transition-colors">{idea.title}</h3>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{idea.description}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        const newIdeas = [...ideas];
                                        newIdeas[index].votes++;
                                        setIdeas(newIdeas);
                                    }}
                                    className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-3 min-w-[64px] hover:bg-indigo-600 hover:border-indigo-500 group/vote transition-all"
                                >
                                    <Plus className="w-4 h-4 mb-1 group-hover/vote:scale-125 transition-transform" />
                                    <span className="text-lg font-black">{idea.votes}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/10 rounded-3xl">
                        <Code2 className="w-8 h-8 text-indigo-400 mb-4" />
                        <h4 className="font-bold mb-2">Open Source</h4>
                        <p className="text-xs text-gray-400">Join our GitHub community and start contributing today.</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-amber-600/20 to-transparent border border-white/10 rounded-3xl">
                        <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
                        <h4 className="font-bold mb-2">AI-Driven</h4>
                        <p className="text-xs text-gray-400">Leverage advanced ML models for perfect prioritization.</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-emerald-600/20 to-transparent border border-white/10 rounded-3xl">
                        <Rocket className="w-8 h-8 text-emerald-400 mb-4" />
                        <h4 className="font-bold mb-2">Fast Pace</h4>
                        <p className="text-xs text-gray-400">Regular updates with features requested by YOU.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
