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
    
    let activeUserId = data.user.id;
    const workspaceId = req.headers['x-workspace-id'];
    
    if (workspaceId && workspaceId !== data.user.id) {
      const { data: tm } = await supabase.from('team_members')
        .select('id')
        .eq('user_id', workspaceId)
        .eq('email', data.user.email)
        .eq('status', 'Active')
        .single();
        
      if (tm) {
        activeUserId = workspaceId;
      } else {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this workspace.' });
      }
    }
    
    req.userId = activeUserId;
    req.realUserId = data.user.id;
    req.userEmail = data.user.email;
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
const makeBody = (to, from, subject, message, replyTo = null) => {
  const cleanSubject = sanitizeHeader(subject);
  // Encode subject correctly for email headers to support emojis/special chars
  const encodedSubject = `=?utf-8?B?${Buffer.from(cleanSubject).toString('base64')}?=`;

  const headers = [
    "Content-Type: text/html; charset=\"UTF-8\"\n",
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 8bit\n",
    "to: ", sanitizeHeader(to), "\n",
    "from: ", sanitizeHeader(from), "\n",
  ];
  if (replyTo) {
    headers.push("reply-to: ", sanitizeHeader(replyTo), "\n");
  }
  headers.push("subject: ", encodedSubject, "\n\n", message);
  
  const str = headers.join('');

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

// ----------------------------------------------------------------------
// User Profile & Onboarding
// ----------------------------------------------------------------------

app.get('/api/user/profile', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name, business_name, onboarding_completed, username, bio, website_url, brand_description, profile_picture')
      .eq('id', req.userId)
      .single();

    if (error) {
      console.error("Fetch profile error:", error);
      if (error.code === 'PGRST116' || !data) {
        const defaultProfile = { onboarding_completed: false };
        return res.json({ ...defaultProfile, user: defaultProfile });
      }
      return res.status(500).json({ error: error.message });
    }
    const profile = data || { onboarding_completed: false };
    res.json({ ...profile, user: profile });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/onboarding', requireAuth, async (req, res) => {
  try {
    const { first_name, username, bio, website_url, brand_description, profile_picture } = req.body;
    
    // Check if username is taken by someone else
    if (username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', req.userId)
        .single();
        
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken.' });
      }
    }

    const updates = {
      onboarding_completed: true
    };
    
    if (first_name !== undefined) updates.first_name = first_name;
    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (website_url !== undefined) updates.website_url = website_url;
    if (brand_description !== undefined) updates.brand_description = brand_description;
    if (profile_picture !== undefined) updates.profile_picture = profile_picture;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      console.error("Onboarding update error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, user: data });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/preferences', requireAuth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // First, fetch existing preferences
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', req.userId)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error("Fetch preferences error:", fetchErr);
      // If the column doesn't exist yet, this will error. We should gracefully handle it.
      if (fetchErr.message.includes('Could not find the column')) {
        return res.status(400).json({ error: 'Database column missing. Please run the SQL migration to add the preferences column.' });
      }
      return res.status(500).json({ error: fetchErr.message });
    }

    const currentPrefs = user?.preferences || {};
    const newPrefs = { ...currentPrefs, ...preferences };

    const { data, error } = await supabase
      .from('users')
      .update({ preferences: newPrefs })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      console.error("Update preferences error:", error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, user: data });
  } catch (err) {
    console.error("Preferences error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------------------------------------------------------
// 1b. Real OAuth Flows (Zoom, Slack, Stripe, Salesforce, HubSpot)
// ----------------------------------------------------
const OAUTH_PROVIDERS = {
  zoom: {
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
  },
  stripe: {
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    clientId: process.env.STRIPE_CLIENT_ID,
    clientSecret: process.env.STRIPE_CLIENT_SECRET,
  },
  salesforce: {
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
  }
};

app.get('/auth/:provider', (req, res) => {
  const { provider } = req.params;
  const { uid } = req.query;
  
  if (provider === 'google' || provider === 'mock') return; // Handled separately
  
  const config = OAUTH_PROVIDERS[provider];
  if (!config) {
    return res.status(400).send("Unsupported provider: " + provider);
  }
  
  const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:3001'}/auth/${provider}/callback`;
  
  // Generate Standard OAuth 2.0 URL
  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.append('response_type', 'code');
  
  // NOTE: If process.env.[PROVIDER]_CLIENT_ID is missing, this will pass an empty string
  // which will correctly trigger an "Invalid Client ID" error on the provider's actual website.
  authUrl.searchParams.append('client_id', config.clientId || '');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', uid || '');
  
  res.redirect(authUrl.toString());
});

app.get('/auth/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const { code, state: uid, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'http://localhost:5173');
  
  if (error || !code) {
    return res.redirect(`${frontendUrl}/dashboard?error=auth_failed`);
  }
  
  // In a 100% finished backend, you would exchange 'code' for an access token here
  // using config.tokenUrl and config.clientSecret.
  
  // Once tokens are acquired and saved to the database, redirect to the frontend:
  res.redirect(`${frontendUrl}/dashboard?connected_provider=${provider}`);
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

  const models = ["openai/gpt-oss-120b"];
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
// Workflows Endpoints
// ----------------------------------------------------
app.get('/api/workflows', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('workflows').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workflows', requireAuth, async (req, res) => {
  try {
    const { template_name, trigger_event, delay_ms, action_type, action_payload, is_active } = req.body;
    const { data, error } = await supabase.from('workflows').insert({
      user_id: req.userId,
      template_name,
      trigger_event,
      delay_ms,
      action_type,
      action_payload,
      is_active: is_active !== undefined ? is_active : true
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workflows/:id', requireAuth, async (req, res) => {
  try {
    const { template_name, trigger_event, delay_ms, action_type, action_payload, is_active } = req.body;
    const updatePayload = {};
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (template_name !== undefined) updatePayload.template_name = template_name;
    if (trigger_event !== undefined) updatePayload.trigger_event = trigger_event;
    if (delay_ms !== undefined) updatePayload.delay_ms = delay_ms;
    if (action_type !== undefined) updatePayload.action_type = action_type;
    if (action_payload !== undefined) updatePayload.action_payload = action_payload;

    const { data, error } = await supabase.from('workflows').update(updatePayload).eq('id', req.params.id).eq('user_id', req.userId).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. Booking Endpoint (Creates GCal Event & Sends Emails)
// ----------------------------------------------------
app.post('/api/bookings', async (req, res) => {
  try {
    const { ownerUid, bookerName, bookerEmail, bookerPhone, bookerNotes, startTime, endTime, eventTitle, eventTypeSlug, replyToEmail } = req.body;

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
    
    // 1.5 Fetch Team Members
    const { data: teamMembers } = await supabase.from('team_members').select('*').eq('user_id', ownerUid).eq('status', 'Active');
    let selectedMember = null;
    if (teamMembers && teamMembers.length > 0) {
      selectedMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    }

    const tokens = ownerData.google_tokens;
    let meetLink = null;
    let calendarSuccess = false;
    let gmailClient = null;

    // 2. Try Google API if connected
    if (tokens && (tokens.refresh_token || tokens.access_token)) {
      try {
        oauth2Client.setCredentials({ 
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token 
        });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });

        const event = {
          summary: `Meeting: ${bookerName} & ${ownerData.first_name || 'LinksMeet'}`,
          description: `Scheduled via LinksMeet for event: ${eventTitle}`,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
          attendees: [
            { email: bookerEmail },
            { email: ownerData.email },
            ...(selectedMember ? [{ email: selectedMember.email }] : [])
          ],
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
        const bookerRaw = makeBody(bookerEmail, ownerEmail, `Confirmed: ${eventTitle} with ${ownerName}`, bookerHtml, replyToEmail);
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
        
        if (selectedMember) {
          const tmHtml = ownerHtml.replace(eOwnerName, escapeHtml(selectedMember.name));
          const tmRaw = makeBody(selectedMember.email, ownerEmail, `New Lead: ${bookerName} booked ${eventTitle}`, tmHtml);
          await gmail.users.messages.send({ userId: 'me', requestBody: { raw: tmRaw } });
        }
        
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
      phone: bookerPhone || '',
      company: bookerNotes || '',
      source: `Booking: ${eventTitle}`,
      status: 'New'
    });

    if (contactError) console.error("Supabase Contact Insert Error:", contactError);

    // Workflows are now handled perfectly by the real-time background engine.

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
// 4.5 Team Management API
// ----------------------------------------------------
app.post('/api/team/send-invite', requireAuth, async (req, res) => {
  try {
    const { email, role, teamMemberId, ownerName } = req.body;
    
    const frontendUrl = process.env.FRONTEND_URL || (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : 'http://localhost:5173');
    const acceptLink = `${frontendUrl}/accept-invite?id=${teamMemberId}&action=accept`;
    const declineLink = `${frontendUrl}/accept-invite?id=${teamMemberId}&action=decline`;
    
    const subject = `You've been invited to join ${ownerName}'s team on LinksMeet`;
    const htmlBody = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: #0E61F3; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">Team Invitation</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hi,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;"><strong>${escapeHtml(ownerName)}</strong> has invited you to join their team on LinksMeet as a <strong>${escapeHtml(role)}</strong>.</p>
          
          <div style="text-align: center; margin-top: 32px; margin-bottom: 16px; display: flex; justify-content: center; gap: 16px;">
            <a href="${acceptLink}" style="background: #0E61F3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Accept Invitation</a>
            <a href="${declineLink}" style="background: #ffffff; color: #475569; border: 1px solid #cbd5e1; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Decline</a>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">Powered by <strong>LinksMeet</strong></p>
        </div>
      </div>
    `;
    
    await sendEmailForUser(req.userId, email, subject, htmlBody);
    res.json({ success: true });
  } catch (error) {
    console.error("Invite Email Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/team/accept-invite', async (req, res) => {
  try {
    const { id, action } = req.body;
    if (!id) return res.status(400).json({ error: "Missing ID" });
    
    if (!supabase) return res.status(500).json({ error: "Database not connected" });
    
    const newStatus = action === 'decline' ? 'Declined' : 'Active';
    const { data, error } = await supabase.from('team_members').update({ status: newStatus }).eq('id', id).select().single();
    if (error) throw error;
    
    // Check if the user already has an account
    let isExistingUser = false;
    if (data && data.email) {
      const { data: userRow } = await supabase.from('users').select('id').eq('email', data.email).single();
      if (userRow) isExistingUser = true;
    }
    
    res.json({ success: true, member: data, isExistingUser });
  } catch (error) {
    console.error("Accept Invite Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// 5. Campaigns API
// ----------------------------------------------------
app.get('/api/team/workspaces', requireAuth, async (req, res) => {
  try {
    const { data: teamData, error: teamErr } = await supabase.from('team_members')
      .select('user_id, role, users!team_members_user_id_fkey(first_name)')
      .eq('email', req.userEmail)
      .eq('status', 'Active');
      
    if (teamErr) throw teamErr;
    
    // We want the owner's first name, not the invitee's first name. 
    // Wait, users!team_members_user_id_fkey joins on user_id, which is the owner.
    res.json({ workspaces: teamData || [] });
  } catch (error) {
    console.error("Fetch Workspaces Error:", error);
    res.status(500).json({ error: error.message });
  }
});

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
      active_step_index: campaign.activeStepIndex || 0,
      next_run_at: campaign.nextRunAt !== undefined ? campaign.nextRunAt : null
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
    let { data, error } = await supabase.from('campaigns').update({
      name: updates.name,
      status: updates.status,
      recipient_email: updates.recipientEmail,
      recipient_name: updates.recipientName,
      steps: updates.steps,
      active_step_index: updates.activeStepIndex,
      next_run_at: updates.nextRunAt !== undefined ? updates.nextRunAt : undefined
    }).eq('id', req.params.id).eq('user_id', req.userId).select().single();
    
    if (error && error.code === 'PGRST116') {
      // Row not found, create it with the client-provided UUID
      const insertRes = await supabase.from('campaigns').insert({
        id: req.params.id,
        user_id: req.userId,
        name: updates.name,
        status: updates.status || 'Draft',
        recipient_email: updates.recipientEmail || '',
        recipient_name: updates.recipientName || '',
        steps: updates.steps || [],
        active_step_index: updates.activeStepIndex || 0,
        next_run_at: updates.nextRunAt !== undefined ? updates.nextRunAt : null
      }).select().single();
      data = insertRes.data;
      error = insertRes.error;
    }

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
    const payload = {
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
    };
    
    if (log.id) {
      payload.id = log.id;
    }

    const { data, error } = await supabase.from('campaign_logs').upsert(payload).select().single();
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
      const nowIso = new Date().toISOString();
      // Only fetch 50 campaigns that are running and actually due for processing
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'Running')
        .or(`next_run_at.is.null,next_run_at.lte.${nowIso}`)
        .limit(50);
        
      if (error || !campaigns) return;

      const promises = campaigns.map(async (camp) => {
        if (!camp.steps || camp.steps.length === 0) return;
        
        let steps = [...camp.steps];
        let idx = camp.active_step_index !== undefined && camp.active_step_index !== null ? camp.active_step_index : 0;
        if (idx === -1) idx = 0;
        
        if (idx >= steps.length) {
          await supabase.from('campaigns').update({ status: 'Completed', steps, next_run_at: null }).eq('id', camp.id);
          return;
        }

        const step = steps[idx];
        const now = Date.now();

        if (!step) {
          await supabase.from('campaigns').update({ active_step_index: idx + 1 }).eq('id', camp.id);
          return;
        }

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
              
              // Set next_run_at in database so the server completely ignores this campaign until that exact future date
              const targetDate = new Date(step.waitUntil).toISOString();
              await supabase.from('campaigns').update({ steps, next_run_at: targetDate }).eq('id', camp.id);
            } else if (now >= step.waitUntil) {
              step.status = 'Sent';
              // Delay is over, reset next_run_at to null so the next step processes immediately
              await supabase.from('campaigns').update({ active_step_index: idx + 1, steps, next_run_at: null }).eq('id', camp.id);
            }
          }
        } else if (step.type === 'email') {
          if (step.status === 'Pending' || step.status === 'Draft' || !step.status) {
            step.status = 'Sending';
            await supabase.from('campaigns').update({ steps }).eq('id', camp.id);

            try {
              await sendEmailForUser(camp.user_id, camp.recipient_email, step.subject || 'LinksMeet Outreach', step.body || '');
              step.status = 'Sent';
              
              await Promise.all([
                supabase.from('campaigns').update({ active_step_index: idx + 1, steps, next_run_at: null }).eq('id', camp.id),
                supabase.from('campaign_logs').insert({
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
                })
              ]);
            } catch (err) {
              console.error(`Failed to send email for campaign ${camp.id}:`, err);
              step.status = 'Failed';
              await supabase.from('campaigns').update({ status: 'Paused', steps, next_run_at: null }).eq('id', camp.id);
            }
          }
        }
      });
      
      await Promise.allSettled(promises);
    } catch (err) {
      console.error("Campaign Engine Error:", err);
    }
  }, 2000); // Check every 2 seconds for near-instant email sending
  console.log("Background Campaign Engine started...");
}

// ----------------------------------------------------
// Perfect Background Workflow Engine
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      // 1. Fetch active workflows
      const { data: activeWorkflows } = await supabase.from('workflows').select('*').eq('is_active', true);
      if (!activeWorkflows || activeWorkflows.length === 0) return;

      // 2. Fetch upcoming and recent bookings (start_time past 7 days to future)
      const nowMs = Date.now();
      const minDate = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, event_types(*), users(*)')
        .in('status', ['New', 'Rescheduled'])
        .gte('start_time', minDate);
      
      if (!bookings || bookings.length === 0) return;

      for (const booking of bookings) {
        const executedWfs = booking.executed_workflows || [];
        const eventTitle = booking.event_types?.title || 'Event';
        const eventTypeSlug = booking.event_types?.slug || '';
        const ownerData = booking.users || {};
        
        for (const wf of activeWorkflows) {
          // Must belong to same user
          if (wf.user_id !== booking.user_id && wf.user_id !== ownerData.id) continue;
          // Must not have already executed
          if (executedWfs.includes(wf.id)) continue;
          
          // Must match event type if filter is applied
          if (wf.action_payload?.applyToAll === false) {
             const targetSlugs = wf.action_payload?.targetEventTypes || (wf.action_payload?.targetEventType ? [wf.action_payload.targetEventType] : []);
             if (targetSlugs.length > 0 && !targetSlugs.includes(eventTypeSlug) && !targetSlugs.includes(eventTitle)) {
               continue;
             }
          }

          // Calculate fire time
          let fireTimeMs = null;
          if (wf.trigger_event === 'event_starts_before') {
            fireTimeMs = new Date(booking.start_time).getTime() - wf.delay_ms;
          } else if (wf.trigger_event === 'event_ends_after') {
            fireTimeMs = new Date(booking.end_time).getTime() + wf.delay_ms;
          } else if (wf.trigger_event === 'booking_created') {
            fireTimeMs = new Date(booking.created_at).getTime() + wf.delay_ms;
          }

          // If it's time to fire (or past due within reason, but we already filter by minDate)
          if (fireTimeMs && nowMs >= fireTimeMs) {
            console.log(`[WORKFLOW ENGINE] Firing workflow '${wf.template_name}' for booking ${booking.id}`);
            
            const eventDateObj = new Date(booking.start_time);
            const eventDateFull = eventDateObj.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
            const eventDateShort = eventDateObj.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
            
            let subject = wf.action_payload?.subject || `Workflow: ${wf.template_name}`;
            let bodyTxt = wf.action_payload?.body || `Hello,\n\nThis is a notification for ${eventTitle}.`;
            
            subject = subject.replace(/\{EVENT_NAME\}/g, eventTitle).replace(/\{ATTENDEE\}/g, booking.name).replace(/\{ORGANIZER\}/g, ownerData.first_name || 'Organizer').replace(/\{EVENT_DATE_ddd, MMM D, YYYY h:mma\}/g, eventDateFull).replace(/\{EVENT_DATE_ddd, h:mma\}/g, eventDateShort);
            bodyTxt = bodyTxt.replace(/\{EVENT_NAME\}/g, eventTitle).replace(/\{ATTENDEE\}/g, booking.name).replace(/\{ORGANIZER\}/g, ownerData.first_name || 'Organizer').replace(/\{EVENT_DATE_ddd, MMM D, YYYY h:mma\}/g, eventDateFull).replace(/\{EVENT_DATE_ddd, h:mma\}/g, eventDateShort);
            
            if (wf.action_type === 'email') {
               const customHtml = `<div style="font-family: sans-serif; padding: 20px; white-space: pre-wrap;">${bodyTxt}</div>`;
               try {
                 // Try to send email
                 await sendEmailForUser(wf.user_id, booking.email, subject, customHtml);
                 
                 // Mark as executed
                 const newExecuted = [...executedWfs, wf.id];
                 await supabase.from('bookings').update({ executed_workflows: newExecuted }).eq('id', booking.id);
                 await supabase.from('workflows').update({ runs: wf.runs + 1 }).eq('id', wf.id);
               } catch (e) {
                 console.error(`Failed to send email for workflow ${wf.id}:`, e.message);
                 // We don't mark as executed if it failed due to disconnect, we can retry later or it will just fail again
               }
            } else {
               // non-email flows just mark as executed
               const newExecuted = [...executedWfs, wf.id];
               await supabase.from('bookings').update({ executed_workflows: newExecuted }).eq('id', booking.id);
               await supabase.from('workflows').update({ runs: wf.runs + 1 }).eq('id', wf.id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Workflow Engine Error:", err);
    }
  }, 5000); // Check every 5 seconds for real-time responsiveness
  console.log("Background Workflow Engine started...");
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
