'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitPullRequest, GitMerge, X, Check, MessageSquare, FileCode,
    Loader2, AlertCircle, ChevronDown, ExternalLink, Clock, User, Plus
} from 'lucide-react';
import api from '@/lib/api';

interface PR {
    number: number;
    title: string;
    state: string;
    merged_at: string | null;
    created_at: string;
    updated_at: string;
    body: string;
    user: { login: string; avatar_url: string };
    head: { ref: string };
    base: { ref: string };
    html_url: string;
    labels: { name: string; color: string }[];
    requested_reviewers: { login: string; avatar_url: string }[];
    draft: boolean;
    comments: number;
    review_comments: number;
    additions?: number;
    deletions?: number;
    changed_files?: number;
}

interface PRDetail extends PR {
    files: { filename: string; additions: number; deletions: number; status: string }[];
    reviews: { user: { login: string; avatar_url: string }; state: string; body: string; submitted_at: string }[];
    comments: any[];
}

type Tab = 'open' | 'merged' | 'closed';

export default function PullRequestsPage() {
    const { id } = useParams();
    const [prs, setPrs] = useState<PR[]>([]);
    const [tab, setTab] = useState<Tab>('open');
    const [loading, setLoading] = useState(true);
    const [selectedPR, setSelectedPR] = useState<PRDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [reviewBody, setReviewBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const fetchPRs = async (state: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/repo/${id}/pull-requests?state=${state === 'merged' ? 'closed' : state}`);
            let data: PR[] = res.data || [];
            if (state === 'merged') data = data.filter(pr => pr.merged_at !== null);
            if (state === 'closed') data = data.filter(pr => pr.merged_at === null);
            setPrs(data);
        } catch {
            setError('Failed to load pull requests. Make sure GitHub is connected.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchPRs(tab); }, [id, tab]);

    const openPRDetail = async (prNumber: number) => {
        try {
            setDetailLoading(true);
            const res = await api.get(`/repo/${id}/pull-requests/${prNumber}`);
            setSelectedPR(res.data);
        } catch {
            setActionMsg('Failed to load PR details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const submitReview = async (event: string) => {
        if (!selectedPR) return;
        setSubmitting(true);
        try {
            await api.post(`/repo/${id}/pull-requests/${selectedPR.number}/review`, {
                body: reviewBody,
                event,
            });
            setActionMsg(`Review submitted: ${event}`);
            setReviewBody('');
        } catch {
            setActionMsg('Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const mergePR = async () => {
        if (!selectedPR) return;
        setSubmitting(true);
        try {
            await api.post(`/repo/${id}/pull-requests/${selectedPR.number}/merge`, {
                commit_title: `Merge pull request #${selectedPR.number}`,
                merge_method: 'merge',
            });
            setActionMsg('✅ PR merged successfully!');
            setSelectedPR(null);
            fetchPRs(tab);
        } catch {
            setActionMsg('Failed to merge PR. You may not have permission.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const statusIcon = (pr: PR) => {
        if (pr.merged_at) return <GitMerge className="w-4 h-4 text-purple-400" />;
        if (pr.state === 'open') return <GitPullRequest className="w-4 h-4 text-green-400" />;
        return <X className="w-4 h-4 text-red-400" />;
    };

    const statusColor = (pr: PR) => {
        if (pr.merged_at) return 'bg-purple-500/10 border border-purple-500/20 text-purple-400';
        if (pr.state === 'open') return 'bg-green-500/10 border border-green-500/20 text-green-400';
        return 'bg-red-500/10 border border-red-500/20 text-red-400';
    };

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'open', label: 'Open', icon: GitPullRequest },
        { key: 'merged', label: 'Merged', icon: GitMerge },
        { key: 'closed', label: 'Closed', icon: X },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                            <GitPullRequest className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Pull Requests</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review, approve, and merge pull requests</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                tab === key
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-themed-secondary hover:text-themed'
                            }`}
                            style={tab !== key ? { background: 'var(--bg-card)', border: '1px solid var(--border)' } : {}}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Action Message */}
                {actionMsg && (
                    <div className="flex items-center justify-between p-4 rounded-2xl mb-6 bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-sm font-semibold text-indigo-400">{actionMsg}</p>
                        <button onClick={() => setActionMsg(null)}><X className="w-4 h-4 text-indigo-400" /></button>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="py-32 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    </div>
                ) : prs.length === 0 ? (
                    <div className="py-32 text-center">
                        <GitPullRequest className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-lg font-black" style={{ color: 'var(--text-secondary)' }}>No {tab} pull requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {prs.map((pr, idx) => (
                            <motion.div
                                key={pr.number}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-lg"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                onClick={() => openPRDetail(pr.number)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl flex-shrink-0 ${statusColor(pr)}`}>
                                        {statusIcon(pr)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-black text-sm mb-1 hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                    {pr.title}
                                                    {pr.draft && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-black">DRAFT</span>}
                                                </h3>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    #{pr.number} · {pr.head.ref} → {pr.base.ref} · by <strong>{pr.user.login}</strong> · {formatDate(pr.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {pr.labels?.slice(0, 3).map(label => (
                                                    <span key={label.name} className="text-[9px] px-2 py-0.5 rounded-full font-black"
                                                        style={{ background: `#${label.color}22`, color: `#${label.color}`, border: `1px solid #${label.color}44` }}>
                                                        {label.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                {(pr.comments || 0) + (pr.review_comments || 0)} comments
                                            </span>
                                            {pr.requested_reviewers?.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Reviewers:</span>
                                                    <div className="flex -space-x-1">
                                                        {pr.requested_reviewers.slice(0, 3).map(r => (
                                                            <img key={r.login} src={r.avatar_url} alt={r.login} className="w-5 h-5 rounded-full border border-white/20" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* PR Detail Slide-over */}
            <AnimatePresence>
                {(detailLoading || selectedPR) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedPR(null); }}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="w-full max-w-2xl h-full overflow-y-auto flex flex-col"
                            style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
                        >
                            {detailLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                </div>
                            ) : selectedPR && (
                                <div className="p-6 space-y-6">
                                    {/* PR Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>{selectedPR.title}</h2>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                #{selectedPR.number} · {selectedPR.head.ref} → {selectedPR.base.ref}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={selectedPR.html_url} target="_blank" rel="noopener noreferrer"
                                                className="p-2 rounded-xl transition-all border"
                                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                                <ExternalLink className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                            </a>
                                            <button onClick={() => setSelectedPR(null)} className="p-2 rounded-xl transition-all border"
                                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <img src={selectedPR.user.avatar_url} alt={selectedPR.user.login} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedPR.user.login}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Author · {formatDate(selectedPR.created_at)}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {selectedPR.body && (
                                        <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                            <p className="leading-relaxed whitespace-pre-wrap line-clamp-6">{selectedPR.body}</p>
                                        </div>
                                    )}

                                    {/* Files Changed */}
                                    {selectedPR.files && selectedPR.files.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                                <FileCode className="w-3.5 h-3.5" />
                                                Files Changed ({selectedPR.files.length})
                                            </h3>
                                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                {selectedPR.files.map(file => (
                                                    <div key={file.filename} className="flex items-center justify-between p-2 rounded-lg text-xs"
                                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                                        <span className="font-mono truncate max-w-[300px]" style={{ color: 'var(--text-primary)' }}>{file.filename}</span>
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <span className="text-green-400 font-bold">+{file.additions}</span>
                                                            <span className="text-red-400 font-bold">-{file.deletions}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews */}
                                    {selectedPR.reviews && selectedPR.reviews.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Reviews</h3>
                                            <div className="space-y-2">
                                                {selectedPR.reviews.map((review, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                                        <img src={review.user.avatar_url} alt={review.user.login} className="w-7 h-7 rounded-full flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{review.user.login}</p>
                                                            {review.body && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{review.body}</p>}
                                                        </div>
                                                        <span className={`text-[9px] px-2 py-1 rounded-lg font-black flex-shrink-0 ${
                                                            review.state === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                            review.state === 'CHANGES_REQUESTED' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>{review.state}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Review Actions */}
                                    {selectedPR.state === 'open' && (
                                        <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                                            <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Add Review</h3>
                                            <textarea
                                                value={reviewBody}
                                                onChange={e => setReviewBody(e.target.value)}
                                                placeholder="Leave your review comment..."
                                                rows={3}
                                                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                                                style={{
                                                    background: 'var(--bg-card)',
                                                    border: '1px solid var(--border)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => submitReview('COMMENT')} disabled={submitting}
                                                    className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all border"
                                                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                    <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Comment
                                                </button>
                                                <button onClick={() => submitReview('APPROVE')} disabled={submitting}
                                                    className="flex-1 py-2.5 rounded-xl text-xs font-black bg-green-600 hover:bg-green-500 text-white transition-all">
                                                    <Check className="w-3.5 h-3.5 inline mr-1" /> Approve
                                                </button>
                                                <button onClick={() => submitReview('REQUEST_CHANGES')} disabled={submitting}
                                                    className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white transition-all">
                                                    Request Changes
                                                </button>
                                            </div>
                                            <button
                                                onClick={mergePR}
                                                disabled={submitting || selectedPR.draft}
                                                className="w-full mt-3 py-3 rounded-xl text-sm font-black bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                                                Merge Pull Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
