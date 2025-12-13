/**
 * Contact Support Page
 * Allows users to submit support queries via a form
 * Responses will be sent to ieeemetaverse@gmail.com
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_ENDPOINTS } from "../config/api";
import "./ContactSupport.css";

export default function ContactSupport() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.user_metadata?.full_name || user?.email || "",
        email: user?.email || "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
    const [errorMessage, setErrorMessage] = useState("");

    /**
     * Handle form input changes
     * @param {Event} e - Input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear status when user starts typing
        if (submitStatus) {
            setSubmitStatus(null);
            setErrorMessage("");
        }
    };

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);
        setErrorMessage("");

        try {
            const response = await fetch(API_ENDPOINTS.CONTACT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Failed to send message");
            }

            setSubmitStatus("success");
            setFormData({
                name: user?.user_metadata?.full_name || user?.email || "",
                email: user?.email || "",
                subject: "",
                message: "",
            });
        } catch (err) {
            console.error("Contact form error:", err);
            setSubmitStatus("error");
            setErrorMessage(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-support-page">
            <div className="contact-support-container">
                <h1>Contact Support</h1>
                <p className="contact-support-description">
                    Have a question or need assistance? Fill out the form below and we'll get back to you at{" "}
                    <strong>ieeemetaverse@gmail.com</strong>. We typically respond within 24-48 hours.
                </p>

                {submitStatus === "success" && (
                    <div className="contact-success-message">
                        <div className="success-icon">✓</div>
                        <p>Thank you for contacting us! We'll respond to your inquiry at the email address you provided.</p>
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="contact-error-message">
                        <div className="error-icon">✗</div>
                        <p>{errorMessage || "Failed to send message. Please try again."}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="contact-support-form">
                    <div className="form-group">
                        <label htmlFor="name">
                            <span className="label-icon">👤</span>
                            Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your full name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            <span className="label-icon">✉️</span>
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your.email@example.com"
                            disabled={loading || !!user}
                        />
                        {user && <small className="form-hint">Using your account email</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">
                            <span className="label-icon">📌</span>
                            Subject <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="Brief description of your inquiry"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">
                            <span className="label-icon">💬</span>
                            Message <span className="required">*</span>
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={8}
                            placeholder="Please provide details about your inquiry..."
                            disabled={loading}
                        />
                        <small className="character-count">{formData.message.length} characters</small>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? (
                            <>
                                <LoadingSpinner message="Sending..." size="small" />
                            </>
                        ) : (
                            <>
                                <span>Send Message</span>
                                <span className="button-icon">➤</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

