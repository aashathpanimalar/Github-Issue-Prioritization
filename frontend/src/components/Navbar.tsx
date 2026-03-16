 'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Menu, X, LogOut, User as UserIcon, LayoutDashboard, ChevronRight, Lightbulb, GitBranch, GitPullRequest, Users, Activity, BarChart3, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Extract repoId from pathname for repo sub-navigation
    const repoMatch = pathname?.match(/^\/repo\/(\d+)/);
    const repoId = repoMatch ? repoMatch[1] : null;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/');
    };

    const repoNavLinks = repoId ? [
        { href: `/repo/${repoId}`, label: 'Issues', icon: Activity },
        { href: `/repo/${repoId}/branches`, label: 'Branches', icon: GitBranch },
        { href: `/repo/${repoId}/pull-requests`, label: 'Pull Requests', icon: GitPullRequest },
        { href: `/repo/${repoId}/team`, label: 'Team', icon: Users },
        { href: `/repo/${repoId}/workflow`, label: 'Workflow', icon: LayoutDashboard },
        { href: `/repo/${repoId}/insights`, label: 'Insights', icon: BarChart3 },
    ] : [];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'py-3 backdrop-blur-lg border-b' : 'py-5 bg-transparent'
            }`}
            style={{
                background: isScrolled ? 'var(--glass-bg)' : 'transparent',
                borderColor: 'var(--border)',
            }}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
                            <Github className="text-white w-5 h-5" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-themed">GitHub Hub</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-themed-secondary hover:text-themed transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link href="/projects" className="flex items-center gap-1.5 text-sm font-semibold text-themed-secondary hover:text-themed transition-colors">
                                    <Briefcase className="w-4 h-4 text-indigo-400" />
                                    Projects
                                </Link>
                                <Link href="/ideas" className="flex items-center gap-1.5 text-sm font-semibold text-themed-secondary hover:text-themed transition-colors">
                                    <Lightbulb className="w-4 h-4 text-amber-400" />
                                    Ideas
                                </Link>
                                <ThemeToggle />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors ml-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <ThemeToggle />
                                <Link href="/login" className="text-sm font-semibold text-themed-secondary hover:text-themed transition-colors">Log In</Link>
                                <Link
                                    href="/signup"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                                >
                                    Get Started <ChevronRight className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="md:hidden text-themed p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Repo Sub-Navigation Bar */}
                {repoId && repoNavLinks.length > 0 && (
                    <div className="hidden md:flex items-center gap-1 mt-3 pt-3 border-t overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                        {repoNavLinks.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                            : 'text-themed-secondary hover:text-themed hover:bg-card-themed'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t overflow-hidden"
                        style={{ background: 'var(--glass-bg)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex flex-col p-6 gap-5">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-themed font-semibold">
                                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                                    </Link>
                                    <Link href="/projects" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-themed font-semibold">
                                        <Briefcase className="w-5 h-5 text-indigo-400" /> Projects
                                    </Link>
                                    <Link href="/ideas" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-themed font-semibold">
                                        <Lightbulb className="w-5 h-5 text-amber-400" /> Ideas
                                    </Link>
                                    {repoNavLinks.map(({ href, label, icon: Icon }) => (
                                        <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-themed-secondary font-semibold">
                                            <Icon className="w-5 h-5" /> {label}
                                        </Link>
                                    ))}
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-themed-secondary">Theme:</span>
                                        <ThemeToggle />
                                    </div>
                                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 text-red-400 font-semibold">
                                        <LogOut className="w-5 h-5" /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-themed-secondary">Theme:</span>
                                        <ThemeToggle />
                                    </div>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-themed font-semibold">Log In</Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-indigo-600 text-white p-4 rounded-xl text-center font-bold">Get Started</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
