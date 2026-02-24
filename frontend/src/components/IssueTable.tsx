'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IssueAnalysisResponse } from '@/types';
import {
    AlertCircle,
    ArrowUpRight,
    ChevronDown,
    CheckCircle2,
    Clock,
    Bot,
    Filter,
    Search,
    X,
    Trophy,
    Zap,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface IssueTableProps {
    issues: IssueAnalysisResponse[];
}

export default function IssueTable({ issues }: IssueTableProps) {
    const [selectedIssue, setSelectedIssue] = useState<IssueAnalysisResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [filterRisk, setFilterRisk] = useState('ALL');

    // Close modal on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedIssue(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'HIGH': return {
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
                glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
                icon: <ShieldAlert className="w-4 h-4" />
            };
            case 'MEDIUM': return {
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
                glow: '',
                icon: <Zap className="w-4 h-4" />
            };
            case 'LOW': return {
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                glow: '',
                icon: <Trophy className="w-4 h-4" />
            };
            default: return {
                bg: 'bg-gray-500/10',
                border: 'border-gray-500/20',
                text: 'text-gray-400',
                glow: '',
                icon: <Clock className="w-4 h-4" />
            };
        }
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/20';
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
            case 'MODERATE': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            case 'LOW': return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'ALL' || issue.priority === filterPriority;
        const matchesRisk = filterRisk === 'ALL' || issue.riskLevel === filterRisk;
        return matchesSearch && matchesPriority && matchesRisk;
    });

    return (
        <div className="space-y-8">
            {/* Premium Control Bar */}
            <div className="sticky top-4 z-40 px-2">
                <div className="bg-[#0D0D0D]/60 backdrop-blur-2xl border border-white/10 p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">

                    {/* Search Input */}
                    <div className="relative flex-1 w-full group">
                        <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-all">
                            <div className="pl-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search prioritized reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none py-3.5 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-0 font-medium"
                            />
                        </div>
                    </div>

                    {/* Filters Container */}
                    <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-none min-w-[140px]">
                            <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 group-hover:bg-white/[0.08] transition-all">
                                <Filter className="w-4 h-4 text-emerald-400" />
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-gray-300 focus:outline-none cursor-pointer appearance-none pr-6 py-0.5 uppercase tracking-wide w-full"
                                >
                                    <option value="ALL" className="bg-[#0A0A0A]">Priority: All</option>
                                    <option value="HIGH" className="bg-[#0A0A0A]">High Priority</option>
                                    <option value="MEDIUM" className="bg-[#0A0A0A]">Medium Priority</option>
                                    <option value="LOW" className="bg-[#0A0A0A]">Low Priority</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 pointer-events-none group-hover:text-gray-400 transition-colors" />
                            </div>
                        </div>

                        <div className="relative group flex-1 md:flex-none min-w-[140px]">
                            <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 group-hover:bg-white/[0.08] transition-all">
                                <AlertCircle className="w-4 h-4 text-rose-400" />
                                <select
                                    value={filterRisk}
                                    onChange={(e) => setFilterRisk(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-gray-300 focus:outline-none cursor-pointer appearance-none pr-6 py-0.5 uppercase tracking-wide w-full"
                                >
                                    <option value="ALL" className="bg-[#0A0A0A]">Risk: All</option>
                                    <option value="CRITICAL" className="bg-[#0A0A0A]">Critical Risk</option>
                                    <option value="HIGH" className="bg-[#0A0A0A]">High Risk</option>
                                    <option value="MODERATE" className="bg-[#0A0A0A]">Moderate Risk</option>
                                    <option value="LOW" className="bg-[#0A0A0A]">Low Risk</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 pointer-events-none group-hover:text-gray-400 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredIssues.map((issue, index) => {
                        const styles = getPriorityStyles(issue.priority);
                        return (
                            <motion.div
                                key={issue.issueId}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group relative"
                                onClick={() => setSelectedIssue(issue)}
                            >
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/20 via-teal-500/0 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex items-center justify-between p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 rounded-[1.5rem] cursor-pointer transition-all duration-300 group-hover:translate-x-1 shadow-sm">

                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className={cn(
                                            "flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 group-hover:scale-105",
                                            styles.bg,
                                            styles.border,
                                            styles.text,
                                            styles.glow
                                        )}>
                                            {styles.icon}
                                            <span className="text-[10px] font-black mt-1 opacity-80">{issue.priority.substring(0, 3)}</span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-lg font-bold text-gray-200 truncate group-hover:text-white transition-colors mb-2">
                                                {issue.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={cn(
                                                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-all",
                                                    getRiskBadge(issue.riskLevel)
                                                )}>
                                                    {issue.riskLevel} IMPACT
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    ML CONFIDENCE: {(issue.score * 10).toFixed(0)}%
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-medium">
                                                    #{issue.issueId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pl-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all group-hover:border-emerald-500/30">
                                            <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredIssues.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]"
                    >
                        <div className="w-20 h-20 bg-emerald-600/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-600/10 shadow-inner">
                            <Search className="w-10 h-10 text-emerald-500/50" />
                        </div>
                        <h3 className="text-gray-400 font-black text-xl mb-2">No matching reports</h3>
                        <p className="text-gray-600 text-sm font-medium">Try adjusting your filters to broaden the scan</p>
                    </motion.div>
                )}
            </div>

            {/* Details Modal Overlay */}
            <AnimatePresence>
                {selectedIssue && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            onClick={() => setSelectedIssue(null)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.12)] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="relative overflow-hidden p-10 border-b border-white/[0.05] bg-gradient-to-br from-emerald-600/[0.05] to-teal-600/[0.05]">
                                <div className="absolute top-0 right-0 p-8">
                                    <button
                                        onClick={() => setSelectedIssue(null)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all hover:rotate-90 border border-white/5"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6 max-w-3xl">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black border tracking-widest uppercase",
                                            getPriorityStyles(selectedIssue.priority).bg,
                                            getPriorityStyles(selectedIssue.priority).border,
                                            getPriorityStyles(selectedIssue.priority).text
                                        )}>
                                            {selectedIssue.priority} PRIORITY
                                        </span>
                                        <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20 tracking-widest uppercase">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Active Scan
                                        </span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-black text-white leading-[1.1] tracking-tight">
                                        {selectedIssue.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* Left: Analysis */}
                                    <div className="lg:col-span-12 xl:col-span-8 space-y-10">
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                                    <div className="w-6 h-[1px] bg-emerald-500/50"></div>
                                                    AI Reasoning Core
                                                </h3>
                                            </div>
                                            <div className="bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.07] border border-emerald-500/10 rounded-3xl p-8 relative group overflow-hidden">
                                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
                                                <Bot className="w-10 h-10 text-emerald-400 mb-6" />
                                                <p className="text-xl text-emerald-50/90 leading-relaxed font-medium relative z-10">
                                                    {selectedIssue.summary || "Generating comprehensive report..."}
                                                </p>
                                            </div>
                                        </section>

                                        <section className="grid sm:grid-cols-2 gap-6">
                                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-400" />
                                                    Action Plan
                                                </h4>
                                                <ul className="space-y-4">
                                                    {["Critical logic audit", "Performance profiling", "Load test validation"].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-4">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                                            <span className="text-sm text-gray-400 font-medium">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                                                    Suggested Fix
                                                </h4>
                                                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                                    Implement immediate safeguards in the core processing module to prevent cascading failure triggers.
                                                </p>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right: Telemetry */}
                                    <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                                        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 shadow-inner relative overflow-hidden">
                                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full"></div>
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">Metric Analysis</h4>

                                            <div className="space-y-10">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Impact Probability</span>
                                                        <span className="text-2xl font-black text-white">{(selectedIssue.score || 0).toFixed(1)}</span>
                                                    </div>
                                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(selectedIssue.score || 0) * 10}%` }}
                                                            transition={{ delay: 0.2, duration: 1.5, ease: "circOut" }}
                                                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Risk Factor</span>
                                                        <span className="text-2xl font-black text-white">{(selectedIssue.riskScore || 0).toFixed(1)}</span>
                                                    </div>
                                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(selectedIssue.riskScore || 0) * 10}%` }}
                                                            transition={{ delay: 0.4, duration: 1.5, ease: "circOut" }}
                                                            className={cn("h-full rounded-full transition-colors",
                                                                selectedIssue.riskScore > 8 ? "bg-gradient-to-r from-rose-600 to-rose-400" :
                                                                    selectedIssue.riskScore > 5 ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-12 pt-10 border-t border-white/[0.05] text-center">
                                                <div className="relative inline-block px-10 py-5 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="block text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] mb-3">Classification</span>
                                                    <span className={cn(
                                                        "text-3xl font-black tracking-tighter italic",
                                                        selectedIssue.riskLevel === 'CRITICAL' ? 'text-rose-500' :
                                                            selectedIssue.riskLevel === 'HIGH' ? 'text-orange-500' :
                                                                selectedIssue.riskLevel === 'MODERATE' ? 'text-amber-500' : 'text-teal-400'
                                                    )}>
                                                        {selectedIssue.riskLevel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.a
                                            whileHover={{ y: -3, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            href={`https://github.com/issues/${selectedIssue.issueId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block w-full text-center py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.2rem] text-sm font-black transition-all shadow-[0_10px_40px_rgba(16,185,129,0.2)] hover:shadow-emerald-500/30"
                                        >
                                            Inspect Source
                                            <ArrowUpRight className="inline-block w-4 h-4 ml-2" />
                                        </motion.a>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
