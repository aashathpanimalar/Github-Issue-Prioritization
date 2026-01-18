'use client';

import { motion } from 'framer-motion';
import { IssueAnalysisResponse } from '@/types';
import { AlertCircle, ArrowUpRight, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface IssueTableProps {
    issues: IssueAnalysisResponse[];
}

export default function IssueTable({ issues }: IssueTableProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">PRIORITY</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">ISSUE TITLE</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">RISK</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400">SCORE</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-400"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {issues.map((issue, index) => (
                            <motion.tr
                                key={issue.issueId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "group hover:bg-white/5 transition-colors cursor-pointer",
                                    expandedId === issue.issueId && "bg-white/5"
                                )}
                                onClick={() => setExpandedId(expandedId === issue.issueId ? null : issue.issueId)}
                            >
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold border",
                                        getPriorityColor(issue.priority)
                                    )}>
                                        {issue.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                                            {issue.title}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Updated recently
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded border",
                                        issue.riskLevel === 'CRITICAL' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                                            issue.riskLevel === 'HIGH' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' :
                                                issue.riskLevel === 'MODERATE' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                                                    'text-blue-500 bg-blue-500/10 border-blue-500/20'
                                    )}>
                                        {issue.riskLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(issue.score || 0) * 10}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-mono text-gray-400">{(issue.score || 0).toFixed(1)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ChevronDown className={cn(
                                        "w-5 h-5 text-gray-500 transition-transform",
                                        expandedId === issue.issueId && "rotate-180"
                                    )} />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Overlay / Content */}
            {issues.map(issue => (
                expandedId === issue.issueId && (
                    <motion.div
                        key={`detail-${issue.issueId}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-indigo-500/5 border-t border-white/10 p-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold">{issue.title}</h3>
                            <a
                                href={`https://github.com/TODO/repo/issues/${issue.issueId}`}
                                target="_blank"
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium"
                            >
                                View on GitHub
                                <ArrowUpRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">ML Intelligence Summary</h4>
                                <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                                    {issue.summary || "Our AI is analyzing the complexity and impact of this issue. Based on historical data, this requires immediate attention due to its proximity to core modules."}
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Priority Factors</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <span className="text-xs text-gray-500 block mb-1">Impact Score</span>
                                            <span className="text-xl font-bold text-indigo-400">{issue.score.toFixed(1)}/10</span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <span className="text-xs text-gray-500 block mb-1">Risk Score</span>
                                            <span className={cn(
                                                "text-xl font-bold",
                                                issue.riskScore > 7.5 ? "text-rose-500" : "text-amber-400"
                                            )}>{issue.riskScore.toFixed(1)}/10</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            ))}
        </div>
    );
}
