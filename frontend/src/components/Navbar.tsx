'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Menu, X, LogOut, User as UserIcon, LayoutDashboard, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // Check for user in localStorage to determine auth state
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

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 bg-black/80 backdrop-blur-lg border-b border-white/10' : 'py-6 bg-transparent'
            }`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
                        <Github className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">IssueFlow</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>

                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                <UserIcon className="w-4 h-4" />
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-4"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</Link>
                            <Link
                                href="/signup"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                            >
                                Get Started
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-6">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-300">
                                        <LayoutDashboard /> Dashboard
                                    </Link>
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-300">
                                        <UserIcon /> Profile
                                    </Link>
                                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 text-lg font-medium text-red-500">
                                        <LogOut /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300">Log In</Link>
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
