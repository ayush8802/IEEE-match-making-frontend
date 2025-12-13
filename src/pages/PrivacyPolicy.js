/**
 * Privacy Policy Page
 * Displays the privacy policy for the IEEE Matchmaking Platform
 */

import React from "react";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
    return (
        <div className="privacy-policy-page">
            <div className="privacy-policy-container">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="policy-section">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to the IEEE Matchmaking Platform ("Platform", "Service", "we", "us", or "our"). We are
                        committed to protecting your privacy and ensuring you have a positive experience on our platform.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                        you use our service.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>2. Information We Collect</h2>
                    <h3>2.1 Information You Provide</h3>
                    <p>We collect information that you voluntarily provide to us, including:</p>
                    <ul>
                        <li>
                            <strong>Account Information:</strong> Name, email address, password, and profile information
                        </li>
                        <li>
                            <strong>Questionnaire Data:</strong> Research interests, collaboration preferences, affiliation,
                            and other information you provide in the questionnaire
                        </li>
                        <li>
                            <strong>Communication Data:</strong> Messages sent through the platform, contact form
                            submissions
                        </li>
                        <li>
                            <strong>Professional Information:</strong> LinkedIn profile, research areas, publications, and
                            academic background
                        </li>
                    </ul>

                    <h3>2.2 Automatically Collected Information</h3>
                    <p>We automatically collect certain information when you use our service:</p>
                    <ul>
                        <li>
                            <strong>Usage Data:</strong> How you interact with our platform, pages visited, features used
                        </li>
                        <li>
                            <strong>Device Information:</strong> IP address, browser type, operating system, device
                            identifiers
                        </li>
                        <li>
                            <strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your
                            experience and analyze usage patterns
                        </li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>3. How We Use Your Information</h2>
                    <p>We use the collected information for the following purposes:</p>
                    <ul>
                        <li>To provide and maintain our service</li>
                        <li>To process and match you with relevant researchers and sessions</li>
                        <li>To facilitate communication between users</li>
                        <li>To send you notifications, updates, and recommendations</li>
                        <li>To respond to your inquiries and provide customer support</li>
                        <li>To improve and personalize your experience</li>
                        <li>To monitor and analyze usage patterns and trends</li>
                        <li>To detect, prevent, and address technical issues and security threats</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>4. Information Sharing and Disclosure</h2>
                    <p>We may share your information in the following circumstances:</p>
                    <ul>
                        <li>
                            <strong>With Other Users:</strong> Your profile information and questionnaire responses may be
                            visible to other registered users for matching purposes
                        </li>
                        <li>
                            <strong>Service Providers:</strong> We may share data with third-party service providers who
                            assist in operating our platform (e.g., cloud hosting, analytics)
                        </li>
                        <li>
                            <strong>Legal Requirements:</strong> We may disclose information if required by law or in
                            response to valid legal requests
                        </li>
                        <li>
                            <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets,
                            your information may be transferred
                        </li>
                        <li>
                            <strong>With Your Consent:</strong> We may share information with your explicit consent for
                            specific purposes
                        </li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>5. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal information
                        against unauthorized access, alteration, disclosure, or destruction. These measures include:
                    </p>
                    <ul>
                        <li>Encryption of data in transit and at rest</li>
                        <li>Regular security assessments and updates</li>
                        <li>Access controls and authentication mechanisms</li>
                        <li>Secure hosting infrastructure</li>
                    </ul>
                    <p>
                        However, no method of transmission over the internet or electronic storage is 100% secure. While we
                        strive to use commercially acceptable means to protect your data, we cannot guarantee absolute
                        security.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>6. Your Rights and Choices</h2>
                    <p>You have the following rights regarding your personal information:</p>
                    <ul>
                        <li>
                            <strong>Access:</strong> Request access to your personal data
                        </li>
                        <li>
                            <strong>Correction:</strong> Request correction of inaccurate or incomplete data
                        </li>
                        <li>
                            <strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)
                        </li>
                        <li>
                            <strong>Portability:</strong> Request transfer of your data to another service
                        </li>
                        <li>
                            <strong>Objection:</strong> Object to processing of your data for certain purposes
                        </li>
                        <li>
                            <strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent
                        </li>
                    </ul>
                    <p>
                        To exercise these rights, please contact us at{" "}
                        <a href="mailto:ieeemetaverse@gmail.com">ieeemetaverse@gmail.com</a>.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>7. Cookies and Tracking Technologies</h2>
                    <p>
                        We use cookies and similar tracking technologies to track activity on our service and store certain
                        information. You can instruct your browser to refuse all cookies or to indicate when a cookie is
                        being sent. However, if you do not accept cookies, you may not be able to use some portions of our
                        service.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>8. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to fulfill the purposes outlined in
                        this Privacy Policy, unless a longer retention period is required or permitted by law. When we no
                        longer need your information, we will securely delete or anonymize it.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>9. Children's Privacy</h2>
                    <p>
                        Our service is not intended for individuals under the age of 18. We do not knowingly collect
                        personal information from children. If you believe we have collected information from a child, please
                        contact us immediately.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>10. International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and maintained on computers located outside of your state,
                        province, country, or other governmental jurisdiction where data protection laws may differ. By using
                        our service, you consent to the transfer of your information to these facilities.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>11. Changes to This Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                        new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this
                        Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>12. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <p>
                        <strong>Email:</strong> <a href="mailto:ieeemetaverse@gmail.com">ieeemetaverse@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}



