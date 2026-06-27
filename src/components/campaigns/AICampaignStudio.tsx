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
    let meta: any = { recipientEmail: recipientEmail || 'joshikushal148@gmail.com' };

    if (urlInput.trim()) {
      setIsScraping(true);
      try {
        const scraped = await campaignEngine.scrapeUrlMetadata(urlInput.trim());
        meta = { ...scraped, recipientEmail: recipientEmail || 'joshikushal148@gmail.com' };
      } catch {
        meta = { companyName: 'Target Client', industry: 'SaaS', painPoints: 'Scaling operations', recipientEmail: recipientEmail || 'joshikushal148@gmail.com' };
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
    <div className="camp-ai-studio">
      <div className="camp-ai-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
          <Sparkles size={18} /> AI CAMPAIGN STUDIO
        </div>
        <span className="camp-ai-tag" style={{ whiteSpace: 'nowrap' }}>⚡ Groq AI</span>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
          <Globe size={15} style={{ color: '#4f46e5' }} /> Client Website URL(s)
        </label>
        <input
          type="text"
          className="camp-input"
          placeholder="e.g. https://stripe.com or https://linear.app"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={{ width: '100%', background: '#fff' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
          <FileText size={15} style={{ color: '#4f46e5' }} /> OR Client Description & Pitch
        </label>
        <textarea
          className="camp-textarea"
          placeholder="e.g. We are an AI software agency helping B2B healthcare startups automate their patient onboarding workflows..."
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
          style={{ minHeight: '110px' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isScraping || isGenerating || (!urlInput.trim() && !descInput.trim())}
        className="camp-btn camp-btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
      >
        {isScraping ? (
          <>
            <Loader2 size={18} className="crm-spin-ic" /> Scraping live metadata...
          </>
        ) : isGenerating ? (
          <>
            <Loader2 size={18} className="crm-spin-ic" /> Writing personalized copy...
          </>
        ) : (
          <>
            <Sparkles size={18} /> Generate & Auto-Fill Sequence
          </>
        )}
      </button>

      <AnimatePresence>
        {extractedMeta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534', fontSize: '0.85rem', marginBottom: '8px' }}>
              <CheckCircle2 size={16} /> Live Scraped Intelligence
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

      <div className="camp-ai-tip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
          <Lightbulb size={15} /> Pro Tip
        </div>
        When you press generate, the AI scrapes live websites, analyzes tone, and generates the entire 4-step sequence (Initial Email + delays + 3 follow-ups) directly into your workflow on the left!
      </div>
    </div>
  );
};
