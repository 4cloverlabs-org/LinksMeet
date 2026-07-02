import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { POSTS } from './posts';
import '../pages/Landing.css';

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
            <img src="/logo.png" alt="LinksMeet" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 5 }} />
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
      <footer className="cc-footer">
        <div className="cc-container">
          <div className="cc-footer-grid">
            <div className="cc-foot-col">
              <h5>Product</h5>
              <Link to="/">Home</Link>
              <a href="/#features">Features</a>
              <Link to="/pricing">Pricing</Link>
            </div>
            <div className="cc-foot-col">
              <h5>Company</h5>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/careers">Careers</Link>
            </div>

            <div className="cc-foot-brand">
              <div className="cc-foot-cube cc-floaty" />
              <p>Built for modern<br />sales teams</p>
            </div>

            <div className="cc-foot-col">
              <h5>Resources</h5>
              <Link to="/blog">Blog</Link>
              <Link to={`/blog/${firstPost}`}>Latest article</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div className="cc-foot-col">
              <h5>Legal</h5>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Support</Link>
            </div>
          </div>

          <div className="cc-foot-bottom">
            <span className="copy">LinksMeet © {new Date().getFullYear()}</span>
            <div className="cc-socials">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
