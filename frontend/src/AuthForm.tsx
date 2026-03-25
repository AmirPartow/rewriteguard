/**
 * Authentication form component with signup, login and social-migration (set-password) modes.
 * Features client-side validation and animated transitions.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from './AuthContext';

type AuthMode = 'login' | 'signup' | 'set-password';

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
}

interface AuthFormProps {
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
}

export default function AuthForm({ onPrivacyClick, onTermsClick }: AuthFormProps = {}) {
    const { login, signup, error, clearError, isLoading } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Clear errors when switching modes
    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        clearError();
        setPassword('');
        setConfirmPassword('');
    };

    // Client-side validation
    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (mode === 'signup' || mode === 'set-password') {
            if (!/[A-Z]/.test(password)) {
                errors.password = 'Password must contain an uppercase letter';
            } else if (!/[a-z]/.test(password)) {
                errors.password = 'Password must contain a lowercase letter';
            } else if (!/\d/.test(password)) {
                errors.password = 'Password must contain a number';
            }
        }

        // Confirm password (signup or set-password)
        if ((mode === 'signup' || mode === 'set-password') && password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Just check if errors object is empty to proceed, not setting state
        return Object.keys(errors).length === 0;
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
            
            // On success, log them in automatically
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
                    // Check if backend says they need to set a password
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
        } catch {
            // Error is handled by auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        clearError();
        const env = import.meta as any;
        const CLIENT_IDS: Record<string, string> = {
            google: env.env.VITE_GOOGLE_CLIENT_ID || '1072943021853-a0j1rrqej35dhdqkqaacn4qdlt76hk8j.apps.googleusercontent.com',
            facebook: env.env.VITE_FACEBOOK_APP_ID || '',
            apple: env.env.VITE_APPLE_CLIENT_ID || '',
            x: env.env.VITE_X_CLIENT_ID || '',
        };

        const REDIRECT_URI = `${window.location.origin}/auth-callback`;
        let authUrl = '';

        if (provider === 'google') {
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_IDS.google}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&state=${provider}`;
        } else if (provider === 'facebook' && CLIENT_IDS.facebook) {
            authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${CLIENT_IDS.facebook}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email,public_profile&state=${provider}`;
        } else if (provider === 'apple' && CLIENT_IDS.apple) {
            authUrl = `https://appleid.apple.com/auth/authorize?client_id=${CLIENT_IDS.apple}&redirect_uri=${REDIRECT_URI}&response_type=code%20id_token&scope=name%20email&response_mode=fragment&state=${provider}`;
        } else if (provider === 'x' && CLIENT_IDS.x) {
            // X uses OAuth 2.0 with PKCE
            const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
            sessionStorage.setItem('x_code_verifier', codeVerifier);
            const encoder = new TextEncoder();
            const data = encoder.encode(codeVerifier);
            const digest = await crypto.subtle.digest('SHA-256', data);
            const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
                .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_IDS.x}&redirect_uri=${REDIRECT_URI}&scope=tweet.read%20users.read&state=${provider}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        }

        if (authUrl) {
            window.location.href = authUrl;
        } else {
            console.warn(`Social login provider "${provider}" not configured.`);
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
                
                {/* Header Shield */}
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
                        {mode === 'login' 
                            ? 'Log in to access RewriteGuard' 
                            : mode === 'signup' 
                                ? 'Join thousands of protected writers'
                                : 'Create a password for your account'}
                    </p>
                </div>

                {/* Mode Toggle Tabs */}
                {(mode === 'login' || mode === 'signup') && (
                    <div className="flex bg-gray-100 dark:bg-slate-800/50 rounded-[1.5rem] p-1.5 mb-10">
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className={`flex-1 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'login'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xl'
                                : 'text-slate-400 dark:text-gray-500'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('signup')}
                            className={`flex-1 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-300 ${mode === 'signup'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xl'
                                : 'text-slate-400 dark:text-gray-500'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {/* Error Banner */}
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

                {/* Social Buttons (Above form in Picture 2) */}
                {(mode === 'login' || mode === 'signup') && (
                    <div className="space-y-3 mb-8">
                        {/* Google */}
                        <button onClick={() => handleSocialLogin('google')} className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Facebook */}
                        <button onClick={() => handleSocialLogin('facebook')} className="w-full h-14 flex items-center justify-center gap-3 bg-[#1877F2] rounded-2xl font-bold text-white hover:bg-[#166FE5] transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Continue with Facebook
                        </button>

                        {/* Apple */}
                        <button onClick={() => handleSocialLogin('apple')} className="w-full h-14 flex items-center justify-center gap-3 bg-black dark:bg-white rounded-2xl font-bold text-white dark:text-black hover:opacity-90 transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                            Continue with Apple
                        </button>

                        {/* X (Twitter) */}
                        <button onClick={() => handleSocialLogin('x')} className="w-full h-14 flex items-center justify-center gap-3 bg-black dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-white hover:bg-gray-900 dark:hover:bg-slate-700 transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            Continue with X
                        </button>
                    </div>
                )}

                {/* OR Divider */}
                {(mode === 'login' || mode === 'signup') && (
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 px-4">
                            OR
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name (signup only) */}
                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Jane Doe"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={mode === 'set-password'}
                            placeholder="user@example.com"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-75 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                            {mode === 'login' && (
                                <button type="button" className="text-[10px] uppercase font-black text-blue-600 hover:text-purple-600 transition-colors tracking-widest">Forgot?</button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.04m4.066-1.56a10.14 10.14 0 014.282-1.075c4.478 0 8.268 2.943 9.542 7a10.018 10.018 0 01-2.227 4.02m-4.696-4.696A3 3 0 1111.314 11.314M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                                )}
                            </button>
                        </div>
                        {(mode === 'signup' || mode === 'set-password') && (
                            <p className="text-slate-400 text-[9px] font-black mt-1 ml-1 uppercase tracking-widest leading-loose">
                                Min 8 chars, uppercase, lowercase & digit
                            </p>
                        )}
                    </div>

                    {/* Confirm Password (signup and set-password only) */}
                    {(mode === 'signup' || mode === 'set-password') && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
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

                {/* Switcher & Footer Links */}
                <div className="text-center mt-10">
                    <p className="text-sm font-bold text-slate-500 mb-8">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-blue-600 font-black hover:underline"
                        >
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
