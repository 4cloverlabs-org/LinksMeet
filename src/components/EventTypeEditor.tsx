import { useState, useEffect } from 'react';
import {
  ArrowLeft, Video, Link2, Clock, Settings, Calendar, CreditCard, LayoutTemplate,
  Check, Eye, ShieldCheck, ExternalLink, Bold, Italic, Edit2, Save, Link as LinkIcon, List, ListOrdered, Globe, ChevronDown, Mail
} from 'lucide-react';
import { addEventType, updateEventType, type EventType } from '../lib/crm';

interface Props {
  uid: string;
  initialData: Partial<EventType> | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventTypeEditor({ uid, initialData, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<EventType>>({
    title: '15 Min Meeting',
    slug: '15min',
    dur: '15 Minutes',
    desc: 'A quick intro or sync call.',
    active: true,
    ...(initialData || {})
  });

  const [activeTab, setActiveTab] = useState('basics');
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Auto-sync slug if new
  useEffect(() => {
    if (!initialData?.id && form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: prev.title?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || '' }));
    }
  }, [form.title, initialData?.id, form.slug]);

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      if (form.id) {
        await updateEventType(uid, form.id, form as EventType);
      } else {
        await addEventType(uid, form as Omit<EventType, 'id' | 'createdAt'>);
      }
      setSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
      onSaved();
    } catch (e: any) {
      console.error(e);
      setSaving(false);
    }
  };

  const NavItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          background: active ? '#eff6ff' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: active ? '#2563eb' : '#64748b',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: '4px',
          transition: 'all 0.2s'
        }}>
        <Icon size={18} color={active ? '#3b82f6' : '#94a3b8'} />
        {label}
      </button>
    );
  };

  const ToggleSwitch = ({ checked }: { checked: boolean }) => (
    <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: checked ? '#2563eb' : '#cbd5e1', position: 'relative', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', top: '2px', left: checked ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff', transition: 'left 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
    </div>
  );

  const ToolbarBtn = ({ icon: Icon }: { icon: any }) => (
    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
      <Icon size={16} />
    </button>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#ffffff', color: '#0f172a', overflow: 'hidden', fontFamily: '"Inter", "Geist Sans", sans-serif' }}>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', height: '72px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', flexShrink: 0 }}>

        {/* Header Left (Matches Sidebar Width) */}
        <div style={{ width: '260px', padding: '0 24px', borderRight: '1px solid #e2e8f0', height: '100%', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={18} /> Back to Meetings
          </button>
        </div>

        {/* Header Right */}
        <div style={{ flex: 1, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{form.title || 'Untitled Event'}</h1>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Edit2 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {savedToast && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
                <Check size={16} /> All changes saved
              </div>
            )}
            <button
              onClick={handleSave}
              style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        <div style={{ width: '260px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'auto' }}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 12px 12px' }}>Setup</div>
            <NavItem icon={Link2} label="Basics" id="basics" />
            <NavItem icon={Calendar} label="Availability" id="availability" />

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '28px 0 12px 12px' }}>Booking experience</div>
            <NavItem icon={LayoutTemplate} label="Booking Form" id="form" />
            <NavItem icon={Check} label="Confirmation" id="conf" />
            <NavItem icon={Eye} label="Appearance" id="app" />
            <NavItem icon={CreditCard} label="Payments & Seats" id="pay" />
          </div>
        </div>

        {/* CONTENT SPLIT (Editor + Preview) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#f8fafc' }}>

          {/* Editor Pane */}
          <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>

            {activeTab === 'basics' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Title</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '14px 16px', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                    />
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {form.title?.length || 0}/100
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Description</label>
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderBottom: '1px solid #cbd5e1', background: '#ffffff' }}>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600, padding: '6px 12px' }}>Normal</button>
                      <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />
                      <ToolbarBtn icon={Bold} />
                      <ToolbarBtn icon={Italic} />
                      <ToolbarBtn icon={LinkIcon} />
                      <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />
                      <ToolbarBtn icon={List} />
                      <ToolbarBtn icon={ListOrdered} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={form.desc}
                        onChange={e => setForm({ ...form, desc: e.target.value })}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#0f172a', padding: '16px', minHeight: '120px', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                        placeholder="A quick intro or sync call."
                      />
                      <div style={{ position: 'absolute', right: '16px', bottom: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {form.desc?.length || 0}/500
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', background: '#f1f5f9', color: '#64748b', fontSize: '0.95rem', borderRight: '1px solid #cbd5e1' }}>
                      <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }} />
                      localhost:5173/book/4587d085-425a-4eca-a72a-591dccec003e/
                    </div>
                    <input
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: '#0f172a', padding: '14px 16px', fontSize: '1rem', outline: 'none', fontWeight: 500 }}
                    />
                    <div style={{ padding: '0 16px', color: '#94a3b8' }}>
                      <LinkIcon size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                    This is your unique booking page link.
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Duration</label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', fontSize: '1rem', fontWeight: 600 }}>
                      <Clock size={18} color="#64748b" /> {form.dur || '15 Minutes'}
                    </div>
                    <ChevronDown size={18} color="#64748b" />
                  </div>
                </div>

                <div style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Location</label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', fontSize: '1rem', fontWeight: 600 }}>
                      <Video size={18} color="#2563eb" /> Google Meet (Default)
                    </div>
                    <Settings size={18} color="#64748b" />
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Optimized slots</h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Show start times that fit around your existing bookings, instead of defaulting to fixed times like 9:00 and 9:30. <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Learn more</a></p>
                  </div>
                  <ToggleSwitch checked={false} />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Availability</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                      Working hours <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700 }}>Default</span>
                    </div>
                    <ChevronDown size={18} color="#64748b" />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                      <div>Sunday</div>
                      <div style={{ color: '#94a3b8' }}>Unavailable</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 30px 100px', gap: '16px', alignItems: 'center' }}>
                      <div>Monday</div><div>9:00 AM</div><div style={{ textAlign: 'center' }}>-</div><div>5:00 PM</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 30px 100px', gap: '16px', alignItems: 'center' }}>
                      <div>Tuesday</div><div>9:00 AM</div><div style={{ textAlign: 'center' }}>-</div><div>5:00 PM</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 30px 100px', gap: '16px', alignItems: 'center' }}>
                      <div>Wednesday</div><div>9:00 AM</div><div style={{ textAlign: 'center' }}>-</div><div>5:00 PM</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 30px 100px', gap: '16px', alignItems: 'center' }}>
                      <div>Thursday</div><div>9:00 AM</div><div style={{ textAlign: 'center' }}>-</div><div>5:00 PM</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 30px 100px', gap: '16px', alignItems: 'center' }}>
                      <div>Friday</div><div>9:00 AM</div><div style={{ textAlign: 'center' }}>-</div><div>5:00 PM</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                      <div>Saturday</div>
                      <div style={{ color: '#94a3b8' }}>Unavailable</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={18} /> Asia/Calcutta
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#0f172a' }}>
                      Edit availability <ExternalLink size={16} color="#64748b" />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Check for conflicts</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', marginBottom: '24px' }}>Select which calendars you want to check for conflicts to prevent double bookings.</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: '#64748b', marginBottom: '24px' }}>
                    Use <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, paddingBottom: '2px', cursor: 'pointer' }}>Account <ChevronDown size={14} /></div> Settings
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <Calendar size={20} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Google Calendar</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>sohithkontham5@gmail.com</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'form' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Confirmation</h3>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>What your booker should provide to receive confirmations</p>
                  </div>
                  <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <Mail size={16} /> Email
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                      Phone
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Booking questions</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Customize the questions asked on the booking page. <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Learn more</a></p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>

                  {/* Question Rows */}
                  {[
                    { title: 'Your name', badge: 'Required', badgeColor: '#0f172a', desc: 'Name', toggled: true, hideToggle: true },
                    { title: 'Email address', badge: 'Required', badgeColor: '#0f172a', desc: 'Email', toggled: true },
                    { title: 'Phone number', badge: 'Hidden', badgeColor: '#64748b', desc: 'Phone', toggled: false },
                    { title: 'What is this meeting about?', badge: 'Hidden', badgeColor: '#64748b', desc: 'Short Text', toggled: false },
                    { title: 'Additional notes', badge: 'Optional', badgeColor: '#64748b', desc: 'Long Text', toggled: true },
                    { title: 'Add guests', badge: 'Optional', badgeColor: '#64748b', desc: 'Multiple Emails', toggled: true },
                    { title: 'Reason for reschedule', badge: 'Optional', badgeColor: '#64748b', desc: 'Long Text', toggled: true }
                  ].map((q, i, arr) => (
                    <div key={q.title} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{q.title}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', color: q.badgeColor, padding: '2px 8px', borderRadius: '12px' }}>{q.badge}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{q.desc}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!q.hideToggle && <ToggleSwitch checked={q.toggled} />}
                        <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ margin: '24px auto 0', display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', color: '#2563eb', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <ShieldCheck size={16} /> Save changes to preview all updates.
                </div>
              </div>
            )}

            {activeTab === 'conf' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Calendar event name</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', color: '#64748b', fontSize: '0.95rem' }}>
                      15 min meeting between Kontham sohith and {'{Scheduler}'}
                    </div>
                    <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 20px', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Edit</button>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Redirect on booking</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '12px' }}>Teams</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Redirect to a custom URL after a successful booking</div>
                  </div>
                  <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Upgrade <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ paddingRight: '40px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Custom 'Reply-To' email</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>Use a different email address as the replyTo for confirmation emails instead of the organizer's email</div>
                    </div>
                    <ToggleSwitch checked={false} />
                  </div>

                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '40px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Send Cal Video transcription emails</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>Send emails with the transcription of the Cal Video after the meeting ends. (Requires a paid plan)</div>
                    </div>
                    <ToggleSwitch checked={true} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pay' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '0 0 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ paddingRight: '40px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Paid booking</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>Request payments for your bookings and earn money.</div>
                    </div>
                    <ToggleSwitch checked={false} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '40px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Offer seats</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>Offer seats for booking. This automatically disables guest & opt-in bookings. <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Learn more</a></div>
                    </div>
                    <ToggleSwitch checked={false} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'app' && (
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Layout</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', marginBottom: '16px' }}>You can select multiple and your guests can switch views.</p>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>

                    {/* Month Layout */}
                    <div>
                      <div style={{ width: '140px', height: '90px', border: '2px solid #2563eb', borderRadius: '12px', padding: '8px', marginBottom: '8px', cursor: 'pointer', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '8px', width: '30%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
                          {[...Array(28)].map((_, i) => <div key={i} style={{ background: '#f1f5f9', borderRadius: '2px' }}></div>)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                        <input type="checkbox" checked readOnly style={{ accentColor: '#0f172a' }} /> Month <span style={{ color: '#64748b', fontWeight: 500 }}>(Default)</span>
                      </div>
                    </div>

                    {/* Weekly Layout */}
                    <div>
                      <div style={{ width: '140px', height: '90px', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px', marginBottom: '8px', cursor: 'pointer', background: '#ffffff', display: 'flex', gap: '4px' }}>
                        <div style={{ width: '20px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                          {[...Array(4)].map((_, i) => <div key={i} style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px' }}></div>)}
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '2px' }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                        <input type="checkbox" checked readOnly style={{ accentColor: '#0f172a' }} /> Weekly
                      </div>
                    </div>

                    {/* Column Layout */}
                    <div>
                      <div style={{ width: '140px', height: '90px', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px', marginBottom: '8px', cursor: 'pointer', background: '#ffffff', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ height: '8px', width: '50%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '4px' }}></div>
                          <div style={{ height: '4px', width: '30%', background: '#f1f5f9', borderRadius: '2px' }}></div>
                          <div style={{ height: '4px', width: '40%', background: '#f1f5f9', borderRadius: '2px' }}></div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {[...Array(5)].map((_, i) => <div key={i} style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px' }}></div>)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                        <input type="checkbox" checked readOnly style={{ accentColor: '#0f172a' }} /> Column
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Default view</div>
                    <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                      <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Month</button>
                      <button style={{ background: 'transparent', border: 'none', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Weekly</button>
                      <button style={{ background: 'transparent', border: 'none', padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Column</button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '32px' }}>
                    You can manage this for all your event types in Settings &rarr; <a href="#" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}>Appearance</a> or <a href="#" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}>Override</a> for this event only.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '40px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Event type color</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>This is only used for event type & booking differentiation within the app. It is not displayed to bookers.</div>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>

                    <div style={{ padding: '20px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '40px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Auto translate title and description</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>Automatically translate titles and descriptions to the visitor's browser language using AI.</div>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>

                    <div style={{ padding: '20px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '40px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Interface language</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>Set your preferred language for the booking interface</div>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>

                    <div style={{ padding: '20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ paddingRight: '40px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Lock timezone on booking page</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.4 }}>To lock the timezone on booking page, useful for in-person events. <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Learn more</a></div>
                      </div>
                      <ToggleSwitch checked={false} />
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Preview Pane */}
          <div style={{ width: '420px', padding: '40px 40px 40px 40px', display: 'flex', flexDirection: 'column' }}>

            {activeTab !== 'form' && activeTab !== 'conf' && activeTab !== 'app' && activeTab !== 'pay' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>
                  <Eye size={18} /> Preview
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>

                  {/* Preview Content */}
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={24} color="#ffffff" />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{form.title || '15 Min Meeting'}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                        <Clock size={16} /> {form.dur?.replace(' Minutes', 'm') || '15m'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                        <Video size={16} /> Google Meet
                      </div>
                    </div>

                    <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, paddingBottom: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                      {form.desc || 'A quick intro or sync call.'}
                    </div>

                    {/* Calendar Area */}
                    <div>
                      <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Select a Date & Time</h4>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <ArrowLeft size={16} color="#64748b" />
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>May 2025</div>
                        <ArrowLeft size={16} color="#64748b" style={{ transform: 'rotate(180deg)' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                        <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', rowGap: '12px' }}>
                        {/* Blank spaces for offset */}
                        <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 500 }}>28</div>
                        <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 500 }}>29</div>
                        <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 500 }}>30</div>

                        {/* Dates */}
                        {[...Array(11)].map((_, i) => {
                          const date = i + 1;
                          const isSelected = date === 1;
                          return (
                            <div key={date} style={{
                              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%', fontSize: '0.95rem', fontWeight: 600,
                              background: isSelected ? '#2563eb' : 'transparent',
                              color: isSelected ? '#ffffff' : '#0f172a',
                              cursor: 'pointer'
                            }}>
                              {date}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button style={{ width: '100%', padding: '14px', background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', color: '#2563eb', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Globe size={18} /> Open live booking page
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '12px' }}>
                    Share this link to start accepting bookings.
                  </div>
                </div>

              </>
            )}

            {(activeTab === 'form' || activeTab === 'app' || activeTab === 'pay') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

                  {/* Top Success Area */}
                  <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <Check size={20} strokeWidth={3} />
                    </div>
                    <h2 style={{ margin: '0 0 12px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>This meeting is scheduled</h2>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>We sent an email with a calendar invitation with the details to everyone.</p>
                  </div>

                  {/* Details Table */}
                  <div style={{ padding: '0 32px' }}>
                    <div style={{ borderTop: '1px solid #e2e8f0', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                      <div style={{ display: 'flex' }}>
                        <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>What</div>
                        <div style={{ flex: 1, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>15 min meeting between Kontham sohith and Jane Doe</div>
                      </div>

                      <div style={{ display: 'flex' }}>
                        <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>When</div>
                        <div style={{ flex: 1, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                          Tuesday, June 30, 2026<br />
                          10:00 AM - 10:15 AM (India Standard Time)
                        </div>
                      </div>

                      <div style={{ display: 'flex' }}>
                        <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Who</div>
                        <div style={{ flex: 1, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                          <div style={{ marginBottom: '12px' }}>Kontham sohith <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>Host</span></div>
                          <div>
                            Jane Doe <span style={{ color: '#ea580c', fontWeight: 600, fontSize: '0.85rem' }}>Guest</span><br />
                            <span style={{ color: '#94a3b8' }}>jane.doe@example.com</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex' }}>
                        <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Where</div>
                        <div style={{ flex: 1, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Cal Video</div>
                      </div>

                    </div>
                  </div>

                  {/* Add to Calendar Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Add to calendar</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Icons placeholders for Google, Outlook, Office365, Yahoo */}
                      {['G', 'O', 'M', 'Y'].map(letter => (
                        <div key={letter} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', cursor: 'pointer', background: '#f8fafc' }}>{letter}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
                  Need to make a change? <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Reschedule</a> or <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Cancel</a>
                </div>
              </div>
            )}



          </div>
        </div>
      </div>
    </div>
  );
}
