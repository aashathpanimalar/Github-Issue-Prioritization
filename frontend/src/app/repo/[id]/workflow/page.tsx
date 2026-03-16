'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, GitPullRequest, GitMerge, AlertCircle,
    Loader2, ExternalLink, X, Check, MessageSquare, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface WorkflowData {
    openIssues: any[];
    openPRs: any[];
    mergedPRs: any[];
    repoOwner: string;
    repoName: string;
}

const COLUMNS = [
    { key: 'openIssues', label: 'Open Issues', icon: AlertCircle, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
    { key: 'openPRs', label: 'In Review (PR)', icon: GitPullRequest, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
    { key: 'mergedPRs', label: 'Merged', icon: GitMerge, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
];

export default function WorkflowPage() {
    const { id } = useParams();
    const [data, setData] = useState<WorkflowData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/repo/${id}/workflow-summary`);
                setData(res.data);
            } catch {
                setError('Failed to load workflow data. Make sure GitHub is connected.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const getItems = (key: string) => {
        if (!data) return [];
        return (data as any)[key] || [];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading workflow...</p>
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
                        <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Workflow Board</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                End-to-end GitHub pipeline · Issues → PRs → Merged
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

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLUMNS.map((col) => {
                        const items = getItems(col.key);
                        return (
                            <div key={col.key} className="flex flex-col">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <col.icon className="w-4 h-4" style={{ color: col.color }} />
                                        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{col.label}</span>
                                    </div>
                                    <span className="text-xs font-black px-2.5 py-1 rounded-full"
                                        style={{ background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
                                        {items.length}
                                    </span>
                                </div>

                                {/* Column Body */}
                                <div className="rounded-2xl p-3 flex-1 min-h-[400px] space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar"
                                    style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                                    {items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 opacity-40">
                                            <col.icon className="w-8 h-8 mb-2" style={{ color: col.color }} />
                                            <p className="text-xs font-semibold" style={{ color: col.color }}>Nothing here</p>
                                        </div>
                                    ) : (
                                        items.slice(0, 15).map((item: any, idx: number) => (
                                            <motion.div
                                                key={item.number || item.id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="rounded-xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer group"
                                                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                                            >
                                                {/* User info */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    {item.user?.avatar_url && (
                                                        <img src={item.user.avatar_url} alt={item.user.login}
                                                            className="w-6 h-6 rounded-full flex-shrink-0" />
                                                    )}
                                                    <span className="text-[11px] font-bold truncate flex-1"
                                                        style={{ color: 'var(--text-secondary)' }}>
                                                        {item.user?.login || 'Unknown'}
                                                    </span>
                                                    <a href={item.html_url} target="_blank" rel="noopener noreferrer"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                                    </a>
                                                </div>

                                                {/* Title */}
                                                <p className="text-sm font-bold line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                                                    {item.title}
                                                </p>

                                                {/* Meta */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                                                        #{item.number}
                                                    </span>
                                                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                        {item.updated_at ? formatDate(item.updated_at) : ''}
                                                    </span>
                                                </div>

                                                {/* Labels */}
                                                {item.labels && item.labels.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {item.labels.slice(0, 2).map((label: any) => (
                                                            <span key={label.name} className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                                                                style={{ background: `#${label.color}22`, color: `#${label.color}` }}>
                                                                {label.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                    {items.length > 15 && (
                                        <Link href={`/repo/${id}/pull-requests`}
                                            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                                            style={{ color: col.color, background: col.bg }}>
                                            +{items.length - 15} more <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href={`/repo/${id}/pull-requests`}
                        className="flex items-center justify-between p-5 rounded-2xl border transition-all group hover:border-purple-500/40"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <GitPullRequest className="w-5 h-5 text-purple-400" />
                            <div>
                                <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Manage Pull Requests</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Review, approve, and merge PRs</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-muted)' }} />
                    </Link>
                    <Link href={`/repo/${id}/branches`}
                        className="flex items-center justify-between p-5 rounded-2xl border transition-all group hover:border-indigo-500/40"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-indigo-400" />
                            <div>
                                <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Explore Branches</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>View branch commit history</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-muted)' }} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
