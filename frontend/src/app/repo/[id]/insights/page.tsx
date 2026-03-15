'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, Star, GitFork, Eye, GitBranch, Loader2,
    AlertCircle, TrendingUp, CheckCircle2, XCircle, GitPullRequest, Activity, Copy
} from 'lucide-react';
import api from '@/lib/api';

interface HealthData {
    healthScore: number;
    openIssues: number;
    closedIssues: number;
    issueCloseRate: number;
    openPRs: number;
    mergedPRs: number;
    prMergeRate: number;
    branches: number;
    stars: number;
    forks: number;
    watchers: number;
    language: string;
    description: string;
    defaultBranch: string;
    repoOwner: string;
    repoName: string;
    htmlUrl: string;
    openPRList: any[];
    recentClosedIssues: any[];
    recentOpenIssues: any[];
}

const SCORE_RANGES = [
    { min: 80, label: 'Excellent', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    { min: 60, label: 'Good', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)' },
    { min: 40, label: 'Fair', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    { min: 0, label: 'Needs Attention', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
];

export default function InsightsPage() {
    const { id } = useParams();
    const [health, setHealth] = useState<HealthData | null>(null);
    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [healthRes, dupRes] = await Promise.all([
                    api.get(`/repo/${id}/health`),
                    api.get(`/issues/duplicates/${id}`)
                ]);
                setHealth(healthRes.data);
                setDuplicates(dupRes.data);
            } catch {
                setError('Failed to load insights. Make sure GitHub is connected.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const scoreInfo = health
        ? SCORE_RANGES.find((r) => health.healthScore >= r.min) || SCORE_RANGES[3]
        : SCORE_RANGES[3];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Calculating project health...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-600/20 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Project Insights</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {health ? `${health.repoOwner}/${health.repoName}` : 'Open Source Health & Analytics'}
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

                {health && (
                    <>
                        {/* Hero Health Score */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-1 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                                style={{ background: scoreInfo.bg, border: `1px solid ${scoreInfo.border}` }}
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: scoreInfo.color }}>
                                    Health Score
                                </p>
                                {/* Score Circle */}
                                <div className="relative w-36 h-36 mb-4">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" />
                                        <motion.circle
                                            cx="18" cy="18" r="15.9"
                                            fill="none"
                                            stroke={scoreInfo.color}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeDasharray="100"
                                            initial={{ strokeDashoffset: 100 }}
                                            animate={{ strokeDashoffset: 100 - health.healthScore }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-4xl font-black" style={{ color: scoreInfo.color }}>{health.healthScore}</span>
                                        <span className="text-[10px] font-bold" style={{ color: scoreInfo.color }}>/100</span>
                                    </div>
                                </div>
                                <p className="text-lg font-black" style={{ color: scoreInfo.color }}>{scoreInfo.label}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {health.language && `Primary: ${health.language}`}
                                </p>
                                {health.description && (
                                    <p className="text-xs mt-3 leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                                        {health.description}
                                    </p>
                                )}
                            </motion.div>

                            {/* Key Metrics Grid */}
                            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Stars', value: health.stars.toLocaleString(), icon: Star, color: '#f59e0b', sub: 'stargazers' },
                                    { label: 'Forks', value: health.forks.toLocaleString(), icon: GitFork, color: '#6366f1', sub: 'community forks' },
                                    { label: 'Watchers', value: health.watchers.toLocaleString(), icon: Eye, color: '#8b5cf6', sub: 'subscribers' },
                                    { label: 'Branches', value: health.branches.toString(), icon: GitBranch, color: '#10b981', sub: 'active branches' },
                                ].map((metric, i) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="rounded-2xl p-5 border"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{metric.label}</span>
                                        </div>
                                        <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{metric.value}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{metric.sub}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Rate Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Issue Close Rate */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="rounded-2xl border p-6"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-indigo-400" />
                                        <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Issue Close Rate</h3>
                                    </div>
                                    <span className="text-2xl font-black" style={{ color: health.issueCloseRate >= 50 ? '#10b981' : '#f59e0b' }}>
                                        {health.issueCloseRate}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--border)' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${health.issueCloseRate}%` }}
                                        transition={{ duration: 1, delay: 0.4 }}
                                        className="h-full rounded-full"
                                        style={{ background: health.issueCloseRate >= 50 ? '#10b981' : '#f59e0b' }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open</p>
                                            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{health.openIssues}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Closed</p>
                                            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{health.closedIssues}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* PR Merge Rate */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-2xl border p-6"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <GitPullRequest className="w-4 h-4 text-purple-400" />
                                        <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>PR Merge Rate</h3>
                                    </div>
                                    <span className="text-2xl font-black" style={{ color: health.prMergeRate >= 50 ? '#10b981' : '#f59e0b' }}>
                                        {health.prMergeRate}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--border)' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${health.prMergeRate}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full rounded-full"
                                        style={{ background: health.prMergeRate >= 50 ? '#10b981' : '#f59e0b' }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        <div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open PRs</p>
                                            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{health.openPRs}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Merged PRs</p>
                                            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{health.mergedPRs}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Open Issues */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="rounded-2xl border overflow-hidden"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            >
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Open Issues</h3>
                                </div>
                                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {health.recentOpenIssues.length === 0 ? (
                                        <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No open issues 🎉</p>
                                    ) : health.recentOpenIssues.map((issue: any, i) => (
                                        <a key={i} href={issue.html_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-start gap-3 px-5 py-3 hover:bg-red-500/5 transition-all block">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                            <p className="text-sm line-clamp-1 font-medium" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Open PRs */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="rounded-2xl border overflow-hidden"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            >
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                                    <GitPullRequest className="w-4 h-4 text-purple-400" />
                                    <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Open Pull Requests</h3>
                                </div>
                                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {health.openPRList.length === 0 ? (
                                        <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No open pull requests</p>
                                    ) : health.openPRList.map((pr: any, i) => (
                                        <a key={i} href={pr.html_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-start gap-3 px-5 py-3 hover:bg-purple-500/5 transition-all block">
                                            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                            <p className="text-sm line-clamp-1 font-medium" style={{ color: 'var(--text-primary)' }}>{pr.title}</p>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 mb-8 mt-6">
                            {/* Duplicate Issues List */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="rounded-2xl border overflow-hidden"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            >
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                                    <Copy className="w-4 h-4 text-orange-400" />
                                    <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>High Duplicate Issues</h3>
                                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                        {duplicates.length} Found
                                    </span>
                                </div>
                                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {duplicates.length === 0 ? (
                                        <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No duplicate issues detected 🚀</p>
                                    ) : duplicates.map((dup: any, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 hover:bg-orange-500/5 transition-all">
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-bold truncate pr-4" style={{ color: 'var(--text-primary)' }}>
                                                    #{dup.duplicateIssue?.number} {dup.duplicateIssue?.title}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    is a duplicate of <span className="font-bold text-indigo-500">#{dup.originalIssue?.number} {dup.originalIssue?.title}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(dup.similarityScore * 100, 100)}%` }} />
                                                </div>
                                                <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                                                    {Math.round(dup.similarityScore * 100)}% Match
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
