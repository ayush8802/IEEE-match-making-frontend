/**
 * Navbar Component
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
            alert("Failed to logout: " + error.message);
        }
    };

    // Public Navbar (for non-logged in users)
    if (!user) {
        return (
            <nav className="navbar">
                <div className="navbar-container">
                    <span className="navbar-brand">
                        IEEE Matchmaking
                    </span>
                    <div className="navbar-menu">
                        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/questionnaire" className="navbar-brand">
                    IEEE Matchmaking
                </Link>
                <div className="navbar-menu">
                    <Link to="/questionnaire" className="navbar-link">
                        Questionnaire
                    </Link>
                    <Link to="/researchers" className="navbar-link">
                        Researchers
                    </Link>
                    <Link to="/sessions" className="navbar-link">
                        Sessions
                    </Link>
                    <Link to="/chat" className="navbar-link">
                        Messages
                    </Link>
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button onClick={handleLogout} className="navbar-button">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
