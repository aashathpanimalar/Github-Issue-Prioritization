'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

type SignupData = z.infer<typeof signupSchema>;
type OtpData = z.infer<typeof otpSchema>;

export default function SignupPage() {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const router = useRouter();

    const {
        register: registerDetails,
        handleSubmit: handleSubmitDetails,
        formState: { errors: detailErrors },
    } = useForm<SignupData>({
        resolver: zodResolver(signupSchema),
    });

    const {
        register: registerOtp,
        handleSubmit: handleSubmitOtp,
        formState: { errors: otpErrors },
    } = useForm<OtpData>({
        resolver: zodResolver(otpSchema),
    });

    const onSignupSubmit = async (data: SignupData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/signup', data);
            setEmail(data.email);
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onOtpSubmit = async (data: OtpData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/verify-signup-otp', { email, otp: data.otp });
            router.push('/login?message=Email verified successfully. Please login.');
        } catch (err: any) {
            setError(err.response?.data || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400">Join the future of issue management</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'details' ? (
                        <motion.form
                            key="details"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            onSubmit={handleSubmitDetails(onSignupSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        {...registerDetails('name')}
                                        className={cn(
                                            "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                                            detailErrors.name && "border-red-500/50"
                                        )}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {detailErrors.name && <p className="text-xs text-red-500 ml-1">{detailErrors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        {...registerDetails('email')}
                                        className={cn(
                                            "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                                            detailErrors.email && "border-red-500/50"
                                        )}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {detailErrors.email && <p className="text-xs text-red-500 ml-1">{detailErrors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        {...registerDetails('password')}
                                        type="password"
                                        className={cn(
                                            "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                                            detailErrors.password && "border-red-500/50"
                                        )}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {detailErrors.password && <p className="text-xs text-red-500 ml-1">{detailErrors.password.message}</p>}
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0f1115] px-2 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <a
                                href="http://localhost:8080/api/github/oauth/start?mode=login"
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405 11.5 11.5 0 0 1 3 .405c2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                Continue with GitHub
                            </a>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            onSubmit={handleSubmitOtp(onOtpSubmit)}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <p className="text-gray-400 text-sm mb-4">We've sent a 6-digit code to <span className="text-white font-medium">{email}</span></p>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        {...registerOtp('otp')}
                                        className={cn(
                                            "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center text-2xl tracking-[0.5em] font-mono",
                                            otpErrors.otp && "border-red-500/50"
                                        )}
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                                {otpErrors.otp && <p className="text-xs text-red-500 text-center">{otpErrors.otp.message}</p>}
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('details')}
                                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Change Email
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Log in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
