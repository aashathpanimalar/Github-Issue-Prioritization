'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, GitCommit, Clock, User, ChevronRight, Loader2, AlertCircle, GitMerge, Star } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Branch {
    name: string;
    commit: { sha: string; url: string };
    protected: boolean;
}

interface Commit {
    sha: string;
    commit: {
        message: string;
        author: { name: string; email: string; date: string };
    };
    author: { login: string; avatar_url: string } | null;
    html_url: string;
}

export default function BranchesPage() {
    const { id } = useParams();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);
    const [commitsLoading, setCommitsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/repo/${id}/branches`);
                setBranches(res.data);
                if (res.data.length > 0) {
                    const defaultBranch = res.data.find((b: Branch) => b.name === 'main' || b.name === 'master') || res.data[0];
                    setSelectedBranch(defaultBranch.name);
                }
            } catch {
                setError('Failed to load branches. Make sure your GitHub account is connected.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBranches();
    }, [id]);

    useEffect(() => {
        const fetchCommits = async () => {
            if (!selectedBranch) return;
            try {
                setCommitsLoading(true);
                const res = await api.get(`/repo/${id}/branches/${selectedBranch}/commits`);
                setCommits(res.data);
            } catch {
                setCommits([]);
            } finally {
                setCommitsLoading(false);
            }
        };
        if (selectedBranch) fetchCommits();
    }, [selectedBranch, id]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading branches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                            <GitBranch className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Branch Explorer</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {branches.length} branches · Click a branch to view its commits
                            </p>
                        </div>
                    </div>
                </motion.div>

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Branch List */}
                    <div className="lg:col-span-4">
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                                <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>All Branches</h2>
                            </div>
                            <div className="divide-y overflow-y-auto max-h-[600px] custom-scrollbar" style={{ divideColor: 'var(--border)' }}>
                                {branches.map((branch, idx) => {
                                    const isDefault = branch.name === 'main' || branch.name === 'master';
                                    const isSelected = branch.name === selectedBranch;
                                    return (
                                        <motion.button
                                            key={branch.name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => setSelectedBranch(branch.name)}
                                            className="w-full px-4 py-3 flex items-center justify-between text-left transition-all"
                                            style={{
                                                background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                                                borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <GitBranch className="w-4 h-4" style={{ color: isSelected ? '#6366f1' : 'var(--text-muted)' }} />
                                                <span className={`text-sm font-semibold truncate max-w-[150px] ${isSelected ? 'text-indigo-500' : ''}`}
                                                    style={{ color: isSelected ? '#6366f1' : 'var(--text-primary)' }}>
                                                    {branch.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {isDefault && (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-black uppercase">default</span>
                                                )}
                                                {branch.protected && (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black uppercase">protected</span>
                                                )}
                                                <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Commits Panel */}
                    <div className="lg:col-span-8">
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2">
                                    <GitCommit className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                        Commits on <span className="text-indigo-500">{selectedBranch}</span>
                                    </h2>
                                </div>
                                {commitsLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                            </div>

                            <div className="divide-y overflow-y-auto max-h-[600px] custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {commitsLoading ? (
                                        <div className="py-20 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                        </div>
                                    ) : commits.length === 0 ? (
                                        <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>
                                            <GitCommit className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                            <p className="text-sm font-semibold">No commits found</p>
                                        </div>
                                    ) : (
                                        commits.map((commit, idx) => (
                                            <motion.div
                                                key={commit.sha}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.04 }}
                                                className="p-4 flex items-start gap-4 hover:bg-opacity-50 transition-all group"
                                                style={{ background: 'transparent' }}
                                            >
                                                {/* Author avatar */}
                                                <div className="flex-shrink-0">
                                                    {commit.author ? (
                                                        <img src={commit.author.avatar_url} alt={commit.author.login} className="w-8 h-8 rounded-full border" style={{ borderColor: 'var(--border)' }} />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                                            <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Commit info */}
                                                <div className="flex-1 min-w-0">
                                                    <a href={commit.html_url} target="_blank" rel="noopener noreferrer"
                                                        className="text-sm font-semibold hover:text-indigo-500 transition-colors line-clamp-2 block"
                                                        style={{ color: 'var(--text-primary)' }}>
                                                        {commit.commit.message.split('\n')[0]}
                                                    </a>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                                            {commit.author?.login || commit.commit.author.name}
                                                        </span>
                                                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(commit.commit.author.date)}
                                                        </span>
                                                        <span className="text-xs font-mono text-indigo-400 opacity-70">{commit.sha.substring(0, 7)}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
