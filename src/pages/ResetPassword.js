/**
 * Reset Password Page
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/auth.css";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updatePassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await updatePassword(password);
            alert("Password updated successfully!");
            navigate("/");
        } catch (err) {
            console.error("Update password error:", err);
            alert(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Updating password..." />;
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter your new password</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />

                    <button type="submit" disabled={loading}>
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}
