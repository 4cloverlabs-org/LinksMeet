import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { campaignEngine } from './campaignEngine';

interface ReplyPopupNotificationProps {
  onOpenConversation: () => void;
}

export const ReplyPopupNotification: React.FC<ReplyPopupNotificationProps> = ({ onOpenConversation }) => {
  const [popupData, setPopupData] = useState<{ name: string; campaign: string } | null>(null);

  useEffect(() => {
    const unsub = campaignEngine.subscribe((event, data) => {
      if (event === 'new_reply' && data?.thread) {
        setPopupData({
          name: data.thread.leadName,
          campaign: data.thread.campaignName || 'Campaign Outreach',
        });
        // Auto dismiss after 8 seconds if ignored
        setTimeout(() => setPopupData(null), 8000);
      }
    });
    return () => unsub();
  }, []);

  return (
    <AnimatePresence>
      {popupData && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="camp-reply-popup"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7d3bec', fontWeight: 700, fontSize: '0.9rem' }}>
              <MessageSquare size={16} /> New Reply Received
            </div>
            <button
              onClick={() => setPopupData(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.4 }}>
            <strong style={{ color: '#0f172a' }}>{popupData.name}</strong> replied to your campaign <strong style={{ color: '#7d3bec' }}>"{popupData.campaign}"</strong>.
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => {
                setPopupData(null);
                onOpenConversation();
              }}
              className="camp-btn camp-btn-primary"
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
            >
              <span>Open Conversation</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setPopupData(null)}
              className="camp-btn camp-btn-ghost"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
