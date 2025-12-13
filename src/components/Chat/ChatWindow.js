/**
 * ChatWindow Component
 * Main chat interface displaying messages and input area
 * Handles real-time messaging via Socket.io
 */

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./ChatWindow.css";
import TypingIndicator from "./TypingIndicator";

/**
 * Get socket URL from environment or default to localhost
 */
const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL ||
    process.env.REACT_APP_API_URL?.replace("/api/v1", "") ||
    "http://localhost:5000";

/**
 * ChatWindow Component
 * @param {Object} props - Component props
 * @param {Object} props.activeUser - The user we are chatting with (object with id, name, email, photo)
 * @param {Array} props.messages - Initial messages array
 * @param {Object} props.currentUser - The logged-in user (object with id, name, email)
 * @param {Function} props.onSendMessage - Callback when sending a message (optional, for backward compatibility)
 */
export default function ChatWindow({ activeUser, messages = [], currentUser, onSendMessage, socket: providedSocket }) {
    const [inputValue, setInputValue] = useState("");
    const [typingUsers, setTypingUsers] = useState([]);
    const [messageStatuses, setMessageStatuses] = useState({});
    const [localMessages, setLocalMessages] = useState(messages);
    const [moderationWarning, setModerationWarning] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    /**
     * Sync local messages when prop changes
     */
    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    /**
     * Auto-scroll to bottom when messages update
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages]);

    /**
     * Initialize socket connection and set up event listeners
     * Use provided socket if available, otherwise create new one
     */
    useEffect(() => {
        if (!currentUser) return;

        // Use provided socket if available, otherwise create new connection
        if (providedSocket) {
            socketRef.current = providedSocket;
        } else {
            // Create socket connection with user ID in query (fallback if no socket provided)
            socketRef.current = io(SOCKET_URL, {
                query: { userId: currentUser.id },
                transports: ["websocket", "polling"],
            });

            // Join current user's room
            socketRef.current.emit("join_user", currentUser.id);
        }

        const socket = socketRef.current;
        if (!socket) return;

        // Listen for typing status updates
        socket.on("typing_status", ({ userId, isTyping }) => {
            setTypingUsers((prev) => {
                if (isTyping) {
                    return prev.find((u) => u.id === userId) ? prev : [...prev, { id: userId, name: "" }];
                }
                return prev.filter((u) => u.id !== userId);
            });
        });

        // Note: We don't listen to "receive_message" here because Chat.js already handles
        // all incoming messages and updates the messages prop, which we sync to localMessages.
        // This prevents duplicate messages from being added.

        // Listen for message status updates (sent/delivered/read)
        socket.on("message_status_update", ({ messageId, status }) => {
            setMessageStatuses((prev) => ({ ...prev, [messageId]: status }));
        });

        // Listen for read acknowledgements
        socket.on("messages_read", ({ messageIds }) => {
            setMessageStatuses((prev) => {
                const updated = { ...prev };
                messageIds.forEach((id) => {
                    updated[id] = "read";
                });
                return updated;
            });
        });

        // Listen for blocked messages from backend
        const handleMessageBlocked = ({ reason, content }) => {
            console.warn("🚫 Message blocked in ChatWindow", { reason, content });
            setModerationWarning({ 
                reason: reason || "This message violates community guidelines.",
                content: content || ""
            });
            // Auto-hide warning after 10 seconds
            setTimeout(() => {
                setModerationWarning(null);
            }, 10000);
        };
        
        socket.on("message_blocked", handleMessageBlocked);
        console.log("✅ ChatWindow: message_blocked listener registered");

        // Cleanup on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            // Only disconnect if we created the socket (not if it was provided)
            if (socket && !providedSocket) {
                socket.removeAllListeners();
                socket.disconnect();
                socketRef.current = null;
            } else if (socket) {
                // Just remove listeners if socket was provided (don't disconnect)
                socket.removeListener("typing_status", socket._events?.typing_status);
                socket.removeListener("message_status_update", socket._events?.message_status_update);
                socket.removeListener("messages_read", socket._events?.messages_read);
                socket.removeListener("message_blocked", handleMessageBlocked);
            }
        };
    }, [currentUser, providedSocket, activeUser]); // Include activeUser to update listeners when conversation changes

    /**
     * Handle message form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Clear typing indicator when sending message
        const socketToUse = providedSocket || socketRef.current;
        if (socketToUse && activeUser && currentUser) {
            // Stop typing indicator
            const receiverEmail = activeUser.Email || activeUser.email;
            socketToUse.emit("typing", {
                receiver_id: activeUser.id || null,
                receiver_email: receiverEmail,
                isTyping: false,
            });
        }

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        // Don't add optimistic message here - let Chat.js handle message state
        // The message will appear via socket receive_message or API refresh
        
        // Call onSendMessage callback - this will handle sending via socket
        // Chat.js's handleSendMessage emits the socket event, so we don't emit here to avoid duplicates
        if (onSendMessage) {
            onSendMessage(inputValue);
        } else if (socketToUse && currentUser && activeUser) {
            // Fallback: only emit directly if onSendMessage is not provided
            socketToUse.emit("send_message", {
                sender_id: currentUser.id,
                sender_email: currentUser.email,
                receiver_id: activeUser.id || null,
                receiver_email: activeUser.Email || activeUser.email,
                content: inputValue,
            });
        }

        setInputValue("");
    };

    /**
     * Handle input change and send typing indicators
     * @param {Event} e - Input change event
     */
    const handleInputChange = (e) => {
        setInputValue(e.target.value);

        const socketToUse = providedSocket || socketRef.current;
        if (socketToUse && activeUser && currentUser) {
            const receiverEmail = activeUser.Email || activeUser.email;

            // Send typing start indicator
            socketToUse.emit("typing", {
                receiver_id: activeUser.id || null,
                receiver_email: receiverEmail,
                isTyping: true,
            });

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing indicator after 1 second of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                if (socketToUse) {
                    socketToUse.emit("typing", {
                        receiver_id: activeUser.id || null,
                        receiver_email: receiverEmail,
                        isTyping: false,
                    });
                }
            }, 1000);
        }
    };

    /**
     * Get status icon for message (WhatsApp-style)
     * @param {string} messageId - Message ID
     * @returns {JSX.Element} - Status icon component
     */
    const getStatusIcon = (messageId) => {
        const status = messageStatuses[messageId] || localMessages.find((m) => m.id === messageId)?.status || "sent";
        
        // WhatsApp-style indicators
        if (status === "sent") {
            return <span className="message-status-icon sent">✓</span>; // Single grey tick
        }
        if (status === "delivered") {
            return <span className="message-status-icon delivered">✓✓</span>; // Double grey tick
        }
        if (status === "read") {
            return <span className="message-status-icon read">✓✓</span>; // Double blue tick
        }
        return <span className="message-status-icon pending">⏳</span>; // Pending
    };

    // Show empty state if no active user
    if (!activeUser) {
        return (
            <main className="chat-window">
                <div className="empty-chat">
                    <div>
                        <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--color-text-main, #f1f5f9)" }}>
                            Select a conversation
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "var(--color-text-light, #94a3b8)" }}>
                            Choose a researcher from the list to start chatting
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // Main render
    return (
        <main className="chat-window">
            {/* Chat Header */}
            <header className="chat-header">
                <img
                    src={
                        activeUser.photo && activeUser.photo !== "not found"
                            ? activeUser.photo
                            : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                    }
                    alt={activeUser.name}
                    onError={(e) => {
                        e.target.src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                    }}
                />
            <h3>{activeUser.name || activeUser.email || "Unknown User"}</h3>
        </header>

        {/* Moderation Warning Banner */}
        {moderationWarning && (
            <div className="moderation-warning" role="alert">
                <div className="moderation-warning-content">
                    <span className="moderation-warning-icon">⚠️</span>
                    <div className="moderation-warning-text">
                        <strong>Message Blocked</strong>
                        <p>{moderationWarning.reason || "This message violates community guidelines."}</p>
                    </div>
                    <button
                        className="moderation-warning-close"
                        onClick={() => setModerationWarning(null)}
                        aria-label="Close warning"
                    >
                        ×
                    </button>
                </div>
            </div>
        )}

        {/* Messages List */}
        <div className="messages-list">
                {localMessages.map((msg) => {
                    // Handle both old format (sender: 'me'/'them') and new format (sender: userId)
                    const isSent = msg.sender === currentUser?.id || msg.sender === "me";
                    return (
                        <div key={msg.id || msg.timestamp} className={`message ${isSent ? "sent" : "received"}`}>
                            <span className="message-text">{msg.text}</span>
                            <div className="message-footer">
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                                {isSent && (
                                    <span className="message-status">{getStatusIcon(msg.id)}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form className="chat-input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={handleInputChange}
                    autoFocus
                />
                <button type="submit" className="send-btn" aria-label="Send">
                    ➤
                </button>
            </form>
        </main>
    );
}
