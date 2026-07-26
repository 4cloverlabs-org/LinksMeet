import { useEffect } from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

export default function Contact() {
  useEffect(() => {
    // In React, script tags in JSX do not execute. We must inject it manually.
    if ((window as any).LinksMeet && (window as any).LinksMeet.init) {
      (window as any).LinksMeet.init();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://linksmeet.com/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
            {/* LinksMeet inline widget begin */}
            <div className="linksmeet-inline-widget" data-url="https://linksmeet.com/book/674dd1d4-ee4a-4cd6-a761-9b7d3d82052e/30min" data-auto-sync="false" style={{ minWidth: '320px', height: '700px' }}></div>
            {/* LinksMeet inline widget end */}
          </div>
        </div>
      </div>
    </div>
  );
}
