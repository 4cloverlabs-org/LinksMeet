import emailjs from '@emailjs/browser';
import { fetchIntegrationSettings } from './db';

export interface EmailResult {
  success: boolean;
  isDemo: boolean;
  error?: string;
  generatedMeetLink: string;
}

export interface BookingEmailData {
  name: string;
  email: string;
  message?: string;
  eventTitle: string;
  eventDuration: number;
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
}

/**
 * Generates a unique Jitsi Meet or random Google Meet URL
 */
function generateMeetingLink(): string {
  // Create a realistic Google Meet style code (e.g. abc-defg-hij)
  const c = 'abcdefghijklmnopqrstuvwxyz';
  const p1 = Array.from({ length: 3 }, () => c[Math.floor(Math.random() * c.length)]).join('');
  const p2 = Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join('');
  const p3 = Array.from({ length: 3 }, () => c[Math.floor(Math.random() * c.length)]).join('');
  
  return `https://meet.google.com/${p1}-${p2}-${p3}`;
}

/**
 * Dispatches confirmation emails to client & notification to host.
 */
export async function sendBookingEmails(data: BookingEmailData): Promise<EmailResult> {
  const settings = fetchIntegrationSettings();
  const meetLink = generateMeetingLink();
  
  const { serviceId, publicKey, templateCompanyId, templateClientId } = settings.emailJsConfig;
  
  const missingKeys: string[] = [];
  if (!serviceId) missingKeys.push('Service ID');
  if (!publicKey) missingKeys.push('Public Key');
  if (!templateCompanyId) missingKeys.push('Host Alert Template ID');
  
  const isSimulation = !settings.isLiveMode || missingKeys.length > 0;
  
  if (isSimulation) {
    console.info(
      `[EmailJS Simulation Mode] Missing configurations: ${missingKeys.join(', ')} or Live Mode is OFF.\n` +
      `Simulating email transmissions:\n` +
      `- Host Alert: Booking of ${data.eventTitle} with ${data.name} on ${data.scheduledDate} at ${data.scheduledTime}\n` +
      `- Client Auto-Reply: Confirmed slot sent to ${data.email}\n` +
      `- Generated Meeting URL: ${meetLink}\n` +
      `Payload:`, data
    );
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: true, isDemo: true, generatedMeetLink: meetLink };
  }

  try {
    const meetingSectionStr = `Meeting Details:\n- Event: ${data.eventTitle}\n- Date: ${data.scheduledDate}\n- Time Slot: ${data.scheduledTime}\n- Client Timezone: ${data.timezone}\n- Meet Link: ${meetLink} (Google Meet)`;
    
    const meetingSectionHtml = `
      <div style="background-color: #F9F9F9; border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 16px; padding: 24px; margin-bottom: 24px; font-family: sans-serif;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8A867B; margin-bottom: 12px;">Meeting Details</div>
        <div style="font-size: 15px; margin-bottom: 8px; color: #333333;">Event: <strong style="color: #111111;">${data.eventTitle} (${data.eventDuration} mins)</strong></div>
        <div style="font-size: 15px; margin-bottom: 8px; color: #333333;">Date: <strong style="color: #111111;">${data.scheduledDate}</strong></div>
        <div style="font-size: 15px; margin-bottom: 8px; color: #333333;">Time Slot: <strong style="color: #111111;">${data.scheduledTime}</strong></div>
        <div style="font-size: 15px; margin-bottom: 8px; color: #333333;">Timezone: <strong style="color: #111111;">${data.timezone}</strong></div>
        <div style="margin-top: 18px;">
          <a href="${meetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2F6CF2; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 12px;">Join Google Meet</a>
        </div>
      </div>
    `;

    // 1. Host Notification Email Parameters
    const hostParams = {
      event_title: data.eventTitle,
      client_name: data.name,
      client_email: data.email,
      message: data.message || 'No additional notes.',
      scheduled_date: data.scheduledDate,
      scheduled_time: data.scheduledTime,
      timezone: data.timezone,
      meet_link: meetLink,
      meeting_section: meetingSectionStr,
      meeting_section_html: meetingSectionHtml,
    };

    const promises = [];
    
    // Dispatch host email
    promises.push(emailjs.send(serviceId, templateCompanyId, hostParams, publicKey));

    // 2. Client Auto-Reply Email (if template ID provided)
    if (templateClientId) {
      const clientParams = {
        client_name: data.name,
        client_email: data.email,
        event_title: data.eventTitle,
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime,
        timezone: data.timezone,
        meet_link: meetLink,
        meeting_section: meetingSectionStr,
        meeting_section_html: meetingSectionHtml,
      };
      promises.push(emailjs.send(serviceId, templateClientId, clientParams, publicKey));
    }

    await Promise.all(promises);
    return { success: true, isDemo: false, generatedMeetLink: meetLink };
  } catch (error: any) {
    console.error('[EmailJS SDK failure]', error);
    return {
      success: false,
      isDemo: false,
      error: error?.text || error?.message || 'Failed to dispatch emails via EmailJS. Falling back to local success.',
      generatedMeetLink: meetLink,
    };
  }
}
