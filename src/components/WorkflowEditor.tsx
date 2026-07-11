import React, { useState } from 'react';
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

export default function WorkflowEditor({ initialDraft, onSave, onCancel, eventTypes }: WorkflowEditorProps) {
  const [draft, setDraft] = useState<WorkflowDraft>(initialDraft);
  const [isActive, setIsActive] = useState(!!initialDraft.is_active);
  
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

  const [applyToAll, setApplyToAll] = useState(draft.action_payload?.applyToAll !== false);
  const [targetEventTypes, setTargetEventTypes] = useState<string[]>(Array.isArray(draft.action_payload?.targetEventTypes) ? draft.action_payload.targetEventTypes : (draft.action_payload?.targetEventType ? [draft.action_payload.targetEventType] : []));

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
          <button className="wf-btn-primary" onClick={() => isActive ? handleSave() : handleSave(true)}>
            {isActive ? 'Save Workflow' : 'Activate'}
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
              <div className="wf-select-wrapper">
                <select value={when} onChange={e => setWhen(e.target.value)} className="wf-input">
                  <option>Before event starts</option>
                  <option>After event ends</option>
                  <option>When event is scheduled</option>
                  <option>When event is cancelled</option>
                </select>
                <ChevronDown size={14} className="wf-select-icon" />
              </div>
            </div>

            {when.includes('Before') || when.includes('After') ? (
              <div className="wf-form-group">
                <label>How long {when.toLowerCase()}?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="number" className="wf-input" value={delayValue} onChange={e => setDelayValue(Number(e.target.value))} style={{ flex: 1 }} />
                  <div className="wf-select-wrapper" style={{ width: '120px' }}>
                    <select className="wf-input" value={delayUnit} onChange={e => setDelayUnit(e.target.value)}>
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <ChevronDown size={14} className="wf-select-icon" />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="wf-form-group">
              <label>Which event type will this apply to?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: applyToAll ? 0.5 : 1, pointerEvents: applyToAll ? 'none' : 'auto' }}>
                {eventTypes?.map(et => {
                  const val = et.slug || et.title;
                  return (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#111827', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={targetEventTypes.includes(val)} 
                        onChange={e => {
                          if (e.target.checked) setTargetEventTypes([...targetEventTypes, val]);
                          else setTargetEventTypes(targetEventTypes.filter(t => t !== val));
                        }}
                        disabled={applyToAll}
                      /> {et.title}
                    </label>
                  );
                })}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '13px', color: '#374151', cursor: 'pointer', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <input type="checkbox" checked={applyToAll} onChange={e => { setApplyToAll(e.target.checked); if (e.target.checked) setTargetEventTypes([]); }} /> Apply to all, including future event types
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
              <div className="wf-select-wrapper">
                <select className="wf-input" value={draft.action_type} onChange={e => {
                  setDraft({...draft, action_type: e.target.value});
                  // update defaults when type changes
                  if (e.target.value === 'sms') { setBody('Reminder: {EVENT_NAME} is at {EVENT_DATE_ddd, h:mma}.'); }
                  if (e.target.value === 'voice') { setBody('Hi {ATTENDEE}. This is an AI calling to remind you about {EVENT_NAME}.'); }
                  if (e.target.value === 'email') { setBody('Hi {ATTENDEE},\n\nThis is a reminder about your upcoming event.'); setSubject('Reminder: {EVENT_NAME}'); }
                }}>
                  <option value="email">Send email to attendees</option>
                  <option value="sms">Send SMS to attendees</option>
                  <option value="voice">AI Voice Call to attendees</option>
                </select>
                <ChevronDown size={14} className="wf-select-icon" />
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
              <div className="wf-select-wrapper">
                <select className="wf-input">
                  <option>Reminder</option>
                  <option>Custom</option>
                </select>
                <ChevronDown size={14} className="wf-select-icon" />
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
        
        <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
          <button className="wf-btn-outline" style={{ background: '#fff' }}>Add action</button>
        </div>

      </div>
    </div>
  );
}
