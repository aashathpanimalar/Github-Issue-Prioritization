'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Calendar, Shield, ExternalLink, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

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

                            <div className="w-24 h-24 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 relative z-10 shadow-xl shadow-indigo-600/20">
                                <User className="w-12 h-12 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold mb-1 relative z-10">{user.name}</h2>
                            <p className="text-gray-400 text-sm mb-6 relative z-10">Software Engineer</p>

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
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <User className="text-indigo-500" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Full Name</label>
                                    <p className="text-lg font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Email Address</label>
                                    <p className="text-lg font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Username</label>
                                    <p className="text-lg font-medium">@{user.name?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Role</label>
                                    <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-bold">DEVELOPER</span>
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
                                Connect your GitHub account to analyze private repositories and get advanced prioritization insights.
                            </p>

                            <div className="flex flex-wrap gap-4 relative z-10">
                                <button className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                    Manage Connection <ExternalLink className="w-4 h-4" />
                                </button>
                                <button className="bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-colors">
                                    <RefreshCw className="w-4 h-4" /> Sync Data
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
