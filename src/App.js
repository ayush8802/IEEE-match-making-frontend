/**
 * Main Application Component
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginSignup from "./pages/LoginSignup";
import Questionnaire from "./pages/Questionnaire";
import ResearcherRecommendation from "./pages/ResearcherRecommendation";
import Chat from "./pages/Chat";
import SessionRecommendation from "./pages/SessionRecommendation";
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail";
import ResetPassword from "./pages/ResetPassword";
import ContactSupport from "./pages/ContactSupport";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

/**
 * App Routes Component (needs to be inside AuthProvider)
 */
function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner message="Loading application..." />;
    }

    return (
        <div className="app-min-height">
            <Navbar />
            <main className="main-content">
                <Routes>
                    {!user ? (
                        <>
                            {/* Public Routes */}
                            <Route path="/" element={<LoginSignup />} />
                            <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/contact" element={<ContactSupport />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-use" element={<TermsOfUse />} />
                            {/* Redirect unknown paths to login */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    ) : (
                        <>
                            {/* Protected Routes */}
                            <Route path="/" element={<Navigate to="/questionnaire" replace />} />
                            <Route
                                path="/chat"
                                element={
                                    <ProtectedRoute>
                                        <Chat />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/questionnaire"
                                element={
                                    <ProtectedRoute>
                                        <Questionnaire />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/researchers"
                                element={
                                    <ProtectedRoute>
                                        <ResearcherRecommendation />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/sessions"
                                element={
                                    <ProtectedRoute>
                                        <SessionRecommendation />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Public routes accessible when logged in */}
                            <Route path="/contact" element={<ContactSupport />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-use" element={<TermsOfUse />} />
                            {/* Redirect unknown paths to questionnaire */}
                            <Route path="*" element={<Navigate to="/questionnaire" replace />} />
                        </>
                    )}
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

/**
 * Main App Component
 */
export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
