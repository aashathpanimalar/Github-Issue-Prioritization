'use client';

import { motion } from 'framer-motion';
import { 
    Clock, Tag, GitBranch, 
    User as UserIcon, MoreVertical, 
    ChevronRight, AlertCircle 
} from 'lucide-react';
import { ProjectTask } from '@/types';

interface TaskCardProps {
    task: ProjectTask;
    onEdit: () => void;
    onStatusChange: (status: string) => void;
}

const PRIORITY_COLORS = {
    LOW: 'text-gray-400 bg-gray-400/10',
    MEDIUM: 'text-indigo-400 bg-indigo-400/10',
    HIGH: 'text-orange-400 bg-orange-400/10',
    CRITICAL: 'text-rose-400 bg-rose-400/10'
};

export default function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:border-indigo-500/30"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            onClick={onEdit}
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onStatusChange(task.status === 'PENDING' ? 'IN_REVIEW' : 'COMPLETE'); }} 
                        className="p-1 rounded-lg hover:bg-emerald-500/10 text-emerald-500">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-gray-500/10 transition-all text-[var(--text-muted)]">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h4 className="text-sm font-black mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
            <p className="text-[10px] line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>{task.description}</p>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-indigo-500" />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </span>
                </div>
                {task.branch && (
                    <div className="flex items-center gap-1 text-[9px] font-mono text-indigo-400">
                        <GitBranch className="w-3 h-3" />
                        {task.branch}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
