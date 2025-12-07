/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner message="Loading..." />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
}
