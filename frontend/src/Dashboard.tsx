/**
 * User Dashboard component with usage stats, recent jobs, and plan info.
 */
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from './config';

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

interface JobRecord {
    id: number;
    user_id: number;
    job_type: 'detect' | 'paraphrase';
    input_preview: string;
    word_count: number;
    status: string;
    created_at: string;
}

interface JobStats {
    total_jobs: number;
    detect_jobs: number;
    paraphrase_jobs: number;
    total_words_processed: number;
}

interface Plan {
    name: string;
    daily_limit: number;
    price: number;
    features: string[];
}

const API_BASE = `${API_BASE_URL}/v1`;

export default function Dashboard() {
    const { token, user } = useAuth();
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [jobs, setJobs] = useState<JobRecord[]>([]);
    const [jobStats, setJobStats] = useState<JobStats | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [usageRes, jobsRes, statsRes, plansRes] = await Promise.all([
                fetch(`${API_BASE}/quota/usage`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/jobs/recent?limit=5`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/jobs/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/quota/plans`),
            ]);

            if (usageRes.ok) {
                setUsage(await usageRes.json());
            }

            if (jobsRes.ok) {
                const data = await jobsRes.json();
                setJobs(data.jobs || []);
            }

            if (statsRes.ok) {
                setJobStats(await statsRes.json());
            }

            if (plansRes.ok) {
                const data = await plansRes.json();
                setPlans(data.plans || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!token) return;

        setIsUpgrading(true);

        try {
            const response = await fetch(`${API_BASE}/quota/upgrade`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                await fetchData(); // Refresh data
            }
        } catch {
            // Silent fail
        } finally {
            setIsUpgrading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-48 bg-slate-800/50 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
                    <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const progressColor = (usage?.percentage_used || 0) >= 90
        ? 'from-red-500 to-red-600'
        : (usage?.percentage_used || 0) >= 70
            ? 'from-amber-500 to-orange-500'
            : 'from-emerald-500 to-cyan-500';

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Welcome back, {user?.full_name || 'User'}! 👋
                </h1>
                <p className="text-gray-400">
                    Here's your usage overview for today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Words Today"
                    value={usage?.words_used_today.toLocaleString() || '0'}
                    icon="📝"
                    color="blue"
                />
                <StatCard
                    title="Remaining"
                    value={usage?.words_remaining.toLocaleString() || '0'}
                    icon="⏳"
                    color={usage && usage.words_remaining < 100 ? 'red' : 'green'}
                />
                <StatCard
                    title="Total Jobs"
                    value={jobStats?.total_jobs.toString() || '0'}
                    icon="📊"
                    color="purple"
                />
                <StatCard
                    title="Words Processed"
                    value={jobStats?.total_words_processed.toLocaleString() || '0'}
                    icon="✨"
                    color="cyan"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Usage Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📈</span> Daily Usage
                    </h2>

                    {/* Plan Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${usage?.plan_type === 'premium'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-slate-700 text-gray-300'
                            }`}>
                            {usage?.plan_type === 'premium' ? '⭐ Premium Plan' : '🆓 Free Plan'}
                        </div>
                        <span className="text-gray-400 text-sm">
                            {usage?.daily_limit.toLocaleString()} words/day
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Usage</span>
                            <span className="text-white font-medium">{usage?.percentage_used || 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(100, usage?.percentage_used || 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{usage?.words_detect.toLocaleString() || 0}</p>
                            <p className="text-sm text-gray-500">🔍 Detection</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-400">{usage?.words_paraphrase.toLocaleString() || 0}</p>
                            <p className="text-sm text-gray-500">✍️ Paraphrase</p>
                        </div>
                    </div>
                </div>

                {/* Recent Jobs Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span> Recent Jobs
                    </h2>

                    {jobs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">🚀</p>
                            <p>No jobs yet. Start analyzing or paraphrasing text!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 hover:border-slate-600 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${job.job_type === 'detect'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {job.job_type === 'detect' ? '🔍 Detect' : '✍️ Paraphrase'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(job.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{job.input_preview}</p>
                                    <p className="text-xs text-gray-600 mt-1">{job.word_count} words</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Comparison */}
            {usage?.plan_type === 'free' && plans.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">⭐</span> Upgrade to Premium
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`rounded-xl p-5 border ${plan.name === 'premium'
                                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30'
                                    : 'bg-slate-800/50 border-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white capitalize">{plan.name}</h3>
                                    <span className="text-2xl font-bold text-white">
                                        {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                                    </span>
                                </div>

                                <p className="text-3xl font-bold text-white mb-4">
                                    {plan.daily_limit.toLocaleString()}
                                    <span className="text-sm font-normal text-gray-400"> words/day</span>
                                </p>

                                <ul className="space-y-2 mb-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                                            <span className="text-emerald-400">✓</span> {feature}
                                        </li>
                                    ))}
                                </ul>

                                {plan.name === 'premium' && (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                                    >
                                        {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'cyan' | 'red';
}) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        green: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{title}</p>
        </div>
    );
}
