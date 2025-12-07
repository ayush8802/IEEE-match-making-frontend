/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

import React from "react";
import "../styles/components.css";

/**
 * LoadingSpinner component
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message
 * @param {string} props.size - Size of spinner (small, medium, large)
 */
export default function LoadingSpinner({ message = "Loading...", size = "medium" }) {
    return (
        <div className="loading-spinner-container">
            <div className={`loading-spinner ${size}`}>
                <div className="spinner"></div>
            </div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
}
