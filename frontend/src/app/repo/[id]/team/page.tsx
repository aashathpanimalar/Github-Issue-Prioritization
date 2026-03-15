'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GitCommit, Loader2, AlertCircle, ExternalLink, Star, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    type: string;
}

interface TeamStats {
    commitActivity: { week: number; total: number; days: number[] }[];
    contributorStats: { author: { login: string; avatar_url: string }; total: number; weeks: { w: number; a: number; d: number; c: number }[] }[];
    repoOwner: string;
    repoName: string;
}

export default function TeamPage() {
    const { id } = useParams();
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [stats, setStats] = useState<TeamStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [contribRes, statsRes] = await Promise.all([
                    api.get(`/repo/${id}/contributors`),
                    api.get(`/repo/${id}/team-stats`),
                ]);
                setContributors(contribRes.data || []);
                setStats(statsRes.data);
            } catch {
                setError('Failed to load team data. Make sure GitHub is connected.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    // Calculate total commits for percentage bars
    const totalCommits = contributors.reduce((sum, c) => sum + c.contributions, 0);

    // Get weekly commits from stats for each top contributor
    const getRecentWeeklyCommits = (login: string): number => {
        if (!stats?.contributorStats) return 0;
        const found = stats.contributorStats.find((cs) => cs.author?.login === login);
        if (!found) return 0;
        const lastSixWeeks = found.weeks.slice(-6);
        return lastSixWeeks.reduce((sum, w) => sum + w.c, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading team data...</p>
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
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Team & Contributors</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {contributors.length} contributors · {totalCommits.toLocaleString()} total contributions
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

                {/* Top Contributors Leaderboard */}
                <div className="mb-10">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Star className="w-3.5 h-3.5 text-amber-400" /> Top Contributors
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contributors.slice(0, 6).map((contributor, idx) => {
                            const pct = totalCommits > 0 ? Math.round((contributor.contributions / totalCommits) * 100) : 0;
                            const recent = getRecentWeeklyCommits(contributor.login);
                            const rank = idx + 1;
                            return (
                                <motion.div
                                    key={contributor.login}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    className="rounded-2xl border p-5 relative overflow-hidden group transition-all"
                                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    {/* Rank badge */}
                                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                                        rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                                        rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                                        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-indigo-500/10 text-indigo-400'
                                    }`}>
                                        #{rank}
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={contributor.avatar_url} alt={contributor.login}
                                            className="w-12 h-12 rounded-2xl border-2 transition-transform group-hover:scale-105"
                                            style={{ borderColor: 'var(--border)' }} />
                                        <div>
                                            <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{contributor.login}</p>
                                            <a href={contributor.html_url} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                                View on GitHub <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Contribution bar */}
                                        <div>
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contributions</span>
                                                <span className="text-[10px] font-black" style={{ color: 'var(--text-primary)' }}>{contributor.contributions.toLocaleString()} ({pct}%)</span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: idx * 0.07 }}
                                                    className="h-full rounded-full"
                                                    style={{ background: rank <= 3 ? (rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#f97316') : '#6366f1' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Recent commits */}
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                                {recent} commits in last 6 weeks
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* All Contributors Table */}
                {contributors.length > 6 && (
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                            All Contributors ({contributors.length})
                        </h2>
                        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="grid grid-cols-1 divide-y" style={{ borderColor: 'var(--border)' }}>
                                {contributors.slice(6).map((contributor, idx) => (
                                    <div key={contributor.login}
                                        className="flex items-center justify-between px-5 py-3 hover:bg-opacity-50 transition-all"
                                        style={{ background: 'transparent' }}>
                                        <div className="flex items-center gap-3">
                                            <img src={contributor.avatar_url} alt={contributor.login} className="w-8 h-8 rounded-full" />
                                            <a href={contributor.html_url} target="_blank" rel="noopener noreferrer"
                                                className="text-sm font-semibold hover:text-indigo-500 transition-colors"
                                                style={{ color: 'var(--text-primary)' }}>
                                                {contributor.login}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <GitCommit className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                                                {contributor.contributions.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
