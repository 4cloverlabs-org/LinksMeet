import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Zap, ArrowRight, Trash2, ChevronDown } from 'lucide-react';
import './WorkflowEditor.css';

export interface WorkflowDraft {
  id?: string;
  template_name: string;
  trigger_event: string;
  delay_ms: number;
  action_type: string;
  action_payload: any;
  is_active?: boolean;
}

interface WorkflowEditorProps {
  initialDraft: WorkflowDraft;
  onSave: (draft: WorkflowDraft) => void;
  onCancel: () => void;
  eventTypes: any[];
}


const CustomSelect = ({ value, options, onChange }: { value: string, options: string[], onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="wf-input"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px 16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', minHeight: '42px', transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#D1D5DB'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
      >
        <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{value}</span>
        <ChevronDown size={18} color="#9CA3AF" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px' }}>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {options.map(opt => (
              <div 
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                style={{ padding: '10px 12px', borderRadius: '8px', background: value === opt ? '#F3E8FF' : 'transparent', color: value === opt ? '#7d3bec' : '#374151', fontSize: '14px', fontWeight: value === opt ? 500 : 400, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { if(value !== opt) e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={e => { if(value !== opt) e.currentTarget.style.background = 'transparent' }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default function WorkflowEditor({ initialDraft, onSave, onCancel, eventTypes }: WorkflowEditorProps) {
  const [draft, setDraft] = useState<WorkflowDraft>(initialDraft);
  const [isActive, setIsActive] = useState(!!initialDraft.is_active);
  const [isActivating, setIsActivating] = useState(false);
  
  // Parse delay_ms into unit and value
  let initialDelayValue = 24;
  let initialDelayUnit = 'hours';
  if (initialDraft.delay_ms) {
    if (initialDraft.delay_ms % (24 * 60 * 60 * 1000) === 0) {
      initialDelayValue = initialDraft.delay_ms / (24 * 60 * 60 * 1000);
      initialDelayUnit = 'days';
    } else if (initialDraft.delay_ms % (60 * 60 * 1000) === 0) {
      initialDelayValue = initialDraft.delay_ms / (60 * 60 * 1000);
      initialDelayUnit = 'hours';
    } else {
      initialDelayValue = initialDraft.delay_ms / (60 * 1000);
      initialDelayUnit = 'minutes';
    }
  }

  const [delayValue, setDelayValue] = useState(initialDelayValue);
  const [delayUnit, setDelayUnit] = useState(initialDelayUnit);
  
  const initialWhen = 
    initialDraft.trigger_event === 'booking_cancelled' ? 'When event is cancelled' :
    initialDraft.trigger_event === 'booking_created' ? 'When event is scheduled' :
    initialDraft.trigger_event === 'event_ends_after' ? 'After event ends' :
    'Before event starts';

  const [when, setWhen] = useState(initialWhen);
  
  // Payload states
  const [senderName, setSenderName] = useState('LinksMeet');
  
  const defaultBody = draft.action_type === 'sms' 
    ? 'Reminder: {EVENT_NAME} is at {EVENT_DATE_ddd, h:mma}.'
    : draft.action_type === 'voice'
    ? 'Hi {ATTENDEE}. This is an AI calling to remind you about {EVENT_NAME}.'
    : 'Hi {ATTENDEE},\n\nThis is a reminder about your upcoming event.\n\nEvent: {EVENT_NAME}\n\nDate & time: {EVENT_DATE_ddd, MMM D, YYYY h:mma}\n\nAttendees: You & {ORGANIZER}';

  const [subject, setSubject] = useState(draft.action_payload?.subject || (draft.action_type === 'email' ? 'Reminder: {EVENT_NAME} - {EVENT_DATE_ddd, MMM D, YYYY h:mma}' : ''));
  const [body, setBody] = useState(draft.action_payload?.body || defaultBody);

  const [applyToAll, setApplyToAll] = useState(draft.action_payload?.applyToAll === true);
  const [targetEventTypes, setTargetEventTypes] = useState<string[]>(Array.isArray(draft.action_payload?.targetEventTypes) ? draft.action_payload.targetEventTypes : (draft.action_payload?.targetEventType ? [draft.action_payload.targetEventType] : []));
  const [isEtDropdownOpen, setIsEtDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const actionDropdownRef = useRef<HTMLDivElement>(null);

  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const [messageTemplate, setMessageTemplate] = useState('Reminder');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEtDropdownOpen(false);
      }
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setIsActionDropdownOpen(false);
      }
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setIsTemplateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = (overrideActive?: boolean) => {
    const finalActive = overrideActive !== undefined ? overrideActive : isActive;
    setIsActive(finalActive);
    // Calculate new delay_ms
    let ms = 0;
    if (when.includes('Before event starts') || when.includes('After event ends')) {
      const multiplier = delayUnit === 'days' ? 24 * 60 * 60 * 1000 : (delayUnit === 'hours' ? 60 * 60 * 1000 : 60 * 1000);
      ms = delayValue * multiplier;
    }
    
    let trigger_event = 'event_starts_before';
    if (when === 'After event ends') trigger_event = 'event_ends_after';
    if (when === 'When event is scheduled') trigger_event = 'booking_created';
    if (when === 'When event is cancelled') trigger_event = 'booking_cancelled';

    onSave({
      ...draft,
      trigger_event,
      delay_ms: ms,
      is_active: finalActive,
      action_payload: {
        senderName,
        subject,
        body,
        applyToAll,
        targetEventTypes
      }
    });
  };

  return (
    <div className="wf-editor">
      <div className="wf-editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="wf-btn-icon" onClick={onCancel}><ArrowLeft size={16} /></button>
          <span style={{ color: '#6B7280', fontSize: '14px' }}>Workflows /</span>
          <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{draft.template_name || 'Untitled'}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="wf-btn-outline"><Trash2 size={15} color="#EF4444" /></button>
          {!isActive && (
            <button className="wf-btn-outline" onClick={() => handleSave()}>{isActive ? 'Save Workflow' : 'Save as Draft'}</button>
          )}
          <button 
            className="wf-btn-primary" 
            style={{ minWidth: '110px' }}
            onClick={() => {
              if (isActive) {
                handleSave();
              } else {
                setIsActivating(true);
                setTimeout(() => {
                  handleSave(true);
                }, 1000);
              }
            }}
          >
            {isActivating ? 'Activated ✓' : (isActive ? 'Save Workflow' : 'Activate')}
          </button>
        </div>
      </div>

      <div className="wf-editor-body">
        
        {/* Trigger Block */}
        <div className="wf-block">
          <div className="wf-block-header">
            <Zap size={16} color="#6B7280" /> <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>Trigger</span>
          </div>
          <div className="wf-block-content">
            <div className="wf-form-group">
              <label>When</label>
              <CustomSelect 
                value={when} 
                onChange={setWhen} 
                options={['Before event starts', 'After event ends', 'When event is scheduled', 'When event is cancelled']} 
              />
            </div>

            {when.includes('Before') || when.includes('After') ? (
              <div className="wf-form-group">
                <label>How long {when.toLowerCase()}?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="number" className="wf-input" value={delayValue} onChange={e => setDelayValue(Number(e.target.value))} style={{ flex: 1 }} />
                  <div style={{ width: '120px' }}>
                    <CustomSelect 
                      value={delayUnit} 
                      onChange={setDelayUnit} 
                      options={['minutes', 'hours', 'days']} 
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="wf-form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Which event type will this apply to?
              </label>

              <div ref={dropdownRef} style={{ position: 'relative', marginTop: '8px' }}>
                <div 
                  onClick={() => !applyToAll && setIsEtDropdownOpen(!isEtDropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px', 
                    background: applyToAll ? '#F9FAFB' : '#fff', 
                    cursor: applyToAll ? 'not-allowed' : 'pointer',
                    opacity: applyToAll ? 0.7 : 1,
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => { if(!applyToAll) e.currentTarget.style.borderColor = '#D1D5DB' }}
                  onMouseLeave={e => { if(!applyToAll) e.currentTarget.style.borderColor = '#E5E7EB' }}
                >
                  <span style={{ color: applyToAll ? '#9CA3AF' : '#111827', fontSize: '14px', fontWeight: 500 }}>
                    {applyToAll ? 'All Event Types' : (targetEventTypes.length === 0 ? 'Select Event Types...' : `${targetEventTypes.length} event type${targetEventTypes.length > 1 ? 's' : ''} selected`)}
                  </span>
                  <ChevronDown size={18} color="#9CA3AF" style={{ transform: isEtDropdownOpen && !applyToAll ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {isEtDropdownOpen && !applyToAll && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px' }}>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {eventTypes?.map(et => {
                        const val = et.slug || et.title;
                        const isSelected = targetEventTypes.includes(val);
                        return (
                          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: isSelected ? '#F3E8FF' : 'transparent', cursor: 'pointer', transition: 'background 0.2s', fontSize: '14px', color: isSelected ? '#7d3bec' : '#374151', fontWeight: isSelected ? 500 : 400 }} onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = '#F9FAFB' }} onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={e => {
                                if (e.target.checked) setTargetEventTypes([...targetEventTypes, val]);
                                else setTargetEventTypes(targetEventTypes.filter(t => t !== val));
                              }}
                              style={{ width: '16px', height: '16px', accentColor: '#7d3bec', cursor: 'pointer' }}
                            /> 
                            {et.title}
                          </label>
                        );
                      })}
                      {eventTypes?.length === 0 && (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>No event types found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}>
                <input type="checkbox" checked={applyToAll} onChange={e => { setApplyToAll(e.target.checked); if (e.target.checked) { setTargetEventTypes([]); setIsEtDropdownOpen(false); } }} style={{ accentColor: '#7d3bec', width: '16px', height: '16px', cursor: 'pointer' }} /> 
                <span style={{ fontWeight: 500 }}>Apply to all, including future event types</span>
              </label>
            </div>
          </div>
        </div>

        {/* Arrow connector */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <div style={{ width: '2px', height: '16px', background: '#E5E7EB' }} />
        </div>

        {/* Action Block */}
        <div className="wf-block">
          <div className="wf-block-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRight size={16} color="#6B7280" /> <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>Action</span>
            </div>
            <Trash2 size={14} color="#EF4444" style={{ cursor: 'pointer' }} />
          </div>
          <div className="wf-block-content">
            <div className="wf-form-group">
              <label>Do this</label>
              <div style={{ position: 'relative' }} ref={actionDropdownRef}>
                <div 
                  onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px', 
                    background: '#fff', 
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>
                    {draft.action_type === 'email' ? 'Send email to attendees' : draft.action_type === 'sms' ? 'Send SMS to attendees' : 'AI Voice Call to attendees'}
                  </span>
                  <ChevronDown size={18} color="#9CA3AF" style={{ transform: isActionDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {isActionDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[
                        { value: 'email', label: 'Send email to attendees', comingSoon: false },
                        { value: 'sms', label: 'Send SMS to attendees', comingSoon: true },
                        { value: 'voice', label: 'AI Voice Call to attendees', comingSoon: true }
                      ].map(opt => {
                        const isSelected = draft.action_type === opt.value;
                        return (
                          <div 
                            key={opt.value}
                            onClick={() => {
                              if (opt.comingSoon) return;
                              setDraft({...draft, action_type: opt.value});
                              if (opt.value === 'sms') { setBody('Reminder: {EVENT_NAME} is at {EVENT_DATE_ddd, h:mma}.'); }
                              if (opt.value === 'voice') { setBody('Hi {ATTENDEE}. This is an AI calling to remind you about {EVENT_NAME}.'); }
                              if (opt.value === 'email') { setBody('Hi {ATTENDEE},\n\nThis is a reminder about your upcoming event.'); setSubject('Reminder: {EVENT_NAME}'); }
                              setIsActionDropdownOpen(false);
                            }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              padding: '10px 12px', 
                              borderRadius: '8px', 
                              background: isSelected ? '#F3E8FF' : 'transparent', 
                              cursor: opt.comingSoon ? 'not-allowed' : 'pointer', 
                              transition: 'background 0.2s', 
                              fontSize: '14px', 
                              color: isSelected ? '#7d3bec' : (opt.comingSoon ? '#9CA3AF' : '#374151'), 
                              fontWeight: isSelected ? 500 : 400 
                            }} 
                            onMouseEnter={e => { if(!isSelected && !opt.comingSoon) e.currentTarget.style.background = '#F9FAFB' }} 
                            onMouseLeave={e => { if(!isSelected && !opt.comingSoon) e.currentTarget.style.background = 'transparent' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{opt.label}</span>
                            {opt.comingSoon && (
                              <span style={{ fontSize: '10px', fontWeight: 600, background: '#F3F4F6', color: '#6B7280', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Coming soon</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {draft.action_type === 'email' && (
              <div className="wf-form-group">
                <label>Sender name</label>
                <input type="text" className="wf-input" value={senderName} onChange={e => setSenderName(e.target.value)} />
              </div>
            )}

            <div className="wf-form-group">
              <label>Message template</label>
              <div style={{ position: 'relative' }} ref={templateDropdownRef}>
                <div 
                  onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px', 
                    background: '#fff', 
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>
                    {messageTemplate}
                  </span>
                  <ChevronDown size={18} color="#9CA3AF" style={{ transform: isTemplateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {isTemplateDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {['Reminder', 'Custom'].map(opt => {
                        const isSelected = messageTemplate === opt;
                        return (
                          <div 
                            key={opt}
                            onClick={() => {
                              setMessageTemplate(opt);
                              setIsTemplateDropdownOpen(false);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: isSelected ? '#F3E8FF' : 'transparent', cursor: 'pointer', transition: 'background 0.2s', fontSize: '14px', color: isSelected ? '#7d3bec' : '#374151', fontWeight: isSelected ? 500 : 400 }} 
                            onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = '#F9FAFB' }} 
                            onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="wf-email-editor">
              {draft.action_type === 'email' && (
                <div className="wf-email-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>Email subject</label>
                    <span style={{ fontSize: '12px', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Add variable <ChevronDown size={12}/></span>
                  </div>
                  <input type="text" className="wf-input wf-input-transparent" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
              )}
              <div className="wf-email-section" style={{ borderBottom: 'none' }}>
                <label style={{ margin: 0, marginBottom: '8px', display: 'block' }}>
                  {draft.action_type === 'email' ? 'Email body' : (draft.action_type === 'sms' ? 'SMS body' : 'Voice Agent Prompt')}
                </label>
                <textarea 
                  className="wf-input wf-input-transparent wf-textarea" 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0', marginTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" /> Include calendar event
              </label>
            </div>
            
          </div>
        </div>
        
        <div style={{ padding: '24px 0' }}></div>

      </div>
    </div>
  );
}
