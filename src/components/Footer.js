/**
 * Footer Component
 * Displays footer with links to Privacy Policy, Terms of Use, and Contact Support
 */

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} IEEE Matchmaking Platform. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-use">Terms of Use</Link>
                    <Link to="/contact">Contact Support</Link>
                </div>
            </div>
        </footer>
    );
}
