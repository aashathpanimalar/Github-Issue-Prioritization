'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (token && email) {
            // Save to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email, name }));

            // Redirect to dashboard
            router.push('/dashboard');
        } else {
            const error = searchParams.get('message') || 'Authentication failed';
            router.push(`/login?status=error&message=${encodeURIComponent(error)}`);
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            <p className="text-gray-400 font-medium">Completing authentication...</p>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
