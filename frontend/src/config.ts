/**
 * API Configuration
 *
 * URL resolution priority:
 * 1. VITE_API_URL env var (set in Vercel for production)
 * 2. Auto-detect: localhost → http://localhost:8000 (local dev)
 * 3. Fallback: http://52.32.253.222 (production EC2)
 *
 * This means BOTH local dev AND production work automatically.
 */

// Auto-detect environment
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// API Base URL — env var → auto-detect → production fallback
export const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (isLocalhost ? 'http://localhost:8000' : 'http://52.32.253.222');

// API endpoints
export const API = {
    AUTH: `${API_BASE_URL}/v1/auth`,
    QUOTA: `${API_BASE_URL}/v1/quota`,
    JOBS: `${API_BASE_URL}/v1/jobs`,
    ADMIN: `${API_BASE_URL}/v1/admin`,
    SUBSCRIPTIONS: `${API_BASE_URL}/v1/subscriptions`,
    DETECT: `${API_BASE_URL}/v1/detect`,
    PARAPHRASE: `${API_BASE_URL}/v1/paraphrase`,
    HEALTH: `${API_BASE_URL}/health`,
};
