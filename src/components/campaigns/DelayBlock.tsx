import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';
import { type CampaignStep } from './campaignEngine';

interface DelayBlockProps {
  step: CampaignStep;
  isRunning: boolean;
  onUpdate: (updated: CampaignStep) => void;
  onDelete: () => void;
}

function formatCountdown(secs: number): string {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (d > 0) return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export const DelayBlock: React.FC<DelayBlockProps> = ({
  step,
  isRunning,
  onUpdate,
  onDelete,
}) => {
  const isWaiting = isRunning && step.status === 'Queued' && (step.remainingSeconds || 0) > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'relative', margin: '32px 0', paddingLeft: '0' }}
    >
      <div className="camp-timeline-node">
        <div style={{ width: '8px', height: '8px', background: '#7d3bec', borderRadius: '50%' }} />
        {/* Local vertical line going down to the next node */}
        <div style={{ position: 'absolute', top: '24px', bottom: '-150px', left: '9px', width: '2px', background: '#e2e8f0', zIndex: -1 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 0', width: 'fit-content' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Wait for</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            min={1}
            max={365}
            value={step.delayValue || 1}
            onChange={(e) => onUpdate({ ...step, delayValue: Math.max(1, parseInt(e.target.value) || 1) })}
            style={{
              width: '46px',
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none'
            }}
          />
          <select
            value={step.delayUnit || 'days'}
            onChange={(e) => onUpdate({ ...step, delayUnit: e.target.value as any })}
            style={{
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>

        {isWaiting && (
          <div style={{ marginLeft: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 12px 4px 6px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              <div style={{ background: '#7d3bec', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Clock size={12} strokeWidth={2.5} />
              </div>
              Waiting: {formatCountdown(step.remainingSeconds || 0)}
            </span>
          </div>
        )}

        <button
          onClick={onDelete}
          className="camp-btn camp-btn-ghost"
          style={{ padding: '4px', marginLeft: '12px', border: 'none', color: '#94a3b8' }}
          title="Delete delay"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};
