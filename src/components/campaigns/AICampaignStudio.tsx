// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Check, Loader2 } from 'lucide-react';
import { campaignEngine, type CampaignStep } from './campaignEngine';

interface AICampaignStudioProps {
  onApplySequence: (steps: CampaignStep[]) => void;
  recipientEmail?: string;
  initPrompt?: string;
  autoStart?: boolean;
  compact?: boolean;
}

export const AICampaignStudio: React.FC<AICampaignStudioProps> = ({ onApplySequence, recipientEmail, initPrompt, autoStart, compact }) => {
  const [activeTab, setActiveTab] = useState<'Analyze' | 'Results'>('Analyze');
  const [inputType, setInputType] = useState<'url' | 'brand'>(initPrompt ? 'brand' : 'url');
  const [urlInput, setUrlInput] = useState('');
  const [descInput, setDescInput] = useState(initPrompt || '');
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scrapedMetadata, setScrapedMetadata] = useState<any>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (initPrompt) {
      setDescInput(initPrompt);
      setInputType('brand');
    }
  }, [initPrompt]);

  useEffect(() => {
    if (autoStart && initPrompt) {
      handleGenerate(initPrompt);
    }
  }, [autoStart, initPrompt]);

  const handleGenerate = async (forcePrompt?: string) => {
    const prompt = forcePrompt || urlInput.trim() || descInput.trim();
    if (!prompt) return;

    let meta: any = { recipientEmail: recipientEmail || 'client@company.com' };

    if (inputType === 'url' && urlInput.trim() && !forcePrompt) {
      setIsScraping(true);
      try {
        const scraped = await campaignEngine.scrapeUrlMetadata(urlInput.trim());
        setScrapedMetadata(scraped);
        meta = { ...scraped, recipientEmail: recipientEmail || 'client@company.com' };
      } catch (err: any) {
        setIsScraping(false);
        alert('Could not scrape the target URL. Please ensure the URL is correct or try switching to manual description.');
        return;
      }
      setIsScraping(false);
    }

    setIsGenerating(true);
    try {
      const promptToUse = forcePrompt || (inputType === 'brand' ? descInput.trim() : '');
      const sequence = await campaignEngine.generateAISequence(meta, promptToUse);
      onApplySequence(sequence);
      setHasGenerated(true);
      setActiveTab('Results');
    } catch (err: any) {
      alert(`Error generating sequence: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (autoStart && isGenerating) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: compact ? '0' : '16px',
        padding: compact ? '40px 20px' : '40px',
        border: compact ? 'none' : '1px solid #e2e8f0',
        boxShadow: compact ? 'none' : '0 4px 20px rgba(0,0,0,0.02)',
        fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <Loader2 size={32} color="#7d3bec" className="crm-spin" />
          <Sparkles size={16} color="#7d3bec" style={{ position: 'absolute', top: -5, right: -10 }} />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' }}>Generating AI Campaign...</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Using your brand context to craft the perfect follow-ups.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: compact ? '0' : '16px',
        padding: compact ? '0' : '24px',
        border: compact ? 'none' : '1px solid #e2e8f0',
        boxShadow: compact ? 'none' : '0 4px 20px rgba(0,0,0,0.02)',
        fontFamily: "'Geist', 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#7d3bec" />
              AI Analyzer
              <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Beta</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Let AI analyze your website or brand and generate the perfect email sequence.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!compact && (
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('Analyze')}
            style={{ padding: '8px 0', background: 'none', border: 'none', borderBottom: activeTab === 'Analyze' ? '2px solid #7d3bec' : '2px solid transparent', color: activeTab === 'Analyze' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveTab('Results')}
            style={{ padding: '8px 0', background: 'none', border: 'none', borderBottom: activeTab === 'Results' ? '2px solid #7d3bec' : '2px solid transparent', color: activeTab === 'Results' ? '#7d3bec' : '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Results
          </button>
        </div>
      )}

      {activeTab === 'Analyze' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? '0' : '32px' }}>
          <div style={{ flex: '1 1 300px' }}>
            {!compact && <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>Analyze your website or brand</h3>}
            {!compact && <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0' }}>Enter a website URL or brand description and our AI will create a tailored follow-up sequence for you.</p>}

            {/* Segmented Control */}
            <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div 
                onClick={() => setInputType('url')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', background: inputType === 'url' ? '#ffffff' : 'transparent', color: inputType === 'url' ? '#7d3bec' : '#64748b', border: inputType === 'url' ? '1px solid #bfdbfe' : '1px solid transparent', boxShadow: inputType === 'url' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s ease' }}
              >
                <Globe size={14} /> Website URL
              </div>
              <div 
                onClick={() => setInputType('brand')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderRadius: '6px', background: inputType === 'brand' ? '#ffffff' : 'transparent', color: inputType === 'brand' ? '#7d3bec' : '#64748b', border: inputType === 'brand' ? '1px solid #bfdbfe' : '1px solid transparent', boxShadow: inputType === 'brand' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s ease' }}
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
              onClick={() => handleGenerate()}
              disabled={isScraping || isGenerating || (inputType === 'url' ? !urlInput.trim() : !descInput.trim())}
              style={{
                width: '100%', padding: '10px', fontSize: '0.88rem', fontWeight: 600, background: '#7d3bec', color: '#ffffff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: (isScraping || isGenerating) ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease', marginBottom: '24px'
              }}
            >
              {isScraping ? <><Loader2 size={16} className="crm-spin-ic" /> Analyzing...</> : isGenerating ? <><Loader2 size={16} className="crm-spin-ic" /> Generating...</> : <><Sparkles size={16} /> Analyze</>}
            </button>
          </div>

          {/* Info panel */}
          {!compact && (
            <div style={{ flex: '1 1 260px', minWidth: '260px', background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: '0 0 12px 0' }}>What AI will analyze</h4>
              <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', color: '#64748b', fontSize: '0.8rem', lineHeight: '1.6' }}>
                <li>Brand tone and messaging</li>
                <li>Target audience and pain points</li>
                <li>Value proposition</li>
                <li>Services / Products</li>
                <li>Call-to-action insights</li>
              </ul>
              
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: '0 0 12px 0' }}>AI will generate:</h4>
              <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#64748b', fontSize: '0.8rem', lineHeight: '1.6' }}>
                <li>Optimized email subjects</li>
                <li>Personalized email content</li>
                <li>Best timing recommendations</li>
                <li>Follow-up strategy</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Results' && (
        <div style={{ padding: '24px 0', color: '#334155', fontSize: '0.88rem' }}>
          {isGenerating ? (
            <div style={{ textAlign: 'center', color: '#64748b' }}>AI is working on your sequence...</div>
          ) : scrapedMetadata ? (
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#0f172a' }}>Website Analysis Success</h4>
              <div style={{ marginBottom: '8px' }}><strong>Company:</strong> {scrapedMetadata.companyOverview}</div>
              <div style={{ marginBottom: '8px' }}><strong>Industry:</strong> {scrapedMetadata.industry}</div>
              <div style={{ marginBottom: '8px' }}><strong>Value Proposition:</strong> {scrapedMetadata.valueProposition}</div>
              <div style={{ marginBottom: '16px' }}><strong>Target Audience:</strong> {scrapedMetadata.targetAudience}</div>
              <div style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Check size={14} /> Campaign steps generated & applied to builder!
              </div>

              {scrapedMetadata._rawScrapedText && (
                <details style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#334155', outline: 'none', userSelect: 'none' }}>View Raw Scraped Data</summary>
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', overflowY: 'auto', maxHeight: '150px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {scrapedMetadata._rawScrapedText}
                  </div>
                </details>
              )}
            </div>
          ) : hasGenerated ? (
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', marginBottom: '12px' }}>
                <Check size={24} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#0f172a' }}>Sequence Generated!</h4>
              <p style={{ margin: 0, color: '#64748b' }}>
                Your custom campaign steps have been successfully created and applied to the builder.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>Run an analysis to see results here.</div>
          )}
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

