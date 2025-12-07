/**
 * Navbar Component
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

                    {/* Profile Dropdown */}
                    <div className="profile-menu-container" ref={dropdownRef}>
                        <button
                            className="profile-icon-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-label="Profile Menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <div className="profile-dropdown-item" style={{ cursor: 'default', fontWeight: 'bold' }}>
                                    {user.email}
                                </div>
                                <div className="profile-dropdown-divider"></div>
                                <button onClick={handleLogout} className="profile-dropdown-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

