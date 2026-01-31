/**
 * Admin Dashboard page for monitoring system metrics and health.
 * Auth-protected - only accessible to admin users.
 */
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface MetricsSummary {
    total_requests: number;
    requests_last_hour: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    error_rate: number;
    uptime_seconds: number;
}

interface DetectionMetrics {
    total_detections: number;
    ai_detected: number;
    human_detected: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    f1_score: number;
}

interface EndpointMetrics {
    endpoint: string;
    request_count: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    error_count: number;
    error_rate: number;
}

interface LogEntry {
    level: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
}

interface AdminDashboard {
    summary: MetricsSummary;
    detection_metrics: DetectionMetrics;
    endpoint_breakdown: EndpointMetrics[];
    recent_errors: { endpoint: string; error: string; timestamp: string }[];
    generated_at: string;
}

const API_BASE = 'http://localhost:8000/v1/admin';

export default function AdminPage() {
    const { token } = useAuth();
    const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logLevel, setLogLevel] = useState<string>('all');
    const [autoRefresh, setAutoRefresh] = useState(false);

    const fetchData = async () => {
        if (!token) return;

        try {
            const [metricsRes, logsRes] = await Promise.all([
                fetch(`${API_BASE}/metrics`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/logs?level=${logLevel}&limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (metricsRes.status === 403) {
                setError('Admin access required. You do not have permission to view this page.');
                setIsLoading(false);
                return;
            }

            if (metricsRes.ok) {
                setDashboard(await metricsRes.json());
            }

            if (logsRes.ok) {
                const data = await logsRes.json();
                setLogs(data.logs || []);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, logLevel]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, token, logLevel]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-24 bg-slate-800/50 rounded-xl"></div>
                    <div className="h-24 bg-slate-800/50 rounded-xl"></div>
                    <div className="h-24 bg-slate-800/50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const getHealthColor = (errorRate: number) => {
        if (errorRate > 10) return 'text-red-400';
        if (errorRate > 5) return 'text-amber-400';
        return 'text-emerald-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">🛠️</span> Admin Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        System monitoring and metrics
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded bg-slate-700 border-slate-600"
                        />
                        Auto-refresh (5s)
                    </label>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="F1 Score"
                    value={`${(dashboard?.detection_metrics.f1_score || 0).toFixed(2)}`}
                    subtitle="Model Performance"
                    icon="🎯"
                    color="blue"
                />
                <MetricCard
                    title="P95 Latency"
                    value={`${(dashboard?.summary.p95_latency_ms || 0).toFixed(0)}ms`}
                    subtitle="95th Percentile"
                    icon="⚡"
                    color="purple"
                />
                <MetricCard
                    title="Error Rate"
                    value={`${(dashboard?.summary.error_rate || 0).toFixed(1)}%`}
                    subtitle="Last Hour"
                    icon="⚠️"
                    color={(dashboard?.summary.error_rate || 0) > 5 ? 'red' : 'green'}
                />
                <MetricCard
                    title="Uptime"
                    value={formatUptime(dashboard?.summary.uptime_seconds || 0)}
                    subtitle="Since Start"
                    icon="🟢"
                    color="green"
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Detection Metrics */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-xl">🔍</span> Detection Metrics
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total Detections</span>
                            <span className="text-white font-semibold">{dashboard?.detection_metrics.total_detections || 0}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">AI Detected</span>
                            <span className="text-red-400 font-semibold">{dashboard?.detection_metrics.ai_detected || 0}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Human Detected</span>
                            <span className="text-emerald-400 font-semibold">{dashboard?.detection_metrics.human_detected || 0}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">F1 Score</span>
                                <span className="text-blue-400 font-bold text-xl">{(dashboard?.detection_metrics.f1_score || 0).toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                    style={{ width: `${(dashboard?.detection_metrics.f1_score || 0) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Latency</span>
                            <span className="text-white">{(dashboard?.detection_metrics.avg_latency_ms || 0).toFixed(1)}ms</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">P95 Latency</span>
                            <span className="text-purple-400 font-semibold">{(dashboard?.detection_metrics.p95_latency_ms || 0).toFixed(1)}ms</span>
                        </div>
                    </div>
                </div>

                {/* Request Summary */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-xl">📊</span> Request Summary
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total Requests</span>
                            <span className="text-white font-semibold">{dashboard?.summary.total_requests || 0}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Last Hour</span>
                            <span className="text-cyan-400 font-semibold">{dashboard?.summary.requests_last_hour || 0}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Latency</span>
                            <span className="text-white">{(dashboard?.summary.avg_latency_ms || 0).toFixed(1)}ms</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">P95 Latency</span>
                            <span className="text-purple-400 font-semibold">{(dashboard?.summary.p95_latency_ms || 0).toFixed(1)}ms</span>
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Error Rate</span>
                                <span className={`font-bold text-xl ${getHealthColor(dashboard?.summary.error_rate || 0)}`}>
                                    {(dashboard?.summary.error_rate || 0).toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${(dashboard?.summary.error_rate || 0) > 10 ? 'bg-red-500' :
                                            (dashboard?.summary.error_rate || 0) > 5 ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${Math.min(100, (dashboard?.summary.error_rate || 0) * 10)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-xl">📜</span> Recent Logs
                    </h2>

                    <select
                        value={logLevel}
                        onChange={(e) => setLogLevel(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                        <option value="all">All Levels</option>
                        <option value="error">Errors</option>
                        <option value="warning">Warnings</option>
                        <option value="info">Info</option>
                    </select>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {logs.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No logs to display</p>
                    ) : (
                        logs.map((log, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-3 p-2 rounded-lg text-sm font-mono ${log.level === 'error' ? 'bg-red-500/10 text-red-300' :
                                        log.level === 'warning' ? 'bg-amber-500/10 text-amber-300' :
                                            'bg-slate-700/50 text-gray-300'
                                    }`}
                            >
                                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                                        log.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {log.level.toUpperCase()}
                                </span>
                                <span className="flex-1 break-all">{log.message}</span>
                                <span className="text-gray-500 text-xs whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Errors */}
            {dashboard?.recent_errors && dashboard.recent_errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <span className="text-xl">🚨</span> Recent Errors
                    </h2>

                    <div className="space-y-2">
                        {dashboard.recent_errors.map((err, i) => (
                            <div key={i} className="bg-red-500/10 rounded-lg p-3 text-sm">
                                <div className="flex justify-between items-start">
                                    <span className="text-red-300 font-medium">{err.endpoint}</span>
                                    <span className="text-red-400/60 text-xs">
                                        {new Date(err.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-red-200/80 mt-1 font-mono text-xs">{err.error}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Generated timestamp */}
            <p className="text-center text-gray-600 text-xs">
                Generated at {dashboard?.generated_at ? new Date(dashboard.generated_at).toLocaleString() : 'N/A'}
            </p>
        </div>
    );
}

// Metric Card Component
function MetricCard({
    title,
    value,
    subtitle,
    icon,
    color
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'red';
}) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        green: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-gray-500">{subtitle}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{title}</p>
        </div>
    );
}
