'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { BarChart3, ChevronLeft, Loader2, RefreshCcw, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { IssueAnalysisResponse } from '@/types';
import IssueTable from '@/components/IssueTable';
import { cn } from '@/lib/utils';

export default function RepoDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [issues, setIssues] = useState<IssueAnalysisResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<IssueAnalysisResponse[]>(`/issues/analyze/${id}`);
            setIssues(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch issue analysis.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAnalysis();
        }
    }, [id]);

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/export/csv/${id}`, {
                responseType: 'blob'
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `prioritized_issues_${id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export CSV', err);
            setError('Failed to download CSV. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-600/20 p-2 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-bold">Issue Prioritization Report</h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Real-time analysis for Repository #{id}. We've identified {issues.filter(i => i.priority === 'HIGH').length} high-priority issues that require immediate attention.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAnalysis}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl transition-all"
                    >
                        <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-gray-400 animate-pulse font-medium">Analyzing issues with ML models...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
                    <p className="text-red-500 font-bold mb-4">{error}</p>
                    <button
                        onClick={fetchAnalysis}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Prioritized List</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Filter className="w-4 h-4" />
                            <span>Showing all prioritized issues</span>
                        </div>
                    </div>
                    <IssueTable issues={issues} />
                </motion.div>
            )}
        </div>
    );
}
