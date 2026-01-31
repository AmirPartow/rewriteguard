/**
 * Authentication context and hook for managing user auth state.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types
interface User {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const API_BASE = 'http://localhost:8000/v1/auth';

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const TOKEN_KEY = 'rewriteguard_token';
const USER_KEY = 'rewriteguard_user';

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const [error, setError] = useState<string | null>(null);

    // Load saved auth state on mount
    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setState({
                    user,
                    token: savedToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch {
                // Invalid saved data, clear it
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
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Signup failed');
            }

            // Auto-login after signup
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

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            // Save auth data
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            setState({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            if (state.token) {
                await fetch(`${API_BASE}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${state.token}`,
                    },
                });
            }
        } catch {
            // Ignore logout API errors
        }

        // Clear local state
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{
            ...state,
            login,
            signup,
            logout,
            error,
            clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
