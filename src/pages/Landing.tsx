import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'framer-motion';
import { Check, Target, Github, Twitter, Linkedin, CheckCircle2, FileText, GitMerge, BarChart3, Sparkles, Wand2, AlignLeft, Database, ChevronDown, Search, Filter, Calendar, Link } from 'lucide-react';
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
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/salesforce/salesforce-original.svg" width="36" height="36" alt="Salesforce" />
);
const HubspotLogo = () => (
  <img src="https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg" width="36" height="36" alt="HubSpot" />
);
const GmailLogo = () => (
  <svg viewBox="0 0 48 48" width="36" height="36" aria-label="Gmail">
    <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7a3 3 0 0 0 3-3z" />
    <path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6a3 3 0 0 1-3-3z" />
    <path fill="#e53935" d="M35 11.2L24 19.45 13 11.2 12 17l1 6.7 11 8.25 11-8.25 1-6.7z" />
    <path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859A4.298 4.298 0 0 0 3 12.298z" />
    <path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341A4.298 4.298 0 0 1 45 12.298z" />
  </svg>
);
const OutlookLogo = () => (
  <img src="https://www.google.com/s2/favicons?domain=outlook.com&sz=128" width="36" height="36" alt="Outlook" />
);
const SlackLogo = () => (
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg" width="36" height="36" alt="Slack" />
);
const NotionLogo = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" width="36" height="36" alt="Notion" style={{ objectFit: 'contain' }} />
);
const ZapierLogo = () => (
  <img src="https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg" width="36" height="36" alt="Zapier" />
);
const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" width="36" height="36" aria-label="Google">
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

const faqData = [
  {
    q: "What is SaleMail and how does it work as a scheduling app?",
    a: "SaleMail is a scheduling app and meeting scheduling software used to eliminate booking back-and-forth. You share a link, and SaleMail handles calendar syncing, timezone detection, reminders, and video calls through Zoom, Google Meet, Microsoft Teams, and SaleMail Video. It works as a simple meeting scheduler for 1-on-1s or a fully automated scheduling system with routing and workflows."
  },
  {
    q: "What makes SaleMail different from other scheduling apps?",
    a: "As a scheduler, SaleMail offers exceptional value by integrating seamlessly with common workflow tools like Google Calendar, Zoom, and Stripe. It also works as a lead routing, distribution, and management tool for inbound-focused teams. Overall, SaleMail is built for flexibility and customization."
  },
  {
    q: "Can SaleMail be used as scheduling software for Healthcare, Sales, Support, and B2B teams?",
    a: "Yes. SaleMail adapts as scheduling software across industries and team structures. For B2B sales teams, SaleMail works as booking software with attribute-based routing, round-robin lead distribution, and CRM updates in Salesforce or HubSpot on every booking. It's a complete automated scheduling system."
  }
];

const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {faqData.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderBottom: '1px solid #eaeaea' }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: '32px 0', cursor: 'pointer', textAlign: 'left',
                outline: 'none'
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 500, color: isOpen ? '#2563eb' : '#111', transition: 'color 0.2s' }}>
                {faq.q}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ color: isOpen ? '#2563eb' : '#999' }}
              >
                <ChevronDown size={24} strokeWidth={1.5} />
              </motion.div>
            </button>
            
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingBottom: '32px', color: '#555', fontSize: '1.05rem', lineHeight: '1.7' }}>
                {faq.a}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

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
            <img src="/logo.png" alt="SaleMail" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
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
                    display: 'block',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
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
            <h2 className="lexaro-system-title" style={{ marginBottom: '80px' }}>Turn scattered sales tools into a<br />controlled system</h2>
          </FadeUp>

          <div className="lexaro-stack">
          <div className="lexaro-stack-item">
            <div className="lexaro-system-box">
              <div className="lexaro-system-visual-container">
                <div className="lexaro-system-visual">
                  {/* SVG Paths connecting cards to center node */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <path d="M 260 50 C 350 50, 350 210, 410 210" fill="none" stroke="#334155" strokeWidth="1.5" strokeOpacity="0.4" />
                    <path d="M 260 160 C 350 160, 350 210, 410 210" fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.4" />
                    <path d="M 260 270 C 350 270, 350 210, 410 210" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.4" />
                    <path d="M 260 380 C 350 380, 350 210, 410 210" fill="none" stroke="#525252" strokeWidth="1.5" strokeOpacity="0.4" />
                  </svg>

                  {/* Mid-path Dots */}
                  <div className="lexaro-path-dot" style={{ background: '#334155', top: 100, left: 330 }} />
                  <div className="lexaro-path-dot" style={{ background: '#64748b', top: 170, left: 340 }} />
                  <div className="lexaro-path-dot" style={{ background: '#2563eb', top: 250, left: 340 }} />
                  <div className="lexaro-path-dot" style={{ background: '#111', top: 320, left: 330 }} />

                  {/* Card 1: PDF */}
                  <div className="lexaro-doc-card" style={{ top: 10, left: 40, borderLeft: '4px solid #334155' }}>
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
                  <div className="lexaro-doc-card" style={{ top: 120, left: 40, borderLeft: '4px solid #f97316' }}>
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
                  <div className="lexaro-doc-card" style={{ top: 230, left: 40, borderLeft: '4px solid #2563eb' }}>
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
                  <div className="lexaro-doc-card" style={{ top: 340, left: 40, borderLeft: '4px solid #111' }}>
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
                <div className="lexaro-system-visual" style={{ height: '500px' }}>
                  <div className="lexaro-correction-card" style={{ position: 'absolute', top: '30px', left: '40px', right: '40px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 2 }}>
                    
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
                    <path d="M 230 370 L 140 55" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 230 370 L 270 145" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 230 370 L 150 235" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 230 370 L 260 325" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>

                  {/* Card 1: PDF */}
                  <div className="lexaro-doc-card" style={{ top: 10, left: 20, borderLeft: '4px solid #334155', transform: 'rotate(-2deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#334155' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">New booking confirmed</div>
                      <div className="lexaro-doc-card-sub">James Oliver booked a 30min call</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 20, left: 30, borderLeft: '4px solid #334155', transform: 'rotate(-2deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#334155' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">New booking confirmed</div>
                      <div className="lexaro-doc-card-sub">James Oliver booked a 30min call</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 2: Slack */}
                  <div className="lexaro-doc-card" style={{ top: 100, left: 170, borderLeft: '4px solid #64748b', transform: 'rotate(2deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#f97316' }}><AlignLeft size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Booking rescheduled</div>
                      <div className="lexaro-doc-card-sub">Moved to Wed, 25 Mar 15:00</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 110, left: 160, borderLeft: '4px solid #64748b', transform: 'rotate(2deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#f97316' }}><AlignLeft size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Booking rescheduled</div>
                      <div className="lexaro-doc-card-sub">Moved to Wed, 25 Mar 15:00</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 3: Glossary */}
                  <div className="lexaro-doc-card" style={{ top: 190, left: 30, borderLeft: '4px solid #2563eb', transform: 'rotate(-1deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Meeting starts in 15 mins</div>
                      <div className="lexaro-doc-card-sub">Your next meeting is starting</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 200, left: 40, borderLeft: '4px solid #2563eb', transform: 'rotate(-1deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><FileText size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Meeting starts in 15 mins</div>
                      <div className="lexaro-doc-card-sub">Your next meeting is starting</div>
                    </div>
                    <div className="lexaro-doc-card-check"><Check size={10} strokeWidth={3} /></div>
                  </div>

                  {/* Card 4: Notion */}
                  <div className="lexaro-doc-card" style={{ top: 280, left: 160, borderLeft: '4px solid #111', transform: 'rotate(1deg)', opacity: 0.15, filter: 'blur(1px)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><CheckCircle2 size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Meeting is starting now</div>
                      <div className="lexaro-doc-card-sub">Hurry up!</div>
                    </div>
                  </div>
                  <div className="lexaro-doc-card" style={{ top: 290, left: 150, borderLeft: '4px solid #111', transform: 'rotate(1deg)' }}>
                    <div className="lexaro-doc-card-icon" style={{ color: '#2563eb' }}><CheckCircle2 size={20} /></div>
                    <div className="lexaro-doc-card-text">
                      <div className="lexaro-doc-card-title">Meeting is starting now</div>
                      <div className="lexaro-doc-card-sub">Hurry up!</div>
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
                <div className="lexaro-step-label">01</div>
                <h3>Discover high-quality prospects</h3>
                <p style={{ marginBottom: '32px' }}>Define your ICP. SaleMail finds and verifies decision-makers automatically.</p>
                
                <div className="lexaro-step-visual">
                  {/* SVG Lines Removed for cleaner look */}
                  
                  <div style={{ position: 'absolute', top: 30, left: 30, right: 30, bottom: 120, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 2 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa' }}>
                      <Search size={14} color="#666" />
                      <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 500 }}>Lead Search</span>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb' }}>
                          <Filter size={10} /> Filtering
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Database size={14} color="#2563eb" />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111' }}>Data Enrichment</span>
                        </div>
                        <Check size={14} color="#16a34a" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 28, height: 28, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target size={14} color="#16a34a" />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111' }}>Verification</span>
                        </div>
                        <Check size={14} color="#16a34a" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Receiver */}
                  <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, background: '#111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={16} color="#fff" />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Target Audience</div>
                    <div style={{ fontSize: '0.6rem', color: '#888', whiteSpace: 'nowrap' }}>1,250 Verified Leads</div>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Step 2 */}
            <FadeUp delay={0.2} className="lexaro-full-height">
              <div className="lexaro-step-card" style={{ height: '100%' }}>
                <div className="lexaro-step-label">02</div>
                <h3>Personalize at scale</h3>
                <p style={{ marginBottom: '32px' }}>SaleMail uses lead data to generate highly relevant cold outreach campaigns.</p>
                
                <div className="lexaro-step-visual">
                  {/* SVG Lines Removed for cleaner look */}
                  <div style={{ position: 'absolute', top: 30, left: 30, right: 30, bottom: 120, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 2 }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '6px', background: '#fafafa' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ marginLeft: '12px', fontSize: '0.7rem', color: '#888', fontWeight: 500 }}>New Campaign</span>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        To: <span style={{ background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', color: '#2563eb', fontWeight: 500, border: '1px solid #bfdbfe' }}>Variables</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Tone: <span style={{ background: '#fdf4ff', padding: '4px 8px', borderRadius: '6px', color: '#c026d3', fontWeight: 500, border: '1px solid #fbcfe8' }}>Tone</span>
                      </div>
                      <div style={{ height: '1px', background: '#f0f0f0', margin: '4px 0' }} />
                      <div style={{ fontSize: '0.75rem', color: '#333', lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 600 }}>Subject: Quick question</span><br/>
                        Hi {"{{firstName}}"},<br/>
                        <span style={{ background: '#fef08a', padding: '2px 4px', borderRadius: '4px' }}>Content</span> auto-generated using mapped data points...
                      </div>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} color="#fff" />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Email Sequence</div>
                    <div style={{ fontSize: '0.6rem', color: '#888', whiteSpace: 'nowrap' }}>Highly Personalized</div>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Step 3 */}
            <FadeUp delay={0.3} className="lexaro-full-height">
              <div className="lexaro-step-card" style={{ height: '100%' }}>
                <div className="lexaro-step-label">03</div>
                <h3>Schedule more qualified meetings</h3>
                <p style={{ marginBottom: '32px' }}>Built-in scheduling and AI categorization ensures every opportunity is captured.</p>
                
                <div className="lexaro-step-visual">
                  {/* SVG Lines Removed for cleaner look */}
                  <div style={{ position: 'absolute', top: 30, left: 30, right: 30, bottom: 120, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 2 }}>
                    <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#f8fafc' }}>
                      <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Calendar size={20} color="#2563eb" />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Meeting Booked</span>
                      <span style={{ fontSize: '0.65rem', color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '12px', fontWeight: 500 }}>Automated Reminder</span>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 28, height: 28, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={14} color="#64748b" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111' }}>Calendar Checker</span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Cross-referencing</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 28, height: 28, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Link size={14} color="#64748b" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111' }}>Link Customized</span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Easy to remember</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: 32, height: 32, background: '#16a34a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={16} color="#fff" />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Meeting Booked</div>
                    <div style={{ fontSize: '0.6rem', color: '#888', whiteSpace: 'nowrap' }}>Added to calendar</div>
                  </div>
                </div>
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
                <img src="/logo.png" alt="SaleMail" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
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

      {/* ============ FAQ ============ */}
      <section className="lexaro-faq-section" style={{ padding: '100px 0', backgroundColor: '#fff', borderTop: '1px solid #eaeaea' }}>
        <div className="lexaro-container">
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <div className="lexaro-badge" style={{ margin: '0 auto 16px', display: 'inline-block' }}>Support & Answers</div>
              <h2 className="lexaro-title" style={{ fontSize: '3rem', letterSpacing: '-0.04em' }}>Frequently asked questions</h2>
              <p className="lexaro-subtitle" style={{ fontSize: '1.2rem', color: '#777', maxWidth: '600px', margin: '0 auto' }}>
                Everything you need to know about the product and how it works.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <FaqAccordion />
          </FadeUp>
        </div>
      </section>

      {/* ============ CAMPAIGN VILLAGE ============ */}
      <section className="lexaro-campaign-village" style={{ position: 'relative', overflow: 'hidden', padding: '100px 20px', backgroundColor: '#fff' }}>
        <div className="lexaro-container">
          <FadeUp>
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', padding: '120px 40px', textAlign: 'center', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15)' }}>
              
              {/* Full Background Image */}
              <div style={{ position: 'absolute', inset: -20, zIndex: 0 }}>
                <img src="/hero-landscape.png" alt="Background Texture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {/* Full-width blur and darken overlay for the entire section */}
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.20)', backdropFilter: 'blur(3px)' }} />
              </div>

              {/* Foreground Content */}
              <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#111', marginBottom: '24px' }}>
                  Your best-performing<br />campaign starts here.
                </h2>
                <p style={{ fontSize: '1.15rem', color: '#475569', marginBottom: '40px', fontWeight: 500 }}>
                  Set up in minutes. See results from day one.
                </p>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 32px', fontSize: '16px', backgroundColor: '#111', border: 'none', color: '#fff' }}>
                    Start for free
                  </button>
                  <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 32px', fontSize: '16px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.15)', color: '#111', backdropFilter: 'blur(8px)' }}>
                    Talk to sales
                  </button>
                </div>
              </div>

            </div>
          </FadeUp>
        </div>
      </section>
      </div> {/* End of main content boundary container */}

      {/* ============ FOOTER ============ */}
      <section className="lexaro-footer-section">
        <div className="lexaro-container">

          
          <div className="lexaro-footer-grid">
            <div className="lexaro-footer-col">
              <div className="lexaro-footer-logo">
                <img src="/logo.png" alt="SaleMail" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
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
