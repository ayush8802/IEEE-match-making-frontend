import React from "react";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} IEEE Matchmaking Platform. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact Support</a>
                </div>
            </div>
        </footer>
    );
}
