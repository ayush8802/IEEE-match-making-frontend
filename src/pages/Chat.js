/**
 * Chat Page
 * Modern messaging interface with conversations, unread counts, and real-time updates
 * Similar to WhatsApp/Telegram/Facebook Messenger
 */

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../config/supabase";
import { io } from "socket.io-client";
import ConversationList from "../components/Chat/ConversationList";
import ChatWindow from "../components/Chat/ChatWindow";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getConversations, getConversationMessages, markConversationAsRead } from "../services/conversationService";
import "../styles/chat.css";

/**
 * Get socket URL from environment or default to localhost
 */
const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL ||
    process.env.REACT_APP_API_URL?.replace("/api/v1", "") ||
    "http://localhost:5000";

export default function Chat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]); // Users from mutual recommendations
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const socketRef = useRef(null);
    const processedMessageIdsRef = useRef(new Set()); // Track processed message IDs to prevent duplicates
    const activeConversationRef = useRef(null); // Track active conversation to avoid stale closures in socket listeners

    /**
     * Fetch available users from mutual recommendations
     * These are users who can be messaged but may not have conversations yet
     */
    useEffect(() => {
        const fetchAvailableUsers = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            // Fetch mutual recommendations from questionnaire_responses
            const { data, error } = await supabase
                .from("questionnaire_responses")
                .select("mutual_recommendation")
                .eq("user_id", authUser.id)
                .single();

            if (error) {
                console.error("Error fetching chat users:", error);
                return;
            }

            if (data && data.mutual_recommendation) {
                try {
                    const parsed =
                        typeof data.mutual_recommendation === "string"
                            ? JSON.parse(data.mutual_recommendation)
                            : data.mutual_recommendation;

                    const userList = Array.isArray(parsed) ? parsed : [];
                    setAvailableUsers(userList);
                } catch (err) {
                    console.error("JSON Parse error:", err);
                }
            }
        };

        fetchAvailableUsers();
    }, []);

    /**
     * Fetch conversations from API
     */
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await getConversations();
                const conversationsData = response?.data || [];
                setConversations(conversationsData);

                // Check if navigated with a pre-selected user (from researcher page)
                if (location.state?.selectedUser) {
                    const selectedEmail = location.state.selectedUser.Email || location.state.selectedUser.email;
                    const foundConversation = conversationsData.find(
                        (conv) => conv.otherUser?.email === selectedEmail
                    );
                    if (foundConversation) {
                        setActiveConversation(foundConversation);
                    } else {
                        // Create a temporary conversation object for available user
                        setActiveConversation({
                            id: `user-${selectedEmail}`,
                            conversationId: null,
                            otherUser: {
                                email: selectedEmail,
                                name: location.state.selectedUser.name,
                                photo: location.state.selectedUser.photo,
                            },
                            lastMessage: null,
                            unreadCount: 0,
                            isAvailableUser: true,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchConversations();
        }
    }, [user, location.state]);

    /**
     * Initialize socket connection for real-time updates
     */
    useEffect(() => {
        if (!user) return;

        // Only create socket if it doesn't exist
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                query: { userId: user.id },
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: Infinity, // Keep trying to reconnect
                timeout: 20000,
            });

            // Wait for connection before joining room
            socketRef.current.on("connect", () => {
                console.log("Socket connected, joining room for user:", user.id);
                socketRef.current.emit("join_user", user.id);
            });

            socketRef.current.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
                if (reason === "io server disconnect") {
                    // Server disconnected the socket, reconnect manually
                    socketRef.current.connect();
                }
            });

            socketRef.current.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
            });

            socketRef.current.on("reconnect", (attemptNumber) => {
                console.log("Socket reconnected after", attemptNumber, "attempts");
                socketRef.current.emit("join_user", user.id);
            });
        }
        
        // Join room when connected (or if already connected)
        const joinRoom = () => {
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit("join_user", user.id);
            }
        };
        
        if (socketRef.current.connected) {
            joinRoom();
        } else {
            socketRef.current.once("connect", joinRoom);
        }

        // Setup listeners function
        const setupListeners = () => {
            if (!socketRef.current) return;
            
            // Listen for new messages
            socketRef.current.on("receive_message", (msg) => {
                console.log("🔵 [CHAT] Received message via socket:", {
                    msgId: msg.id,
                    content: msg.content || msg.text,
                    sender_id: msg.sender_id,
                    sender_email: msg.sender_email,
                    receiver_id: msg.receiver_id,
                    receiver_email: msg.receiver_email,
                    current_user_id: user?.id,
                    current_user_email: user?.email,
                    conversation_id: msg.conversation_id
                });
                
                // Check if message is for current user (multiple checks for reliability)
                const isForMe = 
                    msg.receiver_id === user.id || 
                    msg.receiver_email?.toLowerCase() === user.email?.toLowerCase() ||
                    (msg._receiver_email?.toLowerCase() === user.email?.toLowerCase()) ||
                    (msg._broadcast && msg._receiver_email?.toLowerCase() === user.email?.toLowerCase());
                
                console.log("🔵 [CHAT] Is message for me?", isForMe, {
                    receiver_id_match: msg.receiver_id === user.id,
                    receiver_email_match: msg.receiver_email?.toLowerCase() === user.email?.toLowerCase(),
                    _receiver_email_match: msg._receiver_email?.toLowerCase() === user.email?.toLowerCase(),
                    broadcast_match: msg._broadcast && msg._receiver_email?.toLowerCase() === user.email?.toLowerCase()
                });
                
                // Check if message is for current user (as receiver) OR from current user (as sender)
                const isForMeAsReceiver = msg.receiver_id === user.id || msg.receiver_email?.toLowerCase() === user.email?.toLowerCase();
                const isFromMeAsSender = msg.sender_id === user.id || msg.sender_email?.toLowerCase() === user.email?.toLowerCase();
                
                // Get current active conversation from ref (avoids stale closure)
                const currentActiveConversation = activeConversationRef.current;
                
                // Only process messages for the active conversation
                const isForActiveConversation = currentActiveConversation && (
                    msg.conversation_id === currentActiveConversation.conversationId ||
                    (isFromMeAsSender && (
                        currentActiveConversation.otherUser?.email?.toLowerCase() === msg.receiver_email?.toLowerCase() ||
                        currentActiveConversation.otherUser?.id === msg.receiver_id
                    )) ||
                    (isForMeAsReceiver && (
                        currentActiveConversation.otherUser?.email?.toLowerCase() === msg.sender_email?.toLowerCase() ||
                        currentActiveConversation.otherUser?.id === msg.sender_id
                    ))
                );
                
                const shouldProcess = isForActiveConversation && (isForMeAsReceiver || isFromMeAsSender);
                
                if (shouldProcess && isForActiveConversation) {
                    // Check if we've already processed this message ID (using ref for immediate check)
                    // This prevents duplicates even if React batches state updates
                    if (msg.id && processedMessageIdsRef.current.has(msg.id)) {
                        console.log("⚠️ [CHAT] Message already processed (by ID in ref), skipping", { 
                            msgId: msg.id,
                            content: msg.text || msg.content
                        });
                        return;
                    }
                    
                    console.log("✅ [CHAT] Processing message for active conversation", {
                        isForMeAsReceiver,
                        isFromMeAsSender,
                        msgId: msg.id,
                        content: msg.text || msg.content
                    });
                    
                    // Mark as processed immediately (before state update) to prevent race conditions
                    if (msg.id) {
                        processedMessageIdsRef.current.add(msg.id);
                    }
                    
                    setMessages((prev) => {
                        // Double-check in state (in case ref check missed due to timing)
                        if (prev.some(m => m.id === msg.id)) {
                            console.log("⚠️ [CHAT] Message already exists in state (by ID), skipping", { 
                                msgId: msg.id, 
                                existingCount: prev.length 
                            });
                            return prev;
                        }
                        
                        // Also check for content + timestamp match (fallback for messages without IDs)
                        const msgContent = msg.text || msg.content;
                        const msgTime = new Date(msg.timestamp || msg.created_at).getTime();
                        const contentDuplicate = prev.some(m => {
                            const mContent = m.text;
                            const mTime = new Date(m.timestamp).getTime();
                            return mContent === msgContent && Math.abs(mTime - msgTime) < 2000; // Within 2 seconds
                        });
                        if (contentDuplicate) {
                            console.log("⚠️ [CHAT] Message already exists (by content + timestamp), skipping");
                            // Remove from processed set if it was added but is a duplicate
                            if (msg.id) {
                                processedMessageIdsRef.current.delete(msg.id);
                            }
                            return prev;
                        }
                        
                        console.log("➕ [CHAT] Adding new message to state", { msgId: msg.id, content: msgContent });
                        return [...prev, {
                            id: msg.id,
                            text: msgContent,
                            sender: msg.sender_id === user.id ? "me" : msg.sender_id,
                            timestamp: msg.timestamp || msg.created_at,
                            status: msg.status || "delivered",
                        }];
                    });
                }

                // Refresh conversations if message is for me as receiver (to update unread counts, etc.)
                // Use a debounced refresh to avoid excessive calls
                if (isForMeAsReceiver) {
                    console.log("🔄 [CHAT] Scheduling conversation refresh (message received)...");
                    // Debounce: only refresh after a short delay
                    setTimeout(() => {
                        refreshConversations(false); // Don't update active conversation to avoid refetching messages
                    }, 500);
                } else if (isFromMeAsSender) {
                    // Also refresh when I send a message (to update last message preview)
                    console.log("🔄 [CHAT] Scheduling conversation refresh (message sent)...");
                    setTimeout(() => {
                        refreshConversations(false); // Don't update active conversation to avoid refetching messages
                    }, 500);
                }
            });

        // Listen for conversation updates
        socketRef.current.on("conversation_updated", (conversation) => {
            // Filter broadcast conversations by email if it's a broadcast
            if (conversation._broadcast && conversation._receiver_email) {
                // Only process if this conversation is for the current user
                if (conversation._receiver_email === user.email || conversation.user2_email === user.email) {
                    console.log("Processing broadcast conversation update for current user");
                    refreshConversations(false); // Don't update active conversation to avoid message refetch
                } else {
                    console.log("Ignoring broadcast conversation update - not for current user");
                }
            } else {
                // Direct conversation update (not a broadcast)
                console.log("Processing direct conversation update");
                refreshConversations(false); // Don't update active conversation to avoid message refetch
            }
        });

            // Listen for message status updates
            socketRef.current.on("message_status_update", ({ messageId, status }) => {
                setMessages((prev) =>
                    prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
                );
            });

            // Listen for read receipts
            socketRef.current.on("messages_read", ({ conversationId, messageIds }) => {
                if (activeConversation?.conversationId === conversationId) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            messageIds.includes(msg.id) ? { ...msg, status: "read" } : msg
                        )
                    );
                }
                refreshConversations();
            });

            // Listen for blocked messages (logged here, UI handled by ChatWindow)
            socketRef.current.on("message_blocked", ({ reason, content }) => {
                console.warn("🚫 Message blocked by moderation", { reason, content });
                // ChatWindow component handles the UI warning directly via its socket listener
            });
        }; // Close setupListeners function

        // Setup listeners when socket connects, or immediately if already connected
        if (socketRef.current.connected) {
            setupListeners();
        } else {
            socketRef.current.once("connect", () => {
                setupListeners();
            });
        }

        // Update ref when activeConversation changes
        activeConversationRef.current = activeConversation;

        return () => {
            // In development, React Strict Mode causes double mount/unmount
            // Don't disconnect socket immediately, let it reconnect naturally
            // Only clean up listeners to prevent memory leaks
            if (socketRef.current) {
                socketRef.current.removeAllListeners("receive_message");
                socketRef.current.removeAllListeners("conversation_updated");
                socketRef.current.removeAllListeners("message_status_update");
                socketRef.current.removeAllListeners("messages_read");
                // Don't disconnect - let Socket.io handle reconnection
                // socketRef.current = null; // Commented out to allow reuse
            }
        };
    }, [user, activeConversation]); // Include activeConversation to update ref

    /**
     * Refresh conversations list
     * @param {boolean} updateActiveConversation - Whether to update active conversation (default: true)
     */
    const refreshConversations = async (updateActiveConversation = true) => {
        try {
            console.log("🔄 [CHAT] Refreshing conversations list...");
            const response = await getConversations();
            const conversationsData = response?.data || [];
            console.log("🔄 [CHAT] Conversations fetched:", conversationsData.length, "conversations");
            setConversations(conversationsData);

            // Update active conversation if it exists and flag is true
            // Only update if conversation data actually changed to avoid unnecessary re-renders
            if (updateActiveConversation && activeConversation?.conversationId) {
                const updated = conversationsData.find(
                    (c) => c.conversationId === activeConversation.conversationId
                );
                if (updated) {
                    // Only update if something actually changed
                    const hasChanged = 
                        updated.lastMessageAt !== activeConversation.lastMessageAt ||
                        updated.unreadCount !== activeConversation.unreadCount ||
                        updated.lastMessage?.id !== activeConversation.lastMessage?.id;
                    
                    if (hasChanged) {
                        console.log("🔄 [CHAT] Active conversation updated");
                        setActiveConversation(updated);
                    }
                }
            }
        } catch (error) {
            console.error("❌ [CHAT] Error refreshing conversations:", error);
        }
    };

    /**
     * Periodically refresh conversations to catch new messages
     * This ensures User 2 sees messages even if real-time delivery fails
     * Refresh less frequently and don't update active conversation to avoid unnecessary message refetches
     */
    useEffect(() => {
        if (!user) return;

        // Refresh conversations every 30 seconds (less frequent to reduce overhead)
        // Pass false to avoid updating active conversation (which triggers message refetch)
        const interval = setInterval(() => {
            refreshConversations(false);
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    /**
     * Fetch messages when active conversation changes
     */
    useEffect(() => {
        const fetchMessages = async () => {
            // Clear messages immediately when conversation changes
            setMessages([]);
            processedMessageIdsRef.current.clear(); // Clear processed IDs when conversation changes
            
            if (!activeConversation) {
                return;
            }

            // If it's an available user without a conversation, no messages yet
            if (activeConversation.isAvailableUser || !activeConversation.conversationId) {
                return;
            }

            try {
                const response = await getConversationMessages(activeConversation.conversationId);
                const messagesData = response?.data || [];

                // Format messages for ChatWindow
                const formattedMessages = messagesData.map((msg) => ({
                    id: msg.id,
                    text: msg.text || msg.content,
                    sender: msg.isFromMe ? "me" : msg.sender_id,
                    timestamp: msg.timestamp || msg.created_at,
                    status: msg.status || "sent",
                }));

                // Replace messages entirely (don't merge) - each conversation has its own messages
                // Update processed IDs ref
                formattedMessages.forEach(msg => {
                    if (msg.id) {
                        processedMessageIdsRef.current.add(msg.id);
                    }
                });
                
                // Sort by timestamp
                const sortedMessages = formattedMessages.sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeA - timeB;
                });
                
                console.log("📥 [CHAT] Messages fetched for conversation", {
                    conversationId: activeConversation.conversationId,
                    messageCount: sortedMessages.length
                });
                
                setMessages(sortedMessages);

                // Mark conversation as read when opened
                if (activeConversation.unreadCount > 0) {
                    try {
                        await markConversationAsRead(activeConversation.conversationId);
                        
                        // Emit socket event to mark as read
                        if (socketRef.current) {
                            socketRef.current.emit("mark_read", {
                                conversation_id: activeConversation.conversationId,
                                user_id: user.id,
                            });
                        }

                        // Refresh conversations to update unread count
                        refreshConversations();
                    } catch (error) {
                        console.error("Error marking conversation as read:", error);
                    }
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [activeConversation, user]);

    /**
     * Handle conversation selection
     * @param {Object} conversation - Selected conversation object
     */
    const handleSelectConversation = (conversation) => {
        setActiveConversation(conversation);
    };

    /**
     * Handle sending a message
     * Creates conversation if it doesn't exist
     * @param {string} text - Message text
     */
    const handleSendMessage = async (text) => {
        if (!activeConversation || !activeConversation.otherUser) {
            alert("Please select a user to message.");
            return;
        }

        const receiverEmail = activeConversation.otherUser.email;
        const receiverId = activeConversation.otherUser.id;

        // Send via socket
        if (socketRef.current && user) {
            socketRef.current.emit("send_message", {
                sender_id: user.id,
                sender_email: user.email,
                receiver_id: receiverId || null,
                receiver_email: receiverEmail,
                content: text,
            });
        }

        // Refresh conversations after sending (to get new conversation if created)
        setTimeout(() => {
            refreshConversations();
        }, 500);
    };

    // Loading state
    if (loading) {
        return <LoadingSpinner message="Loading messages..." />;
    }

    // Prepare activeUser object for ChatWindow (backward compatibility)
    const activeUser = activeConversation
        ? {
              id: activeConversation.otherUser?.id,
              name: activeConversation.otherUser?.name || activeConversation.otherUser?.email,
              email: activeConversation.otherUser?.email,
              Email: activeConversation.otherUser?.email, // For backward compatibility
              photo: activeConversation.otherUser?.photo,
          }
        : null;

    // Main render
    return (
        <div className="chat-container">
            <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                availableUsers={availableUsers}
            />
            <ChatWindow
                activeUser={activeUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUser={
                    user
                        ? {
                              id: user.id,
                              email: user.email,
                              name: user.user_metadata?.full_name || user.email,
                          }
                        : null
                }
                socket={socketRef.current} // Pass socket to ChatWindow to avoid duplicate connections
            />
        </div>
    );
}
