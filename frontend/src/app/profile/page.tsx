'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Calendar, Shield, ExternalLink, RefreshCw, Save, Edit2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { GithubUser } from '@/types';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedRole, setEditedRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const router = useRouter();

    const fetchGithubData = async () => {
        try {
            const response = await api.get('/github/oauth/user');
            setGithubUser(response.data);
        } catch (error) {
            console.error('Failed to fetch GitHub data', error);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setEditedName(userData.name || '');
        setEditedRole(userData.role || 'DEVELOPER');
        fetchGithubData();
    }, [router]);

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const response = await api.put('/profile/update', {
                name: editedName,
                role: editedRole
            });
            const updatedUser = { ...user, name: response.data.name, role: response.data.role };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to update profile', error);
            setSaveStatus('idle');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {/* Sidebar / Overview */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-24 h-24 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 relative z-10 shadow-xl shadow-indigo-600/20 overflow-hidden">
                                {githubUser?.avatarUrl ? (
                                    <img src={githubUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-white" />
                                )}
                            </div>

                            <h2 className="text-2xl font-bold mb-1 relative z-10">{user.name}</h2>
                            <p className="text-gray-400 text-sm mb-6 relative z-10">{user.role || 'Developer'}</p>

                            <div className="flex justify-center gap-4 relative z-10">
                                <div className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                                    <Github className="w-5 h-5" />
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                                    <Mail className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Security</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <Shield className="w-4 h-4 text-green-400" />
                                Account Verified
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <Calendar className="w-4 h-4 text-indigo-400" />
                                Joined Jan 2026
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <User className="text-indigo-500" />
                                    Personal Information
                                </h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saveStatus === 'saving'}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
                                        >
                                            {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {saveStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        />
                                    ) : (
                                        <p className="text-lg font-medium">{user.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Email Address</label>
                                    <p className="text-lg font-medium text-gray-400">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">GitHub Username</label>
                                    <p className="text-lg font-medium flex items-center gap-2">
                                        {githubUser?.githubUsername ? (
                                            <>
                                                <span className="text-indigo-400">@{githubUser.githubUsername}</span>
                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded border border-indigo-500/20">SYNCED</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-500 italic">Not connected</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Role</label>
                                    {isEditing ? (
                                        <select
                                            value={editedRole}
                                            onChange={(e) => setEditedRole(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        >
                                            <option value="DEVELOPER" className="bg-gray-900">DEVELOPER</option>
                                            <option value="PROJECT MANAGER" className="bg-gray-900">PROJECT MANAGER</option>
                                            <option value="LEAD ENGINEER" className="bg-gray-900">LEAD ENGINEER</option>
                                            <option value="REVIEWER" className="bg-gray-900">REVIEWER</option>
                                        </select>
                                    ) : (
                                        <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-bold border border-indigo-600/20">
                                            {user.role || 'DEVELOPER'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Github className="w-32 h-32" />
                            </div>

                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                                <Github className="text-white" />
                                GitHub Integration
                            </h3>

                            <p className="text-gray-400 mb-8 relative z-10 max-w-md">
                                {githubUser?.connected
                                    ? `Successfully connected to GitHub as @${githubUser.githubUsername}. Your private and public repositories are available for analysis.`
                                    : "Connect your GitHub account to analyze private repositories and get advanced prioritization insights."}
                            </p>

                            <div className="flex flex-wrap gap-4 relative z-10">
                                <button
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'}/github/oauth/start?mode=connect&token=${localStorage.getItem('token')}`}
                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                                >
                                    {githubUser?.connected ? 'Reconnect GitHub' : 'Connect GitHub'} <ExternalLink className="w-4 h-4" />
                                </button>
                                {githubUser?.connected && (
                                    <button
                                        onClick={fetchGithubData}
                                        className="bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Sync Data
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
