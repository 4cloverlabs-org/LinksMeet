import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Settings, Mail, Globe, 
  Trash2, Plus, Edit3, X, Save, AlertTriangle, ShieldCheck, Check, 
  CalendarDays, BarChart3, Users, Hourglass, Star, ExternalLink, RefreshCw,
  Search, ChevronRight, Video
} from 'lucide-react';
import { 
  fetchBookings, fetchEventTypes, fetchAvailability, fetchIntegrationSettings,
  saveIntegrationSettings, saveEventType, deleteEventType, saveAvailability, cancelBooking,
  testIntegrationSettings
} from '../lib/db';
import type { Booking, EventType, Availability, IntegrationSettings } from '../lib/db';
import { formatSelectedDate, POPULAR_TIMEZONES } from '../lib/timezone';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'events' | 'availability' | 'settings'>('bookings');
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [agendaDate, setAgendaDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormState, setEventFormState] = useState<Omit<EventType, 'active'>>({
    id: '',
    title: '',
    description: '',
    duration: 30,
    color: 'blue'
  });
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  // Blocked Date State
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Built-in Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 1. Initial Load
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const b = await fetchBookings();
        const ev = await fetchEventTypes();
        const av = await fetchAvailability();
        const s = await fetchIntegrationSettings();
        
        setBookings(b);
        setEventTypes(ev);
        setAvailability(av);
        setSettings(s);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const refreshBookings = async () => {
    try {
      const b = await fetchBookings();
      setBookings(b);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 2. Booking cancel
  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this meeting reservation?')) return;
    setActionLoading(true);
    try {
      await cancelBooking(id);
      await refreshBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
      showToast('Meeting reservation cancelled successfully.');
    } catch (e) {
      showToast('Failed to cancel meeting.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Event types CRUD
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormState.title.trim() || !eventFormState.description.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const eventId = isEditingEvent ? eventFormState.id : eventFormState.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newEvent: EventType = {
      ...eventFormState,
      id: eventId,
      active: true
    };

    setActionLoading(true);
    try {
      await saveEventType(newEvent);
      const ev = await fetchEventTypes();
      setEventTypes(ev);
      setShowEventForm(false);
      setIsEditingEvent(false);
      setEventFormState({ id: '', title: '', description: '', duration: 30, color: 'blue' });
      showToast(`Event "${newEvent.title}" saved successfully.`);
    } catch (err) {
      showToast('Failed to save event type.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditEventClick = (event: EventType) => {
    setIsEditingEvent(true);
    setEventFormState({
      id: event.id,
      title: event.title,
      description: event.description,
      duration: event.duration,
      color: event.color
    });
    setShowEventForm(true);
  };

  const handleDeleteEventClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event template?')) return;
    setActionLoading(true);
    try {
      await deleteEventType(id);
      const ev = await fetchEventTypes();
      setEventTypes(ev);
      showToast('Event type template deleted.');
    } catch (e) {
      showToast('Failed to delete event type.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Availability Actions
  const handleAvailabilityToggleDay = (day: string) => {
    if (!availability) return;
    
    const updated = {
      ...availability,
      workingDays: {
        ...availability.workingDays,
        [day]: {
          ...availability.workingDays[day],
          active: !availability.workingDays[day].active
        }
      }
    };
    setAvailability(updated);
  };

  const handleAvailabilityTimeChange = (day: string, type: 'start' | 'end', value: string) => {
    if (!availability) return;

    const updated = {
      ...availability,
      workingDays: {
        ...availability.workingDays,
        [day]: {
          ...availability.workingDays[day],
          slots: [{
            ...availability.workingDays[day].slots[0],
            [type]: value
          }]
        }
      }
    };
    setAvailability(updated);
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate || !availability) return;
    if (availability.blockedDates.includes(newBlockedDate)) {
      showToast('This date is already blocked.', 'error');
      return;
    }

    const updated = {
      ...availability,
      blockedDates: [...availability.blockedDates, newBlockedDate].sort()
    };
    setAvailability(updated);
    setNewBlockedDate('');
    showToast(`Date ${formatSelectedDate(newBlockedDate)} blocked.`);
  };

  const handleRemoveBlockedDate = (date: string) => {
    if (!availability) return;
    const updated = {
      ...availability,
      blockedDates: availability.blockedDates.filter(d => d !== date)
    };
    setAvailability(updated);
    showToast(`Date ${formatSelectedDate(date)} unblocked.`);
  };

  const handleSaveAvailability = async () => {
    if (!availability) return;
    setActionLoading(true);
    try {
      await saveAvailability(availability);
      showToast('Working hours and timezone saved successfully.');
    } catch (e) {
      showToast('Failed to save availability settings.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Settings Actions
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setActionLoading(true);
    try {
      saveIntegrationSettings(settings);
      showToast('Integrations configuration saved successfully.');
    } catch (e) {
      showToast('Failed to save configuration.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings) return;
    setActionLoading(true);
    showToast('Verifying Firebase Firestore integration...', 'success');
    try {
      const res = await testIntegrationSettings(settings);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Analytics Metrics Calculation
  const getAnalytics = () => {
    const totalCalls = bookings.filter(b => b.status !== 'cancelled').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingCalls = bookings.filter(b => b.status === 'upcoming' && b.date >= todayStr).length;
    
    const totalMinutes = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.eventDuration || 30), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate most popular format
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        counts[b.eventTitle] = (counts[b.eventTitle] || 0) + 1;
      }
    });
    
    let popularFormat = 'None';
    let maxCount = 0;
    Object.keys(counts).forEach(k => {
      if (counts[k] > maxCount) {
        maxCount = counts[k];
        popularFormat = k;
      }
    });

    return { totalCalls, upcomingCalls, totalHours, popularFormat };
  };

  const stats = getAnalytics();

  // Generate 7 day chart data
  const getChartData = () => {
    const dataPoints = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled').length;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      dataPoints.push({ label: dayLabel, count });
    }
    return dataPoints;
  };
  
  const chartPoints = getChartData();
  const maxChartCount = Math.max(...chartPoints.map(p => p.count), 4); // baseline height of 4

  // Filter and Search Bookings list
  const filteredBookings = bookings.filter(b => {
    // 1. Status Filter
    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = b.date < todayStr;
    let matchesStatus = false;
    
    if (bookingFilter === 'cancelled') {
      matchesStatus = b.status === 'cancelled';
    } else if (bookingFilter === 'upcoming') {
      matchesStatus = b.status === 'upcoming' && !isPast;
    } else {
      matchesStatus = b.status === 'completed' || (b.status === 'upcoming' && isPast);
    }

    if (!matchesStatus) return false;

    // 2. Search Term Filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(term) ||
      b.email.toLowerCase().includes(term) ||
      b.eventTitle.toLowerCase().includes(term) ||
      b.message?.toLowerCase().includes(term)
    );
  });

  // Get bookings for selected agenda date
  const agendaBookings = bookings.filter(b => b.date === agendaDate && b.status !== 'cancelled');

  if (loading || !settings) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'hsl(var(--bg-primary))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '3.5px solid hsl(var(--border-color))', borderTopColor: 'hsl(var(--accent-primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Initializing SaleMail Admin Console...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '260px 1fr', 
      minHeight: 'calc(100vh - 70px)', 
      backgroundColor: 'hsl(var(--bg-primary))',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* ---------------------------------------------------- */}
      {/* LEFT SIDEBAR: PROFILE & NAVIGATION */}
      {/* ---------------------------------------------------- */}
      <aside style={{ 
        borderRight: '1px solid hsl(var(--border-color))', 
        backgroundColor: 'hsl(var(--bg-secondary))',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '35px'
      }}>
        {/* Profile Card */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px 16px',
          borderRadius: 'var(--border-radius-md)',
          backgroundColor: 'hsl(var(--bg-primary))',
          border: '1px solid hsl(var(--border-color))'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            H
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px' }}>Expantra Host</h4>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '10px' }}>Meeting Manager</span>
          <div style={{ 
            fontSize: '0.7rem', 
            backgroundColor: 'hsl(var(--bg-tertiary))', 
            padding: '4px 10px', 
            borderRadius: 'var(--border-radius-full)', 
            color: 'hsl(var(--text-secondary))',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Globe size={10} />
            <span>{availability?.timezone.split('/').pop()?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: activeTab === 'bookings' ? 'rgba(hsl(var(--accent-primary)), 0.08)' : 'none',
              color: activeTab === 'bookings' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
              fontWeight: activeTab === 'bookings' ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <CalendarIcon size={16} />
            <span>Bookings Feed</span>
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            style={{
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: activeTab === 'events' ? 'rgba(hsl(var(--accent-primary)), 0.08)' : 'none',
              color: activeTab === 'events' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
              fontWeight: activeTab === 'events' ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Clock size={16} />
            <span>Event Templates</span>
          </button>
          
          <button
            onClick={() => setActiveTab('availability')}
            style={{
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: activeTab === 'availability' ? 'rgba(hsl(var(--accent-primary)), 0.08)' : 'none',
              color: activeTab === 'availability' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
              fontWeight: activeTab === 'availability' ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <CalendarDays size={16} />
            <span>Weekly Planner</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: activeTab === 'settings' ? 'rgba(hsl(var(--accent-primary)), 0.08)' : 'none',
              color: activeTab === 'settings' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
              fontWeight: activeTab === 'settings' ? 600 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Settings size={16} />
            <span>Integrations</span>
          </button>
        </nav>

        {/* Public Booking Link Button */}
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ padding: '10px 16px', fontSize: '0.8rem', justifyContent: 'center', gap: '6px' }}
        >
          <span>View Booking Page</span>
          <ExternalLink size={12} />
        </a>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTAINER */}
      {/* ---------------------------------------------------- */}
      <main style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>
        
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Welcome back, Host
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
              Overview and configuration panel for SaleMail.
            </p>
          </div>
          
          {/* Active Status Header Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              Today: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
            </span>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: 'hsl(var(--accent-success))',
              boxShadow: '0 0 8px hsl(var(--accent-success))'
            }} />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ROW 1: CORE PERFORMANCE METRICS & SVG TREND CHART */}
        {/* ---------------------------------------------------- */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 1.5fr',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          {/* Metric cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {/* Card 1: Total Bookings */}
            <div className="glass-card glow-card-hover" style={{ 
              padding: '24px', 
              borderRadius: 'var(--border-radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              backgroundColor: 'hsl(var(--bg-secondary))',
              border: '1px solid hsl(var(--border-color))'
            }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: 'var(--border-radius-md)', 
                backgroundColor: 'rgba(hsl(var(--accent-primary)), 0.08)',
                color: 'hsl(var(--accent-primary))'
              }}>
                <Users size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bookings</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 2px 0', lineHeight: 1 }}>{stats.totalCalls}</span>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-success))', fontWeight: 600 }}>+12% this month</span>
              </div>
            </div>

            {/* Card 2: Upcoming syncs */}
            <div className="glass-card glow-card-hover" style={{ 
              padding: '24px', 
              borderRadius: 'var(--border-radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              backgroundColor: 'hsl(var(--bg-secondary))',
              border: '1px solid hsl(var(--border-color))'
            }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: 'var(--border-radius-md)', 
                backgroundColor: 'rgba(hsl(var(--accent-secondary)), 0.08)',
                color: 'hsl(var(--accent-secondary))'
              }}>
                <CalendarIcon size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Sessions</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 2px 0', lineHeight: 1 }}>{stats.upcomingCalls}</span>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Within next 30 days</span>
              </div>
            </div>

            {/* Card 3: Total Consultation Hours */}
            <div className="glass-card glow-card-hover" style={{ 
              padding: '24px', 
              borderRadius: 'var(--border-radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              backgroundColor: 'hsl(var(--bg-secondary))',
              border: '1px solid hsl(var(--border-color))'
            }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: 'var(--border-radius-md)', 
                backgroundColor: 'rgba(hsl(var(--accent-success)), 0.08)',
                color: 'hsl(var(--accent-success))'
              }}>
                <Hourglass size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consultation Hours</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 2px 0', lineHeight: 1 }}>{stats.totalHours} hrs</span>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-success))', fontWeight: 600 }}>Active meeting time</span>
              </div>
            </div>

            {/* Card 4: Most Popular event type */}
            <div className="glass-card glow-card-hover" style={{ 
              padding: '24px', 
              borderRadius: 'var(--border-radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              backgroundColor: 'hsl(var(--bg-secondary))',
              border: '1px solid hsl(var(--border-color))'
            }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: 'var(--border-radius-md)', 
                backgroundColor: 'rgba(hsl(var(--accent-warning)), 0.08)',
                color: 'hsl(var(--accent-warning))'
              }}>
                <Star size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 'calc(100% - 64px)' }}>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular Format</span>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  margin: '8px 0 2px 0', 
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }} title={stats.popularFormat}>
                  {stats.popularFormat}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Most selected slot</span>
              </div>
            </div>
          </div>

          {/* SVG Trend Line Chart Card */}
          <div className="glass-card glow-card-hover" style={{
            padding: '24px',
            borderRadius: 'var(--border-radius-md)',
            backgroundColor: 'hsl(var(--bg-secondary))',
            border: '1px solid hsl(var(--border-color))',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={14} />
                <span>Booking Trends (Last 7 Days)</span>
              </span>
              <button 
                onClick={refreshBookings} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))', display: 'flex' }}
                title="Refresh stats"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Custom SVG Line Chart */}
            <div style={{ position: 'relative', width: '100%', height: '110px', marginTop: '10px' }}>
              <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent-primary))" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="hsl(var(--accent-primary))" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="hsl(var(--accent-primary))" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="hsl(var(--border-color))" strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="3,3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="hsl(var(--border-color))" strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="hsl(var(--border-color))" strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="3,3" />

                {/* Calculate coordinates: 7 points from index 0 to 6.
                    X spans from 10 to 290. Y spans from 90 (0 count) to 10 (max count) */}
                {(() => {
                  const xInterval = 280 / 6;
                  const points = chartPoints.map((pt, i) => {
                    const x = 10 + i * xInterval;
                    const y = 90 - (pt.count / maxChartCount) * 70;
                    return { x, y, ...pt };
                  });

                  // Create SVG path string
                  const pathD = points.reduce((acc, p, i) => {
                    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                  }, '');

                  // Fill area under path
                  const fillD = `${pathD} L ${points[points.length - 1].x} 90 L ${points[0].x} 90 Z`;

                  return (
                    <>
                      <path d={fillD} fill="url(#chartGrad)" />
                      <path d={pathD} fill="none" stroke="hsl(var(--accent-primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                      
                      {/* Dots and Labels */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="3.5" 
                            fill="hsl(var(--bg-secondary))" 
                            stroke="hsl(var(--accent-primary))" 
                            strokeWidth="2" 
                            className="chart-circle"
                          />
                          {/* Y-count hover text */}
                          <text x={p.x} y={p.y - 8} fontSize="6" textAnchor="middle" fontWeight="700" fill="hsl(var(--text-primary))">
                            {p.count > 0 ? p.count : ''}
                          </text>
                          {/* X-axis label */}
                          <text x={p.x} y="98" fontSize="7" textAnchor="middle" fill="hsl(var(--text-secondary))">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TABS CONTAINER */}
        {/* ---------------------------------------------------- */}
        
        {/* TAB 1: BOOKINGS AGENDA SPLIT PANEL */}
        {activeTab === 'bookings' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '30px',
            alignItems: 'flex-start'
          }}>
            
            {/* Column A: Bookings Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', backgroundColor: 'hsl(var(--bg-tertiary))', padding: '3px', borderRadius: 'var(--border-radius-sm)', width: 'fit-content' }}>
                  {['upcoming', 'past', 'cancelled'].map(f => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f as any)}
                      style={{
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: bookingFilter === f ? 'hsl(var(--bg-secondary))' : 'transparent',
                        color: bookingFilter === f ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Search box */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'hsl(var(--text-muted))' }} />
                  <input
                    type="text"
                    placeholder="Search guest or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 30px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid hsl(var(--border-color))',
                      backgroundColor: 'hsl(var(--bg-secondary))',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Booking list */}
              {filteredBookings.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  color: 'hsl(var(--text-secondary))', 
                  border: '1px dashed hsl(var(--border-color))', 
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'hsl(var(--bg-secondary))'
                }}>
                  <CalendarIcon size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No bookings found matching filters.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredBookings.map(b => {
                    const isSelected = selectedBooking?.id === b.id;
                    const initials = b.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <div 
                        key={b.id}
                        onClick={() => {
                          setSelectedBooking(b);
                          setAgendaDate(b.date);
                        }}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 'var(--border-radius-md)',
                          border: isSelected 
                            ? '1px solid hsl(var(--accent-primary))' 
                            : '1px solid hsl(var(--border-color))',
                          backgroundColor: isSelected 
                            ? 'rgba(hsl(var(--accent-primary)), 0.03)' 
                            : 'hsl(var(--bg-secondary))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'hsl(var(--text-muted))';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'hsl(var(--border-color))';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                          {/* Initials Avatar */}
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '50%',
                            backgroundColor: 'hsl(var(--bg-tertiary))',
                            color: 'hsl(var(--text-primary))',
                            fontWeight: 600, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</h4>
                              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>•</span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'nowrap' }}>
                                {formatSelectedDate(b.date)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {b.eventTitle} ({b.eventDuration}m)
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--border-radius-full)',
                            backgroundColor: b.status === 'upcoming' 
                              ? 'rgba(hsl(var(--accent-primary)), 0.08)' 
                              : b.status === 'cancelled'
                                ? 'rgba(hsl(var(--accent-danger)), 0.08)'
                                : 'rgba(hsl(var(--accent-success)), 0.08)',
                            color: b.status === 'upcoming' 
                              ? 'hsl(var(--accent-primary))' 
                              : b.status === 'cancelled'
                                ? 'hsl(var(--accent-danger))'
                                : 'hsl(var(--accent-success))'
                          }}>
                            {b.status}
                          </span>
                          <ChevronRight size={16} style={{ color: 'hsl(var(--text-muted))' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column B: Visual Daily Agenda & Details Visualizer */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'sticky',
              top: '90px'
            }}>
              
              {/* Part 1: Visual Agenda Timeline Planner */}
              <div className="glass-card" style={{
                padding: '24px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'hsl(var(--bg-secondary))',
                border: '1px solid hsl(var(--border-color))'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarIcon size={14} style={{ color: 'hsl(var(--accent-primary))' }} />
                    <span>Daily Schedule Visualizer</span>
                  </h4>
                  <input
                    type="date"
                    value={agendaDate}
                    onChange={(e) => setAgendaDate(e.target.value)}
                    style={{
                      border: '1px solid hsl(var(--border-color))',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      backgroundColor: 'hsl(var(--bg-primary))',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', marginBottom: '12px' }}>
                  Agenda for: {formatSelectedDate(agendaDate)}
                </div>

                {/* Timeline Grid (9 AM - 6 PM) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { slot: '09:00 AM', timeLabel: '09:00 AM' },
                    { slot: '10:00 AM', timeLabel: '10:00 AM' },
                    { slot: '11:00 AM', timeLabel: '11:00 AM' },
                    { slot: '12:00 PM', timeLabel: '12:00 PM' },
                    { slot: '01:00 PM', timeLabel: '01:00 PM' },
                    { slot: '02:00 PM', timeLabel: '02:00 PM' },
                    { slot: '03:00 PM', timeLabel: '03:00 PM' },
                    { slot: '04:00 PM', timeLabel: '04:00 PM' },
                    { slot: '05:00 PM', timeLabel: '05:00 PM' }
                  ].map(({ slot, timeLabel }) => {
                    // Check if this hour is occupied by any booking
                    const matchingBooking = agendaBookings.find(b => b.time.includes(slot));
                    
                    return (
                      <div 
                        key={slot}
                        style={{
                          display: 'flex',
                          alignItems: 'stretch',
                          height: '42px',
                          borderLeft: '2px solid hsl(var(--border-color))'
                        }}
                      >
                        <div style={{ width: '64px', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', paddingLeft: '8px', display: 'flex', alignItems: 'center' }}>
                          {timeLabel}
                        </div>
                        
                        <div style={{ flex: 1, padding: '2px 4px', display: 'flex' }}>
                          {matchingBooking ? (
                            <div 
                              onClick={() => setSelectedBooking(matchingBooking)}
                              style={{
                                flex: 1,
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(hsl(var(--accent-primary)), 0.1)',
                                borderLeft: '3px solid hsl(var(--accent-primary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(hsl(var(--accent-primary)), 0.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(hsl(var(--accent-primary)), 0.1)'}
                            >
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--accent-primary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {matchingBooking.name} ({matchingBooking.eventTitle.split(' ')[0]})
                              </span>
                              <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))' }}>
                                {matchingBooking.time.split(' - ')[0]}
                              </span>
                            </div>
                          ) : (
                            <div style={{
                              flex: 1, border: '1.5px dashed hsl(var(--border-color))', borderRadius: '4px',
                              display: 'flex', alignItems: 'center', paddingLeft: '10px',
                              color: 'hsl(var(--text-muted))', fontSize: '0.75rem'
                            }}>
                              Free Slot
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 2: Selected Booking Details Drawer Card */}
              {selectedBooking && (
                <div 
                  className="glass-card animate-fade-in"
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'hsl(var(--bg-secondary))',
                    border: '1px solid hsl(var(--border-color))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>Meeting Details</span>
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 650 }}>{selectedBooking.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} />
                      <a href={`mailto:${selectedBooking.email}`} style={{ textDecoration: 'underline' }}>{selectedBooking.email}</a>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} />
                      <span>{selectedBooking.eventTitle} ({selectedBooking.eventDuration}m)</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={12} />
                      <span>{formatSelectedDate(selectedBooking.date)} @ {selectedBooking.time}</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={12} />
                      <span>Guest Zone: {selectedBooking.timezone}</span>
                    </span>

                    {selectedBooking.message && (
                      <div style={{
                        marginTop: '6px', fontSize: '0.8rem', backgroundColor: 'hsl(var(--bg-tertiary))',
                        padding: '10px 14px', borderRadius: '4px', fontStyle: 'italic', color: 'hsl(var(--text-secondary))'
                      }}>
                        &ldquo;{selectedBooking.message}&rdquo;
                      </div>
                    )}

                    {selectedBooking.status === 'upcoming' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '12px', marginTop: '6px' }}>
                        <Video size={14} style={{ color: 'hsl(var(--accent-primary))', marginTop: '2px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Google Meet Link:</span>
                          <a href={selectedBooking.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--accent-primary))', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}>
                            Join Google Meet
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedBooking.status === 'upcoming' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="btn btn-secondary"
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        color: 'white',
                        backgroundColor: 'hsl(var(--accent-danger))',
                        borderColor: 'transparent',
                        borderRadius: 'var(--border-radius-sm)',
                        marginTop: '8px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(350, 70%, 45%)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent-danger))'}
                    >
                      <Trash2 size={12} />
                      <span>Cancel Meeting Reservation</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: EVENT TYPES GRID */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Event Templates</h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Configure different meeting options available on your visitor scheduling page.</p>
              </div>
              
              {!showEventForm && (
                <button
                  onClick={() => {
                    setIsEditingEvent(false);
                    setEventFormState({ id: '', title: '', description: '', duration: 30, color: 'blue' });
                    setShowEventForm(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={14} />
                  <span>Create Template</span>
                </button>
              )}
            </div>

            {/* Event Form (Inline overlay) */}
            {showEventForm && (
              <form 
                onSubmit={handleSaveEvent}
                className="glass-card animate-fade-in"
                style={{ 
                  padding: '24px', 
                  border: '1px solid hsl(var(--border-color))', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: 'hsl(var(--bg-secondary))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  maxWidth: '600px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{isEditingEvent ? 'Edit Template' : 'Create Template'}</h4>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEventForm(false);
                      setIsEditingEvent(false);
                    }} 
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="evt-title" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Event Title *</label>
                  <input
                    id="evt-title"
                    type="text"
                    required
                    placeholder="e.g. 30-Min Discovery Call"
                    value={eventFormState.title}
                    onChange={(e) => setEventFormState({ ...eventFormState, title: e.target.value })}
                    style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid hsl(var(--border-color))', backgroundColor: 'hsl(var(--bg-primary))', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="evt-duration" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Duration (minutes) *</label>
                    <select
                      id="evt-duration"
                      value={eventFormState.duration}
                      onChange={(e) => setEventFormState({ ...eventFormState, duration: Number(e.target.value) })}
                      style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid hsl(var(--border-color))', backgroundColor: 'hsl(var(--bg-primary))', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="evt-color" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Theme Tag Color</label>
                    <select
                      id="evt-color"
                      value={eventFormState.color}
                      onChange={(e) => setEventFormState({ ...eventFormState, color: e.target.value })}
                      style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid hsl(var(--border-color))', backgroundColor: 'hsl(var(--bg-primary))', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="evt-desc" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Description *</label>
                  <textarea
                    id="evt-desc"
                    rows={3}
                    required
                    placeholder="Write a brief summary of what you cover during this meeting type..."
                    value={eventFormState.description}
                    onChange={(e) => setEventFormState({ ...eventFormState, description: e.target.value })}
                    style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid hsl(var(--border-color))', backgroundColor: 'hsl(var(--bg-primary))', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-primary"
                    style={{ padding: '8px 24px', fontSize: '0.85rem' }}
                  >
                    <Save size={14} />
                    <span>Save Template</span>
                  </button>
                </div>
              </form>
            )}

            {/* Grid display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {eventTypes.map(event => (
                <div
                  key={event.id}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'hsl(var(--bg-secondary))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className={`badge ${
                        event.color === 'blue' ? 'badge-blue' : event.color === 'purple' ? 'badge-purple' : 'badge-green'
                      }`} style={{ fontSize: '0.7rem' }}>
                        {event.color} theme
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <Clock size={12} />
                        {event.duration} Mins
                      </span>
                    </div>
                    
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 650, marginBottom: '6px', letterSpacing: '-0.01em' }}>{event.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', fontWeight: 300 }}>{event.description}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '12px' }}>
                    <button
                      onClick={() => handleEditEventClick(event)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))',
                        padding: '8px', borderRadius: '4px', display: 'flex'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--bg-tertiary))'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Edit template"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteEventClick(event.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--accent-danger))',
                        padding: '8px', borderRadius: '4px', display: 'flex'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(hsl(var(--accent-danger)), 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WEEKLY AVAILABILITY PLANNER */}
        {activeTab === 'availability' && availability && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '30px',
            alignItems: 'flex-start'
          }}>
            {/* Left Col: Weekdays slots list */}
            <div className="glass-card" style={{
              padding: '30px',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'hsl(var(--bg-secondary))',
              border: '1px solid hsl(var(--border-color))',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 650 }}>Availability Schedule</h3>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Configure standard active weekday hours inside SaleMail.</p>
                </div>
                
                <button
                  onClick={handleSaveAvailability}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Save size={14} />
                  <span>Save Plan</span>
                </button>
              </div>

              {/* Weekday checkboxes and timers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(availability.workingDays).map(day => {
                  const dayConfig = availability.workingDays[day];
                  const firstSlot = dayConfig.slots[0] || { start: '09:00', end: '18:00' };

                  return (
                    <div 
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 20px',
                        border: '1px solid hsl(var(--border-color))',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: dayConfig.active ? 'hsl(var(--bg-primary))' : 'hsl(var(--bg-tertiary))',
                        opacity: dayConfig.active ? 1 : 0.65,
                        transition: 'all var(--transition-fast)',
                        flexWrap: 'wrap',
                        gap: '15px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '120px' }}>
                        <input
                          type="checkbox"
                          checked={dayConfig.active}
                          onChange={() => handleAvailabilityToggleDay(day)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          id={`check-${day}`}
                        />
                        <label htmlFor={`check-${day}`} style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer' }}>{day}</label>
                      </div>

                      {dayConfig.active ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="time"
                            value={firstSlot.start}
                            onChange={(e) => handleAvailabilityTimeChange(day, 'start', e.target.value)}
                            style={{ 
                              padding: '6px 10px', 
                              border: '1px solid hsl(var(--border-color))', 
                              borderRadius: '4px', 
                              backgroundColor: 'hsl(var(--bg-secondary))',
                              fontSize: '0.8rem',
                              outline: 'none'
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>to</span>
                          <input
                            type="time"
                            value={firstSlot.end}
                            onChange={(e) => handleAvailabilityTimeChange(day, 'end', e.target.value)}
                            style={{ 
                              padding: '6px 10px', 
                              border: '1px solid hsl(var(--border-color))', 
                              borderRadius: '4px', 
                              backgroundColor: 'hsl(var(--bg-secondary))',
                              fontSize: '0.8rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontStyle: 'italic' }}>Out of Office</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Operating TZ & Blocked Holiday Dates list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Timezone Card */}
              <div className="glass-card" style={{
                padding: '24px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'hsl(var(--bg-secondary))',
                border: '1px solid hsl(var(--border-color))',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} style={{ color: 'hsl(var(--accent-primary))' }} />
                  <span>Operating Timezone</span>
                </h4>
                
                <select
                  value={availability.timezone}
                  onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: 'var(--border-radius-sm)', 
                    border: '1px solid hsl(var(--border-color))', 
                    backgroundColor: 'hsl(var(--bg-primary))',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  {POPULAR_TIMEZONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4 }}>
                  All slots are calculated in this timezone. Calendars of visitors are automatically synced to match offsets.
                </span>
              </div>

              {/* Blocked Dates Card */}
              <div className="glass-card" style={{
                padding: '24px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'hsl(var(--bg-secondary))',
                border: '1px solid hsl(var(--border-color))',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarIcon size={14} style={{ color: 'hsl(var(--accent-primary))' }} />
                    <span>Vacations & Blocked Dates</span>
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>Define specific off-duty dates where all slots are blocked.</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px 10px', 
                      border: '1px solid hsl(var(--border-color))', 
                      borderRadius: 'var(--border-radius-sm)', 
                      backgroundColor: 'hsl(var(--bg-primary))',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddBlockedDate}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <Plus size={12} />
                    <span>Block</span>
                  </button>
                </div>

                {/* Blocked list */}
                {availability.blockedDates.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>No vacation dates blocked.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                    {availability.blockedDates.map(date => (
                      <div
                        key={date}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'hsl(var(--bg-primary))',
                          padding: '4px 10px',
                          borderRadius: 'var(--border-radius-full)',
                          fontSize: '0.75rem',
                          border: '1px solid hsl(var(--border-color))'
                        }}
                      >
                        <span>{formatSelectedDate(date)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDate(date)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'hsl(var(--text-muted))' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--accent-danger))'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--text-muted))'}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTEGRATIONS SETUP */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 650 }}>Integrations</h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Configure API endpoints and verify connection settings.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Verify setup
                </button>
                
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  <Save size={14} />
                  <span>Save Config</span>
                </button>
              </div>
            </div>

            {/* Toggle Card */}
            <div style={{
              padding: '20px',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid hsl(var(--border-color))',
              backgroundColor: 'hsl(var(--bg-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ maxWidth: '500px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>Toggle Live Database Sync</h4>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.4 }}>
                  Synchronize events, availability parameters, and reservations dynamically using Firebase Firestore and EmailJS integrations instead of local cache.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.isLiveMode}
                onChange={(e) => setSettings({ ...settings, isLiveMode: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            {/* Firebase SDK Config Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid hsl(var(--border-color))', borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: 'hsl(var(--bg-secondary))' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 650, borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'hsl(var(--accent-primary))' }} />
                <span>Firebase Firestore Web SDK Config</span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="fb-key" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>VITE_FIREBASE_API_KEY</label>
                  <input
                    id="fb-key"
                    type="password"
                    placeholder="AIzaSy..."
                    value={settings.firebaseConfig.apiKey}
                    onChange={(e) => setSettings({ ...settings, firebaseConfig: { ...settings.firebaseConfig, apiKey: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="fb-proj" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>VITE_FIREBASE_PROJECT_ID</label>
                  <input
                    id="fb-proj"
                    type="text"
                    placeholder="salemail-app-id"
                    value={settings.firebaseConfig.projectId}
                    onChange={(e) => setSettings({ ...settings, firebaseConfig: { ...settings.firebaseConfig, projectId: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="fb-domain" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>VITE_FIREBASE_AUTH_DOMAIN</label>
                  <input
                    id="fb-domain"
                    type="text"
                    placeholder="salemail-app.firebaseapp.com"
                    value={settings.firebaseConfig.authDomain}
                    onChange={(e) => setSettings({ ...settings, firebaseConfig: { ...settings.firebaseConfig, authDomain: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="fb-app" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>VITE_FIREBASE_APP_ID</label>
                  <input
                    id="fb-app"
                    type="text"
                    placeholder="1:892374:web:2f84..."
                    value={settings.firebaseConfig.appId}
                    onChange={(e) => setSettings({ ...settings, firebaseConfig: { ...settings.firebaseConfig, appId: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>
              </div>
            </div>

            {/* EmailJS Config Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid hsl(var(--border-color))', borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: 'hsl(var(--bg-secondary))' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 650, borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: 'hsl(var(--accent-primary))' }} />
                <span>EmailJS Notification keys</span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="emjs-service" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>VITE_EMAILJS_SERVICE_ID</label>
                  <input
                    id="emjs-service"
                    type="text"
                    placeholder="service_xxxxx"
                    value={settings.emailJsConfig.serviceId}
                    onChange={(e) => setSettings({ ...settings, emailJsConfig: { ...settings.emailJsConfig, serviceId: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="emjs-key" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>VITE_EMAILJS_PUBLIC_KEY</label>
                  <input
                    id="emjs-key"
                    type="password"
                    placeholder="user_xxxxxx"
                    value={settings.emailJsConfig.publicKey}
                    onChange={(e) => setSettings({ ...settings, emailJsConfig: { ...settings.emailJsConfig, publicKey: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="emjs-host" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Host Alert Template ID</label>
                  <input
                    id="emjs-host"
                    type="text"
                    placeholder="template_xxxxx"
                    value={settings.emailJsConfig.templateCompanyId}
                    onChange={(e) => setSettings({ ...settings, emailJsConfig: { ...settings.emailJsConfig, templateCompanyId: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label htmlFor="emjs-client" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Client Confirmation Template ID</label>
                  <input
                    id="emjs-client"
                    type="text"
                    placeholder="template_yyyyy"
                    value={settings.emailJsConfig.templateClientId}
                    onChange={(e) => setSettings({ ...settings, emailJsConfig: { ...settings.emailJsConfig, templateClientId: e.target.value } })}
                    style={{ padding: '8px 10px', border: '1px solid hsl(var(--border-color))', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', backgroundColor: 'hsl(var(--bg-primary))' }}
                  />
                </div>
              </div>
            </div>
          </form>
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* TOAST SYSTEM */}
      {/* ---------------------------------------------------- */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            animation: 'slideUp 0.25s ease-out'
          }}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{toast.message}</span>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
