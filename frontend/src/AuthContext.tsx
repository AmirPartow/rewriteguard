/**
 * Authentication context that bridges Clerk with the rest of the app.
 * Falls back to legacy auth when Clerk is not configured.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API } from './config';

// Conditionally import Clerk hooks (only available when ClerkProvider is present)
let useClerkUser: any = () => ({ user: null, isLoaded: true, isSignedIn: false });
let useClerkAuth: any = () => ({ getToken: async () => null, signOut: async () => {} });
try {
    const clerk = require('@clerk/clerk-react');
    useClerkUser = clerk.useUser;
    useClerkAuth = clerk.useAuth;
} catch { /* Clerk not available */ }

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';

// Types
interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName?: string) => Promise<void>;
    socialLogin: (provider: string, providerId: string, email: string, fullName?: string) => Promise<void>;
    socialConfirm: (provider: string, code: string, redirectUri: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = API.AUTH;
const TOKEN_KEY = 'rewriteguard_token';
const USER_KEY = 'rewriteguard_user';
const BACKEND_USER_KEY = 'rewriteguard_backend_user';

/**
 * Clerk-backed auth provider (used when VITE_CLERK_PUBLISHABLE_KEY is set)
 */
function ClerkAuthProvider({ children }: { children: ReactNode }) {
    const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
    const { getToken, signOut } = useClerkAuth();

    const [backendUser, setBackendUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem(BACKEND_USER_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    const clearError = useCallback(() => setError(null), []);

    // Sync Clerk user to backend on sign-in
    useEffect(() => {
        if (!clerkLoaded) return;

        if (!isSignedIn) {
            setBackendUser(null);
            setToken(null);
            localStorage.removeItem(BACKEND_USER_KEY);
            return;
        }

        const syncUser = async () => {
            setSyncing(true);
            try {
                const clerkToken = await getToken();
                if (!clerkToken) return;
                setToken(clerkToken);

                const email = clerkUser?.primaryEmailAddress?.emailAddress || '';
                const fullName = clerkUser?.fullName || '';
                const clerkId = clerkUser?.id || '';

                const res = await fetch(`${API_BASE}/clerk-sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${clerkToken}`,
                    },
                    body: JSON.stringify({
                        clerk_user_id: clerkId,
                        email,
                        full_name: fullName,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    const user: User = {
                        id: data.user_id,
                        email: data.email,
                        full_name: data.full_name || fullName,
                        is_active: true,
                    };
                    setBackendUser(user);
                    localStorage.setItem(BACKEND_USER_KEY, JSON.stringify(user));
                }
            } catch (err) {
                console.error('Backend user sync failed:', err);
            } finally {
                setSyncing(false);
            }
        };

        syncUser();
    }, [clerkLoaded, isSignedIn, clerkUser?.id]);

    // Refresh Clerk token periodically
    useEffect(() => {
        if (!isSignedIn) return;
        const interval = setInterval(async () => {
            try {
                const newToken = await getToken();
                if (newToken) setToken(newToken);
            } catch { /* ignore */ }
        }, 50_000);
        return () => clearInterval(interval);
    }, [isSignedIn, getToken]);

    const login = async () => {};
    const signup = async () => {};
    const socialLogin = async () => {};
    const socialConfirm = async () => {};

    const logout = async () => {
        try { await signOut(); } catch { /* ignore */ }
        setBackendUser(null);
        setToken(null);
        localStorage.removeItem(BACKEND_USER_KEY);
    };

    return (
        <AuthContext.Provider value={{
            user: backendUser,
            token,
            isAuthenticated: !!isSignedIn && !!backendUser,
            isLoading: !clerkLoaded || syncing,
            login, signup, socialLogin, socialConfirm, logout,
            error, clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Legacy auth provider (used when Clerk is NOT configured)
 */
function LegacyAuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState({
        user: null as User | null,
        token: null as string | null,
        isAuthenticated: false,
        isLoading: true,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setState({ user, token: savedToken, isAuthenticated: true, isLoading: false });
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setState(s => ({ ...s, isLoading: false }));
            }
        } else {
            setState(s => ({ ...s, isLoading: false }));
        }
    }, []);

    const clearError = () => setError(null);

    const signup = async (email: string, password: string, fullName = '') => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Signup failed');
            await login(email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            setError(message);
            throw err;
        }
    };

    const login = async (email: string, password: string) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Login failed');
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        }
    };

    const socialLogin = async (provider: string, providerId: string, email: string, fullName = '') => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/social-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, provider_id: providerId, email, full_name: fullName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Social login failed');
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Social login failed';
            setError(message);
            throw err;
        }
    };

    const socialConfirm = async (provider: string, code: string, redirectUri: string) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/social-confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, code, redirect_uri: redirectUri }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Social confirmation failed');
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setState({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Social confirmation failed';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            if (state.token) {
                await fetch(`${API_BASE}/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${state.token}` },
                });
            }
        } catch { /* ignore */ }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    };

    return (
        <AuthContext.Provider value={{
            ...state, login, signup, socialLogin, socialConfirm, logout, error, clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Picks the right provider based on whether Clerk is configured.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    if (CLERK_KEY) {
        return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
    }
    return <LegacyAuthProvider>{children}</LegacyAuthProvider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
