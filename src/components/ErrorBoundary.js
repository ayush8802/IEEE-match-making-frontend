/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React from "react";
import "../styles/components.css";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
        this.state = {
            hasError: true,
            error,
            errorInfo,
        };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <h2>⚠️ Something went wrong</h2>
                        <p>We're sorry, but something unexpected happened.</p>
                        <button
                            className="error-boundary-button"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <pre>{this.state.error.toString()}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
