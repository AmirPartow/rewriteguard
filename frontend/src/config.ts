/**
 * API Configuration
 *
 * Environment-based URL resolution:
 * - Local development: http://localhost:8000 (default)
 * - Production: https://api.rewritguard.com (set via VITE_API_URL)
 *
 * Set VITE_API_URL in Vercel environment variables for production deployment.
 */

// API Base URL — reads from Vercel/Vite env, falls back to production EC2
export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://52.32.253.222';

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
