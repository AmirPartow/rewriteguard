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

    // Test Trustpilot AFS Email integration locally
    const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
    const handleTestTrustpilot = async () => {
        if (!token) return;
        try {
            setTestEmailStatus('Sending test email...');
            const res = await fetch(`${API_BASE}/subscriptions/test-trustpilot-email`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTestEmailStatus(data.message || 'Success! Check backend console for mock email.');
            } else {
                setTestEmailStatus(`Failed to send email. ${data.detail || ''}`);
            }
        } catch (err) {
            setTestEmailStatus('Error: Could not connect to server.');
        }
        setTimeout(() => setTestEmailStatus(null), 5000);
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-slate-800/50 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-gray-200 dark:bg-slate-800/50 rounded-2xl"></div>
                    <div className="h-64 bg-gray-200 dark:bg-slate-800/50 rounded-2xl"></div>
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
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 relative transition-colors shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
                            Welcome back, {user?.full_name || 'User'}! 👋
                        </h1>
                        <p className="text-slate-600 dark:text-gray-400 font-medium transition-colors">
                            Here's your usage overview for today
                        </p>
                    </div>

                    {/* Trustpilot Local Test Trigger */}
                    <div className="text-right flex flex-col items-end">
                        <button
                            onClick={handleTestTrustpilot}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 rounded-lg text-sm border border-indigo-200 dark:border-indigo-500/30 transition-all font-bold"
                        >
                            Test Trustpilot AFS
                        </button>
                        {testEmailStatus && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 block font-medium">{testEmailStatus}</span>
                        )}
                    </div>
                </div>
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
                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-2xl p-6 transition-colors shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                        <span className="text-2xl">📈</span> Daily Usage
                    </h2>

                    {/* Plan Badge */}
                    <div className="flex items-center justify-between mb-6">
                        <div className={`px-4 py-2 rounded-xl text-sm font-black ${usage?.plan_type === 'premium'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                            : 'bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300'
                            } transition-all`}>
                            {usage?.plan_type === 'premium' ? '⭐ Premium Plan' : '🆓 Free Plan'}
                        </div>
                        <span className="text-slate-500 dark:text-gray-400 text-sm font-bold transition-colors">
                            {usage?.daily_limit.toLocaleString()} words/day
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-3 font-bold">
                            <span className="text-slate-500 dark:text-gray-400">Usage</span>
                            <span className="text-slate-900 dark:text-white transition-colors">{usage?.percentage_used || 0}%</span>
                        </div>
                        <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                            <div
                                className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700 shadow-sm`}
                                style={{ width: `${Math.min(100, usage?.percentage_used || 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-slate-700 transition-colors">
                        <div className="text-center group">
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 transition-colors">{usage?.words_detect.toLocaleString() || 0}</p>
                            <p className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1">🔍 Detection</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">{usage?.words_paraphrase.toLocaleString() || 0}</p>
                            <p className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1">✍️ Paraphrase</p>
                        </div>
                    </div>
                </div>

                {/* Recent Jobs Card */}
                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-2xl p-6 transition-colors shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                        <span className="text-2xl">📋</span> Recent Jobs
                    </h2>

                    {jobs.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 dark:text-gray-500">
                            <p className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</p>
                            <p className="font-medium">No jobs yet. Start analyzing or paraphrasing text!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-slate-600 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${job.job_type === 'detect'
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                            } transition-colors`}>
                                            {job.job_type === 'detect' ? '🔍 Detect' : '✍️ Paraphrase'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold">
                                            {new Date(job.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-gray-400 truncate font-medium transition-colors">{job.input_preview}</p>
                                    <p className="text-[11px] text-slate-400 dark:text-gray-600 mt-2 font-bold">{job.word_count} words</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Comparison */}
            {usage?.plan_type === 'free' && plans.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2.5rem] p-10 transition-colors shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 transition-colors tracking-tight">
                        <span className="text-3xl animate-bounce">⭐</span> Upgrade to Premium
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`rounded-[2rem] p-8 border-2 transition-all ${plan.name === 'premium'
                                    ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border-amber-400/50 dark:border-amber-500/30'
                                    : 'bg-white dark:bg-slate-800/50 border-gray-100 dark:border-slate-700/50 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-xl font-black capitalize ${plan.name === 'premium' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{plan.name} Plan</h3>
                                    <span className={`text-2xl font-black ${plan.name === 'premium' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-gray-500'}`}>
                                        {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                                    </span>
                                </div>

                                <p className={`text-4xl font-black mb-6 ${plan.name === 'premium' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-500'}`}>
                                    {plan.daily_limit.toLocaleString()}
                                    <span className="text-sm font-bold opacity-60"> words/day</span>
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-gray-400 font-bold flex items-center gap-3">
                                            <span className="text-emerald-500 text-lg">✓</span> {feature}
                                        </li>
                                    ))}
                                </ul>

                                {plan.name === 'premium' && (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
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
        blue: 'from-blue-500/5 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/20 border-blue-200 dark:border-blue-500/30 hover:border-blue-300',
        green: 'from-emerald-500/5 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/20 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-300',
        purple: 'from-purple-500/5 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/20 border-purple-200 dark:border-purple-500/30 hover:border-purple-300',
        cyan: 'from-cyan-500/5 to-cyan-600/5 dark:from-cyan-500/20 dark:to-cyan-600/20 border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-300',
        red: 'from-red-500/5 to-red-600/5 dark:from-red-500/20 dark:to-red-600/20 border-red-200 dark:border-red-500/30 hover:border-red-300',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border-2 rounded-[2rem] p-6 transition-all hover:scale-[1.05] group cursor-default shadow-sm hover:shadow-lg`}>
            <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">{icon}</div>
            <p className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{value}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1 transition-colors">{title}</p>
        </div>
    );
}
