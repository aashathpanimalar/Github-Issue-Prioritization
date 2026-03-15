'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Briefcase, FileText, Github, 
    ArrowLeft, Rocket, Loader2, Sparkles 
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateProject() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/projects', {
                name,
                description,
                githubRepoUrl: githubUrl
            });
            router.push('/projects');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-6" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-2xl mx-auto">
                <Link href="/projects">
                    <motion.button 
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 text-sm font-bold mb-8 transition-colors"
                        style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Library
                    </motion.button>
                </Link>

                <div className="mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                        <Rocket className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Launch New Project</h1>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Initialize your group workspace and start collaborating.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>
                            Project Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Briefcase className="w-5 h-5 group-focus-within:text-indigo-500 transition-colors" style={{ color: 'var(--border)' }} />
                            </div>
                            <input 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Next-Gen AI Platform"
                                className="w-full bg-transparent border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-indigo-500 font-bold"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>
                            Description
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-4">
                                <FileText className="w-5 h-5 group-focus-within:text-indigo-500 transition-colors" style={{ color: 'var(--border)' }} />
                            </div>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What are you building? Explain the core mission..."
                                className="w-full bg-transparent border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-indigo-500 font-bold min-h-[120px] resize-none"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>
                            GitHub Repository (Optional)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Github className="w-5 h-5 group-focus-within:text-indigo-500 transition-colors" style={{ color: 'var(--border)' }} />
                            </div>
                            <input 
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full bg-transparent border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:border-indigo-500 font-bold"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <p className="text-[10px] pl-1 font-medium" style={{ color: 'var(--text-muted)' }}>Linking a repo enables branch tracking and automated PR analysis.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <motion.button 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-base font-black shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Launch Project
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
}
