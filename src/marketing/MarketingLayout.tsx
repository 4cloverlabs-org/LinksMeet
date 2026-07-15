import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';
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

  return (
    <div className="cc-landing">
      {/* ============ NAVBAR ============ */}
      <nav className="lexaro-nav" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="lexaro-container">
          <div className="lexaro-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
            LinksMeet
          </div>
          <div className="lexaro-nav-links">
            <Link to="/about">About</Link>
            <a href="/#features">Features</a>
            <a href="/#pricing">Pricing</a>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="lexaro-nav-actions">
            <button className="lexaro-btn" style={{ background: 'transparent', color: '#0f172a', fontWeight: 500, padding: '8px 16px' }} onClick={() => navigate('/login')}>Log in</button>
            <button className="lexaro-btn lexaro-btn-dark" onClick={() => navigate('/signup')} style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '14px' }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ============ PAGE ============ */}
      <main>
        <Outlet />
      </main>

      {/* ============ FOOTER ============ */}
      <section className="lexaro-footer-section">
        <div className="lexaro-container">
          <div className="lexaro-footer-grid" style={{ gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr' }}>
            <div className="lexaro-footer-col">
              <div className="lexaro-footer-logo">
                <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
                LinksMeet
              </div>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '240px' }}>
                Online meeting scheduling platform developed to simplify appointment booking and connect your calendars.
              </p>
            </div>
            <div className="lexaro-footer-col">
              <h4>Platform</h4>
              <div className="lexaro-footer-links">
                <a href="/#features">Scheduling</a>
                <a href="/#integrations">Integrations</a>
                <Link to="/pricing">Pricing</Link>
                <Link to="/login">Sign In</Link>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Company</h4>
              <div className="lexaro-footer-links">
                <Link to="/about">About us</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Resources</h4>
              <div className="lexaro-footer-links">
                <Link to="/blog">Help Center</Link>
                <Link to="/blog">Community</Link>
                <Link to="/contact">Support</Link>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Legal</h4>
              <div className="lexaro-footer-links">
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/terms-of-service">Terms of Service</Link>
                <Link to="/terms-and-conditions">Terms & Conditions</Link>
              </div>
            </div>
          </div>

          <div className="lexaro-footer-bottom">
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
