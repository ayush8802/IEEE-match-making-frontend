/**
 * API Configuration
 * Centralized API URL configuration
 */

/**
 * Get the API base URL from environment variables
 * Falls back to localhost for development
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    // Questionnaire
    QUESTIONNAIRE_SAVE: `${API_BASE_URL}/questionnaire/save`,
    QUESTIONNAIRE_ME: `${API_BASE_URL}/questionnaire/me`,

    // Health check
    HEALTH: `${API_BASE_URL}/health`,
};

export default {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: API_ENDPOINTS,
};
