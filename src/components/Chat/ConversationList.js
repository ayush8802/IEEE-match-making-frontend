/**
 * ConversationList Component
 * Displays list of conversations with last message, unread badges, and timestamps
 * Similar to WhatsApp/Telegram conversation list
 */

import React from "react";
import "./ConversationList.css";

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string
 */
function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Today - show time
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: "short" });
    } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
}

/**
 * ConversationList Component
 * @param {Object} props - Component props
 * @param {Array} props.conversations - Array of conversation objects
 * @param {Object} props.activeConversation - Currently selected conversation
 * @param {Function} props.onSelectConversation - Callback when a conversation is selected
 * @param {Array} props.availableUsers - Array of available users (for initial messaging)
 */
export default function ConversationList({
    conversations = [],
    activeConversation,
    onSelectConversation,
    availableUsers = [],
}) {
    // Combine conversations with available users who don't have conversations yet
    const allItems = [...conversations];

    // Add available users who don't have conversations yet
    availableUsers.forEach((user) => {
        const hasConversation = conversations.some(
            (conv) => conv.otherUser?.email === user.Email || conv.otherUser?.email === user.email
        );
        if (!hasConversation) {
            allItems.push({
                id: `user-${user.Email || user.email}`,
                conversationId: null,
                otherUser: {
                    id: user.id,
                    email: user.Email || user.email,
                    name: user.name,
                    photo: user.photo,
                },
                lastMessage: null,
                lastMessageAt: null,
                unreadCount: 0,
                isAvailableUser: true, // Flag to indicate this is from available users list
            });
        }
    });

    // Sort by last message time (most recent first)
    allItems.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
    });

    // Empty state
    if (allItems.length === 0) {
        return (
            <aside className="conversation-list">
                <header>
                    <h3>Messages</h3>
                </header>
                <div className="conversation-list-empty">
                    <p>No conversations yet. Start chatting with recommended researchers!</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className="conversation-list">
            <header>
                <h3>Messages</h3>
            </header>
            <div className="conversation-items">
                {allItems.map((item) => {
                    const isActive = activeConversation?.id === item.id || activeConversation?.conversationId === item.conversationId;
                    const hasUnread = item.unreadCount > 0;

                    return (
                        <div
                            key={item.id}
                            className={`conversation-item ${isActive ? "active" : ""} ${hasUnread ? "unread" : ""}`}
                            onClick={() => onSelectConversation(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    onSelectConversation(item);
                                }
                            }}
                            aria-label={`Open conversation with ${item.otherUser?.name || "user"}`}
                        >
                            <div className="conversation-avatar">
                                <img
                                    src={
                                        item.otherUser?.photo ||
                                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                                    }
                                    alt={item.otherUser?.name || "User"}
                                    onError={(e) => {
                                        e.target.src =
                                            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                                    }}
                                />
                                {hasUnread && <span className="unread-badge">{item.unreadCount > 99 ? "99+" : item.unreadCount}</span>}
                            </div>
                            <div className="conversation-info">
                                <div className="conversation-header">
                                    <h4 className="conversation-name">{item.otherUser?.name || item.otherUser?.email || "Unknown"}</h4>
                                    {item.lastMessageAt && (
                                        <span className="conversation-time">{formatTime(item.lastMessageAt)}</span>
                                    )}
                                </div>
                                <div className="conversation-preview">
                                    {item.lastMessage ? (
                                        <>
                                            <span className={`preview-text ${hasUnread ? "unread" : ""}`}>
                                                {item.lastMessage.isFromMe ? "You: " : ""}
                                                {item.lastMessage.content || item.lastMessage.text || ""}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="preview-text empty">No messages yet</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}



