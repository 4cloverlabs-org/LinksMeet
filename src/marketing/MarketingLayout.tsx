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
      <nav className="cc-nav">
        <div className="cc-nav-inner">
          <Link to="/" className="cc-logo">
            <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 5 }} />
            <span>LinksMeet</span>
          </Link>
          <div className="cc-nav-links">
            <NavLink to="/about">About</NavLink>
            <a href="/#features">Features</a>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          <button className="cc-btn cc-btn-dark" onClick={() => navigate('/signup')}>Book a Demo</button>
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
