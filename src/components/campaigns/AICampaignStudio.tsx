import React, { useState } from 'react';
import { Sparkles, Globe, Check, Loader2 } from 'lucide-react';
import { campaignEngine, type CampaignStep } from './campaignEngine';

interface AICampaignStudioProps {
  onApplySequence: (steps: CampaignStep[]) => void;
  recipientEmail?: string;
}

export const AICampaignStudio: React.FC<AICampaignStudioProps> = ({ onApplySequence, recipientEmail }) => {
  const [activeTab, setActiveTab] = useState<'Analyze' | 'Results'>('Analyze');
  const [inputType, setInputType] = useState<'url' | 'brand'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!urlInput.trim() && !descInput.trim()) return;

    let meta: any = { recipientEmail: recipientEmail || 'client@company.com' };

    if (inputType === 'url' && urlInput.trim()) {
      setIsScraping(true);
      try {
        const scraped = await campaignEngine.scrapeUrlMetadata(urlInput.trim());
        meta = { ...scraped, recipientEmail: recipientEmail || 'client@company.com' };
      } catch {
        meta = { companyName: 'Target Client', industry: 'SaaS', painPoints: 'Scaling operations', recipientEmail: recipientEmail || 'client@company.com' };
      }
      setIsScraping(false);
    }

    setIsGenerating(true);
    try {
      const sequence = await campaignEngine.generateAISequence(meta, inputType === 'brand' ? descInput.trim() : '');
      onApplySequence(sequence);
      setActiveTab('Results');
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>AI Analyzer</h2>
        <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>BETA</span>
      </div>
      <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
        Let AI analyze your website or brand and generate the perfect email sequence.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div 
          onClick={() => setActiveTab('Analyze')}
          style={{ flex: 1, textAlign: 'center', paddingBottom: '10px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'Analyze' ? '#0E61F3' : '#64748b', borderBottom: activeTab === 'Analyze' ? '2px solid #0E61F3' : '2px solid transparent' }}
        >
          Analyze
        </div>
        <div 
          onClick={() => setActiveTab('Results')}
          style={{ flex: 1, textAlign: 'center', paddingBottom: '10px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'Results' ? '#0E61F3' : '#64748b', borderBottom: activeTab === 'Results' ? '2px solid #0E61F3' : '2px solid transparent' }}
        >
          Results
        </div>
      </div>

      {activeTab === 'Analyze' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Analyze your website or brand</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
              Enter a website URL or brand description and our AI will create a tailored follow-up sequence for you.
            </p>
          </div>

          {/* Segmented Control */}
          <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div 
              onClick={() => setInputType('url')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', background: inputType === 'url' ? '#ffffff' : 'transparent', color: inputType === 'url' ? '#0E61F3' : '#64748b', border: inputType === 'url' ? '1px solid #bfdbfe' : '1px solid transparent', boxShadow: inputType === 'url' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s ease' }}
            >
              <Globe size={14} /> Website URL
            </div>
            <div 
              onClick={() => setInputType('brand')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', background: inputType === 'brand' ? '#ffffff' : 'transparent', color: inputType === 'brand' ? '#0E61F3' : '#64748b', border: inputType === 'brand' ? '1px solid #bfdbfe' : '1px solid transparent', boxShadow: inputType === 'brand' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s ease' }}
            >
              <Sparkles size={14} /> Brand Description
            </div>
          </div>

          {/* Input Area */}
          <div style={{ marginBottom: '16px' }}>
            {inputType === 'url' ? (
              <div style={{ position: 'relative' }}>
                <Globe size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.88rem', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                />
              </div>
            ) : (
              <textarea
                placeholder="Describe your brand..."
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                style={{ width: '100%', minHeight: '80px', padding: '10px 12px', fontSize: '0.88rem', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
              />
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isScraping || isGenerating || (inputType === 'url' ? !urlInput.trim() : !descInput.trim())}
            style={{
              width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 600, background: '#0E61F3', color: '#ffffff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: (isScraping || isGenerating) ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease', marginBottom: '24px'
            }}
          >
            {isScraping ? <><Loader2 size={16} className="crm-spin-ic" /> Analyzing...</> : isGenerating ? <><Loader2 size={16} className="crm-spin-ic" /> Generating...</> : <><Sparkles size={16} /> Analyze</>}
          </button>

          {/* What AI will analyze */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>What AI will analyze</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Brand tone and messaging', 'Target audience and pain points', 'Value proposition', 'Services / Products', 'Call-to-action insights'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                  <Check size={14} color="#64748b" /> {item}
                </div>
              ))}
            </div>
          </div>

          {/* AI will generate box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1 }}>
              <Sparkles size={48} color="#0E61F3" />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', position: 'relative', zIndex: 1 }}>AI will generate:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}>
              {['Optimized email subjects', 'Personalized email content', 'Best timing recommendations', 'Follow-up strategy'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                  <Check size={14} color="#0E61F3" /> {item}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'Results' && (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
          {isGenerating ? 'AI is working on your sequence...' : 'Run an analysis to see results here.'}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          <Sparkles size={12} /> Powered by AI
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer' }}>
          Learn more
        </div>
      </div>
    </div>
  );
};

