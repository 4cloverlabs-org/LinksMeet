import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Lock, AlertCircle, ChevronRight, ArrowRight } from 'lucide-react';
import './Legal.css';

export default function Terms() {
  const [activeSection, setActiveSection] = useState<string>('section-1');

  useEffect(() => {
    document.title = 'Terms of Service - LinksMeet';
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'section-1', title: 'Acceptance of Terms' },
    { id: 'section-2', title: 'Eligibility' },
    { id: 'section-3', title: 'Accounts' },
    { id: 'section-4', title: 'Google Integrations' },
    { id: 'section-5', title: 'Acceptable Use' },
    { id: 'section-6', title: 'Subscriptions & Payments' },
    { id: 'section-7', title: 'Intellectual Property' },
    { id: 'section-8', title: 'User Data' },
    { id: 'section-9', title: 'Termination' },
    { id: 'section-10', title: 'Disclaimer' },
    { id: 'section-11', title: 'Limitation of Liability' },
    { id: 'section-12', title: 'Governing Law' },
    { id: 'section-13', title: 'Changes' },
    { id: 'section-14', title: 'Contact' },
  ];

  return (
    <div className="cc-page">
      <div className="cc-container cc-legal">
        <div className="cc-page-hero">
          <div className="cc-legal-badge">
            <FileText size={16} /> Legal Documentation
          </div>
          <h1>Terms of Service</h1>
          <p className="cc-effective-date">Effective Date: <strong>July 19, 2026</strong></p>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.92rem', color: '#1e3a8a', fontWeight: 500 }}>Looking for our full 25-section comprehensive Terms & Conditions?</span>
            <Link to="/terms-and-conditions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
              View Terms & Conditions <ArrowRight size={16} />
            </Link>
          </div>

          <div className="cc-intro-box">
            <p>
              Welcome to LinksMeet ("LinksMeet", "we", "our", or "us"). These Terms of Service govern your use of <a href="https://linksmeet.com" target="_blank" rel="noopener noreferrer">https://linksmeet.com</a> and all related services.
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
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing or using LinksMeet, you agree to these Terms.
              </p>
            </section>

            <section id="section-2" className="cc-policy-section">
              <h2>Eligibility</h2>
              <p>
                You must be at least 18 years old.
              </p>
            </section>

            <section id="section-3" className="cc-policy-section">
              <h2>Accounts</h2>
              <p>
                You are responsible for your account and credentials.
              </p>
            </section>

            <section id="section-4" className="cc-policy-section">
              <h2>Google Integrations</h2>
              <p>
                LinksMeet uses Google Sign-In, Google Calendar and Gmail APIs to provide scheduling features.
              </p>
            </section>

            <section id="section-5" className="cc-policy-section">
              <h2>Acceptable Use</h2>
              <p>
                Do not misuse the service, violate laws, interfere with operations, or attempt unauthorized access.
              </p>
            </section>

            <section id="section-6" className="cc-policy-section">
              <h2>Subscriptions & Payments</h2>
              <p>
                Paid subscriptions are billed through secure third-party payment processors. LinksMeet does not store complete payment card numbers or CVV information.
              </p>
            </section>

            <section id="section-7" className="cc-policy-section">
              <h2>Intellectual Property</h2>
              <p>
                All software, branding and content belong to LinksMeet or its licensors.
              </p>
            </section>

            <section id="section-8" className="cc-policy-section">
              <h2>User Data</h2>
              <p>
                You retain ownership of your data while granting us a limited license to provide the Service.
              </p>
            </section>

            <section id="section-9" className="cc-policy-section">
              <h2>Termination</h2>
              <p>
                We may suspend or terminate accounts for violations of these Terms.
              </p>
            </section>

            <section id="section-10" className="cc-policy-section">
              <h2>Disclaimer</h2>
              <p>
                The Service is provided AS IS and AS AVAILABLE without warranties to the extent permitted by law.
              </p>
            </section>

            <section id="section-11" className="cc-policy-section">
              <h2>Limitation of Liability</h2>
              <p>
                LinksMeet is not liable for indirect or consequential damages to the fullest extent permitted by law.
              </p>
            </section>

            <section id="section-12" className="cc-policy-section">
              <h2>Governing Law</h2>
              <p>
                These Terms are governed by the laws of India.
              </p>
            </section>

            <section id="section-13" className="cc-policy-section">
              <h2>Changes</h2>
              <p>
                We may update these Terms at any time. Continued use constitutes acceptance.
              </p>
            </section>

            <section id="section-14" className="cc-policy-section">
              <h2>Contact</h2>
              <p>If you have any questions regarding these Terms of Service, please contact us:</p>
              <div className="cc-contact-card">
                <div className="cc-contact-row">
                  <strong>Website:</strong> <a href="https://linksmeet.com" target="_blank" rel="noopener noreferrer">https://linksmeet.com</a>
                </div>
                <div className="cc-contact-row">
                  <strong>Email:</strong> <a href="mailto:linksmeet@4cloverlabs.com">linksmeet@4cloverlabs.com</a>
                </div>
              </div>
            </section>

            <div className="cc-policy-footer-ack">
              By accessing or using LinksMeet, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
