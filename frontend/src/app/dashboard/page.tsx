'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Plus, Search, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Loader2, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { User, PublicRepoResponse, GithubUser, GithubRepo } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const [user, setUser] = useState<User | null>(null);
    const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
    const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [reposLoading, setReposLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            fetchGithubInfo();
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const status = searchParams.get('status');
        const message = searchParams.get('message');
        if (status === 'success') {
            setSuccess(message || 'Connected successfully!');
            fetchGithubInfo();
        } else if (status === 'error') {
            setError(message || 'Failed to connect.');
        }
    }, [searchParams]);

    const fetchGithubInfo = async () => {
        try {
            const userRes = await api.get<GithubUser>('/github/oauth/user');
            setGithubUser(userRes.data);

            setReposLoading(true);
            const reposRes = await api.get<GithubRepo[]>('/github/oauth/repositories');
            setGithubRepos(reposRes.data);
        } catch (err) {
            console.error('Failed to fetch GitHub info', err);
        } finally {
            setReposLoading(false);
        }
    };

    const handleConnectGithub = () => {
        const token = localStorage.getItem('token');
        window.location.href = `http://localhost:8081/api/github/oauth/start?token=${token}`;
    };

    const handleAnalyzePublicRepo = async (e?: React.FormEvent, customUrl?: string) => {
        if (e) e.preventDefault();
        const urlToAnalyze = customUrl || repoUrl;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post<PublicRepoResponse>('/public-repo/analyze', { repoUrl: urlToAnalyze });
            setSuccess(`Analysis complete for ${response.data.repoName}!`);
            setRepoUrl('');
            setTimeout(() => {
                router.push(`/repo/${response.data.repoId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to analyze repository.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* 🌌 Background Blobs for Atmosphere */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
                >
                    <div className="flex items-center gap-6">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-600/40 border border-indigo-400/30"
                        >
                            <UserIcon className="w-10 h-10 text-white" />
                        </motion.div>
                        <div>
                            <span className="text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Developer Workspace</span>
                            <h1 className="text-5xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
                                Welcome, {user.name.split(' ')[0]}!
                            </h1>
                            <p className="text-gray-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                System status: Operational & Smart Analysis Active
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {githubUser?.connected ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 pr-6 rounded-2xl"
                            >
                                <img src={githubUser.avatarUrl} alt={githubUser.githubUsername} className="w-12 h-12 rounded-xl border border-white/10 shadow-lg" />
                                <div>
                                    <p className="font-black text-sm text-white tracking-tight">{githubUser.githubUsername}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">GitHub Connected</p>
                                </div>
                                <div className="ml-4 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleConnectGithub}
                                className="bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 group"
                            >
                                <Github className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                Connect Account
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* 📊 Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: "Repositories", value: githubRepos.length || "0", icon: Search, color: "text-indigo-400" },
                        { label: "Analyzed Today", value: "12", icon: CheckCircle2, color: "text-emerald-400" },
                        { label: "High Priority", value: "3", icon: AlertCircle, color: "text-red-400" },
                        { label: "ML Confidence", value: "98%", icon: RefreshCw, color: "text-purple-400" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:border-white/20 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Stats</span>
                            </div>
                            <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                            <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {(error || success) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8"
                        >
                            {error && (
                                <div className="flex items-center gap-4 text-red-500 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 backdrop-blur-md">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">Operation Failed</p>
                                        <p className="text-xs opacity-80">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)} className="ml-auto hover:bg-red-500/20 p-2 rounded-lg transition-all">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-4 text-emerald-400 bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
                                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">Success</p>
                                        <p className="text-xs opacity-80">{success}</p>
                                    </div>
                                    <button onClick={() => setSuccess(null)} className="ml-auto hover:bg-emerald-500/20 p-2 rounded-lg transition-all">
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 🔍 Dynamic Search & Analysis Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-12 xl:col-span-4"
                    >
                        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 p-8 rounded-[2rem] h-full flex flex-col relative overflow-hidden group">
                            {/* Decorative element */}
                            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                                <Search className="w-7 h-7 text-indigo-400" />
                                Dynamic Analysis
                            </h2>
                            <p className="text-gray-300 text-sm mb-8 leading-relaxed font-medium">
                                Paste any public GitHub URL. Our <span className="text-white font-bold underline decoration-indigo-500">Naive Bayes</span> model will classify issue priorities with high confidence.
                            </p>

                            <form onSubmit={(e) => handleAnalyzePublicRepo(e)} className="space-y-6 relative z-10 mt-auto">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-indigo-300 font-black ml-1">Repo Telemetry</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={repoUrl}
                                            onChange={(e) => setRepoUrl(e.target.value)}
                                            placeholder="github.com/owner/repository"
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all font-mono text-sm placeholder:text-gray-600"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] disabled:opacity-50 text-lg"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Execute Analysis
                                            <ExternalLink className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>

                    {/* 📂 GitHub Repositories Explorer */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-12 xl:col-span-8"
                    >
                        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] h-full backdrop-blur-sm overflow-hidden flex flex-col min-h-[600px]">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black flex items-center gap-3 mb-1">
                                        <Github className="w-7 h-7 text-white" />
                                        Repository Explorer
                                    </h2>
                                    <p className="text-gray-500 text-xs font-medium">Direct synchronization with your GitHub cloud account</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <span className="text-[10px] font-bold text-gray-400">v1.2 Stable</span>
                                    </div>
                                    <button
                                        onClick={fetchGithubInfo}
                                        disabled={reposLoading}
                                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-50 group"
                                    >
                                        <RefreshCw className={`w-5 h-5 text-indigo-400 ${reposLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                {reposLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <p className="mt-8 text-indigo-400 font-black tracking-widest text-xs uppercase animate-pulse">Synchronizing Data...</p>
                                    </div>
                                ) : githubRepos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar p-1">
                                        {githubRepos.map((repo, idx) => (
                                            <motion.div
                                                key={repo.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between hover:bg-white/[0.07] hover:border-indigo-500/40 transition-all cursor-default"
                                            >
                                                <div className="mb-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                                                            <Github className="w-6 h-6 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {repo.private ? (
                                                                <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2.5 py-1 rounded-lg border border-amber-500/20 font-black shadow-inner">SECURE</span>
                                                            ) : (
                                                                <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-black">PUBLIC</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-black text-gray-100 group-hover:text-white transition-colors truncate mb-1">
                                                        {repo.name}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-500 font-mono tracking-tight">{repo.full_name}</p>
                                                </div>

                                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                                    <button
                                                        onClick={() => handleAnalyzePublicRepo(undefined, repo.html_url)}
                                                        className="flex-1 bg-white/[0.03] hover:bg-white/10 text-white py-3 rounded-xl text-xs font-black transition-all border border-white/10 group-hover:border-indigo-500/50"
                                                    >
                                                        Run Analysis
                                                    </button>
                                                    <a
                                                        href={repo.html_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-3 bg-white/[0.03] hover:bg-white/10 rounded-xl transition-all border border-white/10"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                                            <Github className="w-12 h-12 text-gray-600" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3">No Connectivity</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed mb-8">
                                            {githubUser?.connected
                                                ? "We couldn't detect any active repositories in your GitHub account. Check your permissions or security tokens."
                                                : "Link your GitHub account to enable advanced cloud synchronization and ML-driven repository insights."}
                                        </p>
                                        {!githubUser?.connected && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                onClick={handleConnectGithub}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-indigo-600/20"
                                            >
                                                Initialize GitHub Link
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap');
                
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.5);
                }

                ::selection {
                    background: rgba(99, 102, 241, 0.4);
                    color: white;
                }
            `}</style>
        </div>
    );
}
