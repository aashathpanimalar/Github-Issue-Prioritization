'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function JoinProject() {
    const { token } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/projects/join/${token}`);
            router.push('/projects');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to join project. The link might be invalid or expired.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full rounded-3xl p-10 text-center space-y-8 shadow-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto border-2 border-indigo-500/20">
                    <UserPlus className="w-10 h-10 text-indigo-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-[var(--text-primary)]">You're Invited!</h1>
                    <p className="text-sm text-[var(--text-secondary)]">A teammate has invited you to collaborate on a private project workspace.</p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold animate-shake text-left">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="pt-4">
                    <button 
                        onClick={handleJoin}
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-indigo-600/20"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                Join Project Workspace
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">By joining, you agree to the workspace terms</p>
                </div>
            </motion.div>
        </div>
    );
}
