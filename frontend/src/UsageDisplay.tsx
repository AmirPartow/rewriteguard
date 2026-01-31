/**
 * Usage stats component showing daily word quota usage.
 */
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API } from './config';

interface UsageStats {
    user_id: number;
    plan_type: 'free' | 'premium';
    daily_limit: number;
    words_used_today: number;
    words_detect: number;
    words_paraphrase: number;
    words_remaining: number;
    usage_date: string;
    percentage_used: number;
}

const API_BASE = API.QUOTA;

export default function UsageDisplay() {
    const { token, isAuthenticated } = useAuth();
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const fetchUsage = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/usage`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch usage');
            }

            const data = await response.json();
            setUsage(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load usage');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!token) return;

        setIsUpgrading(true);

        try {
            const response = await fetch(`${API_BASE}/upgrade`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to upgrade');
            }

            // Refresh usage after upgrade
            await fetchUsage();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upgrade');
        } finally {
            setIsUpgrading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsage();
        }
    }, [isAuthenticated, token]);

    if (!isAuthenticated) return null;

    if (isLoading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
                <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                    <div className="flex-1">
                        <div className="h-3 bg-slate-700 rounded w-24 mb-2"></div>
                        <div className="h-2 bg-slate-700 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !usage) {
        return null; // Silently fail
    }

    const progressColor = usage.percentage_used >= 90
        ? 'from-red-500 to-red-600'
        : usage.percentage_used >= 70
            ? 'from-amber-500 to-orange-500'
            : 'from-emerald-500 to-cyan-500';

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${usage.plan_type === 'premium'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-slate-700 text-gray-300'
                        }`}>
                        {usage.plan_type === 'premium' ? '⭐ Premium' : 'Free'}
                    </div>
                    <span className="text-gray-400 text-sm">Daily Usage</span>
                </div>

                {usage.plan_type === 'free' && (
                    <button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                    >
                        {isUpgrading ? 'Upgrading...' : 'Upgrade to Premium →'}
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, usage.percentage_used)}%` }}
                />
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                    <span className="text-white font-medium">{usage.words_used_today.toLocaleString()}</span>
                    {' / '}
                    {usage.daily_limit.toLocaleString()} words
                </span>
                <span className={`font-medium ${usage.words_remaining < 100 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                    {usage.words_remaining.toLocaleString()} remaining
                </span>
            </div>

            {/* Breakdown tooltip on hover */}
            <div className="mt-2 pt-2 border-t border-slate-700/50 flex gap-4 text-xs text-gray-500">
                <span>🔍 Detect: {usage.words_detect.toLocaleString()}</span>
                <span>✍️ Paraphrase: {usage.words_paraphrase.toLocaleString()}</span>
            </div>
        </div>
    );
}
