'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Briefcase, MessageSquare, AlertTriangle, 
    RefreshCcw, Plus, Rocket, Clock, Search, ExternalLink,
    ChevronRight, Users, GitBranch, ShieldCheck, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { Project, ProjectActivity } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProjectHub() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<ProjectActivity[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'Dashboard' | 'My Projects' | 'Reviews' | 'Conflicts'>('Dashboard');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [projRes, statsRes, actRes, revRes, confRes] = await Promise.all([
                api.get('/projects'),
                api.get('/projects/stats'),
                api.get('/projects/activity'),
                api.get('/projects/my-reviews'),
                api.get('/projects/my-conflicts')
            ]);
            setProjects(projRes.data);
            setStats(statsRes.data);
            setActivities(actRes.data.content);
            setReviews(revRes.data);
            setConflicts(confRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Project Sidebar */}
            <aside className="w-64 border-r hidden lg:flex flex-col p-6 sticky top-0 h-screen" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-10">
                    <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Project System</h2>
                </div>
                
                <nav className="space-y-1 flex-1">
                    {[
                        { icon: LayoutDashboard, label: 'Dashboard' },
                        { icon: Briefcase, label: 'My Projects' },
                        { icon: ShieldCheck, label: 'Reviews' },
                        { icon: AlertTriangle, label: 'Conflicts' },
                    ].map((item) => (
                        <button key={item.label} 
                            onClick={() => setActiveTab(item.label as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                activeTab === item.label ? 'bg-indigo-500/10 text-indigo-500 font-bold' : 'text-[var(--text-muted)] hover:bg-gray-500/5'
                            }`}>
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-8 py-10">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overview of your Git Flow projects and activities</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchData}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </motion.button>
                            <Link href="/projects/create">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    New Project
                                </motion.button>
                            </Link>
                        </div>
                    </header>

                    {activeTab === 'Dashboard' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {[
                                    { label: 'Total Projects', value: stats?.totalProjects || projects.length, icon: Briefcase, color: '#6366f1', sub: 'Active repositories' },
                                    { label: 'Active Branches', value: stats?.activeBranches || '0', icon: GitBranch, color: '#8b5cf6', sub: 'Feature & release branches' },
                                    { label: 'Pending Reviews', value: stats?.pendingReviews || '0', icon: Clock, color: '#f59e0b', sub: 'Awaiting approval' },
                                    { label: 'Recent Releases', value: stats?.recentReleases || '0', icon: Rocket, color: '#10b981', sub: 'This month' },
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-2xl p-6 border transition-all hover:shadow-xl hover:-translate-y-1"
                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                                <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Projects List */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <Briefcase className="w-5 h-5 text-indigo-500" />
                                        Active Projects
                                    </h2>
                                    {projects.length === 0 ? (
                                        <div className="rounded-3xl border-2 border-dashed p-16 flex flex-col items-center justify-center text-center space-y-4" style={{ borderColor: 'var(--border)' }}>
                                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                                <Rocket className="w-8 h-8 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>No projects yet</h3>
                                                <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>Create your first project to collaborate with your team and manage Git Flow.</p>
                                            </div>
                                            <Link href="/projects/create">
                                                <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95">
                                                    Create Project
                                                </button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {projects.map((project) => (
                                                <Link key={project.id} href={`/projects/${project.id}`}>
                                                    <motion.div 
                                                        whileHover={{ y: -4 }}
                                                        className="group p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-2xl"
                                                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all text-indigo-500" />
                                                        </div>
                                                        <h3 className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>{project.name}</h3>
                                                        <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>{project.description || 'No description provided.'}</p>
                                                        <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                                            <div className="flex -space-x-2">
                                                                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] text-white font-bold">P</div>
                                                            </div>
                                                            <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>1 Member</span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <Clock className="w-5 h-5 text-orange-500" />
                                        Recent Activity
                                    </h2>
                                    <div className="rounded-3xl border p-6 min-h-[400px]" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                        {activities.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center space-y-4">
                                                <Clock className="w-12 h-12" />
                                                <p className="text-sm font-bold">No recent activity</p>
                                                <p className="text-xs max-w-[200px]">Activities from your projects will appear here as they happen.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {activities.map((act) => (
                                                    <div key={act.id} className="flex gap-4 p-3 rounded-xl transition-all hover:bg-gray-500/5">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-500 border border-indigo-500/30">
                                                            {act.user?.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                                                <span className="text-indigo-500">{act.user?.username}</span> {act.message}
                                                            </p>
                                                            <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Reviews' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <ShieldCheck className="w-6 h-6 text-purple-500" />
                                Pending Reviews
                            </h2>
                            {reviews.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)]">No pending reviews found across your projects. 🎉</p>
                            ) : (
                                <div className="grid gap-4">
                                    {reviews.map(task => (
                                        <div key={task.id} className="p-5 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                            <div>
                                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{task.title}</h3>
                                                <p className="text-xs text-[var(--text-muted)]">Project: {task.project?.name} • Assigned to: {task.assignedTo?.username || 'Unassigned'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-500">IN REVIEW</span>
                                                <Link href={`/projects/${task.project?.id}`}>
                                                    <button className="px-4 py-1.5 bg-[var(--bg-primary)] border border-indigo-500/20 text-indigo-500 rounded-lg text-xs font-bold hover:bg-indigo-500/10">View Board</button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Conflicts' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                High Priority Conflicts & Tasks
                            </h2>
                            {conflicts.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)]">No high priority conflicts detected. 🎉</p>
                            ) : (
                                <div className="grid gap-4">
                                    {conflicts.map(task => (
                                        <div key={task.id} className="p-5 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                            <div>
                                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">{task.title}</h3>
                                                <p className="text-xs text-[var(--text-muted)]">Project: {task.project?.name} • Priority: {task.priority}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${task.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {task.priority}
                                                </span>
                                                <Link href={`/projects/${task.project?.id}`}>
                                                    <button className="px-4 py-1.5 bg-[var(--bg-primary)] border border-indigo-500/20 text-indigo-500 rounded-lg text-xs font-bold hover:bg-indigo-500/10">View Board</button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
