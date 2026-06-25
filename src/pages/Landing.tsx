import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Check, Zap, Target, Slack, Github, Twitter, Linkedin, CheckCircle2, FileText, GitMerge, BarChart3, Sparkles, Wand2, AlignLeft, Maximize2, ArrowRightLeft, ListChecks, Database, Aperture, Layout, Hexagon, Disc } from 'lucide-react';
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

export default function Landing() {
  const navigate = useNavigate();
  const goSignup = () => navigate('/signup');

  // Parallax for Hero
  const { scrollY } = useScroll();
  const heroMockupY = useTransform(scrollY, [0, 1000], [0, -120]);

  return (
    <div className="lexaro-landing" style={{ padding: '40px', background: '#fcfcfc', minHeight: '100vh' }}>
      {/* Outer bounding box simulating the Framer canvas */}
      <div style={{ position: 'relative', background: '#fff', border: '1px solid transparent' }}>
        <div className="corner-tl" />
        <div className="corner-tr" />
        <div className="corner-bl" />
        <div className="corner-br" />

        {/* ============ NAVBAR ============ */}
        <nav className="lexaro-nav">
          <div className="lexaro-container">
            <div className="lexaro-logo">
              {/* Exact overlapping geometric logo from image */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
              </svg>
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
        </nav>

        {/* ============ HATCHED BACKGROUND ============ */}
        <div className="hatched-bg" />

        {/* ============ HERO ============ */}
        <section className="lexaro-hero" id="home">
          <div className="lexaro-container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
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
                <button className="lexaro-btn lexaro-btn-dark" onClick={goSignup} style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Start prospecting
                </button>
                <button className="lexaro-btn lexaro-btn-ghost" onClick={goSignup} style={{ padding: '14px 28px', fontSize: '15px', position: 'relative' }}>
                  {/* Inner markers exactly like the image */}
                  <div style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 4, borderLeft: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', top: 2, right: 2, width: 4, height: 4, borderRight: '1px solid #aaa', borderTop: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: 2, left: 2, width: 4, height: 4, borderLeft: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 4, height: 4, borderRight: '1px solid #aaa', borderBottom: '1px solid #aaa' }} />
                  See examples ↗
                </button>
              </div>
            </motion.div>

            <div className="lexaro-dashboard-wrapper">
              <motion.div 
                className="lexaro-dashboard" 
                style={{ 
                  y: heroMockupY, 
                  rotateX: 18, 
                  rotateY: 10,  /* Tilted left side closer */
                  rotateZ: -2,  /* Exact tilt from image */
                  transformOrigin: 'center center'
                }}
              >
              {/* Premium SaleMail Dashboard Mockup */}
              <div style={{ display: 'flex', height: '480px' }}>
              {/* Sidebar */}
              <div style={{ width: '240px', background: '#fafafa', borderRight: '1px solid var(--lx-border)', padding: '24px 16px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', fontWeight: 600, color: '#0a0a0a' }}>
                   <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg, #0a0a0a, #333)', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                   Acme Corp
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#a3a3a3', marginBottom: '16px', paddingLeft: '8px' }}>MAIN MENU</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ padding: '8px 12px', background: '#ffffff', border: '1px solid var(--lx-border)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, color: '#0a0a0a', boxShadow: 'var(--lx-shadow-sm)' }}>Overview</div>
                  <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#525252', fontWeight: 500 }}>Documents</div>
                  <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#525252', fontWeight: 500 }}>Brand Voice</div>
                  <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#525252', fontWeight: 500 }}>Analytics</div>
                  <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#525252', fontWeight: 500 }}>Settings</div>
                </div>
              </div>
              
              {/* Main Content */}
              <div style={{ flex: 1, padding: '32px', background: '#ffffff', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.85rem', color: '#a3a3a3', marginBottom: '12px', fontWeight: 500 }}>Campaigns / Q3 Enterprise Outreach / Sequence 1</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px', color: '#0a0a0a', letterSpacing: '-0.02em' }}>VP of Engineering - Cold Email</div>
                
                <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
                  {/* Editor Window */}
                  <div style={{ flex: 2, background: '#fafafa', border: '1px solid var(--lx-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e5e5e5' }} />
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e5e5e5' }} />
                       <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e5e5e5' }} />
                     </div>
                     <div style={{ fontSize: '1rem', color: '#0a0a0a', lineHeight: 1.7, flex: 1 }}>
                       <p style={{ margin: '0 0 16px' }}>Hi {"{"}{"{"}firstName{"}"}{"}"},</p>
                       <p style={{ margin: '0 0 16px' }}>Saw your recent post about <span style={{ borderBottom: '2px dashed #f59e0b', color: '#d97706' }}>scaling data infrastructure</span>. We help teams like {"{"}{"{"}companyName{"}"}{"}"} <span style={{ borderBottom: '2px dashed #334155', color: '#dc2626' }}>reduce cloud costs by 30%</span>.</p>
                       <p style={{ margin: 0, color: '#a3a3a3' }}>Open to a quick chat next week?</p>
                     </div>
                  </div>
                  
                  {/* AI Assistant Sidebar */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {/* Quality Card */}
                     <div style={{ background: '#ffffff', border: '1px solid var(--lx-border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--lx-shadow-sm)' }}>
                       <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         Campaign Health
                         <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem' }}>Excellent</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '12px', color: '#525252' }}>
                         <span>Deliverability: High</span>
                         <span style={{ color: '#64748b', fontWeight: 600 }}>✓</span>
                       </div>
                       <div style={{ height: '6px', background: '#f5f5f5', borderRadius: '3px', marginBottom: '16px', overflow: 'hidden' }}>
                         <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #64748b, #34d399)', borderRadius: '3px' }} />
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#525252' }}>
                         <span>Personalization: 92%</span>
                         <span style={{ color: '#64748b', fontWeight: 600 }}>✓</span>
                       </div>
                     </div>
                     
                     {/* Suggestion Card */}
                     <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', boxShadow: 'var(--lx-shadow-sm)' }}>
                       <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>Personalization Suggestion</div>
                       <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5, marginBottom: '12px' }}>
                         Adding a custom icebreaker about their recent Series B funding will increase reply rates. 
                       </div>
                       <button style={{ background: '#ffffff', border: '1px solid #fcd34d', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 500, color: '#b45309', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <span>Generate AI Icebreaker</span>
                         <span>✨</span>
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
          </div>
        </section>
      </div> {/* End of Framer boundary container */}

      {/* Made in Framer Badge */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: 13, fontWeight: 500, zIndex: 1000, color: '#111', fontFamily: '-apple-system, sans-serif' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0H14V7H7L14 14H0V0Z" fill="#111" />
        </svg>
        Made in Framer
      </div>

      {/* ============ TRUSTED LOGOS ============ */}
      <section className="lexaro-trusted">
        <div className="lexaro-container">
          <FadeUp>
            <p>Trusted by innovative teams worldwide</p>
            <div className="lexaro-logos">
              {/* Replacing pure text with simple SVG mocks for realism */}
              <svg height="24" viewBox="0 0 100 24" fill="currentColor"><path d="M10 0H0v24h10c6.6 0 12-5.4 12-12S16.6 0 10 0z" fillOpacity=".8"/><path d="M40 0H30v24h10c6.6 0 12-5.4 12-12S46.6 0 40 0z" fillOpacity=".5"/><path d="M70 0H60v24h10c6.6 0 12-5.4 12-12S76.6 0 70 0z" fillOpacity=".3"/></svg>
              <svg height="24" viewBox="0 0 100 24" fill="currentColor"><circle cx="12" cy="12" r="12" fillOpacity=".8"/><circle cx="36" cy="12" r="12" fillOpacity=".5"/><circle cx="60" cy="12" r="12" fillOpacity=".3"/></svg>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Vercel</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.05em' }}>Retool</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Segment</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ============ THE PROBLEM (LEGACY WORKFLOWS) ============ */}
      <section className="lexaro-legacy-section">
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-legacy-header">
              <h2>The problem with legacy<br />outbound workflows</h2>
              <p>Fragmented sales tools kill productivity. Teams juggle too many platforms — and it slows everything down.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="lexaro-legacy-grid-2">
              {/* Left Card: Scattered */}
              <div className="lexaro-legacy-card">
                <h3>Scattered sales tools</h3>
                <p>Prospects live in ZoomInfo. Emails live in Outreach. Calendars live in Google. Nothing is connected.</p>
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
                    LEADS
                    <div className="lexaro-warning-icon">!</div>
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '120px', left: '220px', transform: 'rotate(10deg)', zIndex: 3 }}>
                    EMAILS
                    <div className="lexaro-warning-icon">!</div>
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '200px', left: '160px', transform: 'rotate(5deg)', zIndex: 3 }}>
                    MEETINGS
                    <div className="lexaro-warning-icon">!</div>
                  </div>
                </div>
              </div>

              {/* Right Card: Unified */}
              <div className="lexaro-legacy-card">
                <h3>One intelligent outbound engine</h3>
                <p>SaleMail connects your lead discovery, automated sequences, and meeting scheduling into a unified workspace.</p>
                <div className="lexaro-legacy-visual">
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <path d="M 120 180 C 180 180, 180 100, 260 100" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                    <path d="M 120 180 C 200 180, 200 180, 260 180" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                    <path d="M 120 180 C 180 180, 180 250, 260 250" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="4 4" />
                  </svg>
                  
                  {/* SaleMail Node */}
                  <div className="lexaro-node-lexaro" style={{ top: '140px', left: '50px', zIndex: 3 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#555" />
                      <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#111" />
                      <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#333" />
                    </svg>
                    SaleMail
                  </div>

                  {/* Pills */}
                  <div className="lexaro-node-pill" style={{ top: '80px', left: '260px', zIndex: 3 }}>
                    <div style={{ background: '#64748b', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    LEADS
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '160px', left: '260px', zIndex: 3 }}>
                    <div style={{ background: '#64748b', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    EMAILS
                  </div>
                  <div className="lexaro-node-pill" style={{ top: '230px', left: '260px', zIndex: 3 }}>
                    <div style={{ background: '#64748b', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    MEETINGS
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
      </section>

      {/* ============ THE SYSTEM (EXACT MATCH) ============ */}
      <section className="lexaro-system-section" id="features">
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
                  <div className="lexaro-correction-card" style={{ position: 'absolute', top: '30px', left: '40px', right: '40px', bottom: '30px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 2 }}>
                    
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
      </section>

      {/* ============ CORE OPERATIONS (Grid) ============ */}
      <section className="lexaro-operations-section" id="operations">
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-operations-header">
              <h2>Core outbound operations</h2>
              <p>A unified set of tools to generate pipeline and manage campaigns across your company.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="lexaro-operations-grid">
              {/* Card 1 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-icon"><Sparkles size={20} strokeWidth={1.5} /></div>
                <h3>Lead Intelligence</h3>
                <p>Discover and manage verified prospects using advanced search and lead enrichment.</p>
              </div>
              {/* Card 2 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-icon"><Wand2 size={20} strokeWidth={1.5} /></div>
                <h3>AI Personalization</h3>
                <p>Generate highly personalized subject lines, icebreakers, and cold emails at scale.</p>
              </div>
              {/* Card 3 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-icon"><AlignLeft size={20} strokeWidth={1.5} /></div>
                <h3>Email Automation</h3>
                <p>Create automated multi-step email sequences with smart delays and A/B testing.</p>
              </div>
              {/* Card 4 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-icon"><Maximize2 size={20} strokeWidth={1.5} /></div>
                <h3>Meeting Scheduling</h3>
                <p>Built-in scheduling system allowing prospects to book meetings directly with calendar sync.</p>
              </div>
              {/* Card 5 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-icon"><ArrowRightLeft size={20} strokeWidth={1.5} /></div>
                <h3>Unified Inbox</h3>
                <p>One centralized inbox for every connected email account with AI reply classification.</p>
              </div>
              {/* Card 6 */}
              <div className="lexaro-operation-card">
                <div className="lexaro-op-icon"><ListChecks size={20} strokeWidth={1.5} /></div>
                <h3>Pipeline CRM</h3>
                <p>Track the complete customer journey through customizable outbound pipelines.</p>
              </div>
            </div>
          </FadeUp>

          {/* Hatched Separator from image */}
          <FadeUp delay={0.2}>
            <div style={{ marginTop: '120px', position: 'relative' }}>
               <div style={{ height: '32px', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #f0f0f0 4px, #f0f0f0 5px)' }} />
               <div style={{ position: 'absolute', top: -5, left: -2, width: 8, height: 8, borderTop: '2px solid #111', borderLeft: '2px solid #111' }} />
               <div style={{ position: 'absolute', top: -5, right: -2, width: 8, height: 8, borderTop: '2px solid #111', borderRight: '2px solid #111' }} />
               <div style={{ position: 'absolute', bottom: -5, left: -2, width: 8, height: 8, borderBottom: '2px solid #111', borderLeft: '2px solid #111' }} />
               <div style={{ position: 'absolute', bottom: -5, right: -2, width: 8, height: 8, borderBottom: '2px solid #111', borderRight: '2px solid #111' }} />
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
                  <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
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
      </section>

      {/* ============ INTEGRATIONS (Exact Image Match) ============ */}
      <section className="lexaro-section bg-white" id="integrations">
        <div className="lexaro-container">
          <FadeUp>
            <div className="lexaro-integrations-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 className="lexaro-title" style={{ marginBottom: '16px' }}>Works with your existing stack</h2>
              <p className="lexaro-subtitle" style={{ fontSize: '1.15rem', color: '#777' }}>SaleMail integrates with your CRM, data providers, and sending domains seamlessly.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="lexaro-integrations-wrapper">
              {/* Curved SVG Lines */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                {/* Left Pink Segments */}
                <path d="M 132 60 L 148 60" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 132 180 L 148 180" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 132 300 L 148 300" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 132 420 L 148 420" fill="none" stroke="#2563eb" strokeWidth="2" />
                
                {/* Left Grey Lines */}
                <path d="M 148 60 C 230 60, 230 240, 320 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M 148 180 C 230 180, 230 240, 320 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M 148 300 C 230 300, 230 240, 320 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M 148 420 C 230 420, 230 240, 320 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                {/* Left Main Stem */}
                <path d="M 320 240 L 352 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />

                {/* Right Pink Segments */}
                <path d="M 668 60 L 652 60" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 668 180 L 652 180" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 668 300 L 652 300" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 668 420 L 652 420" fill="none" stroke="#2563eb" strokeWidth="2" />
                
                {/* Right Grey Lines */}
                <path d="M 652 60 C 570 60, 570 240, 480 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M 652 180 C 570 180, 570 240, 480 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M 652 300 C 570 300, 570 240, 480 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M 652 420 C 570 420, 570 240, 480 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                {/* Right Main Stem */}
                <path d="M 480 240 L 448 240" fill="none" stroke="#e5e5e5" strokeWidth="2" />
              </svg>

              {/* Left Icons */}
              <div className="lexaro-icon-box" style={{ left: '100px', top: '60px' }}><Database color="#4f46e5" size={28} /></div>
              <div className="lexaro-icon-box" style={{ left: '100px', top: '180px' }}><Slack color="#475569" size={28} /></div>
              <div className="lexaro-icon-box" style={{ left: '100px', top: '300px' }}><Aperture color="#334155" size={28} /></div>
              <div className="lexaro-icon-box" style={{ left: '100px', top: '420px' }}><Layout color="#2563eb" size={28} /></div>

              {/* Central Node */}
              <div className="lexaro-center-logo-box">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12L12 20L20 12L12 4Z" fill="#fff" />
                  <path d="M6 10L14 18L18 14L10 6L6 10Z" fill="#fff" />
                  <path d="M18 10L10 18L6 14L14 6L18 10Z" fill="#fff" />
                </svg>
              </div>

              {/* Right Icons */}
              <div className="lexaro-icon-box" style={{ left: '700px', top: '60px' }}><Zap color="#2563eb" size={28} /></div>
              <div className="lexaro-icon-box" style={{ left: '700px', top: '180px' }}><Target color="#2563eb" size={28} /></div>
              <div className="lexaro-icon-box" style={{ left: '700px', top: '300px' }}><Hexagon color="#4f46e5" size={28} /></div>
              <div className="lexaro-icon-box" style={{ left: '700px', top: '420px' }}><Disc color="#2563eb" size={28} /></div>
            </div>
          </FadeUp>
        </div>
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

      {/* ============ FOOTER ============ */}
      <section className="lexaro-section bg-surface" style={{ paddingBottom: 0 }}>
        <div className="lexaro-container lexaro-footer">
          <FadeUp>
            <h2 style={{ letterSpacing: '-0.05em' }}>Automate how your team sells</h2>
          </FadeUp>
          
          <div className="lexaro-footer-grid">
            <div className="lexaro-footer-col">
              <div className="lexaro-logo" style={{ marginBottom: '20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 12L12 4.5L19.5 12" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.5 12H19.5" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19.5L4.5 12" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                SaleMail
              </div>
              <p style={{ color: '#a3a3a3', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '240px' }}>
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
              <Twitter size={20} color="#a3a3a3" style={{ cursor: 'pointer' }} />
              <Github size={20} color="#a3a3a3" style={{ cursor: 'pointer' }} />
              <Linkedin size={20} color="#a3a3a3" style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
