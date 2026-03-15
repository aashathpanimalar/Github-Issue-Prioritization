'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center border border-themed transition-all duration-200"
            style={{ background: 'var(--bg-card)' }}
        >
            <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                )}
            </motion.div>
        </motion.button>
    );
}
