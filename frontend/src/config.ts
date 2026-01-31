/**
 * API Configuration
 * 
 * Change API_BASE_URL to point to your backend server.
 * - For local development: http://localhost:8000
 * - For AWS production: https://your-aws-api-url.com
 */

// Set this to your AWS backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API endpoints
export const API = {
    AUTH: `${API_BASE_URL}/v1/auth`,
    QUOTA: `${API_BASE_URL}/v1/quota`,
    JOBS: `${API_BASE_URL}/v1/jobs`,
    ADMIN: `${API_BASE_URL}/v1/admin`,
    DETECT: `${API_BASE_URL}/v1/detect`,
    PARAPHRASE: `${API_BASE_URL}/v1/paraphrase`,
};
