/**
 * ChatSidebar Component
 * Displays list of users available for chatting
 * Shows mutual recommendations from questionnaire
 */

import React from "react";

/**
 * ChatSidebar Component
 * @param {Object} props - Component props
 * @param {Array} props.users - Array of user objects to display
 * @param {Object} props.activeUser - Currently selected user
 * @param {Function} props.onSelectUser - Callback when a user is selected
 */
export default function ChatSidebar({ users, activeUser, onSelectUser }) {
    // Empty state - no users available
    if (!users || users.length === 0) {
        return (
            <aside className="chat-sidebar">
                <header>
                    <h3>Messages</h3>
                </header>
                <div className="chat-users-list">
                    <p style={{ padding: "20px", color: "var(--color-text-light)" }}>
                        No mutual recommendations found.
                    </p>
                </div>
            </aside>
        );
    }

    // Main render with user list
    return (
        <aside className="chat-sidebar">
            <header>
                <h3>Messages</h3>
            </header>
            <div className="chat-users-list">
                {users.map((user, idx) => (
                    <div
                        key={idx}
                        className={`chat-user-item ${
                            activeUser && activeUser.name === user.name ? "active" : ""
                        }`}
                        onClick={() => onSelectUser(user)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                onSelectUser(user);
                            }
                        }}
                        aria-label={`Select ${user.name}`}
                    >
                        <img
                            src={
                                user.photo && user.photo !== "not found"
                                    ? user.photo
                                    : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                            }
                            alt={user.name}
                            className="chat-user-avatar"
                        />
                        <div className="chat-user-info">
                            <h4>{user.name}</h4>
                            <p>{user.field || "Researcher"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
