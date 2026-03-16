'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { IssueAnalysisResponse } from '@/types';
import IssueTable from '@/components/IssueTable';
import {
    Download, RefreshCcw, ChevronLeft, Github, Activity, Layers, Sparkles,
    MessageSquare, Shield, Loader2, TrendingUp, AlertTriangle, GitBranch,
    GitPullRequest, Users, LayoutDashboard, BarChart3, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const NAV_FEATURE_CARDS = (id: string | string[]) => [
    {
        href: `/repo/${id}/branches`,
        label: 'Branch Explorer',
        desc: 'Visualize all branches and their commit history',
        icon: GitBranch,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.08)',
        border: 'rgba(99,102,241,0.2)',
    },
    {
        href: `/repo/${id}/pull-requests`,
        label: 'Pull Requests',
        desc: 'Review, approve, and merge PRs',
        icon: GitPullRequest,
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
        border: 'rgba(139,92,246,0.2)',
    },
    {
        href: `/repo/${id}/team`,
        label: 'Team & Contributors',
        desc: 'See contributor stats and team productivity',
        icon: Users,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
    },
    {
        href: `/repo/${id}/workflow`,
        label: 'Workflow Board',
        desc: 'Kanban view of your full GitHub pipeline',
        icon: LayoutDashboard,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
    },
    {
        href: `/repo/${id}/insights`,
        label: 'Project Insights',
        desc: 'Health score, merge rates, and open-source metrics',
        icon: BarChart3,
        color: '#06b6d4',
        bg: 'rgba(6,182,212,0.08)',
        border: 'rgba(6,182,212,0.2)',
    },
];

export default function RepoReport() {
    const { id } = useParams();
    const router = useRouter();
    const [issues, setIssues] = useState<IssueAnalysisResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchAnalysis = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/issues/analyze/${id}`);
            setIssues(response.data);
            setRetryCount(0);
        } catch (err: any) {
            const status = err.response?.status;
            let message = 'Failed to fetch issue analysis.';
            if (status === 401) message = 'Session expired. Please log in again.';
            else if (status === 404) message = 'Repository not found. It may have been removed.';
            else if (status === 500) message = 'Server error during analysis.';
            else if (!err.response) message = 'Network error. Please check your connection.';
            else message = err.response?.data?.message || message;
            setError(message);
            setRetryCount(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { if (id) fetchAnalysis(); }, [id, fetchAnalysis]);

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/export/csv/${id}`, { responseType: 'blob' });
            const contentDisposition = response.headers['content-disposition'];
            let filename = `prioritized_issues_${id}.csv`;
            if (contentDisposition) {
                const m = contentDisposition.match(/filename="(.+)"/);
                if (m?.[1]) filename = m[1];
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            setError('Failed to download CSV.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Running ML Analysis</h2>
                <p className="text-sm animate-pulse mt-1" style={{ color: 'var(--text-secondary)' }}>Prioritizing issues with Naive Bayes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-jakarta" style={{ background: 'var(--bg-primary)' }}>
            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Top Nav */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => router.push('/dashboard')}
                        className="group flex items-center gap-3 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <div className="p-2 rounded-xl border transition-all" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold">Return to Dashboard</span>
                    </motion.button>
                    <div className="flex items-center gap-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={fetchAnalysis}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                            Re-analyze
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-emerald-600/20">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </motion.button>
                    </div>
                </div>

                {/* Feature Navigation Cards */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Github className="w-3.5 h-3.5" /> Repository Intelligence Suite
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {NAV_FEATURE_CARDS(id).map((card, i) => (
                            <motion.div
                                key={card.href}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <Link
                                    href={card.href}
                                    className="flex flex-col gap-2 p-4 rounded-2xl border transition-all group hover:shadow-lg"
                                    style={{ background: card.bg, borderColor: card.border }}
                                >
                                    <div className="flex items-center justify-between">
                                        <card.icon className="w-5 h-5" style={{ color: card.color }} />
                                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: card.color }} />
                                    </div>
                                    <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{card.label}</p>
                                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{card.desc}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl text-center space-y-6 p-12 border"
                        style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}
                    >
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto border"
                            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}>
                            <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Analysis Disrupted</h3>
                            <p className="font-medium max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                            {retryCount > 0 && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Attempt {retryCount} failed</p>}
                        </div>
                        <button onClick={fetchAnalysis}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/15">
                            Try Again
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Hero Header */}
                        <div className="mb-16">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <Layers className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div className="h-px w-8 bg-emerald-500/20" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Issue Prioritization</span>
                                    </div>
                                    <h1 className="text-5xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                                        Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Report</span>
                                    </h1>
                                    <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        Real-time ML analysis for <strong>Repository #{id}</strong>. Synthesized{' '}
                                        <strong style={{ color: 'var(--text-primary)' }}>{issues.length} issues</strong> prioritized by Naive Bayes classifier.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        <span className="block text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Total Issues</span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{issues.length}</span>
                                            <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-5 border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}>
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Critical</span>
                                        <span className="text-3xl font-black text-rose-400">
                                            {issues.filter(i => i.riskLevel === 'CRITICAL' || i.priority === 'HIGH').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Issue Table */}
                        <div className="relative">
                            <div className="absolute -top-10 left-0">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                                    <Sparkles className="w-4 h-4 text-emerald-500" /> Prioritization Matrix
                                </h3>
                            </div>
                            <IssueTable issues={issues} />
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-24 p-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl shadow-emerald-600/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-black text-white mb-3">Need deeper insights?</h2>
                                    <p className="text-emerald-100/80 font-medium">
                                        Our AI chatbot can generate fix logic, unit tests, and security patches for any issue in this report.
                                    </p>
                                </div>
                                <button className="px-10 py-4 bg-white text-emerald-700 rounded-2xl text-sm font-black shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95">
                                    Activate AI Assistant
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}

                <div className="py-10 border-t mt-16 text-center" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-center gap-4" style={{ color: 'var(--text-muted)' }}>
                        <Shield className="w-4 h-4 text-emerald-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
                        <Github className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">GitHub Integration</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
