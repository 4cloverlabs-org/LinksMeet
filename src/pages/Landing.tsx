import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import React from 'react';
import { Check, Target, Github, Twitter, Linkedin, CheckCircle2, FileText, GitMerge, BarChart3, Sparkles, Wand2, AlignLeft, Database, ChevronDown, Search, Filter, Calendar, Link, ArrowUpRight, ChevronRight, Menu, ArrowRight, X, Play, Globe, Zap, Clock, Users, Code, Lock, RefreshCw, Smartphone, Monitor, Shield, Layout, Settings, Mail, Bell, MessageSquare, Megaphone, LineChart, Plus, Maximize, User, FileEdit, Info, Loader, Edit2, ArrowUpDown, MousePointer2 } from 'lucide-react';
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

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '20px', overflow: 'hidden' }}>
        {header && (
          <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 20px', zIndex: 10 }}>
            {header}
          </div>
        )}
        <div style={{ width: '100%' }}>
          <div className="lexaro-4col-grid" style={{ padding: '0 20px', maxWidth: '1600px', margin: '0 auto' }}>
            {cards.map((child, index) => {
              const [start, end] = timings[index] || [0, 1];
              
              // Use manual clamping via a callback function to guarantee the animation stops perfectly at its destination
              const opacity = useTransform(scrollYProgress, (v) => {
                if (v <= start) return 0;
                if (v >= end) return 1;
                return (v - start) / (end - start);
              });
              
              const y = useTransform(scrollYProgress, (v) => {
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
    // We intentionally removed the auto-redirect so logged-in users can still view the landing page.
    // If they want to go to their dashboard, they can click the CTA buttons.
  }, []);

  return (
    <div className="lexaro-landing" style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Outer bounding box simulating the Framer canvas */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '0px' }}>

        <div style={{ backgroundColor: '#ffffff', padding: '24px' }}>
          <div className="hero-wrapper" style={{ borderRadius: '32px', overflow: 'hidden', backgroundColor: '#F7F7F7', border: '2px solid #F6F6F6', position: 'relative', zIndex: 10 }}>
            {/* ============ NAVBAR ============ */}
            <nav className="lexaro-nav" style={{ position: 'relative', zIndex: 100, background: 'transparent' }}>
              <div className="lexaro-container">
                <div className="lexaro-logo">
                  <img src="/LinksMeet-without-bg.png" alt="LinksMeet" style={{ width: '26px', height: '26px', objectFit: 'contain', borderRadius: '5px', marginRight: '6px' }} />
                  LinksMeet
                </div>
                <div className="lexaro-nav-links">
                  <a href="#about">About</a>
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                  <a href="#blog">Blog</a>
                  <a href="#contact">Contact</a>
                </div>
                <div className="lexaro-nav-actions">
                  <button className="lexaro-btn" style={{ background: 'transparent', color: '#0f172a', fontWeight: 500, padding: '8px 16px' }} onClick={() => navigate('/login')}>Log in</button>
                  <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup} style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '14px' }}>Get Started</button>
                </div>
              </div>
            </nav>

            {/* ============ HERO ============ */}
            <section className="lexaro-hero" id="home">
              {/* New Background Gradient */}
              <div className="hero-gradient-bg" />
              <div className="hero-noise-texture" />

              <div className="lexaro-container" style={{ position: 'relative', zIndex: 10 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h1 className="lexaro-hero-title">More qualified meetings with<br />intelligent automation</h1>
                  <p className="lexaro-hero-sub">
                    LinksMeet combines lead discovery, personalized cold outreach, email deliverability,
                    and meeting scheduling into one seamless workspace.
                  </p>
                  <div className="lexaro-hero-cta">
                    <button className="lexaro-btn-primary-hero" onClick={goSignup}>
                      Start your free trial
                    </button>
                    <button className="lexaro-btn-secondary-hero" onClick={() => navigate('/login')}>
                      <Play size={16} fill="currentColor" /> How It Works
                    </button>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        </div>


        {/* ============ TRUSTED LOGOS ============ */}
        <section className="lexaro-trusted" style={{ position: 'relative', width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
          <div style={{ width: '100%' }}>
            <FadeUp>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>Trusted by innovative teams worldwide</p>
              <div className="lexaro-marquee-wrapper">
                <div className="lexaro-marquee-track">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="lexaro-marquee-items">
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

        {/* ============ 4-COLUMN FEATURES GRID ============ */}
        <section className="lexaro-legacy-section" style={{ position: 'relative' }}>
          <div className="lexaro-container" style={{ position: 'relative', maxWidth: '1600px', width: '95%' }}>
            {/* Top Hatched Bar */}
            <div className="hatched-bg" style={{ position: 'absolute', top: -49, left: -1, right: -1, height: '48px' }} />
            {/* Bottom Hatched Bar */}
            <div className="hatched-bg" style={{ position: 'absolute', bottom: -49, left: -1, right: -1, height: '48px' }} />

            <div style={{ padding: '0 20px' }}>
              <ScrollRevealGrid 
                header={
                  <FadeUp>
                    <div className="lexaro-legacy-header" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', gap: '8px' }}>
                      <h2 className="lexaro-system-title" style={{ margin: 0, lineHeight: 0.95 }}>The problem with legacy<br />outbound workflows</h2>
                      <p style={{ margin: 0, maxWidth: '600px', color: '#666', fontSize: '1.1rem' }}>Fragmented sales tools kill productivity. LinksMeet unifies everything you need into one intelligent system.</p>
                    </div>
                  </FadeUp>
                }
              >
                
                {/* Card 1 */}
                  <div className="lexaro-feature-card">
                    <div className="lexaro-feature-icon">
                      <Link size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Fragmented Data Sources</h3>
                    <p>Prospects live in ZoomInfo. Emails live in Outreach. Calendars live in Google. Nothing is connected, causing data leaks and lost deals.</p>
                    
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div className="lexaro-mockup-pill lexaro-loop-pill-1">
                        <div className="lexaro-mockup-pill-icon-solid">
                          <Database size={16} />
                        </div>
                        <div className="lexaro-mockup-pill-text">
                          <span className="lexaro-mockup-pill-title">ZoomInfo</span>
                          <span className="lexaro-mockup-pill-sub">Prospect Data</span>
                        </div>
                        <div className="lexaro-mockup-pill-badge" style={{ background: '#F5F3FF', padding: '4px 10px', borderRadius: '12px' }}>Disconnected</div>
                      </div>
                      
                      <div className="lexaro-mockup-pill lexaro-loop-pill-2">
                        <div className="lexaro-mockup-pill-icon-light">
                          <Mail size={16} />
                        </div>
                        <div className="lexaro-mockup-pill-text">
                          <span className="lexaro-mockup-pill-title">Outreach</span>
                          <span className="lexaro-mockup-pill-sub">Email Platform</span>
                        </div>
                        <div className="lexaro-mockup-pill-badge" style={{ background: '#F5F3FF', padding: '4px 10px', borderRadius: '12px' }}>Disconnected</div>
                      </div>
                      
                      <div className="lexaro-mockup-pill lexaro-loop-pill-3">
                        <div className="lexaro-mockup-pill-icon-light">
                          <Calendar size={16} /> 
                        </div>
                        <div className="lexaro-mockup-pill-text">
                          <span className="lexaro-mockup-pill-title">Google</span>
                          <span className="lexaro-mockup-pill-sub">Calendars</span>
                        </div>
                        <div className="lexaro-mockup-pill-badge" style={{ background: '#F5F3FF', padding: '4px 10px', borderRadius: '12px' }}>Disconnected</div>
                      </div>

                      {/* Connected Badge overlay */}
                      <div className="lexaro-connected-badge">
                        Connected <ArrowUpDown size={12} style={{ color: '#4b5563' }} />
                      </div>
                    </div>
                  </div>
                {/* Card 2 */}
                  <div className="lexaro-feature-card">
                    <div className="lexaro-feature-icon">
                      <Shield size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Deliverability Excellence</h3>
                    <p>Protect sender reputation with SPF/DKIM tracking and warm-up.</p>
                    
                    <div className="lexaro-target-container">
                      <div className="lexaro-target-layout">
                        <div className="lexaro-target-left">
                          <div>
                            <div className="lexaro-target-select-label">SPF Record</div>
                            <div className="lexaro-target-select lexaro-shimmer">Verified <ChevronDown size={14} /></div>
                          </div>
                          <div>
                            <div className="lexaro-target-select-label">DKIM Record</div>
                            <div className="lexaro-target-select lexaro-shimmer">Verified <ChevronDown size={14} /></div>
                          </div>
                        </div>
                        <div className="lexaro-target-right">
                          <div style={{ position: 'absolute', left: 0, top: 15, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="lexaro-shimmer lexaro-bar-pulse-h1" style={{ width: '26px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                            <div className="lexaro-shimmer lexaro-bar-pulse-h2" style={{ width: '20px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                            <div className="lexaro-shimmer lexaro-bar-pulse-h3" style={{ width: '12px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                            <div className="lexaro-shimmer lexaro-bar-pulse-h4" style={{ width: '16px', height: '6px', background: '#e5e7eb', borderRadius: '999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', bottom: -1, left: '-10px', right: '-10px', borderBottom: '2px dotted #e5e7eb', zIndex: 0 }}></div>
                            <div className="lexaro-bar-indigo-light lexaro-shimmer lexaro-bar-pulse-1" style={{ height: '35%' }}></div>
                            <div className="lexaro-bar-indigo-dark lexaro-shimmer lexaro-bar-pulse-2" style={{ height: '55%' }}></div>
                            <div className="lexaro-bar-indigo-light lexaro-shimmer lexaro-bar-pulse-3" style={{ height: '75%' }}></div>
                            <div className="lexaro-bar-indigo-dark lexaro-shimmer lexaro-bar-pulse-4" style={{ height: '95%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="lexaro-target-bottom">
                        <div className="lexaro-target-bottom-label">Sender Score</div>
                        <div className="lexaro-avatar-group">
                          <img src="https://i.pravatar.cc/150?img=47" className="lexaro-avatar" alt="Avatar 1" />
                          <img src="https://i.pravatar.cc/150?img=12" className="lexaro-avatar" alt="Avatar 2" />
                          <img src="https://i.pravatar.cc/150?img=33" className="lexaro-avatar" alt="Avatar 3" />
                          <img src="https://i.pravatar.cc/150?img=5" className="lexaro-avatar" alt="Avatar 4" />
                          <div className="lexaro-avatar-count lexaro-shimmer">99/100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* Card 3 */}
                  <div className="lexaro-feature-card">
                    <div className="lexaro-feature-icon">
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
                      <div className="lexaro-sequence-connector">
                        <div className="lexaro-sequence-pulse lexaro-delay-1"></div>
                      </div>

                      {/* Delay Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', color: '#475569', fontSize: '0.65rem', fontWeight: 600, padding: '4px 12px', borderRadius: '16px', zIndex: 2, border: '1px solid #e2e8f0' }}>
                        <Clock size={12} color="#6D28D9" /> Wait 3 Days
                      </div>

                      {/* Animated Connector 2 */}
                      <div className="lexaro-sequence-connector">
                        <div className="lexaro-sequence-pulse lexaro-delay-2"></div>
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
                  <div className="lexaro-feature-card">
                    <div className="lexaro-feature-icon">
                      <Calendar size={22} strokeWidth={1.5} />
                    </div>
                    <h3>Meeting Scheduling</h3>
                    <p>Let prospects book meetings directly with calendar sync.</p>
                    
                    <div className="lexaro-opt-layout">
                      <div className="lexaro-opt-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            <div key={i} className={i === 14 ? 'lexaro-date-animate' : ''} style={{ 
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
                        <div className="lexaro-animated-cursor">
                          <MousePointer2 size={16} fill="#6D28D9" color="#ffffff" strokeWidth={1} style={{ transform: 'rotate(-15deg)' }} />
                        </div>

                        {/* Time slots */}
                        <div style={{ flex: 1, minWidth: '55px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginBottom: '4px', textAlign: 'center', lineHeight: 1.4 }}>Select<br/>Time</div>
                          <div className="lexaro-time-animate" style={{ borderRadius: '6px', padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>10:00<br/>AM</div>
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
        <section className="lexaro-system-section" id="features" style={{ position: 'relative' }}>
          <div className="lexaro-container">
            <FadeUp>
              <h2 className="lexaro-system-title" style={{ marginBottom: '40px' }}>Turn disconnected sales tools into a<br />controlled system</h2>
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

                      {/* LinksMeet Center Node */}
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




        {/* ============ INTEGRATIONS (Exact Image Match) ============ */}
        <section className="lexaro-section bg-white" id="integrations" style={{ position: 'relative' }}>
          <div className="lexaro-container">
            <FadeUp>
              <div className="lexaro-integrations-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 className="lexaro-title" style={{ marginBottom: '16px' }}>Works with your existing stack</h2>
                <p className="lexaro-subtitle" style={{ fontSize: '1.15rem', color: '#777' }}>LinksMeet integrates with your CRM, data providers, and sending domains seamlessly.</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="lexaro-orbit-wrapper">
                <div className="lexaro-orbit-center">
                  <div className="lexaro-orbit-pulse"></div>
                  <img src="/LinksMeet-without-bg.png" alt="LinksMeet" className="lexaro-orbit-logo" />
                </div>

                <div className="lexaro-orbit lexaro-orbit-inner">
                  <div className="lexaro-orbit-node" style={{ top: '0%', left: '50%' }}><SalesforceLogo /></div>
                  <div className="lexaro-orbit-node" style={{ top: '100%', left: '50%' }}><HubspotLogo /></div>
                </div>

                <div className="lexaro-orbit lexaro-orbit-middle">
                  <div className="lexaro-orbit-node" style={{ top: '50%', left: '0%' }}><GmailLogo /></div>
                  <div className="lexaro-orbit-node" style={{ top: '50%', left: '100%' }}><OutlookLogo /></div>
                  <div className="lexaro-orbit-node" style={{ top: '15%', left: '85%' }}><SlackLogo /></div>
                </div>

                <div className="lexaro-orbit lexaro-orbit-outer">
                  <div className="lexaro-orbit-node" style={{ top: '85%', left: '15%' }}><ZapierLogo /></div>
                  <div className="lexaro-orbit-node" style={{ top: '15%', left: '15%' }}><NotionLogo /></div>
                  <div className="lexaro-orbit-node" style={{ top: '85%', left: '85%' }}><GoogleLogo /></div>
                </div>
              </div>
            </FadeUp>
          </div>
          <SectionGridLine />
        </section>

        {/* ============ PRICING (Exact Image Match) ============ */}
        <section className="lexaro-pricing-section" id="pricing">
          <div className="lexaro-container-wide">
            <FadeUp>
              <div className="lexaro-pricing-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 className="lexaro-title" style={{ marginBottom: '16px' }}>Simple pricing for every team</h2>
                <p className="lexaro-subtitle" style={{ marginBottom: '32px' }}>Choose a plan that supports your workflow and scales as you grow.</p>
                <div className="lexaro-pricing-toggle-container" onClick={() => setIsAnnual(!isAnnual)}>
                  <span className={`lexaro-pricing-toggle-text ${!isAnnual ? 'active' : 'inactive'}`}>Monthly</span>
                  <div className={`lexaro-pricing-toggle ${isAnnual ? 'annual' : 'monthly'}`} />
                  <span className={`lexaro-pricing-toggle-text ${isAnnual ? 'active' : 'inactive'}`}>Annually</span>
                  <span className="lexaro-pricing-discount">- 25%</span>
                </div>
              </div>
            </FadeUp>

            <div className="lexaro-pricing-grid-4">
              {/* Starter */}
              <FadeUp delay={0.1} className="lexaro-full-height">
                <div className="lexaro-pricing-box">
                  <div className="lexaro-pricing-top-tier">Starter</div>
                  <div className="lexaro-pricing-desc">
                    Best for testing the waters or solo marketers.
                  </div>
                  <div className="lexaro-pricing-top-price">Free</div>

                  <button className="lexaro-pricing-btn" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="lexaro-pricing-features">
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
              <FadeUp delay={0.2} className="lexaro-full-height">
                <div className="lexaro-pricing-box">
                  <div className="lexaro-pricing-top-tier">Growth</div>
                  <div className="lexaro-pricing-desc">
                    Built for growing teams that need more scale and insights.
                  </div>
                  <div className="lexaro-pricing-top-price">${isAnnual ? '39' : '49'}</div>

                  <button className="lexaro-pricing-btn" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="lexaro-pricing-features">
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
              <FadeUp delay={0.3} className="lexaro-full-height">
                <div className="lexaro-pricing-box">
                  <div className="lexaro-pricing-top-tier">Pro</div>
                  <div className="lexaro-pricing-desc">
                    All the power. For serious marketers and small agencies.
                  </div>
                  <div className="lexaro-pricing-top-price">${isAnnual ? '99' : '129'}</div>

                  <button className="lexaro-pricing-btn lexaro-pricing-btn-solid" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="lexaro-pricing-features">
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
              <FadeUp delay={0.4} className="lexaro-full-height">
                <div className="lexaro-pricing-box">
                  <div className="lexaro-pricing-top-tier">Enterprise</div>
                  <div className="lexaro-pricing-desc">
                    Tailored AI marketing infrastructure for large teams.
                  </div>
                  <div className="lexaro-pricing-top-price">Custom</div>

                  <button className="lexaro-pricing-btn" style={{ marginBottom: '24px' }}>
                    Get Started
                  </button>

                  <div className="lexaro-pricing-features">
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
            
            <div className="lexaro-pricing-guarantee">
              Each plan includes a 14-day, no-questions-asked full refund policy.
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="lexaro-faq" id="faq">
          <div className="lexaro-container">
            <div className="lexaro-faq-grid">
              
              {/* Left Column: Header */}
              <div className="lexaro-faq-left">
                <FadeUp>
                  <div className="lexaro-faq-subtitle">Support & Answers</div>
                  <h2 className="lexaro-faq-title">Frequently asked<br/>questions</h2>
                  <p className="lexaro-faq-desc">Everything you need to know about the product and how it works.</p>
                  
                  <div style={{ marginTop: '40px' }}>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '12px', fontWeight: 500 }}>Still have questions?</p>
                    <button className="lexaro-btn lexaro-btn-ghost" onClick={() => navigate('/contact')} style={{ borderRadius: '8px', padding: '10px 24px', fontSize: '14px', border: '1px solid rgba(125, 59, 236, 0.3)', color: '#7d3bec', fontWeight: 500, backgroundColor: 'rgba(125, 59, 236, 0.05)' }}>
                      Contact our team
                    </button>
                  </div>
                </FadeUp>
              </div>

              {/* Right Column: Accordions */}
              <div className="lexaro-faq-right">
                <div className="lexaro-faq-list">
              <FadeUp delay={0.1} className="lexaro-faq-item">
                <details>
                  <summary>What is LinksMeet and how does it work as a scheduling app?</summary>
                  <div className="lexaro-faq-content">
                    LinksMeet is a scheduling app and meeting scheduling software used to eliminate booking back-and-forth. You share a link, and LinksMeet handles calendar syncing, timezone detection, reminders, and video calls through Zoom, Google Meet, Microsoft Teams, and LinksMeet Video. It works as a simple meeting scheduler for 1-on-1s or a fully automated scheduling system with routing and workflows.
                  </div>
                </details>
              </FadeUp>
              <FadeUp delay={0.2} className="lexaro-faq-item">
                <details>
                  <summary>What makes LinksMeet different from other scheduling apps?</summary>
                  <div className="lexaro-faq-content">
                    Unlike standard scheduling tools, LinksMeet offers a fully integrated AI-powered sales engagement platform. We combine automated lead discovery, personalized cold outreach, superior email deliverability, and intelligent scheduling into one seamless workspace to help you close deals faster.
                  </div>
                </details>
              </FadeUp>
              <FadeUp delay={0.3} className="lexaro-faq-item">
                <details>
                  <summary>Can LinksMeet be used as scheduling software for Healthcare, Sales, Support, and B2B teams?</summary>
                  <div className="lexaro-faq-content">
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
        <section className="lexaro-cta-section" style={{ position: 'relative', overflow: 'hidden', padding: '100px 20px', backgroundColor: '#fff' }}>
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
                    <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 32px', fontSize: '16px', backgroundColor: '#fff', border: 'none', color: '#111', fontWeight: 500 }}>
                      Start for free
                    </button>
                    <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ borderRadius: '40px', padding: '14px 32px', fontSize: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', fontWeight: 400, backdropFilter: 'blur(8px)' }}>
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
                <a href="#features">Scheduling</a>
                <a href="#integrations">Integrations</a>
                <RouterLink to="/pricing">Pricing</RouterLink>
                <RouterLink to="/login">Sign In</RouterLink>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Company</h4>
              <div className="lexaro-footer-links">
                <RouterLink to="/about">About us</RouterLink>
                <RouterLink to="/careers">Careers</RouterLink>
                <RouterLink to="/blog">Blog</RouterLink>
                <RouterLink to="/contact">Contact</RouterLink>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Resources</h4>
              <div className="lexaro-footer-links">
                <RouterLink to="/blog">Help Center</RouterLink>
                <RouterLink to="/blog">Community</RouterLink>
                <RouterLink to="/contact">Support</RouterLink>
              </div>
            </div>
            <div className="lexaro-footer-col">
              <h4>Legal</h4>
              <div className="lexaro-footer-links">
                <RouterLink to="/privacy-policy">Privacy Policy</RouterLink>
                <RouterLink to="/terms-of-service">Terms of Service</RouterLink>
                <RouterLink to="/terms-and-conditions">Terms & Conditions</RouterLink>
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
