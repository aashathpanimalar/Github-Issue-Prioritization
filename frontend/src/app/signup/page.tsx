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
