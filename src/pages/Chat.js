import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import { useLocation } from "react-router-dom";
import "../styles/chat.css";

export default function Chat() {
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]); // List of messages for active user
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // 1. Fetch Users (Mutual Recommendations)
    useEffect(() => {
        const fetchUsers = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("questionnaire_responses")
                .select("mutual_recommendation")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error fetching chat users:", error);
            } else if (data && data.mutual_recommendation) {
                try {
                    const parsed = typeof data.mutual_recommendation === "string"
                        ? JSON.parse(data.mutual_recommendation)
                        : data.mutual_recommendation;

                    const userList = Array.isArray(parsed) ? parsed : [];
                    setUsers(userList);

                    // Check if navigated with a pre-selected user
                    if (location.state?.selectedUser) {
                        const preSelected = userList.find(u => u.name === location.state.selectedUser.name);
                        if (preSelected) setActiveUser(preSelected);
                    }
                } catch (err) {
                    console.error("JSON Parse error:", err);
                }
            }
            setLoading(false);
        };

        fetchUsers();
    }, [location.state]);

    // 2. Fetch Messages when Active User changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeUser || !activeUser.Email) {
                setMessages([]);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch messages where (sender=Me AND receiver=Them) OR (receiver=Me AND sender=Them)
            // Using logic: sender_id.eq.myID,receiver_email.eq.theirEmail OR receiver_email.eq.myEmail,sender_email.eq.theirEmail
            // Since we don't know "my email" inside the query easily without fetching it, let's fetch my email first.
            // Actually, we can just use the auth user's email if available.
            const myEmail = user.email;

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(`and(sender_id.eq.${user.id},receiver_email.eq."${activeUser.Email}"),and(receiver_email.eq."${myEmail}",sender_email.eq."${activeUser.Email}")`)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
            } else {
                const dbMessages = (data || []).map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    sender: msg.sender_id === user.id ? 'me' : 'them',
                    timestamp: msg.created_at
                }));
                setMessages(dbMessages);
            }
        };

        fetchMessages();
    }, [activeUser]);

    const handleSelectUser = (user) => {
        setActiveUser(user);
    };

    const handleSendMessage = async (text) => {
        if (!activeUser || !activeUser.Email) {
            alert("This user has no email, cannot send message.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic UI update
        const tempId = Date.now();
        const newMessage = {
            id: tempId,
            text,
            sender: 'me',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);

        // Save to Supabase
        const { error } = await supabase
            .from("messages")
            .insert({
                sender_id: user.id,
                sender_email: user.email, // Include sender email
                receiver_email: activeUser.Email,
                content: text
            });

        if (error) {
            console.error("Error sending message:", error);
            alert("Failed to save message to database");
        }
    };

    if (loading) return <div className="loading-spinner">Loading chat...</div>;

    return (
        <div className="chat-container">
            <ChatSidebar
                users={users}
                activeUser={activeUser}
                onSelectUser={handleSelectUser}
            />
            <ChatWindow
                activeUser={activeUser}
                messages={messages}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}

