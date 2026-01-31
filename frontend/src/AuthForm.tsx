/**
 * Authentication form component with signup and login modes.
 * Features client-side validation and animated transitions.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from './AuthContext';

type AuthMode = 'login' | 'signup';

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
}

export default function AuthForm() {
    const { login, signup, error, clearError, isLoading } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Clear errors when switching modes
    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setFormErrors({});
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
        } else if (mode === 'signup') {
            if (!/[A-Z]/.test(password)) {
                errors.password = 'Password must contain an uppercase letter';
            } else if (!/[a-z]/.test(password)) {
                errors.password = 'Password must contain a lowercase letter';
            } else if (!/\d/.test(password)) {
                errors.password = 'Password must contain a number';
            }
        }

        // Confirm password (signup only)
        if (mode === 'signup' && password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signup(email, password, fullName);
            }
        } catch {
            // Error is handled by auth context
        } finally {
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
            {/* Card Container */}
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {mode === 'login'
                            ? 'Sign in to access RewriteGuard'
                            : 'Start using AI-powered text tools'
                        }
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-slate-900/50 rounded-xl p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${mode === 'login'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 ${mode === 'signup'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 animate-shake">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-300 text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name (signup only) */}
                    {mode === 'signup' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="full-name-input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                            {formErrors.fullName && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email-input"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (formErrors.email) setFormErrors(f => ({ ...f, email: undefined }));
                            }}
                            placeholder="you@example.com"
                            className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${formErrors.email ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                                }`}
                        />
                        {formErrors.email && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password-input"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (formErrors.password) setFormErrors(f => ({ ...f, password: undefined }));
                                }}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 pr-12 bg-slate-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${formErrors.password ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {formErrors.password && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                        )}
                        {mode === 'signup' && !formErrors.password && (
                            <p className="text-gray-500 text-xs mt-1">
                                Min 8 characters with uppercase, lowercase, and number
                            </p>
                        )}
                    </div>

                    {/* Confirm Password (signup only) */}
                    {mode === 'signup' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirm-password-input"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (formErrors.confirmPassword) setFormErrors(f => ({ ...f, confirmPassword: undefined }));
                                }}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${formErrors.confirmPassword ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                                    }`}
                            />
                            {formErrors.confirmPassword && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        id="auth-submit-button"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                            </>
                        ) : (
                            <>
                                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    {mode === 'login' ? (
                        <>Don't have an account?{' '}
                            <button onClick={() => switchMode('signup')} className="text-blue-400 hover:text-blue-300 transition-colors">
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button onClick={() => switchMode('login')} className="text-blue-400 hover:text-blue-300 transition-colors">
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
