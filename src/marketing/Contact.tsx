import { Mail, MessageSquare, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="cc-page-hero cc-reveal">
          <h1 className="linksmeet-system-title" style={{ margin: 0, lineHeight: 0.95, fontWeight: 575 }}>Let’s talk.</h1>
          <p style={{ fontSize: '1rem', fontWeight: 400, color: '#64748b', maxWidth: '600px', marginTop: '16px' }}>Questions about LinksMeet, pricing, or migrating from another tool? Book a time below.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '40px' }}>
          {/* Form */}
          <div className="cc-contact-form cc-reveal" style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none', width: '100%', maxWidth: '800px' }}>
            <iframe src="https://linksmeet.com/book/674dd1d4-ee4a-4cd6-a761-9b7d3d82052e/30min?primary=%237d3bec" width="100%" height="700" frameBorder="0" style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
