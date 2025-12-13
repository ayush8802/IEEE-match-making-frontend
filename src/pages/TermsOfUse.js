/**
 * Terms of Use Page
 * Displays the terms and conditions for using the IEEE Matchmaking Platform
 */

import React from "react";
import "./TermsOfUse.css";

export default function TermsOfUse() {
    return (
        <div className="terms-of-use-page">
            <div className="terms-of-use-container">
                <h1>Terms of Use</h1>
                <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

                <section className="terms-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using the IEEE Matchmaking Platform ("Platform", "Service", "we", "us", or "our"),
                        you accept and agree to be bound by the terms and provision of this agreement. If you do not agree
                        to abide by the above, please do not use this service.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>2. Description of Service</h2>
                    <p>
                        The IEEE Matchmaking Platform is a service designed to help researchers and professionals connect
                        with each other and discover relevant sessions at IEEE conferences. The platform provides:
                    </p>
                    <ul>
                        <li>Researcher matching based on interests and collaboration preferences</li>
                        <li>Session recommendations tailored to your research areas</li>
                        <li>Communication tools to facilitate connections between users</li>
                        <li>Questionnaire-based profiling to improve matching accuracy</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>3. User Accounts</h2>
                    <h3>3.1 Account Creation</h3>
                    <p>To use our service, you must:</p>
                    <ul>
                        <li>Be at least 18 years old</li>
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and update your information to keep it accurate</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Accept responsibility for all activities under your account</li>
                    </ul>

                    <h3>3.2 Account Responsibility</h3>
                    <p>
                        You are responsible for maintaining the confidentiality of your account password and for all
                        activities that occur under your account. You agree to immediately notify us of any unauthorized use
                        of your account.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>4. User Conduct</h2>
                    <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree
                        NOT to:</p>
                    <ul>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe upon the rights of others</li>
                        <li>Transmit any harmful, offensive, or inappropriate content</li>
                        <li>Impersonate any person or entity</li>
                        <li>Harass, threaten, or abuse other users</li>
                        <li>Collect or store personal data about other users without permission</li>
                        <li>Use the service for spam, phishing, or other fraudulent activities</li>
                        <li>Attempt to gain unauthorized access to any part of the service</li>
                        <li>Interfere with or disrupt the service or servers</li>
                        <li>Use automated systems to access the service without permission</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>5. Intellectual Property Rights</h2>
                    <p>
                        The Platform and its original content, features, and functionality are owned by IEEE and are
                        protected by international copyright, trademark, patent, trade secret, and other intellectual
                        property laws.
                    </p>
                    <p>
                        You retain ownership of the content you submit to the Platform. By submitting content, you grant us
                        a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your
                        content for the purpose of providing and improving the service.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>6. Privacy and Data Protection</h2>
                    <p>
                        Your use of the Platform is also governed by our Privacy Policy. Please review our Privacy Policy,
                        which also governs your use of the service, to understand our practices regarding the collection and
                        use of your information.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>7. Matching and Recommendations</h2>
                    <p>
                        The Platform uses algorithms and machine learning to provide matching and recommendations. We do not
                        guarantee the accuracy, completeness, or usefulness of any matches or recommendations. You understand
                        and agree that:
                    </p>
                    <ul>
                        <li>Matches and recommendations are provided "as is" without warranties</li>
                        <li>We are not responsible for the actions or conduct of matched users</li>
                        <li>You should exercise your own judgment when interacting with other users</li>
                        <li>We reserve the right to modify or discontinue matching algorithms at any time</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>8. Disclaimers and Limitations of Liability</h2>
                    <h3>8.1 Service Availability</h3>
                    <p>
                        The Platform is provided "as is" and "as available" without warranties of any kind. We do not
                        guarantee that the service will be uninterrupted, secure, or error-free.
                    </p>

                    <h3>8.2 Limitation of Liability</h3>
                    <p>
                        To the maximum extent permitted by law, IEEE and its affiliates shall not be liable for any indirect,
                        incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
                        incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses
                        resulting from your use of the service.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>9. Indemnification</h2>
                    <p>
                        You agree to indemnify, defend, and hold harmless IEEE and its officers, directors, employees, and
                        agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out
                        of or relating to your use of the Platform, violation of these Terms, or infringement of any rights
                        of another party.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>10. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend your account and access to the service immediately,
                        without prior notice, for any reason, including breach of these Terms. Upon termination, your right
                        to use the service will immediately cease.
                    </p>
                    <p>
                        You may terminate your account at any time by contacting us or using the account deletion feature
                        (if available).
                    </p>
                </section>

                <section className="terms-section">
                    <h2>11. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                        provide at least 30 days notice prior to any new terms taking effect. What constitutes a material
                        change will be determined at our sole discretion.
                    </p>
                    <p>
                        By continuing to access or use our service after any revisions become effective, you agree to be
                        bound by the revised terms.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in
                        which IEEE operates, without regard to its conflict of law provisions. Any disputes arising from
                        these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts
                        in that jurisdiction.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>13. Severability</h2>
                    <p>
                        If any provision of these Terms is found to be unenforceable or invalid, that provision shall be
                        limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in
                        full force and effect.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>14. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms of Use, please contact us at:
                    </p>
                    <p>
                        <strong>Email:</strong> <a href="mailto:ieeemetaverse@gmail.com">ieeemetaverse@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}



