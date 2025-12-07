/**
 * Login/Signup Page
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/auth.css";

export default function LoginSignup() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                await signIn(email, password);
                navigate("/questionnaire", { replace: true });
            } else {
                // Signup
                await signUp(email, password, { full_name: fullName });
                alert("Signup successful! Please check your email to confirm your account.");
                setIsLogin(true);
                setFullName("");
                setEmail("");
                setPassword("");
            }
        } catch (err) {
            console.error("Auth error:", err);
            alert(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const goToForgotPassword = () => {
        navigate("/forgot-password");
    };

    if (loading) {
        return <LoadingSpinner message={isLogin ? "Logging in..." : "Signing up..."} />;
    }

    return (
        <div className="auth-wrapper landing-page">
            <div className="landing-content">
                <div className="landing-hero">
                    <h1>Match with IEEE Researchers</h1>
                    <p className="hero-subtitle">
                        Discover the perfect sessions and researchers tailored to your interests.
                        Join our community to enhance your conference experience.
                    </p>
                    <ul className="hero-features">
                        <li>✨ Personalized Recommendations</li>
                        <li>🤝 connect with Experts</li>
                        <li>📅 Smart Session Scheduling</li>
                    </ul>

                </div>

                <div className="auth-card">
                    <h2 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h2>

                    <div className="tab-toggle">
                        <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>
                            Login
                        </button>
                        <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>
                            Signup
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="full-name-input"
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="password-input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="show-password-wrapper">
                            <input
                                type="checkbox"
                                id="showPassword"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <label htmlFor="showPassword">Show Password</label>
                        </div>

                        <button type="submit" disabled={loading} className="submit-btn-primary">
                            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                        </button>
                    </form>

                    {isLogin && (
                        <p className="forgot-password">
                            <span onClick={goToForgotPassword} className="toggle-link">
                                Forgot password?
                            </span>
                        </p>
                    )}

                    <div className="auth-footer">
                        <p className="toggle-text">
                            {isLogin ? (
                                <>
                                    New here?{" "}
                                    <span onClick={() => setIsLogin(false)} className="toggle-link">
                                        Create an account
                                    </span>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <span onClick={() => setIsLogin(true)} className="toggle-link">
                                        Login
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="landing-sections">
                <section className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">1</div>
                            <h4>Sign Up</h4>
                            <p>Create your profile and tell us about your research interests.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">2</div>
                            <h4>Get Matched</h4>
                            <p>Our AI recommends researchers and sessions that fit you best.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">3</div>
                            <h4>Connect</h4>
                            <p>Schedule meetings and attend sessions to grow your network.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
