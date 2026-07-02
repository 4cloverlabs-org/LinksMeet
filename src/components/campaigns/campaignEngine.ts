import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/config';


async function callGroqAI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("You must be signed in to use AI generation.");

    const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ systemPrompt, userPrompt })
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.content;
    } else {
      const err = await res.text();
      console.warn("Backend AI Error:", err);
    }
  } catch (e) {
    console.warn("Backend AI fetch error:", e);
  }
  throw new Error("AI sequence generation failed on the backend.");
}

export type EmailStatus =
  | 'Pending'
  | 'Generating'
  | 'Queued'
  | 'Sending'
  | 'Sent'
  | 'Opened'
  | 'Clicked'
  | 'Replied'
  | 'Failed'
  | 'Skipped'
  | 'Unsubscribed'
  | 'Paused';

export type StepType = 'email' | 'delay';

export interface CampaignStep {
  id: string;
  type: StepType;
  title: string;
  subject?: string;
  body?: string;
  delayValue?: number;
  delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  status: EmailStatus;
  remainingSeconds?: number;
  totalSeconds?: number;
  waitUntil?: number;
  opens?: number;
  replies?: number;
  clicks?: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Draft' | 'Running' | 'Paused' | 'Completed';
  recipientEmail: string;
  recipientName?: string;
  steps: CampaignStep[];
  activeStepIndex?: number;
  createdAt: number;
}

export interface SentEmailLog {
  id: string;
  campaignId: string;
  campaignName: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: EmailStatus;
  opens: number;
  clicks: number;
  replied: boolean;
  deliveryStatus: 'Delivered' | 'Bounced' | 'In Transit';
  spamStatus: 'Passed' | 'Flagged';
  stage: string;
}

export interface ConversationMessage {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: string;
  isLead: boolean;
}

export interface ConversationThread {
  id: string;
  leadName: string;
  leadEmail: string;
  subject: string;
  campaignName: string;
  summary: string;
  messages: ConversationMessage[];
  unread: boolean;
}

export interface CampaignSettingsData {
  dailyLimit: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
  weekendSending: boolean;
  stopOnReply: boolean;
  pixelTracking: boolean;
  linkTracking: boolean;
  autoUnsubscribe: boolean;
  signature: string;
  directMailEngine?: 'gmail';
  gmailAccessToken?: string;
  gmailUserEmail?: string;
}

// Initial default settings
let settings: CampaignSettingsData = {
  dailyLimit: 50,
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  weekendSending: false,
  stopOnReply: true,
  pixelTracking: true,
  linkTracking: true,
  autoUnsubscribe: true,
  signature: '<p>Best regards,<br><strong>LinksMeet Team</strong></p>',
  directMailEngine: 'gmail',
  gmailAccessToken: '',
  gmailUserEmail: '',
};



const INITIAL_LOGS: SentEmailLog[] = [
  {
    id: 'log_1',
    campaignId: 'camp_1',
    campaignName: 'SaaS Founders Outbound Q3',
    recipient: 'joshikushal148@gmail.com',
    subject: '⚡ Pipeline velocity optimization — quick query',
    sentAt: '2 hours ago',
    status: 'Opened',
    opens: 3,
    clicks: 1,
    replied: false,
    deliveryStatus: 'Delivered',
    spamStatus: 'Passed',
    stage: 'Initial Email',
  },
  {
    id: 'log_2',
    campaignId: 'camp_old',
    campaignName: 'Healthcare Agency Outreach',
    recipient: 'sarah.j@medtech.org',
    subject: 'AI workflow integration for MedTech',
    sentAt: 'Yesterday',
    status: 'Replied',
    opens: 5,
    clicks: 2,
    replied: true,
    deliveryStatus: 'Delivered',
    spamStatus: 'Passed',
    stage: 'Follow-up 1',
  },
  {
    id: 'log_3',
    campaignId: 'camp_old',
    campaignName: 'Healthcare Agency Outreach',
    recipient: 'm.kane@healthpulse.co',
    subject: 'AI workflow integration for MedTech',
    sentAt: '2 days ago',
    status: 'Sent',
    opens: 0,
    clicks: 0,
    replied: false,
    deliveryStatus: 'Delivered',
    spamStatus: 'Passed',
    stage: 'Initial Email',
  },
];

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: 'th_1',
    leadName: 'sarah.j@medtech.org',
    leadEmail: 'sarah.j@medtech.org',
    subject: 'Re: ⚡ AI workflow integration for MedTech',
    campaignName: 'Healthcare Agency Outreach',
    summary: 'Prospect expressed strong interest in our API capabilities for patient data scheduling and requested enterprise volume pricing details.',
    unread: true,
    messages: [
      {
        id: 'm_1',
        sender: 'kushal@linksmeet.io',
        senderName: 'Kushal',
        content: '<p>Hello sarah.j@medtech.org,</p><p>We noticed MedTech is scaling its clinic scheduling infrastructure. 🚀 We help healthcare platforms automate patient confirmation workflows with 99.8% delivery rates. 📊</p><p>Would you be open to exploring a brief 10-minute partnership sync next Tuesday? 📅</p><p>Best regards,<br><strong>Kushal</strong></p>',
        timestamp: 'Yesterday, 10:14 AM',
        isLead: false,
      },
      {
        id: 'm_2',
        sender: 'sarah.j@medtech.org',
        senderName: 'sarah.j@medtech.org',
        content: '<p>Hello!</p><p>Actually, timing is perfect. We are actively evaluating new email infrastructure providers this quarter. 💼</p><p>Do you support full HIPAA compliant data encryption, and what does your enterprise schedule look like for 50,000 authenticated emails per month?</p><p>Best,<br>Sarah</p>',
        timestamp: 'Yesterday, 3:45 PM',
        isLead: true,
      },
    ],
  },
];

class CampaignEngine {
  private campaigns: Campaign[] = [];
  private logs: SentEmailLog[] = [];
  private threads: ConversationThread[] = [];
  private listeners: ((event: string, data?: any) => void)[] = [];

  constructor() {
    this.loadLocalState();
    this.startPolling();
  }

  private loadLocalState() {
    const savedLogs = localStorage.getItem('sm_sent_logs');
    if (savedLogs) {
      try { this.logs = JSON.parse(savedLogs); } catch { this.logs = INITIAL_LOGS; }
    } else {
      this.logs = INITIAL_LOGS;
    }

    const savedThreads = localStorage.getItem('sm_threads');
    if (savedThreads) {
      try { this.threads = JSON.parse(savedThreads); } catch { this.threads = INITIAL_THREADS; }
    } else {
      this.threads = INITIAL_THREADS;
    }

    const savedSettings = localStorage.getItem('sm_campaign_settings');
    if (savedSettings) {
      try { settings = JSON.parse(savedSettings); } catch { /* ignore */ }
    }
  }

  private saveLocalState() {
    localStorage.setItem('sm_sent_logs', JSON.stringify(this.logs));
    localStorage.setItem('sm_threads', JSON.stringify(this.threads));
  }

  private async fetchCampaigns() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;

      const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.campaigns = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          recipientEmail: d.recipient_email,
          recipientName: d.recipient_name,
          steps: d.steps,
          activeStepIndex: d.active_step_index,
          createdAt: new Date(d.created_at).getTime()
        }));
        this.notify('update');
      }
    } catch (err) {
      console.warn("Failed to fetch campaigns", err);
    }
  }

  private startPolling() {
    this.fetchCampaigns();
    setInterval(() => {
      this.fetchCampaigns();
    }, 5000); // UI poll every 5 seconds
  }

  public async sendRealEmail(recipient: string, subject: string, htmlBody: string): Promise<{ success: boolean; message: string }> {
    if (!recipient) return { success: false, message: 'No recipient specified.' };
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        console.warn("User not authenticated.");
        const msg = "⚠️ You must be signed in to send emails.";
        alert(msg);
        return { success: false, message: msg };
      }

      const res = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject || 'LinksMeet Outreach',
          htmlBody: htmlBody
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        console.log(`[LinksMeet Backend API] Sent email to ${recipient}`);
        return { success: true, message: `Dispatched via backend to ${recipient}!` };
      } else {
        const errMsg = data?.error || 'Unknown Backend API error.';
        console.warn(`❌ Backend API Error: ${errMsg}`, data);
        alert(`❌ Email Error: ${errMsg}`);
        return { success: false, message: errMsg };
      }
    } catch (err: any) {
      console.warn("Real email dispatch warning:", err);
      const netMsg = `❌ Network error sending email: ${err?.message || err}`;
      alert(netMsg);
      return { success: false, message: netMsg };
    }
  }

  public subscribe(fn: (event: string, data?: any) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify(event: string, data?: any) {
    this.listeners.forEach(fn => fn(event, data));
  }

  public logEvent(data: any) {
    const camp = this.campaigns.find(c => c.id === data.campaignId);
    const step = camp?.steps.find(s => s.id === data.stepId);
    const log: SentEmailLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      campaignId: data.campaignId,
      campaignName: camp?.name || 'Manual Campaign',
      recipient: data.recipientEmail || 'Unknown',
      subject: step?.subject || 'Manual Send',
      sentAt: 'Just now',
      status: data.status || 'Sent',
      opens: 0,
      clicks: 0,
      replied: false,
      deliveryStatus: 'Delivered',
      spamStatus: 'Passed',
      stage: step?.title || 'Manual Dispatched',
    };
    this.logs.unshift(log);
    this.saveLocalState();
    this.notify('email_sent', log);
    this.notify('update');
  }

  public getCampaigns(): Campaign[] { return JSON.parse(JSON.stringify(this.campaigns)); }
  public getLogs(): SentEmailLog[] { return [...this.logs]; }
  public getThreads(): ConversationThread[] { return [...this.threads]; }
  public getSettings(): CampaignSettingsData { return { ...settings }; }

  public updateSettings(newSettings: Partial<CampaignSettingsData>) {
    settings = { ...settings, ...newSettings };
    localStorage.setItem('sm_campaign_settings', JSON.stringify(settings));
    this.notify('settings_updated', settings);
  }

  public async saveCampaign(campaign: Campaign) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;

      const payload = {
        name: campaign.name,
        status: campaign.status,
        recipientEmail: campaign.recipientEmail,
        recipientName: campaign.recipientName,
        steps: campaign.steps,
        activeStepIndex: campaign.activeStepIndex
      };

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaign.id);
      const method = isUUID ? "PUT" : "POST";
      const url = isUUID ? `${API_BASE_URL}/api/campaigns/${campaign.id}` : `${API_BASE_URL}/api/campaigns`;

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await this.fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async deleteCampaign(id: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      // It was a local dummy campaign that never hit backend
      this.campaigns = this.campaigns.filter(c => c.id !== id);
      this.notify('update');
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;

      const res = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (res.ok) await this.fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  }

  public async startCampaign(id: string) {
    const camp = this.campaigns.find(c => c.id === id);
    if (!camp || camp.status === 'Completed') return;
    
    camp.status = 'Running';
    if (
      camp.activeStepIndex === undefined || 
      camp.activeStepIndex === -1 || 
      (camp.activeStepIndex === 0 && camp.steps[0]?.status === 'Pending')
    ) {
      camp.activeStepIndex = -1; // Ready for backend to pick up
    }
    
    await this.saveCampaign(camp);
  }

  public async pauseCampaign(id: string) {
    const camp = this.campaigns.find(c => c.id === id);
    if (!camp) return;
    
    camp.status = 'Paused';
    await this.saveCampaign(camp);
  }

  public simulateIncomingReply(senderEmail: string, senderName: string, replyBody: string, campaignName: string) {
    // If there is a running campaign for this email, pause it automatically
    const runningCamp = this.campaigns.find(c => c.recipientEmail.toLowerCase() === senderEmail.toLowerCase() && c.status === 'Running');
    if (runningCamp && settings.stopOnReply) {
      runningCamp.status = 'Paused';
      if (runningCamp.activeStepIndex !== undefined) {
        const activeStep = runningCamp.steps[runningCamp.activeStepIndex];
        if (activeStep) activeStep.status = 'Replied';
      }
    }

    const log = this.logs.find(l => l.recipient.toLowerCase() === senderEmail.toLowerCase());
    if (log) {
      log.status = 'Replied';
      log.replied = true;
    }

    // Check existing thread
    let thread = this.threads.find(t => t.leadEmail.toLowerCase() === senderEmail.toLowerCase());
    const newMsg: ConversationMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: senderEmail,
      senderName: senderName,
      content: replyBody,
      timestamp: 'Just now',
      isLead: true,
    };

    if (thread) {
      thread.messages.push(newMsg);
      thread.unread = true;
    } else {
      thread = {
        id: 'th_' + Math.random().toString(36).substring(2, 9),
        leadName: senderName,
        leadEmail: senderEmail,
        subject: log ? `Re: ${log.subject}` : 'Re: Outreach partnership',
        campaignName: campaignName || 'Outbound Q3',
        summary: `Prospect replied inquiring about further integration specifics and next steps.`,
        unread: true,
        messages: [newMsg],
      };
      this.threads.unshift(thread);
    }

    this.saveLocalState();
    this.notify('new_reply', { thread, message: newMsg });
  }

  public sendReplyMessage(threadId: string, content: string) {
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      thread.messages.push({
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        sender: 'kushal@linksmeet.io',
        senderName: 'Kushal',
        content,
        timestamp: 'Just now',
        isLead: false,
      });
      thread.unread = false;
      this.saveLocalState();
      this.notify('update');
    }
  }

  // AI Scraper with Groq API
  public async scrapeUrlMetadata(url: string) {
    try {
      const rawJson = await callGroqAI(
        "You are an AI web intelligence analyzer. Extract and infer realistic B2B sales intelligence for the provided target URL/company. Return ONLY valid JSON with keys: companyName, industry, targetAudience, painPoints, usps, tone. Do NOT wrap in markdown backticks or extra text.",
        `Analyze this URL or company name for cold outreach: ${url}`
      );
      const cleaned = rawJson.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn("Groq scrape fallback used due to error:", err);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate real-time delay
      const cleanUrl = url.replace(/https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      if (cleanUrl.includes('stripe')) {
        return {
          companyName: 'Stripe',
          industry: 'Fintech & Payment Infrastructure',
          targetAudience: 'Startups, E-commerce platforms, Enterprise developers',
          painPoints: 'Complex global payment compliance, fraud mitigation, checkout conversion drop-offs',
          usps: 'Developer-first APIs, unified financial infrastructure, 99.999% uptime',
          tone: 'Professional, highly technical, direct, authoritative',
        };
      } else if (cleanUrl.includes('linear')) {
        return {
          companyName: 'Linear',
          industry: 'Productivity & Issue Tracking SaaS',
          targetAudience: 'High-velocity product teams, engineers, designers',
          painPoints: 'Sluggish Jira boards, cluttered sprint planning, slow UI responsiveness',
          usps: 'Keyboard-first workflow, sub-50ms sync speed, pristine minimalist UX',
          tone: 'Concise, design-forward, modern, efficient',
        };
      } else {
        const parts = cleanUrl.split('.');
        const name = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Target Company';
        return {
          companyName: name,
          industry: 'B2B Software & Digital Services',
          targetAudience: 'Operations leaders, growth executives, decision makers',
          painPoints: 'Manual repetitive tasks, siloed data systems, scaling bottlenecks',
          usps: 'AI-driven automation, seamless API integration, rapid ROI',
          tone: 'Conversational, consultative, value-focused',
        };
      }
    }
  }

  // AI Sequence Generator with Groq API
  // AI Sequence Generator with Groq API
  public async generateAISequence(metadata: any, description: string) {
    const targetEmail = metadata.recipientEmail || 'joshikushal148@gmail.com';
    const [localPart = '', domainPart = ''] = targetEmail.split('@');
    let cleanName = localPart.replace(/[0-9_.-]+/g, ' ').trim();
    let nameWords = cleanName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (nameWords.length === 1 && nameWords[0].toLowerCase() === 'joshikushal') {
      nameWords = ['Joshi', 'Kushal'];
    }
    const derivedName = nameWords.join(' ') || 'Joshi Kushal';
    
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const derivedCompany = (!genericDomains.includes(domainPart.toLowerCase()) && domainPart.includes('.'))
      ? domainPart.split('.')[0].charAt(0).toUpperCase() + domainPart.split('.')[0].slice(1)
      : (metadata.companyName || 'your organization');
    const derivedSender = 'Kushal';

    const cleanText = (str: string) => {
      if (!str) return '';
      return str
        .replace(/{{FirstName}}|{{LastName}}|{{RecipientID}}|{{RecipientEmail}}/gi, derivedName)
        .replace(/{{Company}}/gi, derivedCompany)
        .replace(/{{Industry}}/gi, metadata.industry || 'B2B SaaS')
        .replace(/{{Location}}/gi, 'Global')
        .replace(/{{SenderID}}|{{SenderEmail}}|{{MyEmail}}/gi, derivedSender);
    };

    try {
      const prompt = `Write an enterprise cold email sequence (4 emails: Initial Email + 3 follow-ups) pitching our SaaS to ${derivedCompany} (${metadata.industry || 'SaaS'}).
Target Audience: ${metadata.targetAudience || 'Decision Makers'}
Pain Points: ${metadata.painPoints || 'Inefficiencies'}
Value Props: ${metadata.usps || 'Automation'}
Tone: ${metadata.tone || 'Professional'}
Additional Context: ${description || 'Outbound sales automation'}

Instructions:
1. NEVER output placeholder variables or curly braces like {{FirstName}}, {{Company}}, {{RecipientID}}, or {{SenderID}}.
2. Address the recipient directly by their real name: "${derivedName}".
3. Refer to their company directly as "${derivedCompany}".
4. Sign off directly with "${derivedSender}".
5. Make the text highly readable, structured into concise paragraphs, and professional.
6. Use professional emojis strategically (e.g. ⚡, 📊, 💼, 🤝, 📅, 🚀) without clutter.

Return ONLY a valid JSON array of objects representing the email steps. Each object must have keys:
- title (string, e.g. "Initial Email", "Follow-up 1", "Follow-up 2", "Final Follow-up")
- subject (string, compelling email subject line without brackets)
- body (string, HTML formatted paragraphs <p>...</p> without brackets)
- delayAfterDays (number, delay in days before next step, e.g. 2, 3, 4. Put 0 for the last step)
Do NOT include markdown formatting or backticks around the JSON.`;

      const rawJson = await callGroqAI(
        "You are an elite B2B sales copywriter trained on top-performing outbound sequences. Return ONLY a pure JSON array.",
        prompt
      );
      const cleaned = rawJson.replace(/```json|```/g, '').trim();
      const items = JSON.parse(cleaned);
      
      const steps: CampaignStep[] = [];
      items.forEach((item: any, idx: number) => {
        steps.push({
          id: 's_' + Math.random().toString(36).substring(2, 9),
          type: 'email',
          title: item.title || `Email ${idx + 1}`,
          subject: cleanText(item.subject || '⚡ Quick follow-up'),
          body: cleanText(item.body || `<p>Hello ${derivedName},</p><p>Checking in on our recent communication.</p><p>Best regards,<br><strong>${derivedSender}</strong></p>`),
          status: 'Pending',
        });
        if (idx < items.length - 1 && item.delayAfterDays > 0) {
          steps.push({
            id: 'd_' + Math.random().toString(36).substring(2, 9),
            type: 'delay',
            title: `Wait ${item.delayAfterDays} days`,
            delayValue: item.delayAfterDays,
            delayUnit: 'days',
            status: 'Pending',
          });
        }
      });
      if (steps.length > 0) return steps;
    } catch (err) {
      console.warn("Groq sequence generation fallback used due to error:", err);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate real-time generation delay
    }

    const industry = metadata.industry || 'your sector';
    const pain = metadata.painPoints || 'scaling operational throughput';
    const descNote = description ? ` Noticed your strategic focus on "${description.slice(0, 50)}...".` : '';

    return [
      {
        id: 's_1',
        type: 'email' as StepType,
        title: 'Initial Email',
        subject: `⚡ Autonomous sales automation for ${derivedCompany}`,
        body: `<p>Hello ${derivedName},</p><p>We have been closely following ${derivedCompany}'s momentum in ${industry}. 🚀${descNote}</p><p>Many executive leaders we partner with mention that ${pain} takes up excessive internal bandwidth.</p><p>We built our AI engine to resolve this using autonomous conversational workflows that improve inbox conversion by 45%. 📊</p><p>Would you have 10 minutes available next week for a brief walkthrough? 📅</p><p>Best regards,<br><strong>${derivedSender}</strong></p>`,
        status: 'Pending' as EmailStatus,
      },
      {
        id: 's_2',
        type: 'delay' as StepType,
        title: 'Wait 2 days',
        delayValue: 2,
        delayUnit: 'days' as const,
        status: 'Pending' as EmailStatus,
      },
      {
        id: 's_3',
        type: 'email' as StepType,
        title: 'Follow-up 1',
        subject: `💼 Benchmark metrics: Automating outreach in ${industry.split('&')[0].trim()}`,
        body: `<p>Hello ${derivedName},</p><p>Circling back on my note below. Here is a 90-second case study highlighting how organizations in ${industry} cut manual follow-up time by 70% while boosting booked demos. 📈</p><p>Please let me know if you would like me to share our executive briefing deck. 🤝</p><p>Warmly,<br><strong>${derivedSender}</strong></p>`,
        status: 'Pending' as EmailStatus,
      },
      {
        id: 's_4',
        type: 'delay' as StepType,
        title: 'Wait 3 days',
        delayValue: 3,
        delayUnit: 'days' as const,
        status: 'Pending' as EmailStatus,
      },
      {
        id: 's_5',
        type: 'email' as StepType,
        title: 'Follow-up 2',
        subject: `⚡ Quick thought on ${derivedCompany}'s Q3 roadmap`,
        body: `<p>Hello ${derivedName},</p><p>One additional thought — our platform automatically detects prospect replies and manages calendar scheduling without friction. ✨</p><p>If improving outbound sales productivity is on your strategic roadmap for this quarter, let’s connect briefly this week.</p><p>Best,<br><strong>${derivedSender}</strong></p>`,
        status: 'Pending' as EmailStatus,
      },
      {
        id: 's_6',
        type: 'delay' as StepType,
        title: 'Wait 4 days',
        delayValue: 4,
        delayUnit: 'days' as const,
        status: 'Pending' as EmailStatus,
      },
      {
        id: 's_7',
        type: 'email' as StepType,
        title: 'Follow-up 3 (Final)',
        subject: `🤝 Permission to close your file, ${derivedName}?`,
        body: `<p>Hello ${derivedName},</p><p>I do not want to clutter your inbox if the timing is not ideal. I will go ahead and pause my outreach for now. ✨</p><p>Whenever ${derivedCompany} is ready to supercharge outbound prospecting with AI, feel free to reach out anytime!</p><p>Sincerely,<br><strong>${derivedSender}</strong></p>`,
        status: 'Pending' as EmailStatus,
      },
    ];
  }

  // AI Reply Generator with Groq API
  public async generateAIReply(action: string, thread: any, currentText?: string): Promise<string> {
    try {
      const lastMsg = thread.messages[thread.messages.length - 1]?.content || '';
      const prompt = `You are a helpful sales assistant replying to a prospect named ${thread.leadName} (${thread.leadEmail}) regarding "${thread.subject}".
Prospect's last message: "${lastMsg}"
Current drafted reply: "${currentText || ''}"

Action requested: "${action}"
Instructions for action:
- 'suggest': Suggest a high-converting, polite response addressing their message.
- 'professional': Rewrite the reply in a formal, professional corporate tone.
- 'friendly': Rewrite the reply in a warm, enthusiastic, friendly tone.
- 'shorter': Make the reply concise and brief.
- 'longer': Expand the reply with more helpful details and clarity.
- 'translate': Translate the reply into Spanish (or French if already Spanish).

Return ONLY the plain email reply body text (with appropriate line breaks/paragraphs). Do not include pleasantries explaining your action.`;

      return await callGroqAI("You are an expert sales communication assistant.", prompt);
    } catch (err) {
      console.warn("Groq reply generation fallback used due to error:", err);
      if (action === 'suggest') {
        return `Hello ${thread.leadEmail},\n\nThank you for reaching out! Regarding your strategic inquiry — yes, all our enterprise tiers include rigorous SOC-2 Type II and HIPAA compliant encryption out of the box. 🔒\n\nFor enterprise volume plans, let us know if you have 10 minutes available tomorrow for a quick executive walkthrough! 📅\n\nBest regards,\nKushal`;
      } else if (action === 'professional') {
        return `Dear ${thread.leadEmail},\n\nThank you for your prompt correspondence. We are pleased to confirm complete adherence to enterprise data security and compliance frameworks. 💼\n\nPlease inform us of your availability to schedule a formal technical briefing this week. 🤝\n\nSincerely,\nKushal`;
      } else if (action === 'friendly') {
        return `Hello ${thread.leadEmail}! 👋\n\nIt is wonderful to hear from you! You bet — we have full compliance and enterprise encryption covered so your data remains 100% secure. ⚡\n\nWould you like to jump on a brief 10-minute Zoom session to see the live platform in action? 🚀\n\nWarmly,\nKushal`;
      } else if (action === 'shorter') {
        return `Hello ${thread.leadEmail},\n\nYes, we fully support enterprise encryption and custom sending limits! ⚡ Free for a 10-minute briefing tomorrow? 📅\n\nBest,\nKushal`;
      } else if (action === 'longer') {
        return `Hello ${thread.leadEmail},\n\nThank you for getting back to us so promptly. It is excellent to hear that your organization is actively evaluating scalable email infrastructure this quarter. 📊\n\nTo address your requirements directly:\n1. Security & Compliance: We maintain rigorous SOC-2 Type II certification and provide end-to-end data encryption both at rest and in transit. 🔒\n2. Dedicated Infrastructure: Our enterprise tiers include dedicated IP pools and custom SPF/DKIM alignment to guarantee 99.9% deliverability. 🚀\n\nWould you have 15 minutes available on your calendar this Thursday or Friday for a tailored walkthrough? 🤝\n\nSincerely,\nKushal`;
      } else if (action === 'translate') {
        return `Hola ${thread.leadEmail},\n\n¡Gracias por contactarnos! Con respecto a su consulta estratégica, sí, todos nuestros planes empresariales incluyen cifrado de alta seguridad. 🔒\n\n¿Tendría 10 minutos disponibles mañana para una breve sesión ejecutiva? 📅\n\nAtentamente,\nKushal`;
      }
      return currentText || '';
    }
  }
}

export const campaignEngine = new CampaignEngine();
