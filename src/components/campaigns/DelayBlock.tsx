import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, ArrowDown } from 'lucide-react';
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
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div style={{ color: '#cbd5e1', margin: '2px 0' }}>
        <ArrowDown size={18} />
      </div>

      <div className="camp-delay-block">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={16} style={{ color: 'var(--camp-accent)' }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--camp-text)' }}>Wait</span>
          <input
            type="number"
            min={1}
            max={365}
            value={step.delayValue || 1}
            onChange={(e) => onUpdate({ ...step, delayValue: Math.max(1, parseInt(e.target.value) || 1) })}
            disabled={isWaiting}
            style={{
              width: '56px',
              padding: '4px 8px',
              border: '1px solid var(--camp-border)',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          />
          <select
            value={step.delayUnit || 'days'}
            onChange={(e) => onUpdate({ ...step, delayUnit: e.target.value as any })}
            disabled={isWaiting}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--camp-border)',
              borderRadius: '6px',
              background: '#fff',
              fontWeight: 500,
            }}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>

        {isWaiting && (
          <div style={{ marginLeft: '16px' }}>
            <span className="camp-countdown-pill">
              <span className="camp-pulse-dot" style={{ background: '#38bdf8' }} />
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

      <div style={{ color: '#cbd5e1', margin: '2px 0' }}>
        <ArrowDown size={18} />
      </div>
    </motion.div>
  );
};
