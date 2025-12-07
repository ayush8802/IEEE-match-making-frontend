/**
 * API Service
 * Centralized HTTP client with interceptors and error handling
 */

import axios from "axios";
import config from "../config/api";
import supabase from "../config/supabase";

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
    baseURL: config.BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - attach auth token
 */
apiClient.interceptors.request.use(
    async (config) => {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        // Attach token if available
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - handle errors
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the session
                const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

                if (refreshError || !session) {
                    // Refresh failed, redirect to login
                    window.location.href = "/";
                    return Promise.reject(error);
                }

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                window.location.href = "/";
                return Promise.reject(error);
            }
        }

        // Format error for better handling
        const formattedError = {
            message: error.response?.data?.error?.message || error.message || "An error occurred",
            status: error.response?.status,
            data: error.response?.data,
        };

        return Promise.reject(formattedError);
    }
);

/**
 * Generic API request function with retry logic
 * @param {Function} requestFn - Function that returns a promise
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Response data
 */
export async function apiRequest(requestFn, maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await requestFn();
            return response.data;
        } catch (error) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error.status && error.status >= 400 && error.status < 500) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

export default apiClient;
