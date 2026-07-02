const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();

// Restrict CORS to an explicit allowlist of browser origins.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / non-browser clients (no Origin header) and allowlisted origins.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '100kb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.send('LinksMeet API Server is running');
});

// Strip CR/LF to prevent email header injection; collapse to a single line.
const sanitizeHeader = (s) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim();
// Escape values that get interpolated into HTML email bodies (prevents injection).
const escapeHtml = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Initialize Supabase Service Role Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log("Backend securely connected to Supabase.");
} else {
  console.warn("WARNING: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Database calls will fail.");
}

// Verify the caller's Supabase JWT and attach the authenticated user id.
async function requireAuth(req, res, next) {
  try {
    if (!supabase) return res.status(500).json({ error: 'No db connection' });
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = data.user.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
);

// Helper to encode emails for Gmail API
const makeBody = (to, from, subject, message) => {
  const str = ["Content-Type: text/html; charset=\"UTF-8\"\n",
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "to: ", sanitizeHeader(to), "\n",
    "from: ", sanitizeHeader(from), "\n",
    "subject: ", sanitizeHeader(subject), "\n\n",
    message
  ].join('');

  return Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
};

// ----------------------------------------------------
// 1. Google OAuth Flow
// ----------------------------------------------------
app.get('/auth/google', (req, res) => {
  console.log("GET /auth/google hit with query:", req.query);
  const { uid } = req.query; // LinksMeet user ID
  if (!uid) return res.status(400).send("User ID required");

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.send'
    ],
    state: uid // pass the UID so we know who to save it to in the callback
  });
  console.log("Redirecting user to Google OAuth URL:", url);
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  console.log("OAuth Callback Hit with query:", req.query);
  const { code, state: uid } = req.query;
  if (!code || !uid) {
    console.log("Missing code or uid in callback");
    return res.status(400).send("Invalid callback");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received from Google for uid:", uid);
    
    // Save tokens securely in Supabase
    if (supabase) {
      const { error } = await supabase.from('users').update({
        google_tokens: {
          refresh_token: tokens.refresh_token || null,
          access_token: tokens.access_token,
          expiry_date: tokens.expiry_date
        }
      }).eq('id', uid);
      
      if (error) {
        console.error("Error saving tokens to Supabase:", error);
      } else {
        console.log("Successfully saved tokens to Supabase for uid:", uid);
      }
    } else {
      console.log("Supabase client not initialized, cannot save tokens.");
    }

    // Redirect back to CRM Dashboard
    console.log("Redirecting to dashboard...");
    const frontendUrl = process.env.FRONTEND_URL || (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'http://localhost:5173');
    res.redirect(`${frontendUrl}/dashboard?google_connected=true`);
  } catch (error) {
    console.error("Auth Error in callback:", error);
    if (error.message && error.message.includes('invalid_grant')) {
      const frontendUrl = process.env.FRONTEND_URL || (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'http://localhost:5173');
      return res.redirect(`${frontendUrl}/dashboard?google_error=invalid_grant`);
    }
    res.status(500).send("Authentication failed: " + error.message);
  }
});

// ----------------------------------------------------
// 2. Public Profile Endpoint
// ----------------------------------------------------
app.get('/api/public-profile/:uid', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "No db connection" });
  try {
    const { data, error } = await supabase.from('users').select('first_name, google_tokens').eq('id', req.params.uid).single();
    if (error || !data) return res.status(404).json({ error: "User not found" });
    res.json({ firstName: data.first_name, hasGoogle: !!data.google_tokens });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/gmail-token/:uid', requireAuth, async (req, res) => {
  try {
    // A user may only retrieve their OWN Gmail token, never someone else's.
    if (req.params.uid !== req.userId) return res.status(403).json({ error: "Forbidden" });
    const { data: ownerData } = await supabase.from('users').select('google_tokens, email').eq('id', req.params.uid).single();
    if (!ownerData || !ownerData.google_tokens) return res.status(404).json({ error: "Not found" });
    const tokens = ownerData.google_tokens;
    
    if (tokens.expiry_date && Date.now() > (tokens.expiry_date - 60000) && tokens.refresh_token) {
      oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        tokens.access_token = credentials.access_token;
        tokens.expiry_date = credentials.expiry_date;
        await supabase.from('users').update({ google_tokens: tokens }).eq('id', req.params.uid);
      } catch (err) {
        if (err.message && err.message.includes('invalid_grant')) {
          await supabase.from('users').update({ google_tokens: null }).eq('id', req.params.uid);
          return res.status(401).json({ error: "Gmail session expired. Please reconnect." });
        }
        throw err;
      }
    }
    res.json({ access_token: tokens.access_token, email: ownerData.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2.5 AI Generation Endpoint (Hides GROQ_API_KEY)
// ----------------------------------------------------
app.post('/api/ai/generate', requireAuth, async (req, res) => {
  const { systemPrompt, userPrompt } = req.body;
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
  }

  const models = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"];
  for (const model of models) {
    try {
      // Use dynamic import for node-fetch if global fetch is unavailable, or just use global fetch for Node 18+
      const fetchRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
        })
      });
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return res.json({ content });
      } else {
        const err = await fetchRes.text();
        console.warn(`Groq model ${model} error:`, err);
      }
    } catch (e) {
      console.warn(`Groq fetch error (${model}):`, e);
    }
  }
  res.status(500).json({ error: "Groq API calls failed on all models." });
});

// ----------------------------------------------------
// 3. Booking Endpoint (Creates GCal Event & Sends Emails)
// ----------------------------------------------------
app.post('/api/bookings', async (req, res) => {
  try {
    const { ownerUid, bookerName, bookerEmail, startTime, endTime, eventTitle, eventTypeSlug } = req.body;

    if (!supabase) {
      return res.status(500).json({ error: "Database not connected" });
    }

    // Basic input validation to reject malformed/abusive payloads.
    const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ownerUid || !bookerName || !isEmail(bookerEmail) || !startTime || !endTime || !eventTitle) {
      return res.status(400).json({ error: "Invalid booking payload" });
    }

    // 1. Get Owner Data
    const { data: ownerData, error: userError } = await supabase.from('users').select('*').eq('id', ownerUid).single();
    if (userError || !ownerData) return res.status(404).json({ error: "Owner not found" });
    
    const tokens = ownerData.google_tokens;
    let meetLink = null;
    let calendarSuccess = false;

    // 2. Try Google API if connected
    if (tokens && (tokens.refresh_token || tokens.access_token)) {
      try {
        oauth2Client.setCredentials({ 
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token 
        });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const event = {
          summary: `Meeting: ${bookerName} & ${ownerData.first_name || 'LinksMeet'}`,
          description: `Scheduled via LinksMeet for event: ${eventTitle}`,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
          attendees: [{ email: bookerEmail }, { email: ownerData.email }],
          conferenceData: {
            createRequest: {
              requestId: `sm-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" }
            }
          }
        };

        const gcalRes = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: 'all' // Native Google Calendar invite sent to the booker!
        });

        meetLink = gcalRes.data.hangoutLink || null;

        // Send Beautiful Custom Emails via Gmail API
        const ownerEmail = ownerData.email;
        const ownerName = ownerData.first_name || 'LinksMeet';
        const formattedTime = new Date(startTime).toLocaleString('en-US', { weekday: 'short', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });

        // HTML-escaped copies for safe interpolation into the email bodies.
        const eBookerName = escapeHtml(bookerName);
        const eBookerEmail = escapeHtml(bookerEmail);
        const eOwnerName = escapeHtml(ownerName);
        const eOwnerEmail = escapeHtml(ownerEmail);
        const eEventTitle = escapeHtml(eventTitle);

        // Premium Email to Booker
        const bookerHtml = `
          <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: #0E61F3; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Booking Confirmed!</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="color: #334155; font-size: 16px; margin-top: 0;">Hi <strong>${eBookerName}</strong>,</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.5;">Your meeting with <strong>${eOwnerName}</strong> has been successfully scheduled.</p>

              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px;">${eEventTitle}</h3>
                <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Date:</strong> ${formattedTime}</p>
                <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Host:</strong> ${eOwnerEmail}</p>
              </div>

              ${meetLink ? `
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${meetLink}" style="background: #0E61F3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Join Google Meet</a>
                </div>
              ` : ''}
            </div>
            <div style="background: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">Powered by <strong>LinksMeet</strong></p>
            </div>
          </div>
        `;
        const bookerRaw = makeBody(bookerEmail, ownerEmail, `Confirmed: ${eventTitle} with ${ownerName}`, bookerHtml);
        await gmail.users.messages.send({ userId: 'me', requestBody: { raw: bookerRaw } });

        // Premium Email to Owner
        const ownerHtml = `
          <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
            <div style="background: #10b981; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">New Booking Received</h1>
            </div>
            <div style="padding: 32px 24px;">
              <p style="color: #334155; font-size: 16px; margin-top: 0;">Awesome news, <strong>${eOwnerName}</strong>!</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.5;">A new lead has just scheduled a meeting with you.</p>

              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px;">${eEventTitle}</h3>
                <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Date:</strong> ${formattedTime}</p>
                <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Booker Name:</strong> ${eBookerName}</p>
                <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Booker Email:</strong> ${eBookerEmail}</p>
              </div>

              ${meetLink ? `
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${meetLink}" style="background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">View Google Meet</a>
                </div>
              ` : ''}
            </div>
            <div style="background: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">LinksMeet CRM Automations</p>
            </div>
          </div>
        `;
        const ownerRaw = makeBody(ownerEmail, ownerEmail, `New Lead: ${bookerName} booked ${eventTitle}`, ownerHtml);
        await gmail.users.messages.send({ userId: 'me', requestBody: { raw: ownerRaw } });
        
        calendarSuccess = true;
      } catch (gcalErr) {
        console.error("Google API Error:", gcalErr.message);
      }
    }

    // 3. Save Booking & Contact to Supabase (Always works using Service Role Key)
    const startDate = new Date(startTime);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const slotStr = `${months[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()} · ${startDate.toTimeString().substring(0, 5)}`;
    
    const { data: newBooking, error: insertError } = await supabase.from('bookings').insert({
      user_id: ownerUid,
      event_slug: eventTypeSlug,
      event_title: eventTitle,
      booker_name: bookerName,
      booker_email: bookerEmail,
      slot: slotStr,
      status: 'upcoming',
      meet_link: meetLink
    }).select().single();

    if (insertError) console.error("Supabase Booking Insert Error:", insertError);

    // Auto-create Contact
    const { error: contactError } = await supabase.from('contacts').insert({
      user_id: ownerUid,
      name: bookerName,
      email: bookerEmail,
      status: 'New'
    });

    if (contactError) console.error("Supabase Contact Insert Error:", contactError);

    res.json({ success: true, booking: newBooking, calendarSuccess });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// 4. Send Email Endpoint (Send Now)
// ----------------------------------------------------
async function sendEmailForUser(userId, to, subject, htmlBody) {
  const { data: ownerData, error: userError } = await supabase.from('users').select('email, google_tokens').eq('id', userId).single();
  if (userError || !ownerData || !ownerData.google_tokens) throw new Error("Gmail not connected for this account.");
  
  const tokens = ownerData.google_tokens;
  if (!tokens.access_token && !tokens.refresh_token) throw new Error("Invalid Gmail tokens.");

  oauth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
  });

  if (tokens.expiry_date && Date.now() > (tokens.expiry_date - 60000) && tokens.refresh_token) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      tokens.access_token = credentials.access_token;
      tokens.expiry_date = credentials.expiry_date;
      await supabase.from('users').update({ google_tokens: tokens }).eq('id', userId);
    } catch (err) {
      if (err.message && err.message.includes('invalid_grant')) {
        await supabase.from('users').update({ google_tokens: null }).eq('id', userId);
        throw new Error("Gmail session expired. Please reconnect.");
      }
      throw err;
    }
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const rawEmail = makeBody(to, ownerData.email, subject, htmlBody);
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw: rawEmail } });
  return res.data;
}

app.post('/api/send-email', requireAuth, async (req, res) => {
  try {
    const { to, subject, htmlBody } = req.body;
    if (!to || !subject || !htmlBody) {
      return res.status(400).json({ error: "Missing required fields (to, subject, htmlBody)" });
    }

    await sendEmailForUser(req.userId, to, subject, htmlBody);
    res.json({ success: true });
  } catch (err) {
    console.error("Send Email API Error:", err);
    res.status(500).json({ error: err.message || "Failed to send email" });
  }
});

// ----------------------------------------------------
// 5. Campaigns API
// ----------------------------------------------------
app.get('/api/campaigns', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('campaigns').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/campaigns', requireAuth, async (req, res) => {
  try {
    const campaign = req.body;
    const { data, error } = await supabase.from('campaigns').insert({
      user_id: req.userId,
      name: campaign.name,
      status: campaign.status || 'Draft',
      recipient_email: campaign.recipientEmail,
      recipient_name: campaign.recipientName || '',
      steps: campaign.steps || [],
      active_step_index: campaign.activeStepIndex || 0
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/campaigns/:id', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const { data, error } = await supabase.from('campaigns').update({
      name: updates.name,
      status: updates.status,
      recipient_email: updates.recipientEmail,
      recipient_name: updates.recipientName,
      steps: updates.steps,
      active_step_index: updates.activeStepIndex
    }).eq('id', req.params.id).eq('user_id', req.userId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/campaigns/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('campaigns').delete().eq('id', req.params.id).eq('user_id', req.userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. Campaign Logs, Threads, and Settings API
// ----------------------------------------------------

app.get('/api/logs', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('campaign_logs').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) throw error;
    // Map to frontend format
    const mapped = data.map(d => ({
      id: d.id,
      campaignId: d.campaign_id,
      campaignName: d.campaign_name,
      recipient: d.recipient,
      subject: d.subject,
      sentAt: d.sent_at,
      status: d.status,
      opens: d.opens,
      clicks: d.clicks,
      replied: d.replied,
      deliveryStatus: d.delivery_status,
      spamStatus: d.spam_status,
      stage: d.stage
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', requireAuth, async (req, res) => {
  try {
    const log = req.body;
    const { data, error } = await supabase.from('campaign_logs').insert({
      user_id: req.userId,
      campaign_id: log.campaignId,
      campaign_name: log.campaignName,
      recipient: log.recipient,
      subject: log.subject,
      sent_at: log.sentAt,
      status: log.status,
      opens: log.opens || 0,
      clicks: log.clicks || 0,
      replied: log.replied || false,
      delivery_status: log.deliveryStatus,
      spam_status: log.spamStatus,
      stage: log.stage
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/threads', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('campaign_threads').select('*').eq('user_id', req.userId).order('updated_at', { ascending: false });
    if (error) throw error;
    const mapped = data.map(d => ({
      id: d.id,
      leadName: d.lead_name,
      leadEmail: d.lead_email,
      subject: d.subject,
      campaignName: d.campaign_name,
      summary: d.summary,
      messages: d.messages || [],
      unread: d.unread
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/threads', requireAuth, async (req, res) => {
  try {
    const thread = req.body;
    const { data, error } = await supabase.from('campaign_threads').upsert({
      id: thread.id,
      user_id: req.userId,
      lead_name: thread.leadName,
      lead_email: thread.leadEmail,
      subject: thread.subject,
      campaign_name: thread.campaignName,
      summary: thread.summary,
      messages: thread.messages,
      unread: thread.unread,
      updated_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('campaign_settings').select('*').eq('user_id', req.userId).single();
    if (error && error.code !== 'PGRST116') throw error; 
    res.json(data ? data.settings : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', requireAuth, async (req, res) => {
  try {
    const settings = req.body;
    const { data, error } = await supabase.from('campaign_settings').upsert({
      user_id: req.userId,
      settings: settings
    }).select().single();
    if (error) throw error;
    res.json(data.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. Background Campaign Engine
// ----------------------------------------------------
if (supabase) {
  setInterval(async () => {
    try {
      const { data: campaigns, error } = await supabase.from('campaigns').select('*').eq('status', 'Running');
      if (error || !campaigns) return;

      for (let camp of campaigns) {
        if (!camp.steps || camp.steps.length === 0) continue;
        
        let steps = [...camp.steps];
        let idx = camp.active_step_index !== undefined && camp.active_step_index !== null ? camp.active_step_index : 0;
        if (idx === -1) idx = 0;
        
        if (idx >= steps.length) {
          await supabase.from('campaigns').update({ status: 'Completed', steps }).eq('id', camp.id);
          continue;
        }

        const step = steps[idx];
        const now = Date.now();

        if (step.type === 'delay') {
          if (step.status !== 'Sent') {
            if (!step.waitUntil) {
              const u = step.delayUnit || 'minutes';
              const val = step.delayValue || 1;
              let multiplier = 60;
              if (u === 'hours') multiplier = 3600;
              else if (u === 'days') multiplier = 86400;
              else if (u === 'weeks') multiplier = 604800;
              
              step.waitUntil = now + (val * multiplier * 1000);
              step.status = 'Pending';
              await supabase.from('campaigns').update({ steps }).eq('id', camp.id);
            } else if (now >= step.waitUntil) {
              step.status = 'Sent';
              await supabase.from('campaigns').update({ active_step_index: idx + 1, steps }).eq('id', camp.id);
            }
          }
        } else if (step.type === 'email') {
          if (step.status === 'Pending' || step.status === 'Draft' || !step.status) {
            step.status = 'Sending';
            await supabase.from('campaigns').update({ steps }).eq('id', camp.id);

            try {
              await sendEmailForUser(camp.user_id, camp.recipient_email, step.subject || 'LinksMeet Outreach', step.body || '');
              step.status = 'Sent';
              await supabase.from('campaigns').update({ active_step_index: idx + 1, steps }).eq('id', camp.id);

              await supabase.from('campaign_logs').insert({
                user_id: camp.user_id,
                campaign_id: camp.id,
                campaign_name: camp.name,
                recipient: camp.recipient_email,
                subject: step.subject || 'LinksMeet Outreach',
                sent_at: 'Just now',
                status: 'Sent',
                delivery_status: 'Delivered',
                spam_status: 'Passed',
                stage: step.title || 'Email'
              });
            } catch (err) {
              console.error(`Failed to send email for campaign ${camp.id}:`, err);
              step.status = 'Failed';
              await supabase.from('campaigns').update({ status: 'Paused', steps }).eq('id', camp.id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Campaign Engine Error:", err);
    }
  }, 10000); // Check every 10 seconds
  console.log("Background Campaign Engine started...");
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
