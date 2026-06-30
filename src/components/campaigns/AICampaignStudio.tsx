import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, FileText, CheckCircle2, Loader2, Lightbulb } from 'lucide-react';
import { campaignEngine, type CampaignStep } from './campaignEngine';

interface AICampaignStudioProps {
  onApplySequence: (steps: CampaignStep[]) => void;
  recipientEmail?: string;
}

export const AICampaignStudio: React.FC<AICampaignStudioProps> = ({ onApplySequence, recipientEmail }) => {
  const [urlInput, setUrlInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedMeta, setExtractedMeta] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (!urlInput.trim() && !descInput.trim()) return;

    setExtractedMeta(null);
    let meta: any = { recipientEmail: recipientEmail || 'client@company.com' };

    if (urlInput.trim()) {
      setIsScraping(true);
      try {
        const scraped = await campaignEngine.scrapeUrlMetadata(urlInput.trim());
        meta = { ...scraped, recipientEmail: recipientEmail || 'client@company.com' };
      } catch {
        meta = { companyName: 'Target Client', industry: 'SaaS', painPoints: 'Scaling operations', recipientEmail: recipientEmail || 'client@company.com' };
      }
      setIsScraping(false);
      setExtractedMeta(meta);
    }

    setIsGenerating(true);
    try {
      const sequence = await campaignEngine.generateAISequence(meta, descInput.trim());
      onApplySequence(sequence);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: '24px',
        fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} style={{ color: '#0E61F3' }} />
          </div>
          AI Link & Pitch Analysis
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          <Globe size={15} style={{ color: '#0E61F3' }} /> Website URL Analysis
        </label>
        <input
          type="text"
          placeholder="e.g. https://company.com or https://stripe.com"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={{
            width: '100%',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.88rem',
            color: '#0f172a',
            fontWeight: 500,
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
        />
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
          Scrapes live website copy, tech stack & value proposition.
        </div>
      </div>

      <div style={{ marginBottom: '22px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          <FileText size={15} style={{ color: '#0E61F3' }} /> OR Campaign Description & Pitch
        </label>
        <textarea
          placeholder="Describe your offer, target audience, and key benefits. AI will tailor subject lines and email body..."
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
          style={{
            width: '100%',
            minHeight: '110px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '0.88rem',
            color: '#0f172a',
            fontWeight: 500,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isScraping || isGenerating || (!urlInput.trim() && !descInput.trim())}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          background: isScraping || isGenerating || (!urlInput.trim() && !descInput.trim()) ? '#94a3b8' : '#0E61F3',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: isScraping || isGenerating || (!urlInput.trim() && !descInput.trim()) ? 'not-allowed' : 'pointer',
          boxShadow: (!urlInput.trim() && !descInput.trim()) ? 'none' : '0 4px 12px rgba(14, 97, 243, 0.25)',
          transition: 'all 0.15s ease'
        }}
      >
        {isScraping ? (
          <>
            <Loader2 size={16} className="crm-spin-ic" /> Analyzing live URL...
          </>
        ) : isGenerating ? (
          <>
            <Loader2 size={16} className="crm-spin-ic" /> Generating Sequence...
          </>
        ) : (
          <>
            <Sparkles size={16} /> Analyze & Auto-Fill Sequence
          </>
        )}
      </button>

      <div style={{ marginTop: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155', marginBottom: '6px', fontSize: '0.82rem' }}>
          <Lightbulb size={15} color="#0E61F3" /> How It Works
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
          AI extracts intelligence from the URL or description above and automatically writes tailored initial outreach emails and timed follow-ups into your sequence.
        </p>
      </div>

      <AnimatePresence>
        {extractedMeta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534', fontSize: '0.82rem', marginBottom: '8px' }}>
              <CheckCircle2 size={15} /> Intelligence Extracted
            </div>
            <div style={{ fontSize: '0.78rem', color: '#15803d', lineHeight: 1.5 }}>
              <div><strong>Company:</strong> {extractedMeta.companyName}</div>
              <div><strong>Industry:</strong> {extractedMeta.industry}</div>
              <div><strong>Pain Points:</strong> {extractedMeta.painPoints}</div>
              <div><strong>Tone:</strong> {extractedMeta.tone}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
