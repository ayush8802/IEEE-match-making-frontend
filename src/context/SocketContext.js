import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { supabase } from "../config/supabase";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Initialize socket connection
        // Assuming backend is running on localhost:5000 (default in config)
        // In production, this should be an env var
        const SOCKET_URL = "http://localhost:5000";

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            reconnection: true,
        });

        setSocket(newSocket);

        // Clean up on unmount
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {
            const setupUser = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    socket.emit("join_user", user.id);
                    // Add other init logic if needed
                }
            };
            setupUser();

            socket.on("user_online", (userId) => {
                setOnlineUsers(prev => [...prev, userId]);
            });
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
