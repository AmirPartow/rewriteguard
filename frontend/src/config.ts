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

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
