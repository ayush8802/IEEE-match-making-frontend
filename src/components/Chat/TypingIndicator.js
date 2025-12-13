/**
 * TypingIndicator Component
 * Displays typing indicators for users who are currently typing
 */

import React from "react";
import "./TypingIndicator.css";

/**
 * TypingIndicator Component
 * @param {Object} props - Component props
 * @param {Array} props.users - Array of user objects who are typing
 */
export default function TypingIndicator({ users }) {
    // Don't render if no users are typing
    if (!users || users.length === 0) {
        return null;
    }

    // Render typing indicator for each user
    return (
        <div className="typing-indicator">
            {users.map((u) => (
                <span key={u.id} className="typing-user">
                    {u.name || "Someone"} is typing...
                </span>
            ))}
        </div>
    );
}
