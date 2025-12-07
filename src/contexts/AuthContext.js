/**
 * Authentication Context
 * Provides global authentication state and methods
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../config/supabase";

const AuthContext = createContext({});

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Object} metadata - Additional user metadata
     * @returns {Promise<Object>} Sign up result
     */
    const signUp = async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });

        if (error) throw error;
        return data;
    };

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Sign in result
     */
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    };

    /**
     * Sign out current user
     * @returns {Promise<void>}
     */
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    };

    /**
     * Update password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) throw error;
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
