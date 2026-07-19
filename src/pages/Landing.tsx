import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import React from 'react';
import { Check, Target, Github, Twitter, Linkedin, CheckCircle2, FileText, GitMerge, BarChart3, Sparkles, Wand2, AlignLeft, Database, ChevronDown, Search, Filter, Calendar, Link, ArrowUpRight, ChevronRight, Menu, ArrowRight, X, Play, Globe, Zap, Clock, Users, Code, Lock, RefreshCw, Smartphone, Monitor, Shield, Layout, Settings, Mail, Bell, MessageSquare, Megaphone, LineChart, Plus, Maximize, User, FileEdit, Info, Loader, Edit2, ArrowUpDown, MousePointer2, Cloud, Activity } from 'lucide-react';
import './Landing.css';
import './features_refined.css';

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

const ScrollRevealGrid = ({ children, header }: { children: React.ReactNode, header?: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start tracking when the top of the container hits the bottom of the viewport
    offset: ["start end", "end end"]
  });

  const cards = React.Children.toArray(children);
  
  // scrollYProgress maps over 300vh total.
  // 0.00 -> 0.33 is when the container is scrolling up into view (before it sticks).
  // 0.33 -> 1.00 is when it is stuck and scrolling 200vh.
  const timings = [
    [0.10, 0.33], // Card 1: Animates as the section scrolls into view
    [0.35, 0.55], // Card 2: Animates after sticking
    [0.55, 0.75], // Card 3: Animates after sticking
    [0.75, 0.95]  // Card 4: Animates after sticking
  ];

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '20px', overflow: 'hidden' }}>
        {header && (
          <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 20px', zIndex: 10 }}>
            {header}
          </div>
        )}
        <div style={{ width: '100%' }}>
          <div className="linksmeet-4col-grid" style={{ padding: '0 20px', maxWidth: '1600px', margin: '0 auto' }}>
            {cards.map((child, index) => {
              const [start, end] = timings[index] || [0, 1];
              
              // Use manual clamping via a callback function to guarantee the animation stops perfectly at its destination
              const opacity = useTransform(smoothProgress, (v) => {
                if (v <= start) return 0;
                if (v >= end) return 1;
                return (v - start) / (end - start);
              });
              
              const y = useTransform(smoothProgress, (v) => {
                if (v <= start) return 60;
                if (v >= end) return 0;
                return 60 - ((v - start) / (end - start)) * 60;
              });
              
              return (
                <motion.div key={index} style={{ opacity, y, height: '100%' }}>
                  {child}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

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

const SectionGridLine = () => null;

const faqData = [
  {
    q: "What is LinksMeet and how does it work as a scheduling app?",
    a: "LinksMeet is a scheduling app and meeting scheduling software used to eliminate booking back-and-forth. You share a link, and LinksMeet handles calendar syncing, timezone detection, reminders, and video calls through Zoom, Google Meet, Microsoft Teams, and LinksMeet Video. It works as a simple meeting scheduler for 1-on-1s or a fully automated scheduling system with routing and workflows."
  },
  {
    q: "What makes LinksMeet different from other scheduling apps?",
    a: "As a scheduler, LinksMeet offers exceptional value by integrating seamlessly with common workflow tools like Google Calendar, Zoom, and Stripe. It also works as a lead routing, distribution, and management tool for inbound-focused teams. Overall, LinksMeet is built for flexibility and customization."
  },
  {
    q: "Can LinksMeet be used as scheduling software for Healthcare, Sales, Support, and B2B teams?",
    a: "Yes. LinksMeet adapts as scheduling software across industries and team structures. For B2B sales teams, LinksMeet works as booking software with attribute-based routing, round-robin lead distribution, and CRM updates in Salesforce or HubSpot on every booking. It's a complete automated scheduling system."
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
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    document.title = "LinksMeet — Scheduling & Meeting Automation";
  }, []);

  return (
    <div className="linksmeet-landing" style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Outer bounding box simulating the Framer canvas */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '0px' }}>

        <div style={{ backgroundColor: '#ffffff', padding: '24px' }}>
          <div className="hero-wrapper" style={{ borderRadius: '32px', overflow: 'hidden', backgroundColor: '#F7F7F7', border: '2px solid #F6F6F6', position: 'relative', zIndex: 10 }}>
            {/* ============ NAVBAR ============ */}
            <nav className="linksmeet-nav" style={{ position: 'relative', zIndex: 100, background: 'transparent' }}>
              <div className="linksmeet-container">
                <div className="linksmeet-logo">
                  <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
                  LinksMeet
                </div>
                <div className="linksmeet-nav-links">
                  <a href="#about">About</a>
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#blog">Blog</a>
                  <a href="#contact">Contact</a>
                </div>
                <div className="linksmeet-nav-actions">
                  <button className="linksmeet-btn" style={{ background: 'transparent', color: '#0f172a', fontWeight: 500, padding: '8px 16px' }} onClick={() => navigate('/login')}>Log in</button>
                  <button className="linksmeet-btn linksmeet-btn-dark" onClick={goSignup} style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '14px' }}>Get Started</button>
                </div>
              </div>
            </nav>

            {/* ============ HERO ============ */}
            <section className="linksmeet-hero" id="home">
              {/* New Background Gradient */}
              <div className="hero-gradient-bg" />
              <div className="hero-noise-texture" />

              <div className="linksmeet-container" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <h1 className="linksmeet-hero-title">More qualified meetings with<br />intelligent automation</h1>
                  <p className="linksmeet-hero-sub">
                    LinksMeet combines lead discovery, personalized cold outreach, email deliverability,
                    and meeting scheduling into one seamless workspace.
                  </p>
                  <div className="linksmeet-hero-cta">
                    <button className="linksmeet-btn-primary-hero" onClick={goSignup}>
                      Start your free trial
                    </button>
                    <button className="linksmeet-btn-secondary-hero" onClick={() => navigate('/login')}>
                      <Play size={16} fill="currentColor" /> How It Works
                    </button>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        </div>


        {/* ============ TRUSTED LOGOS (COMMENTED OUT FOR FUTURE USE) ============ */}
        {false && (
        <section className="linksmeet-trusted" style={{ position: 'relative', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
          <div style={{ width: '100%' }}>
            <FadeUp>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>Trusted by innovative teams worldwide</p>
              <div className="linksmeet-marquee-wrapper">
                <div className="linksmeet-marquee-track">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="linksmeet-marquee-items">
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L22 20H2L12 2Z" /></svg>
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
        )}

        {/* ============ 4-COLUMN FEATURES GRID ============ */}
        <section className="linksmeet-legacy-section" style={{ position: 'relative' }}>
          <div className="linksmeet-container" style={{ position: 'relative', maxWidth: '1600px', width: '95%' }}>
            {/* Top Hatched Bar */}
            <div className="hatched-bg" style={{ position: 'absolute', top: -49, left: -1, right: -1, height: '48px' }} />
            {/* Bottom Hatched Bar */}
            <div className="hatched-bg" style={{ position: 'absolute', bottom: -49, left: -1, right: -1, height: '48px' }} />

            <div style={{ padding: '0 20px' }}>
              <ScrollRevealGrid 
                header={
                  <FadeUp>
                    <div className="linksmeet-legacy-header" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', gap: '8px' }}>
                      <h2 className="linksmeet-system-title" style={{ margin: 0, lineHeight: 0.95 }}>The problem with legacy<br />outbound workflows</h2>
                      <p style={{ margin: 0, maxWidth: '600px', color: '#666', fontSize: '1.1rem' }}>Fragmented sales tools kill productivity. LinksMeet unifies everything you need into one intelligent system.</p>
                    </div>
                  </FadeUp>
                }
              >
                
                {/* Card 1 */}
                  <div className="linksmeet-feature-card">
                    <div className="linksmeet-feature-icon">
                      <Link size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Fragmented Data Sources</h3>
                    <p>Prospects live in ZoomInfo. Emails live in Outreach. Calendars live in Google. Nothing is connected, causing data leaks and lost deals.</p>
                    
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div className="linksmeet-mockup-pill linksmeet-loop-pill-1">
                        <div className="linksmeet-mockup-pill-icon-solid">
                          <Database size={16} />
                        </div>
                        <div className="linksmeet-mockup-pill-text">
                          <span className="linksmeet-mockup-pill-title">ZoomInfo</span>
                          <span className="linksmeet-mockup-pill-sub">Prospect Data</span>
                        </div>
                        <div className="linksmeet-mockup-pill-badge" style={{ background: '#F5F3FF', padding: '4px 10px', borderRadius: '12px' }}>Disconnected</div>
                      </div>
                      
                      <div className="linksmeet-mockup-pill linksmeet-loop-pill-2">
                        <div className="linksmeet-mockup-pill-icon-light">
                          <Mail size={16} />
                        </div>
                        <div className="linksmeet-mockup-pill-text">
                          <span className="linksmeet-mockup-pill-title">Outreach</span>
                          <span className="linksmeet-mockup-pill-sub">Email Platform</span>
                        </div>
                        <div className="linksmeet-mockup-pill-badge" style={{ background: '#F5F3FF', padding: '4px 10px', borderRadius: '12px' }}>Disconnected</div>
                      </div>
                      
                      <div className="linksmeet-mockup-pill linksmeet-loop-pill-3">
                        <div className="linksmeet-mockup-pill-icon-light">
                          <Calendar size={16} /> 
                        </div>
                        <div className="linksmeet-mockup-pill-text">
                          <span className="linksmeet-mockup-pill-title">Google</span>
                          <span className="linksmeet-mockup-pill-sub">Calendars</span>
                        </div>
                        <div className="linksmeet-mockup-pill-badge" style={{ background: '#F5F3FF', padding: '4px 10px', borderRadius: '12px' }}>Disconnected</div>
                      </div>

                      {/* Connected Badge overlay */}
                      <div className="linksmeet-connected-badge">
                        Connected <ArrowUpDown size={12} style={{ color: '#4b5563' }} />
                      </div>
                    </div>
                  </div>
                {/* Card 2 */}
                  <div className="linksmeet-feature-card">
                    <div className="linksmeet-feature-icon">
                      <Shield size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Deliverability Excellence</h3>
                    <p>Protect sender reputation with SPF/DKIM tracking and warm-up.</p>
                    
                    <div className="linksmeet-target-container">
                      <div className="linksmeet-target-layout">
                        <div className="linksmeet-target-left">
                          <div>
                            <div className="linksmeet-target-select-label">SPF Record</div>
                            <div className="linksmeet-target-select linksmeet-shimmer">Verified <ChevronDown size={14} /></div>
                          </div>
                          <div>
                            <div className="linksmeet-target-select-label">DKIM Record</div>
                            <div className="linksmeet-target-select linksmeet-shimmer">Verified <ChevronDown size={14} /></div>
                          </div>
                        </div>
                        <div className="linksmeet-target-right">
                          <div style={{ position: 'absolute', left: 0, top: 15, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="linksmeet-shimmer linksmeet-bar-pulse-h1" style={{ width: '26px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                            <div className="linksmeet-shimmer linksmeet-bar-pulse-h2" style={{ width: '20px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                            <div className="linksmeet-shimmer linksmeet-bar-pulse-h3" style={{ width: '12px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                            <div className="linksmeet-shimmer linksmeet-bar-pulse-h4" style={{ width: '16px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', bottom: -1, left: '-10px', right: '-10px', borderBottom: '2px dotted #e5e7eb', zIndex: 0 }}></div>
                            <div className="linksmeet-bar-indigo-light linksmeet-shimmer linksmeet-bar-pulse-1" style={{ height: '35%' }}></div>
                            <div className="linksmeet-bar-indigo-dark linksmeet-shimmer linksmeet-bar-pulse-2" style={{ height: '55%' }}></div>
                            <div className="linksmeet-bar-indigo-light linksmeet-shimmer linksmeet-bar-pulse-3" style={{ height: '75%' }}></div>
                            <div className="linksmeet-bar-indigo-dark linksmeet-shimmer linksmeet-bar-pulse-4" style={{ height: '95%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="linksmeet-target-bottom">
                        <div className="linksmeet-target-bottom-label">Sender Score</div>
                        <div className="linksmeet-avatar-group">
                          <img src="https://i.pravatar.cc/150?img=47" className="linksmeet-avatar" alt="Avatar 1" />
                          <img src="https://i.pravatar.cc/150?img=12" className="linksmeet-avatar" alt="Avatar 2" />
                          <img src="https://i.pravatar.cc/150?img=33" className="linksmeet-avatar" alt="Avatar 3" />
                          <img src="https://i.pravatar.cc/150?img=5" className="linksmeet-avatar" alt="Avatar 4" />
                          <div className="linksmeet-avatar-count linksmeet-shimmer">99/100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* Card 3 */}
                  <div className="linksmeet-feature-card">
                    <div className="linksmeet-feature-icon">
                      <GitMerge size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Cold Email Automation</h3>
                    <p>Build multi-step sequences with smart delays and A/B testing.</p>
                    
                    <div style={{ position: 'relative', height: '280px', width: '100%', marginTop: 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px' }}>
                      
                      {/* Step 1 */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2, width: '220px', textAlign: 'left' }}>
                        <Mail size={14} color="#6D28D9" />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Initial Outreach</div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Automated Email</div>
                        </div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6D28D9' }}></div>
                      </div>

                      {/* Animated Connector 1 */}
                      <div className="linksmeet-sequence-connector">
                        <div className="linksmeet-sequence-pulse linksmeet-delay-1"></div>
                      </div>

                      {/* Delay Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', color: '#475569', fontSize: '0.65rem', fontWeight: 600, padding: '4px 12px', borderRadius: '16px', zIndex: 2, border: '1px solid #e2e8f0' }}>
                        <Clock size={12} color="#6D28D9" /> Wait 3 Days
                      </div>

                      {/* Animated Connector 2 */}
                      <div className="linksmeet-sequence-connector">
                        <div className="linksmeet-sequence-pulse linksmeet-delay-2"></div>
                      </div>

                      {/* Step 2 */}
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2, width: '220px', textAlign: 'left' }}>
                        <Mail size={14} color="#6D28D9" />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Value Prop Follow-up</div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>If no reply</div>
                        </div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid #ddd6fe' }}></div>
                      </div>

                      {/* White Fade Gradient */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '90px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,1) 100%)', zIndex: 5 }}></div>

                      {/* Active Button */}
                      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: '#6D28D9', color: '#ffffff', padding: '10px 24px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, width: 'max-content' }}>
                        <Play size={14} fill="currentColor" /> Launch Campaign
                      </div>
                    </div>
                  </div>
                {/* Card 4 */}
                  <div className="linksmeet-feature-card">
                    <div className="linksmeet-feature-icon">
                      <Calendar size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Meeting Scheduling</h3>
                    <p>Let prospects book meetings directly with calendar sync.</p>
                    
                    <div className="linksmeet-opt-layout">
                      <div className="linksmeet-opt-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Availability 
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6D28D9', background: '#F5F3FF', padding: '4px 8px', borderRadius: '12px' }}>October</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flex: 1, position: 'relative' }}>
                        {/* Mini Calendar Grid */}
                        <div style={{ flex: 1.2, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', alignContent: 'start' }}>
                          {['M','T','W','T','F','S','S'].map((d, i) => (
                            <div key={'d'+i} style={{ fontSize: '0.55rem', fontWeight: 700, color: '#9CA3AF', textAlign: 'center', marginBottom: '4px' }}>{d}</div>
                          ))}
                          {[...Array(31)].map((_, i) => (
                            <div key={i} className={i === 14 ? 'linksmeet-date-animate' : ''} style={{ 
                              aspectRatio: '1/1', 
                              borderRadius: '4px', 
                              background: i === 14 ? undefined : '#f8fafc',
                              border: i === 14 ? undefined : '1px solid #f1f5f9',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: i === 14 ? undefined : '#cbd5e1',
                              fontSize: '0.6rem', fontWeight: 600,
                              boxShadow: i === 14 ? undefined : 'none'
                            }}>
                              {i + 1}
                            </div>
                          ))}
                        </div>

                        {/* Animated Cursor */}
                        <div className="linksmeet-animated-cursor">
                          <MousePointer2 size={16} fill="#6D28D9" color="#ffffff" strokeWidth={1} style={{ transform: 'rotate(-15deg)' }} />
                        </div>

                        {/* Time slots */}
                        <div style={{ flex: 1, minWidth: '55px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textAlign: 'center', lineHeight: 1.4 }}>Select<br/>Time</div>
                          <div className="linksmeet-time-animate" style={{ borderRadius: '6px', padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>10:00<br/>AM</div>
                          <div style={{ border: '2px solid #F5F5F5', borderRadius: '6px', padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, color: '#334155', textAlign: 'center', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', lineHeight: 1.4 }}>11:30<br/>AM</div>
                          <div style={{ border: '2px solid #F5F5F5', borderRadius: '6px', padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, color: '#334155', textAlign: 'center', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', lineHeight: 1.4 }}>2:00<br/>PM</div>
                        </div>
                      </div>
                    </div>
                  </div>
              </ScrollRevealGrid>
            </div>
          </div>
          <SectionGridLine />
        </section>

        {/* ============ THE SYSTEM (EXACT MATCH) ============ */}
        <section className="linksmeet-system-section" id="features" style={{ position: 'relative' }}>
          <div className="linksmeet-container">
            <FadeUp>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 className="linksmeet-system-title" style={{ marginBottom: '16px' }}>Get clear answers in 3 simple steps</h2>
                <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>From data to clarity—uncover insights, take action, and grow smarter in three simple steps.</p>
              </div>
            </FadeUp>

            <div className="linksmeet-grid-ui">
              {/* Card 1: AI Powered Outreach */}
              <FadeUp delay={0.1} className="linksmeet-grid-card">
                <div className="grid-card-content">
                  <h3>AI-Powered Outreach</h3>
                  <p>AI automatically analyzes leads, generates personalized campaigns, and schedules follow-ups.</p>
                </div>
                <div className="grid-card-visual" style={{ minHeight: '200px', overflow: 'hidden' }}>
                  <div className="v1-ai-center">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 12px rgba(125, 59, 236, 0.4))' }}>
                      <path d="M11 2C11 2 11 9 19 11C11 13 11 20 11 20C11 20 11 13 3 11C11 9 11 2 11 2Z" fill="currentColor"/>
                      <path d="M18 14C18 14 18 17.5 22 18.5C18 19.5 18 23 18 23C18 23 18 19.5 14 18.5C18 17.5 18 14 18 14Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="v1-ai-tag v1-tag-1">Analyze lead</div>
                  <div className="v1-ai-tag v1-tag-2 highlight">Generate campaign</div>
                  <div className="v1-ai-tag v1-tag-3">Schedule follow-up</div>
                  <div className="v1-ai-tag v1-tag-4">Personalize email</div>
                  <div className="v1-ai-tag v1-tag-5">Score prospect</div>
                </div>
              </FadeUp>

              {/* Card 2: Track User Behavior (Gauge) */}
              <FadeUp delay={0.2} className="linksmeet-grid-card">
                <div className="grid-card-content">
                  <h3>Track User Behavior</h3>
                  <p>See what’s used, what’s dropped, and what keeps users engaged.</p>
                </div>
                <div className="grid-card-visual" style={{ paddingBottom: '20px' }}>
                  <div className="v2-gauge-container">
                    <div className="v2-gauge-bg">
                      <div className="v2-gauge-track" />
                      <div className="v2-gauge-inner" />
                      <div className="v2-needle-wrapper">
                        <div className="v2-needle" />
                      </div>
                      <div className="v2-gauge-pivot" />
                    </div>
                  </div>
                  {/* Floating Tags perfectly matching the image */}
                  <div className="v2-tag v2-tag-1">
                    Low Engagement <span className="v2-badge-red">↓ 8%</span>
                  </div>
                  <div className="v2-tag v2-tag-2">
                    High Engagement <span className="v2-badge-blue">↑ 12%</span>
                  </div>
                </div>
              </FadeUp>

              {/* Card 3: Turn Insights Into Action (Envelope) */}
              <FadeUp delay={0.3} className="linksmeet-grid-card">
                <div className="grid-card-content">
                  <h3>Turn Insights Into Action</h3>
                  <p>Get clear, actionable recommendations to boost retention and grow MRR.</p>
                </div>
                <div className="grid-card-visual" style={{ paddingBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '85%', display: 'flex' }}>
                    <img src="/envelope-icon.jpg" alt="Actionable Insights Envelope" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                    {/* Guarantees the image perfectly adopts the #7d3bec hue/saturation while preserving whites/blacks */}
                    <div style={{ position: 'absolute', inset: 0, background: '#7d3bec', mixBlendMode: 'color', pointerEvents: 'none' }} />
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
          <SectionGridLine />
        </section>




        {/* ============ INTEGRATIONS (Exact Image Match) ============ */}
        <section className="linksmeet-section bg-white" id="integrations" style={{ position: 'relative' }}>
          <div className="linksmeet-container">
            <FadeUp>
              <div className="linksmeet-integrations-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 className="linksmeet-title" style={{ marginBottom: '16px' }}>Works with your existing stack</h2>
                <p className="linksmeet-subtitle" style={{ fontSize: '1.15rem', color: '#777' }}>LinksMeet integrates with your CRM, data providers, and sending domains seamlessly.</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="linksmeet-orbit-wrapper">
                <div className="linksmeet-orbit-center">
                  <div className="linksmeet-orbit-pulse"></div>
                  <img src="/LinksMeet-without-bg.png" alt="LinksMeet" className="linksmeet-orbit-logo" />
                </div>

                <div className="linksmeet-orbit linksmeet-orbit-inner">
                  <div className="linksmeet-orbit-node" style={{ top: '0%', left: '50%' }}><SalesforceLogo /></div>
                  <div className="linksmeet-orbit-node" style={{ top: '100%', left: '50%' }}><HubspotLogo /></div>
                </div>

                <div className="linksmeet-orbit linksmeet-orbit-middle">
                  <div className="linksmeet-orbit-node" style={{ top: '50%', left: '0%' }}><GmailLogo /></div>
                  <div className="linksmeet-orbit-node" style={{ top: '50%', left: '100%' }}><OutlookLogo /></div>
                  <div className="linksmeet-orbit-node" style={{ top: '15%', left: '85%' }}><SlackLogo /></div>
                </div>

                <div className="linksmeet-orbit linksmeet-orbit-outer">
                  <div className="linksmeet-orbit-node" style={{ top: '85%', left: '15%' }}><ZapierLogo /></div>
                  <div className="linksmeet-orbit-node" style={{ top: '15%', left: '15%' }}><NotionLogo /></div>
                  <div className="linksmeet-orbit-node" style={{ top: '85%', left: '85%' }}><GoogleLogo /></div>
                </div>
              </div>
            </FadeUp>
          </div>
          <SectionGridLine />
        </section>

        {/* ============ PRICING (Exact Image Match) ============ */}
        <section className="linksmeet-pricing-section" id="pricing">
          <div className="linksmeet-container-wide">
            <FadeUp>
              <div className="linksmeet-pricing-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 className="linksmeet-title" style={{ marginBottom: '16px' }}>Simple pricing for every team</h2>
                <p className="linksmeet-subtitle" style={{ marginBottom: '32px' }}>Choose a plan that supports your workflow and scales as you grow.</p>
                <div className="linksmeet-pricing-toggle-container" onClick={() => setIsAnnual(!isAnnual)}>
                  <span className={`linksmeet-pricing-toggle-text ${!isAnnual ? 'active' : 'inactive'}`}>Monthly</span>
                  <div className={`linksmeet-pricing-toggle ${isAnnual ? 'annual' : 'monthly'}`} />
                  <span className={`linksmeet-pricing-toggle-text ${isAnnual ? 'active' : 'inactive'}`}>Annually</span>
                  <span className="linksmeet-pricing-discount">- 25%</span>
                </div>
              </div>
            </FadeUp>

            <div className="linksmeet-pricing-grid-4">
              {/* Starter */}
              <FadeUp delay={0.1} className="linksmeet-full-height">
                <div className="linksmeet-pricing-box">
                  <div className="linksmeet-pricing-top-tier">Starter</div>
                  <div className="linksmeet-pricing-desc">
                    Best for testing the waters or solo marketers.
                  </div>
                  <div className="linksmeet-pricing-top-price">Free</div>

                  <button className="linksmeet-pricing-btn" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="linksmeet-pricing-features">
                    <ul>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> 1 User Workspace</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> 2 AI Campaigns per month</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Basic Automation Tools</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Standard AI Text Generator</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Community Support</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> 1 User Workspace</li>
                    </ul>
                  </div>
                </div>
              </FadeUp>

              {/* Growth */}
              <FadeUp delay={0.2} className="linksmeet-full-height">
                <div className="linksmeet-pricing-box">
                  <div className="linksmeet-pricing-top-tier">Growth</div>
                  <div className="linksmeet-pricing-desc">
                    Built for growing teams that need more scale and insights.
                  </div>
                  <div className="linksmeet-pricing-top-price">${isAnnual ? '39' : '49'}</div>

                  <button className="linksmeet-pricing-btn" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="linksmeet-pricing-features">
                    <ul>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Up to 5 Users</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> 20 AI Campaigns per month</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Dynamic Audience Targeting</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Email, Ads & Social Auto-Templates</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Performance Insights Dashboard</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> 5 User Workspace</li>
                    </ul>
                  </div>
                </div>
              </FadeUp>

              {/* Pro */}
              <FadeUp delay={0.3} className="linksmeet-full-height">
                <div className="linksmeet-pricing-box">
                  <div className="linksmeet-pricing-top-tier">Pro</div>
                  <div className="linksmeet-pricing-desc">
                    All the power. For serious marketers and small agencies.
                  </div>
                  <div className="linksmeet-pricing-top-price">${isAnnual ? '99' : '129'}</div>

                  <button className="linksmeet-pricing-btn linksmeet-pricing-btn-solid" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="linksmeet-pricing-features">
                    <ul>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Unlimited Campaigns</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Unlimited Team Members</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> AI-Performance Predictions</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> A/B Testing Recommendations</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Performance Insights Dashboard</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Priority Chat & Email Support</li>
                    </ul>
                  </div>
                </div>
              </FadeUp>

              {/* Enterprise */}
              <FadeUp delay={0.4} className="linksmeet-full-height">
                <div className="linksmeet-pricing-box">
                  <div className="linksmeet-pricing-top-tier">Enterprise</div>
                  <div className="linksmeet-pricing-desc">
                    Tailored AI marketing infrastructure for large teams.
                  </div>
                  <div className="linksmeet-pricing-top-price">Custom</div>

                  <button className="linksmeet-pricing-btn" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="linksmeet-pricing-features">
                    <ul>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Dedicated Onboarding</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Custom Integrations</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Performance Insights Dashboard</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> SLA & Security Compliance</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> Priority Chat & Email Support</li>
                      <li><CheckCircle2 size={16} strokeWidth={2} /> VIP Support & Strategy Calls</li>
                    </ul>
                  </div>
                </div>
              </FadeUp>
            </div>
            
            <div className="linksmeet-pricing-guarantee">
              Each plan includes a 14-day, no-questions-asked full refund policy.
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="linksmeet-faq" id="faq">
          <div className="linksmeet-container">
            <div className="linksmeet-faq-grid">
              
              {/* Left Column: Header */}
              <div className="linksmeet-faq-left">
                <FadeUp>
                  <div className="linksmeet-faq-subtitle">Support & Answers</div>
                  <h2 className="linksmeet-faq-title">Frequently asked<br/>questions</h2>
                  <p className="linksmeet-faq-desc">Everything you need to know about the product and how it works.</p>
                  
                  <div style={{ marginTop: '40px' }}>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '12px', fontWeight: 500 }}>Still have questions?</p>
                    <button className="linksmeet-btn linksmeet-btn-ghost" onClick={() => navigate('/contact')} style={{ borderRadius: '8px', padding: '10px 24px', fontSize: '14px', border: '1px solid rgba(125, 59, 236, 0.3)', color: '#7d3bec', fontWeight: 500, backgroundColor: 'rgba(125, 59, 236, 0.05)' }}>
                      Contact our team
                    </button>
                  </div>
                </FadeUp>
              </div>

              {/* Right Column: Accordions */}
              <div className="linksmeet-faq-right">
                <div className="linksmeet-faq-list">
              <FadeUp delay={0.1} className="linksmeet-faq-item">
                <details>
                  <summary>What is LinksMeet and how does it work as a scheduling app?</summary>
                  <div className="linksmeet-faq-content">
                    LinksMeet is a scheduling app and meeting scheduling software used to eliminate booking back-and-forth. You share a link, and LinksMeet handles calendar syncing, timezone detection, reminders, and video calls through Zoom, Google Meet, Microsoft Teams, and LinksMeet Video. It works as a simple meeting scheduler for 1-on-1s or a fully automated scheduling system with routing and workflows.
                  </div>
                </details>
              </FadeUp>
              <FadeUp delay={0.2} className="linksmeet-faq-item">
                <details>
                  <summary>What makes LinksMeet different from other scheduling apps?</summary>
                  <div className="linksmeet-faq-content">
                    Unlike standard scheduling tools, LinksMeet offers a fully integrated AI-powered sales engagement platform. We combine automated lead discovery, personalized cold outreach, superior email deliverability, and intelligent scheduling into one seamless workspace to help you close deals faster.
                  </div>
                </details>
              </FadeUp>
              <FadeUp delay={0.3} className="linksmeet-faq-item">
                <details>
                  <summary>Can LinksMeet be used as scheduling software for Healthcare, Sales, Support, and B2B teams?</summary>
                  <div className="linksmeet-faq-content">
                    Absolutely! LinksMeet is highly adaptable. Sales and B2B teams can use it for automated lead routing and discovery, while Healthcare and Support teams benefit from secure, reliable scheduling with seamless integrations for video conferencing and calendar management.
                  </div>
                </details>
              </FadeUp>
            </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="linksmeet-cta-section" style={{ position: 'relative', overflow: 'hidden', padding: '100px 20px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <FadeUp>
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', padding: '80px 40px', textAlign: 'center', backgroundColor: '#7d3bec', border: '4px solid #F5F5F5', boxShadow: 'none' }}>

                {/* Geometric Background Shapes */}
                {/* Geometric Background Shapes */}
                <motion.div 
                  animate={{ y: [0, -30, 0], scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', zIndex: 0 }} 
                />
                <motion.div 
                  animate={{ y: [0, 40, 0], x: [0, 20, 0], rotate: [15, -5, 15] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '250px', height: '250px', borderRadius: '40px', backgroundColor: 'rgba(0, 0, 0, 0.05)', zIndex: 0 }} 
                />
                <motion.div 
                  animate={{ y: [0, -40, 0], x: [0, -30, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  style={{ position: 'absolute', top: '-10%', right: '-5%', width: '350px', height: '350px', borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.05)', zIndex: 0 }} 
                />
                <motion.div 
                  animate={{ y: [0, 50, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  style={{ position: 'absolute', bottom: '-30%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', zIndex: 0 }} 
                />

                {/* Foreground Content */}
                <div style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  


                  {/* Title & Subtitle */}
                  <h2 style={{ fontSize: '3.5rem', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#fff', marginBottom: '24px' }}>
                    Your best performing<br />campaign starts here.
                  </h2>
                  <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '40px', fontWeight: 400 }}>
                    Set up in minutes. See results from day one.
                  </p>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button className="linksmeet-btn linksmeet-btn-dark" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 32px', fontSize: '16px', backgroundColor: '#fff', border: 'none', color: '#111', fontWeight: 500 }}>
                      Start for free
                    </button>
                    <button className="linksmeet-btn linksmeet-btn-ghost" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 32px', fontSize: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', fontWeight: 400, backdropFilter: 'blur(8px)' }}>
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
                <a href="#features">Scheduling</a>
                <a href="#integrations">Integrations</a>
                <RouterLink to="/pricing">Pricing</RouterLink>
                <RouterLink to="/login">Sign In</RouterLink>
              </div>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Company</h4>
              <div className="linksmeet-footer-links">
                <RouterLink to="/about">About us</RouterLink>
                <RouterLink to="/careers">Careers</RouterLink>
                <RouterLink to="/blog">Blog</RouterLink>
                <RouterLink to="/contact">Contact</RouterLink>
              </div>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Resources</h4>
              <div className="linksmeet-footer-links">
                <RouterLink to="/blog">Help Center</RouterLink>
                <RouterLink to="/blog">Community</RouterLink>
                <RouterLink to="/contact">Support</RouterLink>
              </div>
            </div>
            <div className="linksmeet-footer-col">
              <h4>Legal</h4>
              <div className="linksmeet-footer-links">
                <RouterLink to="/privacy-policy">Privacy Policy</RouterLink>
                <RouterLink to="/terms-of-service">Terms of Service</RouterLink>
                <RouterLink to="/terms-and-conditions">Terms & Conditions</RouterLink>
              </div>
            </div>
          </div>

          <div className="linksmeet-footer-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <span>&copy; {new Date().getFullYear()} LinksMeet. All rights reserved.</span>
              <span style={{ color: '#888' }}>
                by <a href="https://4cloverlabs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>4CloverLabs</a>
              </span>
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
