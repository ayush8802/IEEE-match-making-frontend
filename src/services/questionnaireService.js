/**
 * Questionnaire Service
 * API calls for questionnaire operations
 */

import apiClient, { apiRequest } from "./api";
import { API_ENDPOINTS } from "../config/api";

/**
 * Save questionnaire response
 * @param {Object} answers - Questionnaire answers
 * @returns {Promise<Object>} Response data
 */
export async function saveQuestionnaire(answers) {
    return apiRequest(() =>
        apiClient.post(API_ENDPOINTS.QUESTIONNAIRE_SAVE, { answers })
    );
}

/**
 * Get current user's questionnaire response
 * @returns {Promise<Object>} Questionnaire data
 */
export async function getQuestionnaire() {
    return apiRequest(() =>
        apiClient.get(API_ENDPOINTS.QUESTIONNAIRE_ME)
    );
}

export default {
    saveQuestionnaire,
    getQuestionnaire,
};
