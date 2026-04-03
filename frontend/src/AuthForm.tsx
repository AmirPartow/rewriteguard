/**
 * Authentication form — uses Clerk components when configured,
 * falls back to email/password form otherwise.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from './AuthContext';

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';

type AuthMode = 'login' | 'signup' | 'set-password';

interface AuthFormProps {
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
}

// Lazy-load Clerk components only when needed
let ClerkSignIn: any = null;
let ClerkSignUp: any = null;
if (CLERK_KEY) {
    try {
        const clerk = require('@clerk/clerk-react');
        ClerkSignIn = clerk.SignIn;
        ClerkSignUp = clerk.SignUp;
    } catch { /* Clerk not available */ }
}

export default function AuthForm({ onPrivacyClick, onTermsClick }: AuthFormProps = {}) {
    const [mode, setMode] = useState<AuthMode>('login');

    // ─── Clerk-powered auth ───
    if (CLERK_KEY && ClerkSignIn && ClerkSignUp) {
        const clerkAppearance = {
            elements: {
                rootBox: 'w-full',
                card: 'bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-2xl',
                headerTitle: 'text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600',
                headerSubtitle: 'text-slate-500 dark:text-slate-400 font-bold text-sm',
                socialButtonsBlockButton: 'h-12 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all',
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-[1.5rem] font-black text-sm tracking-widest uppercase shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 h-12',
                formFieldInput: 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/10',
                formFieldLabel: 'text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest',
                footerActionLink: 'text-blue-600 font-black hover:underline',
                dividerLine: 'bg-gray-100 dark:bg-white/5',
                dividerText: 'text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-600',
            },
        };

        return (
            <div className="w-full max-w-md mx-auto animate-fade-in-up">
                <div className="flex bg-gray-100 dark:bg-slate-800/50 rounded-[1.5rem] p-1.5 mb-6">
                    <button type="button" onClick={() => setMode('login')}
                        className={`flex-1 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xl' : 'text-slate-400 dark:text-gray-500'}`}>
                        Login
                    </button>
                    <button type="button" onClick={() => setMode('signup')}
                        className={`flex-1 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'signup' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xl' : 'text-slate-400 dark:text-gray-500'}`}>
                        Sign Up
                    </button>
                </div>

                {mode === 'login' ? (
                    <ClerkSignIn appearance={clerkAppearance} routing="hash" signUpUrl="#signup" forceRedirectUrl="/" />
                ) : (
                    <ClerkSignUp appearance={clerkAppearance} routing="hash" signInUrl="#signin" forceRedirectUrl="/" />
                )}

                <div className="text-center mt-6">
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
                        By continuing, you agree to RewriteGuard's{' '}
                        <button onClick={onTermsClick} className="text-blue-500 hover:underline">Terms of Service</button> and have read our{' '}
                        <button onClick={onPrivacyClick} className="text-blue-500 hover:underline">Privacy Policy</button>.
                    </p>
                </div>
            </div>
        );
    }

    // ─── Legacy email/password form (fallback) ───
    return <LegacyAuthForm mode={mode} setMode={setMode} onPrivacyClick={onPrivacyClick} onTermsClick={onTermsClick} />;
}


function LegacyAuthForm({ mode, setMode, onPrivacyClick, onTermsClick }: {
    mode: AuthMode; setMode: (m: AuthMode) => void;
    onPrivacyClick?: () => void; onTermsClick?: () => void;
}) {
    const { login, signup, error, clearError, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        clearError();
        setPassword('');
        setConfirmPassword('');
    };

    const validateForm = (): boolean => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) return false;
        if (!password || password.length < 8) return false;
        if (mode === 'signup' || mode === 'set-password') {
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) return false;
            if (password !== confirmPassword) return false;
        }
        return true;
    };

    const handleSetPassword = async () => {
        setIsSubmitting(true);
        try {
            const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiBase}/api/v1/auth/set-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to set password');
            await login(email, password);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                try {
                    await login(email, password);
                } catch (err: any) {
                    if (err.message === 'ACCOUNT_HAS_NO_PASSWORD') {
                        setMode('set-password');
                        clearError();
                        setPassword('');
                        setConfirmPassword('');
                    }
                }
            } else if (mode === 'signup') {
                await signup(email, password, fullName);
            } else if (mode === 'set-password') {
                await handleSetPassword();
            }
        } catch { /* handled by context */ } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl transition-colors">

                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Security Setup'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                        {mode === 'login' ? 'Log in to access RewriteGuard' : mode === 'signup' ? 'Join thousands of protected writers' : 'Create a password for your account'}
                    </p>
                </div>

                {(mode === 'login' || mode === 'signup') && (
                    <div className="flex bg-gray-100 dark:bg-slate-800/50 rounded-[1.5rem] p-1.5 mb-10">
                        <button type="button" onClick={() => switchMode('login')}
                            className={`flex-1 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xl' : 'text-slate-400 dark:text-gray-500'}`}>
                            Login
                        </button>
                        <button type="button" onClick={() => switchMode('signup')}
                            className={`flex-1 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'signup' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xl' : 'text-slate-400 dark:text-gray-500'}`}>
                            Sign Up
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-2xl p-4 mb-8">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-600 dark:text-red-300 text-xs font-bold">{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Full Name</label>
                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={mode === 'set-password'} placeholder="user@example.com"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-75 placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                            {mode === 'login' && (
                                <button type="button" className="text-[10px] uppercase font-black text-blue-600 hover:text-purple-600 transition-colors tracking-widest">Forgot?</button>
                            )}
                        </div>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.04m4.066-1.56a10.14 10.14 0 014.282-1.075c4.478 0 8.268 2.943 9.542 7a10.018 10.018 0 01-2.227 4.02m-4.696-4.696A3 3 0 1111.314 11.314M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                                )}
                            </button>
                        </div>
                        {(mode === 'signup' || mode === 'set-password') && (
                            <p className="text-slate-400 text-[9px] font-black mt-1 ml-1 uppercase tracking-widest leading-loose">Min 8 chars, uppercase, lowercase & digit</p>
                        )}
                    </div>

                    {(mode === 'signup' || mode === 'set-password') && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600" />
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting || isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2">
                        {isSubmitting ? 'Processing...' : (
                            <>
                                {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Set Password & Login'}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-10">
                    <p className="text-sm font-bold text-slate-500 mb-8">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="text-blue-600 font-black hover:underline">
                            {mode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
                        By continuing, you agree to RewriteGuard's{' '}
                        <button onClick={onTermsClick} className="text-blue-500 hover:underline">Terms of Service</button> and have read our{' '}
                        <button onClick={onPrivacyClick} className="text-blue-500 hover:underline">Privacy Policy</button>.
                    </p>
                </div>
            </div>
        </div>
    );
}
