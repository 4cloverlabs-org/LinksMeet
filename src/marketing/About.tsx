import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import './About.css';

const VALUES = [
  { 
    icon: Zap, 
    color: '#c4f053', 
    title: 'Frictionless Scheduling', 
    desc: 'If a feature doesn’t help you book meetings faster, we don’t build it.' 
  },
  { 
    icon: Sparkles, 
    color: '#d4c5f9', 
    title: 'Clarity over Clutter', 
    desc: 'Booking pages designed to be fast, obvious, and completely out of your way.' 
  },
  { 
    icon: Clock, 
    color: '#ffcd57', 
    title: 'Your Time is Yours', 
    desc: 'Just connect your calendar, share your link, and let the magic happen.' 
  },
  { 
    icon: Users, 
    color: '#7ed4f6', 
    title: 'Built for Professionals', 
    desc: 'Shaping our roadmap to solve real-world scheduling problems for modern teams.' 
  },
];

const SplitSphereSVG = () => (
  <svg viewBox="0 0 240 240" width="100%" height="100%" style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.2))' }}>
    <defs>
      <radialGradient id="sphereTop" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#b782f9" />
        <stop offset="100%" stopColor="#5b1ab9" />
      </radialGradient>
      <radialGradient id="sphereBottom" cx="70%" cy="70%" r="70%">
        <stop offset="0%" stopColor="#6722d3" />
        <stop offset="100%" stopColor="#25065a" />
      </radialGradient>
    </defs>
    {/* Top Hemisphere (shifted left) */}
    <path d="M 30 120 A 90 90 0 0 1 210 120 Z" fill="url(#sphereTop)" transform="translate(-16, 0)" />
    {/* Bottom Hemisphere (shifted right) */}
    <path d="M 30 120 A 90 90 0 0 0 210 120 Z" fill="url(#sphereBottom)" transform="translate(16, 0)" />
  </svg>
);

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="cc-page" style={{ background: '#ffffff' }}>
      <div className="cc-container" style={{ maxWidth: 1200 }}>
        
        {/* Top Section */}
        <div className="about-top-section">
          <motion.div 
            className="about-hero-title"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1>About Us</h1>
          </motion.div>
          
          <motion.div 
            className="about-hero-text"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <p>
              We started LinksMeet with one belief: software should help you connect, not give you more to manage.
            </p>
            <p>
              Most scheduling tools grow by adding. More settings, more integrations, and more complexity until the tool meant to 
              organize your calendar becomes a chore to configure. Professionals end up spending their time fighting settings
              instead of talking to their clients, and the joy of meeting people gets lost in the back-and-forth.
            </p>
            <p>
              We took the opposite approach. LinksMeet does the few things teams genuinely need, such as seamless bookings,
              beautiful interfaces, automated reminders, and clear availability, and it does them quickly and beautifully. 
              Nothing you have to learn for a week. Nothing you’ll dread sharing.
            </p>
            <p>
              The result is a scheduling platform people actually love to use, because setting it up takes seconds. And a 
              seamless connection is the first step to building great relationships.
            </p>
          </motion.div>
        </div>

        {/* Hero Images */}
        <motion.div 
          className="about-hero-images"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="about-landscape-container">
            <motion.img 
              src="/img/about-landscape.png" 
              alt="Mountain Landscape" 
              className="about-landscape" 
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Values Section */}
        <div className="about-values-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            Values
          </motion.h2>
          
          <motion.div 
            className="about-values-grid"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {VALUES.map(v => {
              const Icon = v.icon;
              return (
                <motion.div 
                  className="about-value-item" 
                  key={v.title}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
                  }}
                  whileHover={{ y: -5 }}
                >
                  <div className="about-value-icon">
                    <div className="split-circle-top" style={{ backgroundColor: v.color }}></div>
                    <div className="split-circle-bottom" style={{ backgroundColor: v.color }}></div>
                    <div className="split-circle-inner">
                      <Icon size={32} color="#0f172a" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Call to action (using Landing Page CTA) */}
        <div className="cc-reveal" style={{ position: 'relative', overflow: 'hidden', padding: '20px 0 100px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', padding: '80px 40px', textAlign: 'center', backgroundColor: '#7d3bec', border: '4px solid #F5F5F5', boxShadow: 'none' }}>

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
                  Want to see it in action?
                </h2>
                <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '40px', fontWeight: 400 }}>
                  It takes minutes to set up.
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button className="linksmeet-btn linksmeet-btn-dark" onClick={() => navigate('/signup')} style={{ borderRadius: '10px', padding: '14px 32px', fontSize: '16px', backgroundColor: '#fff', border: 'none', color: '#111', fontWeight: 500, cursor: 'pointer' }}>
                    Get started
                  </button>
                  <button className="linksmeet-btn linksmeet-btn-ghost" onClick={() => navigate('/contact')} style={{ borderRadius: '10px', padding: '14px 32px', fontSize: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', fontWeight: 400, backdropFilter: 'blur(8px)', cursor: 'pointer' }}>
                    Talk to us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
