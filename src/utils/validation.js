/**
 * Form Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param {string} url - URL string
 * @returns {boolean} Valid URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate LinkedIn URL
 * @param {string} url - LinkedIn URL
 * @returns {boolean} Valid LinkedIn URL
 */
export function isValidLinkedInUrl(url) {
    if (!url) return true; // Optional field
    return isValidUrl(url) && url.includes("linkedin.com");
}

/**
 * Validate required field
 * @param {any} value - Field value
 * @returns {boolean} Has value
 */
export function isRequired(value) {
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (typeof value === "string") {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
}

/**
 * Validate array length
 * @param {Array} arr - Array to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} Valid length
 */
export function isValidArrayLength(arr, min, max) {
    if (!Array.isArray(arr)) return false;
    return arr.length >= min && arr.length <= max;
}

export default {
    isValidEmail,
    isValidUrl,
    isValidLinkedInUrl,
    isRequired,
    isValidArrayLength,
};
