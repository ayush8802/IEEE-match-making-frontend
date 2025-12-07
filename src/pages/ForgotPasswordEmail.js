/**
 * Forgot Password Page
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/auth.css";

export default function ForgotPasswordEmail() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await resetPassword(email);
            alert("Password reset email sent! Please check your inbox.");
            navigate("/");
        } catch (err) {
            console.error("Reset password error:", err);
            alert(err.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Sending reset email..." />;
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle">Enter your email to receive a password reset link</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        Send Reset Link
                    </button>
                </form>

                <p className="toggle-text">
                    Remember your password?{" "}
                    <span onClick={() => navigate("/")} className="toggle-link">
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}
