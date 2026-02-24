'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { IssueAnalysisResponse } from '@/types';
import IssueTable from '@/components/IssueTable';
import {
    Download,
    RefreshCcw,
    ChevronLeft,
    Github,
    Activity,
    Layers,
    Sparkles,
    MessageSquare,
    Shield,
    Loader2,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
            console.error('Error fetching issues:', err);
            const status = err.response?.status;
            let message = 'Failed to fetch issue analysis.';
            if (status === 401) {
                message = 'Session expired. Please log in again.';
            } else if (status === 404) {
                message = 'Repository not found. It may have been removed.';
            } else if (status === 500) {
                message = 'Server error during analysis. The team has been notified.';
            } else if (!err.response) {
                message = 'Network error. Please check your connection.';
            } else {
                message = err.response?.data?.message || message;
            }
            setError(message);
            setRetryCount(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchAnalysis();
    }, [id, fetchAnalysis]);

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/export/csv/${id}`, {
                responseType: 'blob'
            });

            const contentDisposition = response.headers['content-disposition'];
            let filename = `prioritized_issues_${id}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to download CSV. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <h2 className="text-xl font-black text-white tracking-tight">Synchronizing Intelligence</h2>
                    <p className="text-gray-500 text-sm font-medium animate-pulse">Running ML prioritization models...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] text-white selection:bg-emerald-500/30 font-jakarta">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/8 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/8 blur-[120px] rounded-full"></div>
                <div className="absolute top-[30%] right-[20%] w-[25%] h-[25%] bg-cyan-600/5 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-15"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => router.push('/dashboard')}
                        className="group flex items-center gap-3 text-gray-500 hover:text-white transition-colors"
                    >
                        <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:border-emerald-500/20 transition-all">
                            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">Return to Dashboard</span>
                    </motion.button>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={fetchAnalysis}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-300 hover:bg-white/10 hover:border-emerald-500/20 transition-all"
                        >
                            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                            Re-analyze
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </motion.button>
                    </div>
                </div>

                {error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-rose-500/5 border border-rose-500/10 p-12 rounded-[3rem] text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                            <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white">Analysis Disrupted</h3>
                            <p className="text-gray-500 font-medium max-w-md mx-auto">{error}</p>
                            {retryCount > 0 && (
                                <p className="text-gray-600 text-xs font-medium">Attempt {retryCount} failed</p>
                            )}
                        </div>
                        <button
                            onClick={fetchAnalysis}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/15"
                        >
                            Try Again
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Hero Header */}
                        <div className="mb-20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                                <div className="space-y-6 max-w-3xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-600/10 border border-emerald-600/20 rounded-xl">
                                            <Layers className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div className="h-px w-12 bg-emerald-500/20"></div>
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Advanced Intelligence</span>
                                    </div>
                                    <h1 className="text-5xl sm:text-7xl font-black text-white leading-[1] tracking-tight">
                                        Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 font-jakarta">Report</span>
                                    </h1>
                                    <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-2xl">
                                        Real-time AI analysis for <span className="text-white font-bold">Repository #{id}</span>. We&apos;ve synthesized {issues.length} prioritized vectors that require immediate developer intervention.
                                    </p>
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 min-w-[160px] hover:border-emerald-500/10 transition-colors">
                                        <span className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Total Issues</span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-white tracking-tighter">{issues.length}</span>
                                            <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                                        </div>
                                    </div>
                                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6 min-w-[160px]">
                                        <span className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Critical Risk</span>
                                        <span className="text-3xl font-black text-rose-400 tracking-tighter">
                                            {issues.filter(i => i.riskLevel === 'CRITICAL' || i.priority === 'HIGH').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Interface */}
                        <div className="relative">
                            <div className="absolute -top-10 left-0">
                                <h3 className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-[0.3em]">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    Prioritization Matrix
                                </h3>
                            </div>
                            <IssueTable issues={issues} />
                        </div>

                        {/* Bottom AI Action */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-32 p-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] shadow-[0_40px_100px_rgba(16,185,129,0.2)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
                            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20">
                                    <MessageSquare className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-4 max-w-2xl">
                                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Need deeper insights?</h2>
                                    <p className="text-emerald-100/80 font-bold text-lg">
                                        Our AI system can generate custom fix logic, unit tests, and security patches for any issue in this report.
                                    </p>
                                </div>
                                <button className="px-10 py-5 bg-white text-emerald-700 rounded-[1.5rem] text-sm font-black shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95">
                                    Activate AI Assistant
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Footer Security Badge */}
            <div className="py-12 border-t border-white/5 text-center mt-20">
                <div className="flex items-center justify-center gap-4 text-gray-600">
                    <Shield className="w-4 h-4 text-emerald-500/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">End-to-End Encrypted Analysis</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                    <Github className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Direct Integration</span>
                </div>
            </div>
        </div>
    );
}
