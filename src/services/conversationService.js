/**
 * Conversation Service
 * API calls for conversation operations
 */

import apiClient, { apiRequest } from "./api";
import { API_ENDPOINTS } from "../config/api";

/**
 * Get all conversations for the current user
 * @returns {Promise<Object>} Response data with conversations array
 */
export async function getConversations() {
    return apiRequest(() => apiClient.get(API_ENDPOINTS.CONVERSATIONS));
}

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} Response data with messages array
 */
export async function getConversationMessages(conversationId) {
    return apiRequest(() => apiClient.get(API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId)));
}

/**
 * Mark all messages in a conversation as read
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} Response data
 */
export async function markConversationAsRead(conversationId) {
    return apiRequest(() => apiClient.post(API_ENDPOINTS.CONVERSATION_MARK_READ(conversationId)));
}

export default {
    getConversations,
    getConversationMessages,
    markConversationAsRead,
};



