import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, ArrowLeft } from 'lucide-react';
import { POSTS } from './posts';
import '../pages/Landing.css';
import './Legal.css';

export default function MarketingLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Scroll to top + (re)bind scroll-reveal on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const els = Array.from(document.querySelectorAll<HTMLElement>('.cc-reveal'));
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach(el => el.classList.add('cc-in'));
      return;
    }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('cc-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  const firstPost = POSTS[0].slug;
  const isLegalPage = ['/privacy-policy', '/terms-of-service', '/terms-and-conditions'].includes(pathname);

  return (
    <div className="cc-landing">
      {/* ============ NAVBAR ============ */}
      {!isLegalPage && (
      <nav className="linksmeet-nav" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="linksmeet-container">
          <div className="linksmeet-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
            LinksMeet
          </div>
          <div className="linksmeet-nav-links">
            <Link to="/about">About</Link>
            <a href="/#features">Features</a>
            <a href="/#pricing">Pricing</a>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="linksmeet-nav-actions">
            <button className="linksmeet-btn" style={{ background: 'transparent', color: '#0f172a', fontWeight: 500, padding: '8px 16px' }} onClick={() => navigate('/login')}>Log in</button>
            <button className="linksmeet-btn linksmeet-btn-dark" onClick={() => navigate('/signup')} style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '14px' }}>Get Started</button>
          </div>
        </div>
      </nav>
      )}

      {/* ============ PAGE ============ */}
      <main>
        {isLegalPage && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 0', width: '100%', boxSizing: 'border-box' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                background: 'transparent',
                color: '#6B7280',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#111827';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.transform = 'translateX(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#6B7280';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={18} style={{ transition: 'transform 0.2s ease' }} />
              <span>Back</span>
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* ============ FOOTER ============ */}
      <section className="linksmeet-footer-section">
        <div className="linksmeet-container">
          <div className="linksmeet-footer-grid" style={{ gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr' }}>
            <div className="linksmeet-footer-col">
              <div className="linksmeet-footer-logo">
                <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
                LinksMeet
              </div>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '240px' }}>
                Online meeting scheduling platform developed to simplify appointment booking and connect your calendars.
              </p>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Platform</h4>
              <div className="linksmeet-footer-links">
                <a href="/#features">Scheduling</a>
                <a href="/#integrations">Integrations</a>
                <Link to="/pricing">Pricing</Link>
                <Link to="/login">Sign In</Link>
              </div>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Company</h4>
              <div className="linksmeet-footer-links">
                <Link to="/about">About us</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Resources</h4>
              <div className="linksmeet-footer-links">
                <Link to="/blog">Help Center</Link>
                <Link to="/blog">Community</Link>
                <Link to="/contact">Support</Link>
              </div>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Legal</h4>
              <div className="linksmeet-footer-links">
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/terms-of-service">Terms of Service</Link>
                <Link to="/terms-and-conditions">Terms & Conditions</Link>
              </div>
            </div>
          </div>

          <div className="linksmeet-footer-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span>© {new Date().getFullYear()} LinksMeet. All rights reserved.</span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Twitter size={20} color="#888" style={{ cursor: 'pointer' }} />
              <Github size={20} color="#888" style={{ cursor: 'pointer' }} />
              <Linkedin size={20} color="#888" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
