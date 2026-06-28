import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'framer-motion';
import { Check, Target, Slack, Github, Twitter, Linkedin, CheckCircle2, FileText, GitMerge, BarChart3, Sparkles, Wand2, AlignLeft, ListChecks, Database } from 'lucide-react';
import './Landing.css';

const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

/* ---- Real brand logos for the integrations orbit ---- */
const SalesforceLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-label="Salesforce">
    <path d="M10.1 8.6a3.1 3.1 0 0 1 5.4.8 2.7 2.7 0 1 1 .5 5.3H8.1a2.9 2.9 0 0 1-.5-5.7 3.3 3.3 0 0 1 2.5-.4z" fill="#00A1E0" />
  </svg>
);
const HubspotLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-label="HubSpot">
    <circle cx="9.5" cy="15" r="4.3" fill="none" stroke="#FF7A59" strokeWidth="2" />
    <circle cx="17" cy="7.2" r="2.3" fill="#FF7A59" />
    <path d="M14.8 7.2H12.5V12" stroke="#FF7A59" strokeWidth="2" fill="none" />
  </svg>
);
const GmailLogo = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" aria-label="Gmail">
    <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7a3 3 0 0 0 3-3z" />
    <path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6a3 3 0 0 1-3-3z" />
    <path fill="#e53935" d="M35 11.2L24 19.45 13 11.2 12 17l1 6.7 11 8.25 11-8.25 1-6.7z" />
    <path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859A4.298 4.298 0 0 0 3 12.298z" />
    <path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341A4.298 4.298 0 0 1 45 12.298z" />
  </svg>
);
const OutlookLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-label="Outlook">
    <rect x="10" y="4.5" width="11.5" height="15" rx="1" fill="#0F6CBD" />
    <rect x="12" y="8" width="8" height="4.5" fill="#fff" opacity="0.85" />
    <ellipse cx="7" cy="12" rx="6.2" ry="5.2" fill="#0A4F8F" />
    <ellipse cx="7" cy="12" rx="3" ry="3.4" fill="none" stroke="#fff" strokeWidth="1.7" />
  </svg>
);
const SlackLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-label="Slack">
    <path fill="#36C5F0" d="M9.6 3.5a1.85 1.85 0 1 0 0 3.7h1.85V5.35A1.85 1.85 0 0 0 9.6 3.5m0 4.93H4.65a1.85 1.85 0 1 0 0 3.7H9.6a1.85 1.85 0 0 0 0-3.7" />
    <path fill="#2EB67D" d="M20.5 10.28a1.85 1.85 0 1 0-3.7 0v1.85h1.85a1.85 1.85 0 0 0 1.85-1.85m-4.93 0V5.35a1.85 1.85 0 1 0-3.7 0v4.93a1.85 1.85 0 0 0 3.7 0" />
    <path fill="#ECB22E" d="M14.4 20.5a1.85 1.85 0 1 0 0-3.7h-1.85v1.85c0 1.02.83 1.85 1.85 1.85m0-4.93h4.95a1.85 1.85 0 1 0 0-3.7H14.4a1.85 1.85 0 0 0 0 3.7" />
    <path fill="#E01E5A" d="M3.5 13.72a1.85 1.85 0 1 0 3.7 0v-1.85H5.35a1.85 1.85 0 0 0-1.85 1.85m4.93 0v4.93a1.85 1.85 0 1 0 3.7 0v-4.93a1.85 1.85 0 0 0-3.7 0" />
  </svg>
);
const NotionLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-label="Notion">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#111" strokeWidth="1.2" />
    <path d="M8 16V9l5 6V9" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ZapierLogo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-label="Zapier">
    <g stroke="#FF4F00" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 4v16" /><path d="M4 12h16" /><path d="M6.3 6.3l11.4 11.4" /><path d="M17.7 6.3 6.3 17.7" />
    </g>
  </svg>
);
const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" aria-label="Google">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.2 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.2 29.1 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C42.6 35.4 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

const SectionGridLine = () => (
  <div style={{
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '1120px',
    borderBottom: '1px dashed rgba(0,0,0,0.15)',
    zIndex: 50
  }}>
    <div style={{ position: 'absolute', bottom: -2, left: -2, width: 5, height: 5, background: 'rgba(0,0,0,0.4)' }} />
    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 5, height: 5, background: 'rgba(0,0,0,0.4)' }} />
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const goSignup = () => navigate('/signup');
  
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="lexaro-landing" style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Outer bounding box simulating the Framer canvas */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '80px' }}>
        {/* Global Vertical Lines passing throughout the main content (stops before footer) */}
        <div className="global-vertical-line left-line" />
        <div className="global-vertical-line right-line" />

      {/* ============ NAVBAR ============ */}
      <nav className="lexaro-nav" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="lexaro-container">
          <div className="lexaro-logo">
            <div style={{ width: '10px', height: '10px', background: '#111', transform: 'rotate(45deg)', borderRadius: '1px', marginRight: '2px' }} />
            SaleMail
          </div>
          <div className="lexaro-nav-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="lexaro-nav-actions">
            <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup}>Get Started</button>
          </div>
        </div>
        
        <SectionGridLine />
      </nav>

        {/* ============ HERO ============ */}
        <section className="lexaro-hero" id="home" style={{ position: 'relative' }}>
          
          {/* Subtle Grid Background */}
          <div className="hero-grid-bg" />

          <div className="lexaro-container" style={{ position: 'relative', zIndex: 10 }}>
            
            {/* Floating Cursors */}
            <div className="floating-cursor sarah-cursor">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#60a5fa" xmlns="http://www.w3.org/2000/svg" className="cursor-svg">
                 <path d="M4 2L20 12L12 14L10 22L4 2Z" fill="#60a5fa" stroke="white" strokeWidth="2"/>
              </svg>
              <div className="cursor-label" style={{ background: '#60a5fa' }}>Sarah</div>
            </div>
            
            <div className="floating-cursor aaron-cursor">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg" className="cursor-svg">
                 <path d="M4 2L20 12L12 14L10 22L4 2Z" fill="#f59e0b" stroke="white" strokeWidth="2"/>
              </svg>
              <div className="cursor-label" style={{ background: '#f59e0b', color: '#fff' }}>Aaron</div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ position: 'relative', zIndex: 20 }}
            >
              <div className="lexaro-badge">
                AI-Powered Sales Engagement Platform
              </div>
              <h1 className="lexaro-hero-title">More qualified meetings with<br />intelligent automation</h1>
              <p className="lexaro-hero-sub">
                SaleMail combines lead discovery, personalized cold outreach, email deliverability,<br />
                and meeting scheduling into one seamless workspace.
              </p>
              <div className="lexaro-hero-cta">
                <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup} style={{ borderRadius: '100px', padding: '14px 28px', fontSize: '1rem', fontWeight: 600 }}>
                  Start prospecting
                </button>
                <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ borderRadius: '100px', padding: '14px 28px', fontSize: '1rem', fontWeight: 600, border: '1px solid #e5e5e5', background: '#fff', color: '#000' }}>
                  See examples ↗
                </button>
              </div>
            </motion.div>

            {/* Bottom Graphic Showcase */}
            <div style={{ perspective: '2000px', padding: '10px 0 120px', display: 'flex', justifyContent: 'center' }}>
              <motion.div
                className="hero-graphic-container"
                initial={{ opacity: 0, y: 80, x: 0, rotateX: 0, rotateY: 0, rotateZ: -12 }}
                animate={{ opacity: 1, y: 0, x: 0, rotateX: 0, rotateY: 0, rotateZ: -8 }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  maxWidth: '1000px',
                  overflow: 'visible',
                  display: 'block',
                  position: 'relative'
                }}
              >
                <img 
                  src="/hero.png" 
                  alt="Hero Graphic" 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block'
                  }} 
                />
              </motion.div>
            </div>
          </div>
          <SectionGridLine />
        </section>


      {/* ============ TRUSTED LOGOS ============ */}
      <section className="lexaro-trusted" style={{ position: 'relative' }}>
        <div className="lexaro-container">
          <FadeUp>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>Trusted by innovative teams worldwide</p>
            <div className="lexaro-marquee-wrapper">
              <div className="lexaro-marquee-track">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="lexaro-marquee-items">
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L22 20H2L12 2Z"/></svg>
                      Vercel
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.05em' }}>Retool</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 14, height: 14, background: 'currentColor', borderRadius: '50%' }} />
                      Segment
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Stripe</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 500, fontFamily: 'serif', letterSpacing: '0.05em' }}>Notion</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.03em' }}>Linear</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
        <SectionGridLine />
      </section>

      {/* ============ THE PROBLEM (LEGACY WORKFLOWS) ============ */}
      <section className="lexaro-legacy-section" style={{ padding: '80px 0', position: 'relative' }}>
        <div className="lexaro-container" style={{ position: 'relative', borderLeft: '1px solid #eaeaea', borderRight: '1px solid #eaeaea' }}>
          
          {/* Top Hatched Bar */}
          <div className="hatched-bg" style={{ position: 'absolute', top: -49, left: -1, right: -1, borderLeft: '1px solid #eaeaea', borderRight: '1px solid #eaeaea', height: '48px' }} />

          {/* Bottom Hatched Bar */}
          <div className="hatched-bg" style={{ position: 'absolute', bottom: -49, left: -1, right: -1, borderLeft: '1px solid #eaeaea', borderRight: '1px solid #eaeaea', height: '48px' }} />

          {/* Corner Markers Removed */}

          <div style={{ padding: '80px 60px' }}>
            <FadeUp>
              <div className="lexaro-legacy-header" style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2.8rem' }}>The problem with legacy<br />outbound workflows</h2>
                <p>Fragmented sales tools kill productivity. Teams juggle too many platforms — and it slows everything down.</p>
              </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="lexaro-legacy-grid-2">
              {/* Left Card: Scattered */}
              <div className="lexaro-legacy-card">
                <h3>Fragmented Data Silos</h3>
                <p>Prospects live in ZoomInfo. Emails live in Outreach. Calendars live in Google. Nothing is connected, causing data leaks and lost deals.</p>
                <div className="lexaro-legacy-visual">
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <path d="M 50 200 L 120 170 L 150 210 L 250 160 L 330 180 L 400 130" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                  </svg>
                  
                  {/* Point Dots */}
                  <div style={{ position: 'absolute', top: 196, left: 46, width: 8, height: 8, background: '#111', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 0 4px #eee' }} />
                  <div style={{ position: 'absolute', top: 166, left: 116, width: 8, height: 8, background: '#111', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 0 4px #eee' }} />
                  <div style={{ position: 'absolute', top: 206, left: 146, width: 8, height: 8, background: '#111', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 0 4px #eee' }} />
                  <div style={{ position: 'absolute', top: 156, left: 246, width: 8, height: 8, background: '#111', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 0 4px #eee' }} />
                  <div style={{ position: 'absolute', top: 176, left: 326, width: 8, height: 8, background: '#111', borderRadius: '50%', zIndex: 2, boxShadow: '0 0 0 4px #eee' }} />

                  {/* Pills */}
                  <div className="lexaro-node-pill" style={{ top: '130px', left: '80px', transform: 'rotate(-10deg)', zIndex: 3 }}>
                    ZoomInfo
                    <div className="lexaro-warning-icon">!</div>
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '120px', left: '220px', transform: 'rotate(10deg)', zIndex: 3 }}>
                    Outreach
                    <div className="lexaro-warning-icon">!</div>
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '200px', left: '160px', transform: 'rotate(5deg)', zIndex: 3 }}>
                    Calendly
                    <div className="lexaro-warning-icon">!</div>
                  </div>
                </div>
              </div>

              {/* Right Card: Unified */}
              <div className="lexaro-legacy-card">
                <h3>The All-In-One Revenue Engine</h3>
                <p>SaleMail unifies your lead discovery, automated sequences, and meeting scheduling into a single, intelligent workspace.</p>
                <div className="lexaro-legacy-visual">
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <path d="M 120 180 C 150 180, 150 100, 190 100" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                    <path d="M 120 180 C 160 180, 160 180, 190 180" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                    <path d="M 120 180 C 150 180, 150 250, 190 250" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                  </svg>
                  
                  {/* SaleMail Node */}
                  <div className="lexaro-node-lexaro" style={{ top: '140px', left: '30px', zIndex: 3 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                      <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                      <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
                    </svg>
                    SaleMail
                  </div>

                  {/* Pills */}
                  <div className="lexaro-node-pill" style={{ top: '80px', left: '190px', zIndex: 3 }}>
                    <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    Verified Data
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '160px', left: '190px', zIndex: 3 }}>
                    <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    AI Sequences
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '230px', left: '190px', zIndex: 3 }}>
                    <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    Auto-Booking
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Bottom 4 Features */}
          <FadeUp delay={0.2}>
            <div className="lexaro-legacy-grid-4">
              <div className="lexaro-feature-col">
                <h4><CheckCircle2 size={20} strokeWidth={1.5} /> AI Personalization</h4>
                <p>Generate highly personalized icebreakers and emails at scale.</p>
              </div>
              <div className="lexaro-feature-col">
                <h4><FileText size={20} strokeWidth={1.5} /> Deliverability Excellence</h4>
                <p>Protect sender reputation with SPF/DKIM tracking and warm-up.</p>
              </div>
              <div className="lexaro-feature-col">
                <h4><GitMerge size={20} strokeWidth={1.5} /> Cold Email Automation</h4>
                <p>Build multi-step sequences with smart delays and A/B testing.</p>
              </div>
              <div className="lexaro-feature-col">
                <h4><BarChart3 size={20} strokeWidth={1.5} /> Meeting Scheduling</h4>
                <p>Let prospects book meetings directly with calendar sync.</p>
              </div>
            </div>
          </FadeUp>
          </div>
        </div>
        <SectionGridLine />
      </section>

      {/* ============ THE SYSTEM (EXACT MATCH) ============ */}
      <section className="lexaro-system-section" id="features" style={{ position: 'relative' }}>
        <div className="lexaro-container">
          <FadeUp>
            <h2 className="lexaro-system-title">Turn scattered sales tools into a<br />controlled system</h2>
          </FadeUp>

          <div className="lexaro-stack">
          <div className="lexaro-stack-item">
            <div className="lexaro-system-box">
              <div className="lexaro-system-visual-container">
                <div className="lexaro-system-visual">
                  {/* SVG Paths connecting cards to center node */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <path d="M 260 70 C 350 70, 350 210, 410 210" fill="none" stroke="#334155" strokeWidth="1.5" strokeOpacity="0.4" />
                    <path d="M 260 160 C 350 160, 350 210, 410 210" fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.4" />
                    <path d="M 260 250 C 350 250, 350 210, 410 210" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.4" />
                    <path d="M 260 340 C 350 340, 350 210, 410 210" fill="none" stroke="#525252" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>

                  {/* Mid-path Dots */}
                  <div className="lexaro-path-dot" style={{ background: '#334155', top: 120, left: 350 }} />
                  <div className="lexaro-path-dot" style={{ background: '#64748b', top: 180, left: 330 }} />
                  <div className="lexaro-path-dot" style={{ background: '#2563eb', top: 235, left: 326 }} />
                  <div className="lexaro-path-dot" style={{ background: '#111', top: 295, left: 345 }} />

                  {/* Card 1: PDF */}
                  <div className="lexaro-doc-card" style={{ top: 40, left: 40, borderLeft: '4px solid #334155' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#334155' }}>
                      <FileText size={20} />
                    </div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Lead Database.csv</div>
                      <div className="lexaro-doc-card-sub">Verified contacts</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 2: Slack */}
                  <div className="lexaro-doc-card" style={{ top: 130, left: 40, borderLeft: '4px solid #f97316' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#f97316' }}>
                      <Wand2 size={20} />
                    </div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Cold Sequences</div>
                      <div className="lexaro-doc-card-sub">Email outreach</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 3: Glossary */}
                  <div className="lexaro-doc-card" style={{ top: 220, left: 40, borderLeft: '4px solid #2563eb' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}>
                      <FileText size={20} />
                    </div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Sender Reputation</div>
                      <div className="lexaro-doc-card-sub">Domain warm-up</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 4: Notion */}
                  <div className="lexaro-doc-card" style={{ top: 310, left: 40, borderLeft: '4px solid #111' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}>
                      <Database size={20} /> {/* Using Target as placeholder for Notion logo */}
                    </div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Salesforce Sync</div>
                      <div className="lexaro-doc-card-sub">CRM Data</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* SaleMail Center Node */}
                  <div className="lexaro-center-ring">
                    {/* Ring edge markers */}
                    <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', bottom: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', left: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', right: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    
                    <div className="lexaro-center-node">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                        <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                        <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lexaro-system-content">
                <h3>Turn scattered lead data into qualified meetings</h3>
                <p>Discover verified prospects, generate highly personalized cold emails, and schedule meetings automatically.</p>
                <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ padding: '14px 28px', fontSize: '15px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -1, left: -1, width: 4, height: 4, borderLeft: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', top: -1, right: -1, width: 4, height: 4, borderRight: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: -1, left: -1, width: 4, height: 4, borderLeft: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: -1, right: -1, width: 4, height: 4, borderRight: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  See examples ↗
                </button>
              </div>
            </div>
          </div>

          {/* Block 2: Enforce tone */}
          <div className="lexaro-stack-item">
            <div className="lexaro-system-box">
              <div className="lexaro-system-content" style={{ padding: '40px 40px 40px 80px' }}>
                <h3>Manage conversations from a Unified Communication Hub</h3>
                <p>Centralize replies from Gmail and Outlook, categorize conversations using AI, and manage every lead from a single inbox.</p>
                <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ padding: '14px 28px', fontSize: '15px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -1, left: -1, width: 4, height: 4, borderLeft: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', top: -1, right: -1, width: 4, height: 4, borderRight: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: -1, left: -1, width: 4, height: 4, borderLeft: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: -1, right: -1, width: 4, height: 4, borderRight: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  See examples ↗
                </button>
              </div>

              <div className="lexaro-system-visual-container">
                <div className="lexaro-system-visual" style={{ height: '420px' }}>
                  <div className="lexaro-correction-card" style={{ position: 'absolute', top: '30px', left: '40px', right: '40px', bottom: '30px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 2 }}>
                    
                    {/* Text Preview */}
                    <div style={{ padding: '16px 24px', fontSize: '0.95rem', color: '#111' }}>Draft Preview</div>
                    <div style={{ padding: '0 24px 20px', fontSize: '1rem', color: '#111', lineHeight: '1.6' }}>
                      <span style={{ background: '#ffedd5', color: '#9a3412', padding: '2px 4px', borderRadius: '2px' }}>Buy my product.</span> It is <span style={{ background: '#ffedd5', color: '#9a3412', padding: '2px 4px', borderRadius: '2px' }}>the best on the market.</span>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #fde68a', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '2px', fontSize: '0.75rem' }}>
                          <div style={{ width: 14, height: 14, background: '#d97706', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>!</div>
                          Low personalization
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #fde68a', background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '2px', fontSize: '0.75rem' }}>
                          <div style={{ width: 14, height: 14, background: '#d97706', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>!</div>
                          Spam trigger detected
                        </div>
                      </div>
                    </div>

                    {/* Corrected Version */}
                    <div style={{ background: '#f5f5f5', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea', padding: '12px 24px', fontSize: '0.95rem', color: '#111' }}>AI Optimized Version</div>
                    <div style={{ padding: '20px 24px', fontSize: '1rem', color: '#111', lineHeight: '1.6' }}>
                      <span style={{ background: '#bbf7d0', color: '#166534', padding: '2px 4px', borderRadius: '2px' }}>Hi Sarah,</span> saw your recent post on <span style={{ background: '#bbf7d0', color: '#166534', padding: '2px 4px', borderRadius: '2px' }}>RevOps efficiency</span>. We help teams like yours scale...
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '2px', fontSize: '0.75rem' }}>
                          <div style={{ width: 14, height: 14, background: '#059669', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>✓</div>
                          Highly personalized
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '2px', fontSize: '0.75rem' }}>
                          <div style={{ width: 14, height: 14, background: '#059669', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>✓</div>
                          Inbox placement optimized
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ background: '#f9f9f9', borderTop: '1px solid #eaeaea', padding: '16px 24px', flex: 1 }}>
                      <span style={{ display: 'inline-block', background: '#f1f1f1', color: '#555', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '2px' }}>AI Personalization active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Generate aligned content */}
          <div className="lexaro-stack-item">
            <div className="lexaro-system-box">
              <div className="lexaro-system-visual-container">
                <div className="lexaro-system-visual" style={{ height: '420px', overflow: 'hidden' }}>
                  
                  {/* Central Node at bottom */}
                  <div className="lexaro-center-ring" style={{ top: 'auto', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    {/* Ring edge markers */}
                    <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', bottom: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', left: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', right: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    
                    <div className="lexaro-center-node">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                        <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                        <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
                      </svg>
                    </div>
                  </div>

                  {/* Dashed lines connecting to center */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <path d="M 230 340 L 120 100" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 230 340 L 250 140" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 230 340 L 100 200" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 230 340 L 220 250" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>

                  {/* Card 1: PDF */}
                  <div className="lexaro-doc-card" style={{ top: 20, left: 30, borderLeft: '4px solid #334155', transform: 'rotate(-4deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#334155' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Lead Qualified</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 40, left: 40, borderLeft: '4px solid #334155', transform: 'rotate(-3deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#334155' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Lead Qualified</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 2: Slack */}
                  <div className="lexaro-doc-card" style={{ top: 80, left: 160, borderLeft: '4px solid #64748b', transform: 'rotate(7deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#f97316' }}><AlignLeft size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Meeting Scheduled</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 100, left: 150, borderLeft: '4px solid #64748b', transform: 'rotate(8deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#f97316' }}><AlignLeft size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Meeting Scheduled</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 3: Glossary */}
                  <div className="lexaro-doc-card" style={{ top: 130, left: 30, borderLeft: '4px solid #2563eb', transform: 'rotate(5deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Proposal Sent</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 150, left: 36, borderLeft: '4px solid #2563eb', transform: 'rotate(6deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Proposal Sent</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 4: Notion */}
                  <div className="lexaro-doc-card" style={{ top: 220, left: 160, borderLeft: '4px solid #111', transform: 'rotate(-8deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><CheckCircle2 size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Closed Won</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 200, left: 140, borderLeft: '4px solid #111', transform: 'rotate(-10deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><CheckCircle2 size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Closed Won</div>
                      <div className="lexaro-doc-card-sub">Pipeline Updated</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                </div>
              </div>

              <div className="lexaro-system-content">
                <h3>Track the complete customer journey through a CRM</h3>
                <p>Customizable pipelines to monitor opportunities, meetings, and revenue with detailed real-time analytics.</p>
                <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ padding: '14px 28px', fontSize: '15px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -1, left: -1, width: 4, height: 4, borderLeft: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', top: -1, right: -1, width: 4, height: 4, borderRight: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: -1, left: -1, width: 4, height: 4, borderLeft: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: -1, right: -1, width: 4, height: 4, borderRight: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  See examples ↗
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
        <SectionGridLine />
      </section>

      {/* ============ CORE OPERATIONS (Grid) ============ */}
      <section className="lexaro-operations-section" id="operations" style={{ position: 'relative' }}>
        <div className="lexaro-container lexaro-operations-container">
          <FadeUp>
            <div className="lexaro-operations-header">
              <h2>Core outbound operations</h2>
              <p>An integrated suite of intelligent tools designed to accelerate pipeline generation and orchestrate campaigns at scale.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="lexaro-operations-grid">
              {/* Card 1 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-visual">
                  <div className="lx-bar-chart">
                    <div className="lx-bar" style={{ height: '40%' }}></div>
                    <div className="lx-bar" style={{ height: '60%' }}></div>
                    <div className="lx-bar" style={{ height: '30%' }}></div>
                    <div className="lx-bar active" style={{ height: '90%' }}></div>
                    <div className="lx-bar" style={{ height: '50%' }}></div>
                    <div className="lx-bar" style={{ height: '70%' }}></div>
                    <div className="lx-bar" style={{ height: '45%' }}></div>
                  </div>
                </div>
                <div className="lexaro-op-content">
                  <h3>Prospect Intelligence</h3>
                  <p>Uncover high-intent accounts and verified decision-makers with advanced data enrichment and precision targeting.</p>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-visual">
                  <div className="lx-email-window">
                    <div className="lx-email-line" style={{ width: '40%' }}></div>
                    <div className="lx-email-line" style={{ width: '80%' }}></div>
                    <div className="lx-email-line" style={{ width: '60%' }}></div>
                    <div className="lx-email-line" style={{ width: '90%', marginBottom: '0' }}></div>
                    <div className="lx-email-btn">SEND EMAIL</div>
                    <div style={{ position: 'absolute', top: '20%', right: '15%', color: '#fff' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="lexaro-op-content">
                  <h3>Generative AI Personalization</h3>
                  <p>Deploy hyper-personalized outreach at scale, dynamically tailoring subject lines and copy to each individual prospect.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-visual">
                  <div className="lx-honeycomb">
                    <div className="lx-hex" style={{ opacity: 0.2 }}></div>
                    <div className="lx-hex" style={{ background: '#333', color: '#fff' }}><Sparkles size={16} /></div>
                    <div className="lx-hex" style={{ opacity: 0.2 }}></div>
                    <div className="lx-hex" style={{ background: '#555', color: '#fff' }}><Database size={16} /></div>
                    <div className="lx-hex" style={{ background: '#fff', color: '#111' }}><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" width="16" alt="github" /></div>
                    <div className="lx-hex" style={{ background: '#555', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.53-1.09a.09.09 0 0 0-.07-.03c-1.5.26-2.94.71-4.27 1.33a.08.08 0 0 0-.04.03C1.84 10.87.5 16.03.86 21.09a.08.08 0 0 0 .03.06c1.78 1.32 3.5 2.13 5.17 2.67a.08.08 0 0 0 .09-.03c.4-.55.77-1.13 1.09-1.74a.08.08 0 0 0-.04-.11 11.23 11.23 0 0 1-1.62-.77.08.08 0 0 1-.01-.13c.12-.09.23-.19.34-.29a.08.08 0 0 1 .08-.01c3.4 1.55 7.07 1.55 10.45 0a.08.08 0 0 1 .08.01c.11.1.22.2.34.29a.08.08 0 0 1-.01.13 11.23 11.23 0 0 1-1.62.77.08.08 0 0 0-.04.11c.32.61.69 1.19 1.09 1.74a.08.08 0 0 0 .09.03c1.67-.54 3.39-1.35 5.17-2.67a.08.08 0 0 0 .03-.06c.4-5.41-1.12-10.46-4.06-15.68a.08.08 0 0 0-.04-.03zM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.41s.96-2.41 2.15-2.41c1.19 0 2.16 1.08 2.15 2.41 0 1.33-.96 2.41-2.15 2.41zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41s.96-2.41 2.15-2.41c1.19 0 2.16 1.08 2.15 2.41 0 1.33-.96 2.41-2.15 2.41z"/></svg></div>
                    <div className="lx-hex" style={{ background: '#333', color: '#fff' }}><ListChecks size={16} /></div>
                    <div className="lx-hex" style={{ background: '#555', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.99 12c0-6.63-5.37-12-12-12s-12 5.37-12 12c0 5.96 4.35 10.9 10 11.84v-8.38h-3v-3.46h3v-2.64c0-2.96 1.8-4.58 4.45-4.58 1.27 0 2.37.09 2.69.13v3.12l-1.84.01c-1.44 0-1.72.69-1.72 1.69v2.22h3.41l-.44 3.46h-2.97v8.38c5.65-.94 10-5.88 10-11.84z"/></svg></div>
                    <div className="lx-hex" style={{ opacity: 0.2 }}></div>
                  </div>
                </div>
                <div className="lexaro-op-content">
                  <h3>Intelligent Automation</h3>
                  <p>Design sophisticated, multi-step engagement cadences featuring smart conditional delays and multivariate A/B testing.</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-visual">
                  <div style={{ position: 'relative', width: '240px', height: '140px' }}>
                    {/* Line chart visualization */}
                    <svg viewBox="0 0 240 140" style={{ width: '100%', height: '100%' }}>
                      <path d="M 0 120 Q 30 110, 60 125 T 120 100 T 180 80 T 240 40" fill="none" stroke="#fff" strokeWidth="2" className="lx-chart-path" />
                      <path d="M 0 130 Q 40 120, 80 135 T 160 110 T 240 90" fill="none" stroke="#555" strokeWidth="1.5" strokeDasharray="4 4" />
                      {/* Active point marker */}
                      <circle cx="120" cy="100" r="4" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
                      <rect x="100" y="70" width="40" height="20" rx="10" fill="#fff" />
                      <text x="120" y="84" fill="#111" fontSize="10" fontWeight="bold" textAnchor="middle">32.8k</text>
                    </svg>
                    <div style={{ position: 'absolute', top: 10, left: 10, color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Sales performance<br/><span style={{ fontSize: '18px' }}>$4,068,400</span></div>
                    <div style={{ position: 'absolute', top: 10, right: 10, color: '#aaa', fontSize: '10px' }}>Last 30 days</div>
                  </div>
                </div>
                <div className="lexaro-op-content">
                  <h3>Frictionless Scheduling</h3>
                  <p>Accelerate the sales cycle with embedded, secure calendar synchronization, empowering prospects to book seamlessly.</p>
                </div>
              </div>

              {/* Card 5 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-visual">
                  <div className="lx-badge">
                    <div style={{ position: 'relative', zIndex: 2, color: '#fff' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill="currentColor"/>
                        <path d="M8 12L11 15L16 9" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="lexaro-op-content">
                  <h3>Centralized Command Center</h3>
                  <p>Consolidate communications across all sender domains into a single inbox, featuring AI-driven intent classification.</p>
                </div>
              </div>

              {/* Card 6 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-visual">
                  {/* Calendar / Schedule mockup */}
                  <div style={{ width: '180px', background: '#222', borderRadius: '8px', padding: '12px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>
                      <span>October</span>
                      <span style={{ color: '#fff' }}>&lt; &gt;</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '8px', color: '#666', marginBottom: '8px' }}>
                      <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                      {Array.from({length: 14}).map((_, i) => (
                        <div key={i} style={{ aspectRatio: '1/1', background: i === 9 ? '#fff' : '#1a1a1a', borderRadius: '4px', border: '1px solid #333', animation: i === 9 ? 'lxCalendarBlink 6s infinite' : 'none' }}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="lexaro-op-content">
                  <h3>Purpose-Built Sales CRM</h3>
                  <p>Gain full visibility into the customer journey with real-time analytics and fully customizable revenue pipelines.</p>
                </div>
              </div>

            </div>
          </FadeUp>

        </div>
      </section>

      {/* ============ HOW IT WORKS (Image Match) ============ */}
      <section className="lexaro-steps-section" id="how-it-works">
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-steps-header">
              <h2>How your outreach becomes<br />a revenue machine</h2>
              <p>Connect your data once. SaleMail automates your pipeline generation automatically.</p>
            </div>
          </FadeUp>

          <div className="lexaro-steps-grid">
            {/* Step 1 */}
            <FadeUp delay={0.1} className="lexaro-full-height">
              <div className="lexaro-step-card" style={{ height: '100%' }}>
                <div className="lexaro-step-visual">
                  <svg className="lexaro-step-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                     <path d="M 50% 60 L 50% 280" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                     <path d="M 60 120 L 50% 280" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                     <path d="M calc(100% - 60px) 120 L 50% 280" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                  
                  {/* Nodes */}
                  <div className="lexaro-mini-card" style={{ top: 40, left: '50%', transform: 'translateX(-50%)' }}>
                    <FileText size={14} color="#334155" /> Lead Search
                  </div>
                  <div className="lexaro-mini-card" style={{ top: 100, left: 20 }}>
                    <Slack size={14} color="#f97316" /> Filtering
                  </div>
                  <div className="lexaro-mini-card" style={{ top: 100, right: 20 }}>
                    <FileText size={14} color="#2563eb" /> Data Enrichment
                  </div>
                  <div className="lexaro-mini-card" style={{ top: 160, left: '50%', transform: 'translateX(-50%)' }}>
                    <Target size={14} color="#2563eb" /> Verification
                  </div>
                  
                  {/* Receiver */}
                  <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2 }}>
                    <div style={{ width: 32, height: 32, background: '#111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                        <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#fff" />
                        <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#aaa" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>SaleMail AI</div>
                    <div style={{ fontSize: '0.6rem', color: '#888' }}>Building Target List...</div>
                  </div>
                </div>
                
                <div className="lexaro-step-label">Step 1</div>
                <h3>Discover high-quality prospects</h3>
                <p>Define your ICP. SaleMail finds and verifies decision-makers automatically.</p>
              </div>
            </FadeUp>

            {/* Step 2 */}
            <FadeUp delay={0.2} className="lexaro-full-height">
              <div className="lexaro-step-card" style={{ height: '100%' }}>
                <div className="lexaro-step-visual">
                  <svg className="lexaro-step-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                     <path d="M 60 80 L 50% 50%" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                     <path d="M calc(100% - 60px) 80 L 50% 50%" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                     <path d="M 50% calc(100% - 80px) L 50% 50%" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>

                  <div className="lexaro-mini-chip" style={{ top: 60, left: 40 }}>
                    <div className="lexaro-mini-chip-icon"><Check size={10} strokeWidth={3} /></div> Variables
                  </div>
                  <div className="lexaro-mini-chip" style={{ top: 60, right: 40 }}>
                    <div className="lexaro-mini-chip-icon"><Check size={10} strokeWidth={3} /></div> Tone
                  </div>
                  <div className="lexaro-mini-chip" style={{ bottom: 60, left: '50%', transform: 'translateX(-50%)' }}>
                    <div className="lexaro-mini-chip-icon"><Check size={10} strokeWidth={3} /></div> Content
                  </div>

                  <div className="lexaro-center-ring" style={{ width: '80px', height: '80px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
                    <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', bottom: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', left: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', right: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div className="lexaro-center-node" style={{ width: '48px', height: '48px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                        <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                        <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lexaro-step-label">Step 2</div>
                <h3>Personalize at scale</h3>
                <p>SaleMail uses lead data to generate highly relevant cold outreach campaigns.</p>
              </div>
            </FadeUp>

            {/* Step 3 */}
            <FadeUp delay={0.3} className="lexaro-full-height">
              <div className="lexaro-step-card" style={{ height: '100%' }}>
                <div className="lexaro-step-visual">
                  <svg className="lexaro-step-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                     <path d="M 50% 280 L 50% 80" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                     <path d="M 50% 280 L 80 160" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                     <path d="M 50% 280 L calc(100% - 80px) 160" stroke="#eee" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>

                  <div className="lexaro-mini-card" style={{ top: 60, left: '50%', transform: 'translateX(-50%)' }}>
                    <FileText size={16} color="#64748b" />
                    <div className="lexaro-mini-card-col">
                      <span>Meeting Booked</span>
                      <span className="lexaro-mini-card-sub" style={{ color: '#64748b' }}>Intent Detected</span>
                    </div>
                  </div>

                  <div className="lexaro-mini-card" style={{ top: 140, left: 20 }}>
                    <Slack size={16} color="#64748b" />
                    <div className="lexaro-mini-card-col">
                      <span>Positive Reply</span>
                      <span className="lexaro-mini-card-sub" style={{ color: '#64748b' }}>Intent Detected</span>
                    </div>
                  </div>

                  <div className="lexaro-mini-card" style={{ top: 140, right: 20 }}>
                    <FileText size={16} color="#2563eb" />
                    <div className="lexaro-mini-card-col">
                      <span>Follow Up Later</span>
                      <span className="lexaro-mini-card-sub" style={{ color: '#2563eb' }}>Intent Detected</span>
                    </div>
                  </div>

                  <div className="lexaro-center-ring" style={{ width: '80px', height: '80px', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, position: 'absolute', top: 'auto' }}>
                    <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', bottom: -3, left: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', left: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ position: 'absolute', right: -3, top: '50%', width: 6, height: 6, border: '1px solid #aaa', borderRadius: '50%', background: '#fff' }} />
                    <div className="lexaro-center-node" style={{ width: '48px', height: '48px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                        <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                        <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lexaro-step-label">Step 3</div>
                <h3>Schedule more qualified meetings</h3>
                <p>Built-in scheduling and AI categorization ensures every opportunity is captured.</p>
              </div>
            </FadeUp>
          </div>
        </div>
        <SectionGridLine />
      </section>

      {/* ============ INTEGRATIONS (Exact Image Match) ============ */}
      <section className="lexaro-section bg-white" id="integrations" style={{ position: 'relative' }}>
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-integrations-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 className="lexaro-title" style={{ marginBottom: '16px' }}>Works with your existing stack</h2>
              <p className="lexaro-subtitle" style={{ fontSize: '1.15rem', color: '#777' }}>SaleMail integrates with your CRM, data providers, and sending domains seamlessly.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="lexaro-orbit-wrapper">
              {/* Central Logo */}
              <div className="lexaro-orbit-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#fff" />
                  <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#fff" />
                  <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#fff" />
                </svg>
              </div>

              {/* Ring 1 (Inner): CRM + sending domains */}
              <div className="lexaro-orbit-ring ring-1">
                <div className="lexaro-orbit-icon" style={{ top: '0%', left: '50%' }}><SalesforceLogo /></div>
                <div className="lexaro-orbit-icon" style={{ top: '100%', left: '50%' }}><HubspotLogo /></div>
                <div className="lexaro-orbit-icon" style={{ top: '50%', left: '0%' }}><GmailLogo /></div>
                <div className="lexaro-orbit-icon" style={{ top: '50%', left: '100%' }}><OutlookLogo /></div>
              </div>

              {/* Ring 2 (Outer): data + automation */}
              <div className="lexaro-orbit-ring ring-2">
                <div className="lexaro-orbit-icon" style={{ top: '14.6%', left: '14.6%' }}><SlackLogo /></div>
                <div className="lexaro-orbit-icon" style={{ top: '85.4%', left: '85.4%' }}><NotionLogo /></div>
                <div className="lexaro-orbit-icon" style={{ top: '14.6%', left: '85.4%' }}><ZapierLogo /></div>
                <div className="lexaro-orbit-icon" style={{ top: '85.4%', left: '14.6%' }}><GoogleLogo /></div>
              </div>
            </div>
          </FadeUp>
        </div>
        <SectionGridLine />
      </section>

      {/* ============ PRICING (Exact Image Match) ============ */}
      <section className="lexaro-pricing-section" id="pricing">
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-pricing-header">
              <h2>Simple, transparent pricing</h2>
            </div>
          </FadeUp>

          <div className="lexaro-pricing-grid-3">
            {/* Starter */}
            <FadeUp delay={0.1} className="lexaro-full-height">
              <div className="lexaro-pricing-box">
                {/* Corner Markers */}
                <div className="lexaro-pricing-marker lexaro-pricing-marker-tl" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-tr" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-bl" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-br" />

                <div className="lexaro-pricing-top">
                  <div className="lexaro-pricing-top-tier">Starter</div>
                  <div className="lexaro-pricing-top-price">$29<span>/ month</span></div>
                </div>

                <div className="lexaro-pricing-features">
                  <h4>What's Included:</h4>
                  <ul>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Up to 5 team members</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> 5,000 active contacts</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Basic lead enrichment</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Email & Calendar Sync</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Core integrations</li>
                  </ul>
                </div>

                <button className="lexaro-pricing-btn lexaro-pricing-btn-ghost">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 5, height: 5, borderLeft: '1px solid #111', borderTop: '1px solid #111' }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 5, height: 5, borderRight: '1px solid #111', borderTop: '1px solid #111' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 5, height: 5, borderLeft: '1px solid #111', borderBottom: '1px solid #111' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 5, height: 5, borderRight: '1px solid #111', borderBottom: '1px solid #111' }} />
                  Start free trial
                </button>
              </div>
            </FadeUp>

            {/* Team */}
            <FadeUp delay={0.2} className="lexaro-full-height">
              <div className="lexaro-pricing-box premium">
                {/* Corner Markers */}
                <div className="lexaro-pricing-marker lexaro-pricing-marker-tl" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-tr" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-bl" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-br" />

                <div className="lexaro-pricing-top">
                  <div className="lexaro-pricing-top-tier">Team</div>
                  <div className="lexaro-pricing-top-price">$159<span>/ month</span></div>
                </div>

                <div className="lexaro-pricing-features">
                  <h4>What's Included:</h4>
                  <ul>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Up to 25 team members</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> 50,000 active contacts</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Advanced AI personalization</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Built-in meeting scheduling</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Dedicated sending IPs</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> All integrations</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> AI sequence generator</li>
                  </ul>
                </div>

                <button className="lexaro-pricing-btn lexaro-pricing-btn-solid">
                  Start free trial
                </button>
              </div>
            </FadeUp>

            {/* Organization */}
            <FadeUp delay={0.3} className="lexaro-full-height">
              <div className="lexaro-pricing-box">
                {/* Corner Markers */}
                <div className="lexaro-pricing-marker lexaro-pricing-marker-tl" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-tr" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-bl" />
                <div className="lexaro-pricing-marker lexaro-pricing-marker-br" />

                <div className="lexaro-pricing-top">
                  <div className="lexaro-pricing-top-tier">Organization</div>
                  <div className="lexaro-pricing-top-price">Custom</div>
                </div>

                <div className="lexaro-pricing-features">
                  <h4>What's Included:</h4>
                  <ul>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Unlimited team members</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Unlimited active contacts</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Dedicated account manager</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Custom integrations</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> SLA guarantee</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> SSO & advanced security</li>
                    <li><CheckCircle2 size={16} strokeWidth={1.5} /> Custom contract terms</li>
                  </ul>
                </div>

                <button className="lexaro-pricing-btn lexaro-pricing-btn-ghost">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 5, height: 5, borderLeft: '1px solid #111', borderTop: '1px solid #111' }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 5, height: 5, borderRight: '1px solid #111', borderTop: '1px solid #111' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 5, height: 5, borderLeft: '1px solid #111', borderBottom: '1px solid #111' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 5, height: 5, borderRight: '1px solid #111', borderBottom: '1px solid #111' }} />
                  Contact sales
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ============ CAMPAIGN VILLAGE ============ */}
      <section className="lexaro-campaign-village" style={{ position: 'relative', overflow: 'hidden', paddingTop: '80px', backgroundColor: '#fff' }}>
        <div className="hero-grid-bg" />

        <div className="lexaro-container" style={{ position: 'relative', zIndex: 10 }}>
          <FadeUp>
            <div style={{ maxWidth: '600px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#111', marginBottom: '16px' }}>
                Your best-performing<br />campaign starts here.
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '32px', fontWeight: 500 }}>
                Set up in minutes. See results from day one.
              </p>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 28px', fontSize: '15px' }}>
                  Start for free
                </button>
                <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 28px', fontSize: '15px', border: '1px solid #eaeaea', background: '#fff' }}>
                  Talk to sales
                </button>
              </div>
            </div>
          </FadeUp>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '1120px', height: '480px', margin: '0 auto', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <img src="/hero-landscape.png" alt="Landscape Graphic" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center 60%' }} />
        </div>
        
        <SectionGridLine />
      </section>
      </div> {/* End of main content boundary container */}

      {/* ============ FOOTER ============ */}
      <section className="lexaro-footer-section">
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-footer-cta">
              <h2>Automate how your team sells</h2>
              <a href="#" className="lexaro-footer-cta-btn">Get Started</a>
            </div>
          </FadeUp>
          
          <div className="lexaro-footer-grid">
            <div className="lexaro-footer-col">
              <div className="lexaro-footer-logo">
                <div style={{ width: '10px', height: '10px', background: '#fff', transform: 'rotate(45deg)', borderRadius: '1px', marginRight: '2px' }} />
                SaleMail
              </div>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '240px' }}>
                The AI-powered outbound platform for modern teams to scale their revenue.
              </p>
            </div>
            <div className="lexaro-footer-col">
              <h4>Platform</h4>
              <div className="lexaro-footer-links">
                <a href="#">Prospecting</a>
                <a href="#">Outreach</a>
                <a href="#">Deliverability</a>
                <a href="#">Integrations</a>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Company</h4>
              <div className="lexaro-footer-links">
                <a href="#">About us</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Resources</h4>
              <div className="lexaro-footer-links">
                <a href="#">Help Center</a>
                <a href="#">Community</a>
                <a href="#">Outbound Playbooks</a>
              </div>
            </div>
          </div>
          
          <div className="lexaro-footer-bottom">
            <div>© 2026 SaleMail Inc. All rights reserved.</div>
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
