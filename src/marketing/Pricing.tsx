import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter', monthly: 19, desc: 'For individuals and small sales teams getting started.', featured: false,
    features: ['Contact & company management', 'Visual deal pipeline', 'Basic activity tracking', 'Task & follow-up reminders', 'Standard filters', 'Email support', 'Smart contact insights'],
  },
  {
    name: 'Growth', monthly: 39, desc: 'For growing teams that need speed and visibility.', featured: true,
    features: ['Everything in Starter, plus', 'Advanced filters & saved views', 'Sales activity timeline', 'Performance insights & reporting', 'Custom deal stages', 'Team collaboration tools', 'Priority support'],
  },
  {
    name: 'Scale', monthly: 79, desc: 'For high-performing sales organizations.', featured: false,
    features: ['Everything in Growth, plus', 'Advanced batching & analytics', 'Workflow automations', 'Role-based permissions', 'API access & integrations', 'Dedicated account manager', 'Custom onboarding support'],
  },
];

const FAQ = [
  { q: 'Is there a free trial?', a: 'Yes. Every plan starts with a 14-day free trial — no credit card required. You can explore the full product before deciding.' },
  { q: 'Can I change plans later?', a: 'Anytime. Upgrade or downgrade from your account settings and we’ll prorate the difference automatically.' },
  { q: 'How does per-user pricing work?', a: 'You’re billed for each active member on your team. Add or remove seats whenever you need — changes take effect immediately.' },
  { q: 'What happens to my data if I cancel?', a: 'It stays yours. You can export all your contacts, deals, and activity to CSV at any time, and we keep your data available for 30 days after cancellation.' },
  { q: 'Do you offer annual billing?', a: 'Yes — switching to annual billing saves you the equivalent of two months per year on every plan.' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="cc-page-hero cc-reveal">
          <span className="cc-eyebrow">Pricing</span>
          <h1>Simple pricing. Serious impact.</h1>
          <p>Start free for 14 days. Pick a plan when you’re ready — change it whenever you like.</p>
          <div className="cc-billing-toggle">
            <button className={!annual ? 'on' : ''} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? 'on' : ''} onClick={() => setAnnual(true)}>Annual <em>save ~17%</em></button>
          </div>
        </div>

        <div className="cc-price-grid">
          {PLANS.map(plan => {
            const price = annual ? Math.round(plan.monthly * 10 / 12) : plan.monthly;
            return (
              <div key={plan.name} className={`cc-price-card cc-reveal${plan.featured ? ' featured' : ''}`}>
                <div className="cc-price-name">
                  <h3>{plan.name}</h3>
                  {plan.featured && <span className="cc-price-badge"><Star size={10} fill="currentColor" /> Most Popular</span>}
                </div>
                <div className="cc-price-desc">{plan.desc}</div>
                <div className="cc-price-amt">
                  <span className="num">${price}</span>
                  <span className="per">/ Per user<br />per month{annual ? ', billed yearly' : ''}</span>
                </div>
                <button className={`cc-btn cc-btn-block ${plan.featured ? 'cc-btn-primary' : 'cc-btn-light'}`} onClick={() => navigate('/signup')}>
                  Start free trial
                </button>
                <div className="cc-price-sep" />
                <div className="cc-price-list-label">What you get:</div>
                <ul className="cc-price-list">
                  {plan.features.map(f => <li key={f}><Check size={15} strokeWidth={2.5} />{f}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="cc-faq cc-reveal">
          <h2 className="cc-sec-title" style={{ textAlign: 'center', marginBottom: 28 }}>Frequently asked questions</h2>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div className={`cc-faq-item${isOpen ? ' open' : ''}`} key={i}>
                <button className="cc-faq-q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span>{f.q}</span>
                  <span className="cc-faq-sign">{isOpen ? '-' : '+'}</span>
                </button>
                {isOpen && <div className="cc-faq-a">{f.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
