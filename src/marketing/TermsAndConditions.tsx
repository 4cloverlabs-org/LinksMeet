import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Lock, AlertCircle, ChevronRight, ArrowRight } from 'lucide-react';
import './Legal.css';

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState<string>('section-1');

  useEffect(() => {
    document.title = 'Terms & Conditions - LinksMeet';
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
    { id: 'section-2', title: '2. Eligibility' },
    { id: 'section-3', title: '3. User Accounts' },
    { id: 'section-4', title: '4. Google Account Integration' },
    { id: 'section-5', title: '5. Subscription Services' },
    { id: 'section-6', title: '6. Payments' },
    { id: 'section-7', title: '7. Acceptable Use' },
    { id: 'section-8', title: '8. User Content' },
    { id: 'section-9', title: '9. Intellectual Property' },
    { id: 'section-10', title: '10. Limited License' },
    { id: 'section-11', title: '11. Availability of Service' },
    { id: 'section-12', title: '12. Changes to Service' },
    { id: 'section-13', title: '13. Third-Party Services' },
    { id: 'section-14', title: '14. Account Suspension' },
    { id: 'section-15', title: '15. Account Deletion' },
    { id: 'section-16', title: '16. Disclaimer of Warranties' },
    { id: 'section-17', title: '17. Limitation of Liability' },
    { id: 'section-18', title: '18. Indemnification' },
    { id: 'section-19', title: '19. Force Majeure' },
    { id: 'section-20', title: '20. Privacy' },
    { id: 'section-21', title: '21. Governing Law' },
    { id: 'section-22', title: '22. Changes to Terms' },
    { id: 'section-23', title: '23. Severability' },
    { id: 'section-24', title: '24. Entire Agreement' },
    { id: 'section-25', title: '25. Contact Information' },
  ];

  return (
    <div className="cc-page">
      <div className="cc-container cc-legal">
        <div className="cc-page-hero">
          <div className="cc-legal-badge">
            <FileText size={16} /> Legal Documentation
          </div>
          <h1>Terms & Conditions</h1>
          <p className="cc-effective-date">Effective Date: <strong>19 July, 2026</strong></p>
          
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.92rem', color: '#1e3a8a', fontWeight: 500 }}>Looking for our concise Terms of Service?</span>
            <Link to="/terms-of-service" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
              View Terms of Service <ArrowRight size={16} />
            </Link>
          </div>

          <div className="cc-intro-box">
            <p>
              Welcome to LinksMeet (“LinksMeet”, “we”, “our”, or “us”). These Terms & Conditions (“Terms”) govern your access to and use of the LinksMeet website and services available at <a href="https://linksmeet.com" target="_blank" rel="noopener noreferrer">https://linksmeet.com</a> (the “Service”).
            </p>
            <p className="cc-intro-ack">
              By creating an account, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree with these Terms, you must not use the Service.
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
                LinksMeet is a subscription-based online meeting scheduling platform that enables users to connect their Google Calendar, share booking links, manage availability, and schedule meetings efficiently.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and LinksMeet.
              </p>
            </section>

            <section id="section-2" className="cc-policy-section">
              <h2>2. Eligibility</h2>
              <p>To use the Service, you must:</p>
              <ul>
                <li>Be at least 18 years of age, or the age of majority in your jurisdiction.</li>
                <li>Have the legal capacity to enter into a binding agreement.</li>
                <li>Provide accurate and complete registration information.</li>
                <li>Comply with all applicable laws and regulations.</li>
              </ul>
              <p>
                You are responsible for ensuring that your use of the Service complies with the laws applicable to you.
              </p>
            </section>

            <section id="section-3" className="cc-policy-section">
              <h2>3. User Accounts</h2>
              <p>To access certain features, you must create an account.</p>
              <p>You agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information.</li>
                <li>Keep your account information updated.</li>
                <li>Maintain the confidentiality of your login credentials.</li>
                <li>Be responsible for all activities that occur under your account.</li>
              </ul>
              <p>
                You must notify us immediately if you believe your account has been accessed without authorization.
              </p>
            </section>

            <section id="section-4" className="cc-policy-section">
              <h2>4. Google Account Integration</h2>
              <p>LinksMeet integrates with Google services to provide scheduling functionality.</p>
              <p>By connecting your Google account, you authorize LinksMeet to:</p>
              <ul>
                <li>Access your calendar availability.</li>
                <li>Read existing calendar events as necessary.</li>
                <li>Create calendar events.</li>
                <li>Update events.</li>
                <li>Delete events created through the Service when required.</li>
              </ul>
              <p>
                These permissions are used solely to provide the requested functionality and are subject to our <Link to="/privacy-policy">Privacy Policy</Link>.
              </p>
            </section>

            <section id="section-5" className="cc-policy-section">
              <h2>5. Subscription Services</h2>
              <p>LinksMeet is offered as a subscription-based service.</p>
              <p>Subscription plans, pricing, billing periods, and available features may change over time.</p>
              <p>Any applicable subscription details will be displayed before purchase.</p>
              <p>
                Failure to pay applicable subscription fees may result in suspension or termination of access to premium features.
              </p>
            </section>

            <section id="section-6" className="cc-policy-section">
              <h2>6. Payments</h2>
              <p>At the time these Terms become effective, LinksMeet does not process subscription payments directly.</p>
              <p>If payment functionality is introduced in the future:</p>
              <ul>
                <li>Payments will be processed through a secure third-party payment provider.</li>
                <li>Additional billing terms may apply.</li>
                <li>You authorize recurring billing where applicable until cancellation.</li>
                <li>Applicable taxes may be added where required by law.</li>
              </ul>
            </section>

            <section id="section-7" className="cc-policy-section">
              <h2>7. Acceptable Use</h2>
              <p>You agree not to use LinksMeet to:</p>
              <ul>
                <li>Violate any applicable law or regulation.</li>
                <li>Access accounts belonging to others.</li>
                <li>Interfere with the operation of the Service.</li>
                <li>Upload or transmit malicious software.</li>
                <li>Attempt unauthorized access to servers or systems.</li>
                <li>Reverse engineer, copy, or exploit the Service except as permitted by law.</li>
                <li>Disrupt or degrade the experience of other users.</li>
                <li>Use automated scripts or bots that negatively impact the Service.</li>
                <li>Use the Service for spam, phishing, or fraudulent activity.</li>
              </ul>
              <div className="cc-callout-warning">
                <AlertCircle size={18} />
                <div>
                  Any violation may result in immediate suspension or termination.
                </div>
              </div>
            </section>

            <section id="section-8" className="cc-policy-section">
              <h2>8. User Content</h2>
              <p>You retain ownership of information you submit to the Service.</p>
              <p>
                By using LinksMeet, you grant us a limited license to process your information solely for the purpose of providing and improving the Service.
              </p>
              <p>You represent that:</p>
              <ul>
                <li>You own or have permission to use any information you provide.</li>
                <li>Your content does not infringe the rights of others.</li>
                <li>Your use of the Service complies with applicable laws.</li>
              </ul>
            </section>

            <section id="section-9" className="cc-policy-section">
              <h2>9. Intellectual Property</h2>
              <p>The Service, including but not limited to:</p>
              <ul>
                <li>Software</li>
                <li>User interface</li>
                <li>Branding</li>
                <li>Logos</li>
                <li>Graphics</li>
                <li>Design</li>
                <li>Documentation</li>
                <li>Source code</li>
                <li>Features</li>
              </ul>
              <p>
                is owned by LinksMeet or its licensors and is protected by applicable intellectual property laws.
              </p>
              <p>
                Nothing in these Terms transfers ownership of our intellectual property to you.
              </p>
            </section>

            <section id="section-10" className="cc-policy-section">
              <h2>10. Limited License</h2>
              <p>
                Subject to these Terms, LinksMeet grants you a limited, non-exclusive, non-transferable, revocable license to use the Service for its intended purpose.
              </p>
              <p>You may not:</p>
              <ul>
                <li>Copy the Service.</li>
                <li>Sell or sublicense the Service.</li>
                <li>Modify or create derivative works.</li>
                <li>Reverse engineer the platform except where permitted by law.</li>
              </ul>
            </section>

            <section id="section-11" className="cc-policy-section">
              <h2>11. Availability of the Service</h2>
              <p>We strive to maintain reliable service availability.</p>
              <p>However, we do not guarantee:</p>
              <ul>
                <li>Continuous uptime.</li>
                <li>Error-free operation.</li>
                <li>Uninterrupted access.</li>
                <li>Compatibility with every browser or device.</li>
              </ul>
              <p>
                Maintenance, updates, or unforeseen technical issues may temporarily affect availability.
              </p>
            </section>

            <section id="section-12" className="cc-policy-section">
              <h2>12. Changes to the Service</h2>
              <p>We may:</p>
              <ul>
                <li>Add new features.</li>
                <li>Remove existing features.</li>
                <li>Modify functionality.</li>
                <li>Update the user interface.</li>
                <li>Improve performance.</li>
                <li>Discontinue portions of the Service.</li>
              </ul>
              <p>We are not obligated to maintain any specific feature indefinitely.</p>
            </section>

            <section id="section-13" className="cc-policy-section">
              <h2>13. Third-Party Services</h2>
              <p>LinksMeet integrates with third-party providers including:</p>
              <ul>
                <li>Google Sign-In</li>
                <li>Google Calendar</li>
                <li>Gmail API</li>
              </ul>
              <p>Your use of these third-party services is governed by their respective terms and privacy policies.</p>
              <p>LinksMeet is not responsible for the availability or actions of third-party services.</p>
            </section>

            <section id="section-14" className="cc-policy-section">
              <h2>14. Account Suspension and Termination</h2>
              <p>We reserve the right to suspend or terminate your account if:</p>
              <ul>
                <li>You violate these Terms.</li>
                <li>You misuse the Service.</li>
                <li>You engage in fraudulent activity.</li>
                <li>Continued access poses security or legal risks.</li>
                <li>Required by applicable law.</li>
              </ul>
              <p>Upon termination, your right to access the Service immediately ends.</p>
            </section>

            <section id="section-15" className="cc-policy-section">
              <h2>15. User-Initiated Account Deletion</h2>
              <p>You may request deletion of your account at any time by contacting us.</p>
              <p>
                Following verification, we will delete or anonymize your personal information in accordance with our <Link to="/privacy-policy">Privacy Policy</Link>, except where retention is required by law.
              </p>
            </section>

            <section id="section-16" className="cc-policy-section">
              <h2>16. Disclaimer of Warranties</h2>
              <p>The Service is provided on an “AS IS” and “AS AVAILABLE” basis.</p>
              <p>
                To the fullest extent permitted by law, LinksMeet disclaims all warranties, whether express, implied, statutory, or otherwise, including but not limited to:
              </p>
              <ul>
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy</li>
                <li>Reliability</li>
                <li>Availability</li>
              </ul>
              <p>We do not guarantee that the Service will meet every requirement or operate without interruption.</p>
            </section>

            <section id="section-17" className="cc-policy-section">
              <h2>17. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, LinksMeet, its owners, employees, affiliates, and partners shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages arising out of or relating to:
              </p>
              <ul>
                <li>Use of the Service.</li>
                <li>Inability to access the Service.</li>
                <li>Loss of profits.</li>
                <li>Loss of business opportunities.</li>
                <li>Data loss.</li>
                <li>Service interruptions.</li>
                <li>Third-party integrations.</li>
                <li>Unauthorized access.</li>
              </ul>
              <p>
                Where liability cannot be excluded by law, our total liability shall not exceed the amount paid by you to LinksMeet during the twelve (12) months preceding the claim.
              </p>
            </section>

            <section id="section-18" className="cc-policy-section">
              <h2>18. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless LinksMeet, its founders, employees, affiliates, and service providers from any claims, liabilities, damages, losses, costs, and expenses arising from:
              </p>
              <ul>
                <li>Your misuse of the Service.</li>
                <li>Your violation of these Terms.</li>
                <li>Your violation of applicable law.</li>
                <li>Your infringement of the rights of another person or entity.</li>
              </ul>
            </section>

            <section id="section-19" className="cc-policy-section">
              <h2>19. Force Majeure</h2>
              <p>
                LinksMeet shall not be liable for delays or failures resulting from events beyond our reasonable control, including but not limited to:
              </p>
              <ul>
                <li>Natural disasters.</li>
                <li>Internet outages.</li>
                <li>Government actions.</li>
                <li>Cyberattacks.</li>
                <li>Labor disputes.</li>
                <li>Power failures.</li>
                <li>Acts of war.</li>
                <li>Pandemics.</li>
              </ul>
            </section>

            <section id="section-20" className="cc-policy-section">
              <h2>20. Privacy</h2>
              <p>
                Your use of LinksMeet is also governed by our <Link to="/privacy-policy">Privacy Policy</Link>, which explains how we collect, use, and protect your information.
              </p>
            </section>

            <section id="section-21" className="cc-policy-section">
              <h2>21. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
              </p>
              <p>
                Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts located in India.
              </p>
            </section>

            <section id="section-22" className="cc-policy-section">
              <h2>22. Changes to These Terms</h2>
              <p>We may revise these Terms from time to time.</p>
              <p>When significant changes are made, we will update the Effective Date.</p>
              <p>
                Your continued use of the Service after revised Terms become effective constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section id="section-23" className="cc-policy-section">
              <h2>23. Severability</h2>
              <p>
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section id="section-24" className="cc-policy-section">
              <h2>24. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any additional policies referenced herein, constitute the entire agreement between you and LinksMeet regarding the use of the Service and supersede all prior agreements relating to the Service.
              </p>
            </section>

            <section id="section-25" className="cc-policy-section">
              <h2>25. Contact Information</h2>
              <p>If you have any questions regarding these Terms & Conditions, please contact us:</p>
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
              By creating an account or using LinksMeet, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
