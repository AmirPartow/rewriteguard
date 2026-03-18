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

interface AuthFormProps {
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
}

export default function AuthForm({ onPrivacyClick, onTermsClick }: AuthFormProps = {}) {
    const { login, signup, socialLogin, error, clearError, isLoading } = useAuth();
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

    const handleSocialLogin = async (provider: string) => {
        clearError();
        setIsSubmitting(true);
        try {
            // Simulated OAuth provider data for development
            // Use consistent providerId regardless of mode to ensure account persistence
            const providerId = `dev_${provider}_user_123`; 
            const email = `demo_${provider}@example.com`.toLowerCase();
            const name = `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
            
            await socialLogin(provider, providerId, email, name);
        } catch {
            // Context handles error
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
            <div className="bg-white dark:bg-slate-800/60 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl transition-colors">

                {/* Header */}
                <div className="text-center mb-8 transition-colors">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl mb-6 shadow-xl shadow-blue-500/20 transition-transform hover:scale-105">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight transition-colors">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-3 font-bold transition-colors">
                        {mode === 'login'
                            ? 'Log in to access RewriteGuard'
                            : 'Start using AI-powered text tools'
                        }
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-slate-900/50 rounded-2xl p-1.5 mb-8 transition-colors">
                        <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 ${mode === 'login'
                                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-lg'
                                : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-white'
                                }`}
                        >
                            Login
                        </button>
                    <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 ${mode === 'signup'
                            ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-lg'
                            : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-white'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-8">
                    <button 
                        type="button" 
                        disabled={isSubmitting}
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-200 rounded-2xl font-black text-slate-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 relative group"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-disabled:opacity-100 transition-opacity">
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                        </div>
                        <div className="flex items-center gap-3 group-disabled:opacity-20 transition-opacity">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </div>
                    </button>
                    <button 
                        type="button" 
                        disabled={isSubmitting}
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#1877F2] border border-transparent rounded-2xl font-black text-white hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md disabled:opacity-50 relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-disabled:opacity-100 transition-opacity bg-[#1877F2]">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <div className="flex items-center gap-3 group-disabled:opacity-0 transition-opacity">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Continue with Facebook
                        </div>
                    </button>
                    <button 
                        type="button" 
                        disabled={isSubmitting}
                        onClick={() => handleSocialLogin('apple')}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-black border border-transparent rounded-2xl font-black text-white hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md disabled:opacity-50 relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-disabled:opacity-100 transition-opacity bg-black">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <div className="flex items-center gap-3 group-disabled:opacity-0 transition-opacity">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12.152 6.896c-.548 0-1.711-.516-2.861-.516-1.56 0-2.992.837-3.792 2.234-1.613 2.812-.413 6.96 1.15 9.21.763 1.1 1.663 2.333 2.848 2.333 1.135 0 1.565-.688 2.94-.688 1.375 0 1.765.688 2.964.688 1.222 0 1.992-1.118 2.753-2.215.877-1.282 1.242-2.522 1.261-2.587-.028-.013-2.427-.932-2.453-3.702-.023-2.316 1.89-3.428 1.977-3.483-1.082-1.586-2.748-1.765-3.34-1.802-1.5-.123-2.91.916-3.448.916zm1.383-2.71c.642-.777 1.077-1.855.958-2.936-.928.037-2.05.617-2.717 1.393-.598.69-1.122 1.79-.982 2.84.103.01.205.015.31.015 1.183 0 2.22-.533 2.84-.916z" />
                            </svg>
                            Continue with Apple
                        </div>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative mb-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-white/10"></div>
                    </div>
                    <span className="relative px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 bg-white dark:bg-[#20293c]">Or</span>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-xl p-4 mb-6 animate-shake transition-colors">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-600 dark:text-red-300 text-sm font-bold">{error}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 transition-colors">

                    {/* Full Name (signup only) */}
                    {mode === 'signup' && (
                        <div className="animate-fade-in space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest transition-colors tracking-tight">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="full-name-input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Jane Doe"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/50 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold transition-colors"
                            />
                            {formErrors.fullName && (
                                <p className="text-red-500 text-[10px] font-black mt-1 ml-1 uppercase">{formErrors.fullName}</p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest transition-colors tracking-tight">
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
                            placeholder="user@example.com"
                            className={`w-full bg-gray-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold transition-colors ${formErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-slate-700/50'}`}
                        />
                        {formErrors.email && (
                            <p className="text-red-500 text-[10px] font-black mt-1 ml-1 uppercase">{formErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest transition-colors tracking-tight">Password</label>
                            {mode === 'login' && (
                                <button type="button" className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase transition-colors">Forgot?</button>
                            )}
                        </div>
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
                                className={`w-full bg-gray-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold transition-colors ${formErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-slate-700/50'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-white transition-colors"
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
                            <p className="text-red-500 text-[10px] font-black mt-1 ml-1 uppercase">{formErrors.password}</p>
                        )}
                        {mode === 'signup' && !formErrors.password && (
                            <p className="text-slate-400 dark:text-gray-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-tight transition-colors">
                                Min 8 chars, uppercase, lowercase & digit
                            </p>
                        )}
                    </div>

                    {/* Confirm Password (signup only) */}
                    {mode === 'signup' && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-xs font-black text-slate-400 dark:text-gray-500 ml-1 uppercase tracking-widest transition-colors tracking-tight">
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
                                className={`w-full bg-gray-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-bold transition-colors ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-slate-700/50'}`}
                            />
                            {formErrors.confirmPassword && (
                                <p className="text-red-500 text-[10px] font-black mt-1 ml-1 uppercase">{formErrors.confirmPassword}</p>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black text-lg shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                {mode === 'login' ? 'Login' : 'Create Account'}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-8 space-y-4">
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-bold transition-colors">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-black transition-all"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>

                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 leading-relaxed max-w-xs mx-auto transition-colors">
                        By continuing, you agree to RewriteGuard's{' '}
                        <button 
                            type="button"
                            onClick={() => onTermsClick && onTermsClick()}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            Terms of Service
                        </button>
                        {' '}and have read our{' '}
                        <button 
                            type="button"
                            onClick={() => onPrivacyClick && onPrivacyClick()}
                            className="text-blue-500 hover:underline cursor-pointer"
                        >
                            Privacy Policy
                        </button>.
                    </p>
                </div>
            </div>
        </div>
    );
}
