import React, { useState, useEffect } from 'react';
import { Shield, Lock, Calendar, Mail, CreditCard, EyeOff, Globe, Server, UserCheck, AlertCircle, ExternalLink, ChevronRight } from 'lucide-react';
import './Legal.css';

export default function Privacy() {
  const [activeSection, setActiveSection] = useState<string>('section-1');

  useEffect(() => {
    document.title = 'Privacy Policy - LinksMeet';
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'section-1', title: '1. About LinksMeet' },
    { id: 'section-2', title: '2. Information We Collect' },
    { id: 'section-3', title: '3. Information We Do Not Collect' },
    { id: 'section-4', title: '4. How We Use Your Information' },
    { id: 'section-5', title: '5. Google APIs' },
    { id: 'section-6', title: '6. Email Communications' },
    { id: 'section-7', title: '7. Cookies' },
    { id: 'section-8', title: '8. Analytics' },
    { id: 'section-9', title: '9. Subscription Services' },
    { id: 'section-10', title: '10. Data Storage' },
    { id: 'section-11', title: '11. Data Retention' },
    { id: 'section-12', title: '12. Sharing of Information' },
    { id: 'section-13', title: '13. International Data Transfers' },
    { id: 'section-14', title: '14. Your Rights' },
    { id: 'section-15', title: '15. Account Deletion' },
    { id: 'section-16', title: '16. Children’s Privacy' },
    { id: 'section-17', title: '17. Security' },
    { id: 'section-18', title: '18. Third-Party Services' },
    { id: 'section-19', title: '19. Changes to Policy' },
    { id: 'section-20', title: '20. Contact Us' },
  ];

  return (
    <div className="cc-page">
      <div className="cc-container cc-legal">
        <div className="cc-page-hero">
          <div className="cc-legal-badge">
            <Shield size={16} /> Legal Documentation
          </div>
          <h1>Privacy Policy</h1>
          <p className="cc-effective-date">Effective Date: <strong>July 19, 2026</strong></p>
          <div className="cc-intro-box">
            <p>
              Welcome to LinksMeet (“LinksMeet”, “we”, “our”, or “us”). Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website, products, and services available through <a href="https://linksmeet.com" target="_blank" rel="noopener noreferrer">https://linksmeet.com</a> (the “Service”).
            </p>
            <p className="cc-intro-ack">
              By accessing or using LinksMeet, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>

        <div className="cc-legal-layout">
          {/* Quick Navigation Sidebar */}
          <aside className="cc-legal-sidebar">
            <div className="cc-sidebar-title">Table of Contents</div>
            <nav className="cc-sidebar-nav">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`cc-sidebar-link ${activeSection === s.id ? 'active' : ''}`}
                >
                  <ChevronRight size={14} />
                  <span>{s.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Prose Content */}
          <div className="cc-prose">
            <section id="section-1" className="cc-policy-section">
              <h2>1. About LinksMeet</h2>
              <p>
                LinksMeet is an online meeting scheduling platform developed to simplify appointment booking by allowing users to connect their calendars, manage availability, and automatically schedule meetings.
              </p>
              <p>
                Our services are operated from India.
              </p>
            </section>

            <section id="section-2" className="cc-policy-section">
              <h2>2. Information We Collect</h2>
              <p>
                We collect information that you voluntarily provide and information required to operate our services.
              </p>

              <h3>Account Information</h3>
              <p>When you create an account, we may collect:</p>
              <ul>
                <li><strong>Full name</strong></li>
                <li><strong>Email address</strong></li>
                <li><strong>Profile picture</strong></li>
                <li><strong>Google account identifier</strong> (where applicable)</li>
              </ul>

              <h3>Google Sign-In Information</h3>
              <p>If you sign in using Google, we receive information that Google shares with your permission, including:</p>
              <ul>
                <li><strong>Name</strong></li>
                <li><strong>Email address</strong></li>
                <li><strong>Profile picture</strong></li>
                <li><strong>Google account ID</strong></li>
              </ul>
              <div className="cc-policy-note">
                <Lock size={16} /> We do not receive your Google password.
              </div>

              <h3>Calendar Information</h3>
              <p>To provide scheduling functionality, we access your connected Google Calendar.</p>
              <p>Depending on the permissions you grant, we may:</p>
              <ul>
                <li>Read your calendar availability</li>
                <li>Read existing events</li>
                <li>Create calendar events</li>
                <li>Update scheduled events</li>
                <li>Delete events created through LinksMeet when required</li>
              </ul>
              <p>We only use this information to provide scheduling functionality.</p>

              <h3>Contact Information</h3>
              <p>When interacting with our Service, we may collect:</p>
              <ul>
                <li><strong>Email address</strong></li>
                <li><strong>Name</strong></li>
              </ul>
              <p>This information is used for communication regarding your account and scheduled meetings.</p>

              <h3>Payment Information</h3>
              <p>
                If you purchase a subscription or other paid services through LinksMeet, we and our trusted third-party payment processors may collect payment-related information necessary to process your transaction and manage your subscription. This may include:
              </p>
              <ul>
                <li>Billing name</li>
                <li>Billing address (where required)</li>
                <li>Payment method information (such as card type and the last four digits of your payment card)</li>
                <li>Transaction history</li>
                <li>Subscription status</li>
                <li>Payment confirmations and invoices</li>
              </ul>
              <div className="cc-callout-warning">
                <AlertCircle size={18} />
                <div>
                  <strong>Important:</strong> LinksMeet does not collect or store your complete payment card number, CVV/security code, or other sensitive payment credentials. All payment transactions are securely processed by trusted third-party payment providers that comply with applicable industry security standards.
                </div>
              </div>
            </section>

            <section id="section-3" className="cc-policy-section">
              <h2>3. Information We Do Not Collect</h2>
              <p>LinksMeet does not intentionally collect:</p>
              <ul>
                <li>Complete payment card numbers</li>
                <li>CVV/security codes</li>
                <li>Full banking credentials</li>
                <li>Government-issued identification</li>
                <li>Uploaded documents or files</li>
                <li>Phone numbers (unless voluntarily provided in future features)</li>
              </ul>
            </section>

            <section id="section-4" className="cc-policy-section">
              <h2>4. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Create and manage your account</li>
                <li>Authenticate your identity</li>
                <li>Connect with your Google account</li>
                <li>Synchronize your Google Calendar</li>
                <li>Display your availability</li>
                <li>Schedule meetings</li>
                <li>Send meeting confirmations</li>
                <li>Send meeting reminders</li>
                <li>Provide customer support</li>
                <li>Improve service reliability</li>
                <li>Prevent fraud and misuse</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p><strong>We do not sell your personal information.</strong></p>
            </section>

            <section id="section-5" className="cc-policy-section">
              <h2>5. Google APIs</h2>
              <p>
                LinksMeet uses Google APIs, including Google Sign-In, Google Calendar, and Gmail API, solely to provide requested functionality.
              </p>
              <p>Information obtained through Google APIs is used only for:</p>
              <ul>
                <li>Authenticating your account</li>
                <li>Reading calendar availability</li>
                <li>Creating and managing calendar events</li>
                <li>Sending meeting-related emails on your behalf or as part of the Service</li>
              </ul>
              <p className="cc-highlight-text">
                LinksMeet’s use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
              </p>
            </section>

            <section id="section-6" className="cc-policy-section">
              <h2>6. Email Communications</h2>
              <p>LinksMeet may send emails related to:</p>
              <ul>
                <li>Account verification</li>
                <li>Meeting confirmations</li>
                <li>Meeting invitations</li>
                <li>Schedule updates</li>
                <li>Meeting cancellations</li>
                <li>Service notifications</li>
                <li>Password recovery</li>
                <li>Important account notices</li>
              </ul>
              <p>We do not send unsolicited marketing emails without your consent.</p>
            </section>

            <section id="section-7" className="cc-policy-section">
              <h2>7. Cookies</h2>
              <p>Currently, LinksMeet does not use cookies for tracking or advertising purposes.</p>
              <p>
                We may use essential browser storage or similar technologies necessary for authentication and maintaining secure sessions. If our practices change in the future, this Privacy Policy will be updated accordingly.
              </p>
            </section>

            <section id="section-8" className="cc-policy-section">
              <h2>8. Analytics</h2>
              <p>
                LinksMeet currently does not use third-party analytics platforms such as Google Analytics, PostHog, or similar services to track user behavior.
              </p>
            </section>

            <section id="section-9" className="cc-policy-section">
              <h2>9. Subscription Services</h2>
              <p>LinksMeet is a subscription-based platform.</p>
              <p>
                When you purchase a subscription, payments are securely processed through trusted third-party payment providers. We may receive limited payment-related information, such as your billing name, subscription status, transaction identifiers, and payment confirmations, solely for the purpose of managing your subscription and providing customer support.
              </p>
              <p>
                LinksMeet does not store or have access to your complete payment card number, CVV/security code, or other sensitive payment credentials. These details are handled directly by our payment processing partners in accordance with applicable security standards, including PCI DSS where applicable.
              </p>
              <p>If our payment providers or payment practices change, this Privacy Policy will be updated accordingly.</p>
            </section>

            <section id="section-10" className="cc-policy-section">
              <h2>10. Data Storage</h2>
              <p>
                Your information may be stored on secure cloud infrastructure operated by LinksMeet or trusted third-party service providers.
              </p>
              <p>
                We implement reasonable administrative, technical, and organizational safeguards designed to protect your information from unauthorized access, disclosure, alteration, or destruction.
              </p>
              <p>
                However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section id="section-11" className="cc-policy-section">
              <h2>11. Data Retention</h2>
              <p>We retain personal information only for as long as necessary to:</p>
              <ul>
                <li>Provide the Service</li>
                <li>Maintain your account</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>
                If you delete your account, we will make reasonable efforts to remove or anonymize your personal information, except where retention is required by law or necessary for legitimate business purposes.
              </p>
            </section>

            <section id="section-12" className="cc-policy-section">
              <h2>12. Sharing of Information</h2>
              <p><strong>We do not sell or rent your personal information.</strong></p>
              <p>We may share information with:</p>
              <ul>
                <li>Google services required to provide calendar functionality</li>
                <li>Cloud hosting providers</li>
                <li>Email service providers</li>
                <li>Legal authorities when required by law</li>
                <li>Professional advisers when necessary</li>
              </ul>
              <p>All third-party providers are expected to protect your information in accordance with applicable privacy obligations.</p>
            </section>

            <section id="section-13" className="cc-policy-section">
              <h2>13. International Data Transfers</h2>
              <p>Your information may be processed or stored on servers located outside your country of residence.</p>
              <p>
                By using LinksMeet, you acknowledge that your information may be transferred to jurisdictions with different data protection laws than those in your country.
              </p>
              <p>Where required, we take reasonable measures to ensure appropriate safeguards are in place.</p>
            </section>

            <section id="section-14" className="cc-policy-section">
              <h2>14. Your Rights</h2>
              <p>Depending on applicable law, you may have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Restrict certain processing activities</li>
                <li>Object to certain processing</li>
                <li>Request a copy of your information where applicable</li>
              </ul>
              <p>To exercise these rights, please contact us using the contact information below.</p>
            </section>

            <section id="section-15" className="cc-policy-section">
              <h2>15. Account Deletion</h2>
              <p>You may request deletion of your account by contacting us.</p>
              <p>
                Upon receiving a verified request, we will make reasonable efforts to delete your personal information unless retention is legally required.
              </p>
              <p>Certain information may remain in backups for a limited period before permanent deletion.</p>
            </section>

            <section id="section-16" className="cc-policy-section">
              <h2>16. Children’s Privacy</h2>
              <p>LinksMeet is not intended for individuals under the age of 18.</p>
              <p>We do not knowingly collect personal information from children.</p>
              <p>If we become aware that information from a child has been collected, we will take reasonable steps to remove it.</p>
            </section>

            <section id="section-17" className="cc-policy-section">
              <h2>17. Security</h2>
              <p>We take reasonable measures to protect your information, including:</p>
              <ul>
                <li>Secure authentication</li>
                <li>Access controls</li>
                <li>Encrypted communications where applicable</li>
                <li>Regular software updates</li>
                <li>Infrastructure security practices</li>
              </ul>
              <p>Despite these measures, no online service can guarantee absolute security.</p>
            </section>

            <section id="section-18" className="cc-policy-section">
              <h2>18. Third-Party Services</h2>
              <p>Our Service may integrate with or rely upon third-party providers, including but not limited to:</p>
              <ul>
                <li>Google Sign-In</li>
                <li>Google Calendar</li>
                <li>Gmail API</li>
              </ul>
              <p>Your use of these third-party services is also governed by their respective privacy policies and terms.</p>
            </section>

            <section id="section-19" className="cc-policy-section">
              <h2>19. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our services, legal obligations, or business practices.
              </p>
              <p>When significant changes are made, we will update the Effective Date at the top of this page.</p>
              <p>Continued use of the Service after updates constitutes acceptance of the revised Privacy Policy.</p>
            </section>

            <section id="section-20" className="cc-policy-section">
              <h2>20. Contact Us</h2>
              <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
              <div className="cc-contact-card">
                <div className="cc-contact-row">
                  <strong>Company:</strong> LinksMeet
                </div>
                <div className="cc-contact-row">
                  <strong>Website:</strong> <a href="https://linksmeet.com" target="_blank" rel="noopener noreferrer">https://linksmeet.com</a>
                </div>
                <div className="cc-contact-row">
                  <strong>Email:</strong> <a href="mailto:linksmeet@4cloverlabs.com">linksmeet@4cloverlabs.com</a>
                </div>
                <div className="cc-contact-row">
                  <strong>Country:</strong> India
                </div>
              </div>
            </section>

            <div className="cc-policy-footer-ack">
              By using LinksMeet, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

