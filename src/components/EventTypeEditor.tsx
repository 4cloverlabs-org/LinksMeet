import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, Link2, Globe, Clock, Settings, Calendar, CreditCard, LayoutTemplate, Layers, Zap, Webhook } from 'lucide-react';
import { addEventType, updateEventType, type EventType } from '../lib/crm';

interface Props {
  uid: string;
  initialData: Partial<EventType> | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventTypeEditor({ uid, initialData, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<EventType>>({
    title: '',
    slug: '',
    dur: '30m',
    desc: '',
    active: true,
    ...(initialData || {})
  });
  
  const [activeTab, setActiveTab] = useState('basics');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Live preview URL sync
  useEffect(() => {
    if (!initialData?.id && form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: prev.title?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || '' }));
    }
  }, [form.title, initialData?.id, form.slug]);

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      setError('Title and URL slug are required');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      if (form.id) {
        await updateEventType(uid, form.id, form as EventType);
      } else {
        await addEventType(uid, form as Omit<EventType, 'id' | 'createdAt'>);
      }
      onSaved();
    } catch (e: any) {
      if (e.code === '23505') setError('An event type with this URL slug already exists.');
      else setError(e.message || 'An error occurred');
      setSaving(false);
    }
  };

  const getDurationLabel = (val: string) => {
    if (val === '15m') return '15m';
    if (val === '30m') return '30m';
    if (val === '45m') return '45m';
    if (val === '60m') return '1h';
    if (val === '90m') return '1h 30m';
    return val;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>
            {form.id ? form.title : 'New Event Type'}
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {error && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</span>}
          <button 
            className="crm-btn crm-btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar Menu */}
        <div style={{ width: '240px', background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto', padding: '24px 16px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Setup</div>
            <button className={`et-nav-btn ${activeTab === 'basics' ? 'on' : ''}`} onClick={() => setActiveTab('basics')}>
              <Link2 size={16} /> Basics
            </button>
            <button className={`et-nav-btn ${activeTab === 'availability' ? 'on' : ''}`} onClick={() => setActiveTab('availability')}>
              <Calendar size={16} /> Availability
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Booking Experience</div>
            <button className={`et-nav-btn ${activeTab === 'booking_form' ? 'on' : ''}`} onClick={() => setActiveTab('booking_form')}>
              <LayoutTemplate size={16} /> Booking Form
            </button>
            <button className={`et-nav-btn ${activeTab === 'confirmation' ? 'on' : ''}`} onClick={() => setActiveTab('confirmation')}>
              <Layers size={16} /> Confirmation
            </button>
            <button className={`et-nav-btn ${activeTab === 'appearance' ? 'on' : ''}`} onClick={() => setActiveTab('appearance')}>
              <Globe size={16} /> Appearance
            </button>
            <button className={`et-nav-btn ${activeTab === 'payments' ? 'on' : ''}`} onClick={() => setActiveTab('payments')}>
              <CreditCard size={16} /> Payments & Seats
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>AI & Automation</div>
            <button className={`et-nav-btn ${activeTab === 'workflows' ? 'on' : ''}`} onClick={() => setActiveTab('workflows')}>
              <Zap size={16} /> Workflows
            </button>
            <button className={`et-nav-btn ${activeTab === 'webhooks' ? 'on' : ''}`} onClick={() => setActiveTab('webhooks')}>
              <Webhook size={16} /> Webhooks
            </button>
          </div>
          
        </div>

        {/* Center Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          
          {activeTab === 'basics' ? (
            <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="crm-field">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'block' }}>Title</label>
                <input 
                  value={form.title || ''} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. 15 Min Meeting" 
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 12px', borderRadius: '8px', fontSize: '0.95rem', width: '100%' }}
                />
              </div>

              <div className="crm-field">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'block' }}>Description</label>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                  {/* Fake toolbar for aesthetic */}
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '12px', color: '#64748b' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Normal</span>
                    <strong style={{ cursor: 'pointer' }}>B</strong>
                    <em style={{ cursor: 'pointer' }}>I</em>
                    <Link2 size={14} style={{ cursor: 'pointer', marginTop: 2 }} />
                  </div>
                  <textarea 
                    value={form.desc || ''} 
                    onChange={e => setForm({ ...form, desc: e.target.value })} 
                    rows={4} 
                    placeholder="A quick video meeting." 
                    style={{ border: 'none', width: '100%', padding: '12px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="crm-field">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'block' }}>URL</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ padding: '10px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#64748b', fontSize: '0.95rem' }}>
                    {window.location.host}/book/{uid}/
                  </div>
                  <input 
                    value={form.slug || ''} 
                    onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} 
                    placeholder="15min" 
                    style={{ flex: 1, background: '#fff', border: '1px solid #cbd5e1', padding: '10px 12px', borderRadius: '0 8px 8px 0', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="crm-field">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'block' }}>Duration</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={form.dur || '30m'} 
                    onChange={e => setForm({ ...form, dur: e.target.value })}
                    style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', padding: '10px 12px', borderRadius: '8px', fontSize: '0.95rem', appearance: 'none', outline: 'none' }}
                  >
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="45m">45 Minutes</option>
                    <option value="60m">60 Minutes</option>
                    <option value="90m">90 Minutes</option>
                  </select>
                  <Clock size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} />
                </div>
              </div>

              <div className="crm-field">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'block' }}>Location</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #cbd5e1', padding: '10px 12px', borderRadius: '8px' }}>
                  <Video size={18} color="#0E61F3" />
                  <span style={{ flex: 1, fontSize: '0.95rem', color: '#0f172a' }}>Google Meet (Default)</span>
                  <Settings size={16} color="#94a3b8" />
                </div>
              </div>

            </div>
          ) : (
            <div style={{ color: '#64748b', marginTop: '40px' }}>
              <h3 style={{ color: '#0f172a' }}>Advanced Settings Placeholder</h3>
              <p>This tab is currently under construction. Please use the Basics tab for configuration.</p>
            </div>
          )}

        </div>

        {/* Right Live Preview Box */}
        <div style={{ width: '420px', background: '#f1f5f9', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          
          <div style={{ background: '#fff', width: '100%', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', overflow: 'hidden' }}>
            
            {/* Fake Booking Widget Header */}
            <div style={{ padding: '24px 24px 0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0E61F3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.2rem' }}>
                  {form.title ? form.title.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Preview User</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{form.title || 'Untitled Event'}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} /> {getDurationLabel(form.dur || '30m')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={16} /> Google Meet
                </div>
              </div>
              
              <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, marginBottom: '24px', minHeight: '40px', wordBreak: 'break-word' }}>
                {form.desc || 'A quick video meeting.'}
              </div>
            </div>

            {/* Fake Calendar Grid */}
            <div style={{ background: '#f8fafc', padding: '24px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Select a Date & Time</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.9rem', color: '#0f172a' }}>
                <div style={{ padding: '8px', color: '#cbd5e1' }}>28</div>
                <div style={{ padding: '8px', color: '#cbd5e1' }}>29</div>
                <div style={{ padding: '8px', color: '#cbd5e1' }}>30</div>
                <div style={{ padding: '8px', background: '#0E61F3', color: '#fff', borderRadius: '50%', cursor: 'pointer' }}>1</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>2</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>3</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>4</div>
                
                <div style={{ padding: '8px', cursor: 'pointer' }}>5</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>6</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>7</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>8</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>9</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>10</div>
                <div style={{ padding: '8px', cursor: 'pointer' }}>11</div>
              </div>
            </div>
          </div>
          
          <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
            <Globe size={14} /> Live booking page preview
          </div>

        </div>
      </div>
      
      {/* Required CSS additions for EventTypeEditor specific styles */}
      <style>{`
        .et-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          text-align: left;
          color: #475569;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 2px;
        }
        .et-nav-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .et-nav-btn.on {
          background: #eff6ff;
          color: #0E61F3;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
