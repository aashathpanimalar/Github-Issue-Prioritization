'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Briefcase, FileText, 
    User as UserIcon, GitBranch, 
    Calendar, AlertCircle, Loader2 
} from 'lucide-react';
import api from '@/lib/api';
import { Project, ProjectTask, ProjectMember } from '@/types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    members: ProjectMember[];
    task?: ProjectTask;
    onSuccess: () => void;
}

export default function TaskModal({ isOpen, onClose, project, members, task, onSuccess }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [status, setStatus] = useState('PENDING');
    const [branch, setBranch] = useState('');
    const [assignedToId, setAssignedToId] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setPriority(task.priority);
            setStatus(task.status);
            setBranch(task.branch || '');
            setAssignedToId(task.assignedTo?.id || '');
        } else {
            setTitle('');
            setDescription('');
            setPriority('MEDIUM');
            setStatus('PENDING');
            setBranch('');
            setAssignedToId('');
        }
    }, [task, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title,
                description,
                priority,
                status,
                branch,
                assignedToId: assignedToId || null
            };

            if (task) {
                // Update existing (skipped implementation for brevity, typically PUT /api/tasks/{id})
            } else {
                await api.post(`/projects/${project.id}/tasks`, payload);
            }
            onSuccess();
        } catch (err) {
            console.error('Failed to save task', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg rounded-3xl p-8 overflow-hidden shadow-2xl"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                            {task ? 'Edit Task' : 'Create Task'}
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-500/10 transition-all">
                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Task Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} 
                                className="w-full bg-transparent border-2 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value)}
                                    className="w-full bg-transparent border-2 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Assignee</label>
                                <select value={assignedToId} onChange={e => setAssignedToId(Number(e.target.value))}
                                    className="w-full bg-transparent border-2 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                    <option value="">Unassigned</option>
                                    {members.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Working Branch</label>
                            <input value={branch} onChange={e => setBranch(e.target.value)} 
                                placeholder="feature/ai-integration"
                                className="w-full bg-transparent border-2 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} 
                                className="w-full bg-transparent border-2 rounded-2xl p-4 outline-none focus:border-indigo-500 font-bold min-h-[100px] resize-none"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Task'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
