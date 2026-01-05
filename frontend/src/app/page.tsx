'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Bot, Github, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      }
    },
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto text-center max-w-4xl"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>AI-Powered Prioritization is here</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
          >
            Solve the Right Issues <br /> <span className="text-indigo-500">Faster than Ever</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Stop wasting time on trivial bugs. IssueFlow uses advanced ML to analyze your GitHub issues and tell you exactly what needs your attention first.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 text-lg shadow-xl shadow-indigo-600/30 w-full sm:w-auto justify-center group"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started for Free"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://github.com/aashathpanimalar/Github-Issue-Prioritization"
              target="_blank"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-24 px-6" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Bot className="w-8 h-8 text-indigo-400" />}
            title="ML Analysis"
            description="Our model analyzes issue descriptions and metadata to calculate impact scores."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-indigo-400" />}
            title="Prioritization"
            description="Get a clear list of issues ranked from High to Low priority based on data."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-indigo-400" />}
            title="Secure Integration"
            description="Connect your repositories via OAuth 2.0 with granular permissions."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors"
    >
      <div className="bg-indigo-500/10 p-4 rounded-2xl w-fit mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
