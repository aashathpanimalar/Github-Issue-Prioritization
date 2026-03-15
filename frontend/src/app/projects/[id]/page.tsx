'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, Clock, Sparkles, Plus, 
    ChevronRight, ExternalLink, Link as LinkIcon, 
    Loader2, AlertCircle, CheckCircle2, MoreVertical,
    GitBranch, User as UserIcon, Send, BrainCircuit
} from 'lucide-react';
import api from '@/lib/api';
import { Project, ProjectTask, ProjectMember, ProjectActivity, User } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';

export default function ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [tab, setTab] = useState<'TASKS' | 'MEMBERS' | 'ACTIVITY' | 'AI'>('TASKS');
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<ProjectTask | undefined>(undefined);
    const [aiInsights, setAiInsights] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [projRes, taskRes, memberRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/projects/${id}/tasks`),
                api.get(`/projects/${id}/members`)
            ]);
            setProject(projRes.data);
            setTasks(taskRes.data);
            setMembers(memberRes.data);
        } catch (err) {
            console.error('Failed to fetch project data', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchData();
    }, [id, fetchData]);

    const handleInviteCopy = () => {
        if (!project) return;
        const url = `${window.location.origin}/projects/join/${project.inviteToken}`;
        navigator.clipboard.writeText(url);
        alert('Invite link copied to clipboard!');
    };

    const handleTaskUpdate = () => {
        fetchData();
        setIsTaskModalOpen(false);
        setEditingTask(undefined);
    };

    const handleRunAI = async () => {
        setAiLoading(true);
        try {
            const res = await api.post(`/projects/${id}/ai-analysis`);
            setAiInsights(res.data);
        } catch (err) {
            console.error('AI analysis failed', err);
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    if (!project) return null;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Project Header */}
            <div className="border-b sticky top-0 z-10" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{project.name}</h1>
                            <div className="flex items-center gap-3 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {members.length} Members</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleInviteCopy}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-gray-500/5"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                            <LinkIcon className="w-4 h-4" />
                            Copy Invite Link
                        </button>
                        <button 
                            onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20">
                            <Plus className="w-4 h-4" />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex items-center gap-8">
                        {[
                            { id: 'TASKS', label: 'Tasks (Kanban)', icon: LayoutDashboard },
                            { id: 'MEMBERS', label: 'Team Members', icon: Users },
                            { id: 'ACTIVITY', label: 'Activity Feed', icon: Clock },
                            { id: 'AI', label: 'AI Insights', icon: BrainCircuit },
                        ].map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => setTab(item.id as any)}
                                className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                                    tab === item.id ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}>
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
                <AnimatePresence mode="wait">
                    {tab === 'TASKS' && (
                        <motion.div 
                            key="tasks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {/* Kanban Columns */}
                            {['PENDING', 'IN_REVIEW', 'COMPLETE'].map((status) => (
                                <div key={status} className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                status === 'PENDING' ? 'bg-indigo-400' : 
                                                status === 'IN_REVIEW' ? 'bg-amber-400' : 'bg-emerald-400'
                                            }`} />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                                {status.replace('_', ' ')}
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                                            {tasks.filter(t => t.status === status).length}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-4 min-h-[500px] p-2 rounded-3xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                                        {tasks.filter(t => t.status === status).map((task) => (
                                            <TaskCard 
                                                key={task.id} 
                                                task={task} 
                                                onEdit={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                                                onStatusChange={(newStatus: string) => api.patch(`/projects/${id}/tasks/${task.id}/status`, { status: newStatus }).then(fetchData)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {tab === 'MEMBERS' && (
                        <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)]">Team Members ({members.length})</h2>
                            <div className="rounded-3xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <div className="grid grid-cols-1 divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {members.map((member) => (
                                        <div key={member.id} className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
                                                    {member.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)]">{member.user.name}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    member.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500' :
                                                    member.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'AI' && (
                        <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto text-center space-y-10">
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto border-2 border-indigo-500/20">
                                    <BrainCircuit className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h2 className="text-3xl font-black text-[var(--text-primary)]">AI Productivity Analysis</h2>
                                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">Our AI agent analyzes your project tasks, member distribution, and branch activity to identify bottlenecks and suggest improvements.</p>
                            </div>

                            {!aiInsights ? (
                                <button 
                                    onClick={handleRunAI}
                                    disabled={aiLoading}
                                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm flex items-center gap-3 mx-auto shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50">
                                    {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Run Intelligence Analysis
                                </button>
                            ) : (
                                <div className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="rounded-3xl border p-8 space-y-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-3 text-indigo-500">
                                            <Sparkles className="w-5 h-5" />
                                            <h3 className="font-black">Agent Recommendations</h3>
                                        </div>
                                        <p className="text-lg font-bold leading-relaxed text-[var(--text-primary)]">
                                            {aiInsights.summary}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Productivity</p>
                                                <p className="text-2xl font-black text-[var(--text-primary)]">{aiInsights.metrics.productivityScore.toFixed(0)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Complete</p>
                                                <p className="text-2xl font-black text-emerald-500">{aiInsights.metrics.complete}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">In Review</p>
                                                <p className="text-2xl font-black text-amber-500">{aiInsights.metrics.review}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Pending</p>
                                                <p className="text-2xl font-black text-indigo-500">{aiInsights.metrics.pending}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">AI Advice: <span className="text-indigo-500">{aiInsights.recommendation}</span></p>
                                        </div>
                                    </div>
                                    <button onClick={() => setAiInsights(null)} className="text-xs font-bold text-[var(--text-muted)] hover:text-indigo-500 mx-auto block">Re-run Analysis</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals */}
            <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                project={project}
                members={members}
                task={editingTask}
                onSuccess={handleTaskUpdate}
            />
        </div>
    );
}
