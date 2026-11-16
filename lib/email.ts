import { Resend } from 'resend';

export function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Official senders by department / form type
export const CAREERS_FROM_EMAIL = 'Rachakonda Careers <careers@rachakondasolutions.com>';
export const ADMISSIONS_FROM_EMAIL = 'Rachakonda Admissions <admissions@rachakondasolutions.com>';
export const CONTACT_FROM_EMAIL = 'Rachakonda Solutions <contact@rachakondasolutions.com>';

export const DEFAULT_FROM_EMAIL = CAREERS_FROM_EMAIL;

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || 'chilumula62@gmail.com';

/**
 * Resolves the appropriate verified sender email based on the form source.
 */
export function getSenderForSource(source?: string): string {
  if (!source) return DEFAULT_FROM_EMAIL;
  const s = source.toLowerCase();
  if (s.includes('career')) return CAREERS_FROM_EMAIL;
  if (s.includes('education') || s.includes('enroll') || s.includes('counseling')) {
    return ADMISSIONS_FROM_EMAIL;
  }
  return CONTACT_FROM_EMAIL;
}

/**
 * Unified Multi-Provider Email Dispatcher:
 * 1. Primary: Resend (100 free emails/day)
 * 2. Automatic Fallback: Brevo (Sendinblue - 300 free emails/day)
 *
 * This allows expanding the free daily sending quota from 100 to 400 emails/day
 * with zero duplicates because all status tracking is centralized in Supabase.
 */
export async function sendEmailViaAvailableProvider({
  from,
  to,
  subject,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string; provider?: 'resend' | 'brevo' }> {
  // 1. Try Resend if key is available
  const resend = getResendClient();
  let resendErrorMessage: string | null = null;
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [to.trim()],
        subject,
        html,
      });

      if (!error && data?.id) {
        console.log(`[Resend] Successfully delivered to ${to} (Message ID: ${data.id})`);
        return { success: true, messageId: data.id, provider: 'resend' };
      }

      resendErrorMessage = error?.message || 'Resend delivery failed';
      console.warn(`[Resend] Delivery issue (${resendErrorMessage}). Checking Brevo fallback...`);
    } catch (err: any) {
      resendErrorMessage = err?.message || 'Resend exception';
      console.warn(`[Resend] Exception (${resendErrorMessage}). Checking Brevo fallback...`);
    }
  }

  // 2. Try Brevo (Sendinblue) if BREVO_API_KEY is configured
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/);
      const senderName = senderMatch ? senderMatch[1].trim() : 'Rachakonda Solutions';
      const senderEmail = senderMatch ? senderMatch[2].trim() : from;

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to.trim() }],
          subject,
          htmlContent: html,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.messageId) {
        console.log(`[Brevo] Successfully delivered to ${to} (Message ID: ${data.messageId})`);
        return { success: true, messageId: data.messageId, provider: 'brevo' };
      }

      console.error('[Brevo] Dispatch failed:', data);
      return { success: false, error: data?.message || 'Brevo dispatch failed', provider: 'brevo' };
    } catch (err: any) {
      console.error('[Brevo] Exception:', err);
      return { success: false, error: err?.message || 'Brevo error', provider: 'brevo' };
    }
  }

  return {
    success: false,
    error: resendErrorMessage || 'No email service available. Please configure RESEND_API_KEY or BREVO_API_KEY.',
  };
}

export interface CareerConfirmationParams {
  to: string;
  name: string;
  referenceId: string;
  roles: string;
  phone: string;
  qualification?: string;
  experience?: string;
  city?: string;
}

export interface CareerAdminAlertParams {
  candidateName: string;
  candidateEmail?: string;
  candidatePhone: string;
  referenceId: string;
  roles: string;
  qualification?: string;
  experience?: string;
  city?: string;
  additionalNotes?: string;
}

/**
 * Sends a branded acknowledgment email to the applicant with their Reference ID and next steps.
 */
export async function sendCareerApplicationConfirmationEmail({
  to,
  name,
  referenceId,
  roles,
  phone,
  qualification = 'N/A',
  experience = 'Fresher',
  city = 'Telangana',
}: CareerConfirmationParams) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    console.warn('[Email Engine] Skipping email: RESEND_API_KEY and BREVO_API_KEY are not configured.');
    return { success: false, reason: 'Email API key missing' };
  }

  if (!to || !to.includes('@')) {
    console.warn(`[Resend] Invalid candidate email provided: "${to}". Skipping.`);
    return { success: false, reason: 'Invalid recipient email' };
  }

  try {
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - Rachakonda Solutions</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Rachakonda <span style="color: #f59e0b;">Solutions</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; font-weight: 700; margin-top: 4px;">
                      ESTD 2012 &bull; Pvt Ltd &bull; Recruitment Cell
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 30px 25px 30px;">
              
              <!-- Greeting & Status Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                      ✓ Application Received
                    </span>
                    <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px 0;">
                      Dear ${escapeHtml(name)},
                    </h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                      Thank you for applying to join the team at <strong>Rachakonda Solutions</strong>. We have officially recorded your application for <strong>${escapeHtml(roles)}</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Reference ID Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); border: 1.5px dashed #0284c7; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; color: #0369a1;">
                      Your Official Application Reference ID
                    </div>
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #0f172a; margin-top: 6px; font-family: 'Courier New', Courier, monospace;">
                      ${escapeHtml(referenceId)}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                      Please quote this Reference ID in any future correspondence with our HR department.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Application Summary Table -->
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                Application Summary
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 28px; font-size: 13px;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Position(s)</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${escapeHtml(roles)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Registered Mobile</td>
                  <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(phone)}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Qualification</td>
                  <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(qualification)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Experience Status</td>
                  <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(experience)}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-weight: 600; color: #64748b;">Location / City</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${escapeHtml(city)}</td>
                </tr>
              </table>

              <!-- Next Steps Roadmap -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
                  What Happens Next?
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align: top; width: 28px; padding-bottom: 10px;">
                      <span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; background-color: #3b82f6; color: #ffffff; text-align: center; font-size: 12px; font-weight: 700;">1</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; padding-bottom: 10px; line-height: 1.5;">
                      <strong>Profile Screening:</strong> Our HR panel evaluates your credentials against our open requirements.
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; width: 28px; padding-bottom: 10px;">
                      <span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; background-color: #3b82f6; color: #ffffff; text-align: center; font-size: 12px; font-weight: 700;">2</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; padding-bottom: 10px; line-height: 1.5;">
                      <strong>Direct Contact:</strong> Shortlisted candidates will be contacted via WhatsApp/Call for the interview round.
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; width: 28px;">
                      <span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; background-color: #3b82f6; color: #ffffff; text-align: center; font-size: 12px; font-weight: 700;">3</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; line-height: 1.5;">
                      <strong>In-Person Walk-in / Interview:</strong> Conducted at our Gajwel Head Campus.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Instant WhatsApp Support CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/919640333313?text=Hi%20Rachakonda%20Solutions,%20I%20have%20applied%20for%20a%20job.%20My%20Ref%20ID%20is%20${encodeURIComponent(referenceId)}" 
                       style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);">
                      💬 Connect with HR on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8;">
                Recruitment Desk &bull; For faster response or document submissions, feel free to tap the WhatsApp button above or call our helpline.
              </p>
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">
                Rachakonda Solutions Pvt Ltd
              </p>
              <p style="margin: 0 0 8px 0;">
                Prashantha Complex, 2nd & 3rd Floor, Above LIC Office, Beside Gajwel Bus Stand Main Road, Gajwel, Telangana 502278
              </p>
              <p style="margin: 0; color: #94a3b8;">
                Helpline: +91 9640333313 &bull; Website: <a href="https://rachakondasolutions.com" style="color: #2563eb; text-decoration: none;">rachakondasolutions.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sender = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const sendRes = await sendEmailViaAvailableProvider({
      from: sender,
      to: to.trim(),
      subject: `Application Confirmed: ${roles} (Ref: ${referenceId}) - Rachakonda Solutions`,
      html: htmlContent,
    });

    if (!sendRes.success) {
      return { success: false, error: sendRes.error };
    }

    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    console.error('[Email Engine] Unexpected exception during candidate email dispatch:', err);
    return { success: false, error: err?.message || 'Email delivery failed' };
  }
}

/**
 * Sends an instant notification email to the internal HR / Admin team whenever a new application is submitted.
 */
export async function sendCareerAdminNotificationEmail({
  candidateName,
  candidateEmail,
  candidatePhone,
  referenceId,
  roles,
  qualification = 'N/A',
  experience = 'Fresher',
  city = 'Telangana',
  additionalNotes,
}: CareerAdminAlertParams) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }

  try {
    const adminHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1e293b; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #ffffff;">
    <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
      🔔 New Career Application: ${escapeHtml(candidateName)}
    </h2>
    <p>A new candidate has submitted their profile on the careers portal.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Reference ID</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; color: #0284c7; font-weight: bold;">${escapeHtml(referenceId)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Candidate Name</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(candidateName)}</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Position(s) Applied</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${escapeHtml(roles)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Mobile Number</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="tel:${escapeHtml(candidatePhone)}">${escapeHtml(candidatePhone)}</a></td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Email ID</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${candidateEmail ? `<a href="mailto:${escapeHtml(candidateEmail)}">${escapeHtml(candidateEmail)}</a>` : 'Not Provided'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Qualification</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(qualification)}</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Experience</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(experience)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">City / Address</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(city)}</td>
      </tr>
      ${additionalNotes ? `
      <tr style="background: #fffbeb;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Notes / Remarks</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(additionalNotes)}</td>
      </tr>
      ` : ''}
    </table>

    <div style="margin-top: 24px; text-align: center;">
      <a href="https://rachakondasolutions.com/crm/candidates" style="background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block;">
        Open in Rachakonda CRM Dashboard →
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const sender = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const sendRes = await sendEmailViaAvailableProvider({
      from: sender,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `[New Candidate] ${candidateName} applied for ${roles} (${referenceId})`,
      html: adminHtml,
    });

    if (!sendRes.success) {
      return { success: false, error: sendRes.error };
    }

    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    console.error('[Email Engine] Admin notification dispatch failed:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Sends an official Interview Call Letter to a shortlisted candidate.
 */
export async function sendInterviewInvitationEmail({
  to,
  name,
  referenceId,
  roles,
  interviewDate = 'Within 3 Business Days (10:00 AM - 4:00 PM)',
  customNotes,
}: {
  to: string;
  name: string;
  referenceId: string;
  roles: string;
  interviewDate?: string;
  customNotes?: string;
}) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }
  if (!to || !to.includes('@')) return { success: false, reason: 'Invalid email' };

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Interview Invitation - Rachakonda Solutions</title></head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          
          <!-- Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #10b981;">
              <div style="font-size: 24px; font-weight: 800; color: #ffffff;">
                Rachakonda <span style="color: #f59e0b;">Solutions</span>
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; font-weight: 700; margin-top: 4px;">
                Recruitment Cell &bull; Interview Call Letter
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 35px 30px 25px 30px;">
              <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; border: 1px solid #fde68a;">
                📅 Profile Shortlisted for Interview
              </span>
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px 0;">
                Dear ${escapeHtml(name)},
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                Congratulations! We are pleased to inform you that your profile has been <strong>shortlisted</strong> for the position of <strong>${escapeHtml(roles)}</strong> at Rachakonda Solutions.
              </p>

              <!-- Interview Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 35%; color: #475569;">Application Ref ID</td>
                  <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: bold; font-family: monospace;">${escapeHtml(referenceId)}</td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Interview Schedule</td>
                  <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${escapeHtml(interviewDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Venue</td>
                  <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; line-height: 1.5;">
                    <strong>Rachakonda Solutions Head Campus</strong><br>
                    Prashantha Complex, 2nd &amp; 3rd Floor, Above LIC Office,<br>
                    Beside Gajwel Bus Stand Main Road, Gajwel, Telangana 502278
                  </td>
                </tr>
                ${customNotes ? `
                <tr>
                  <td style="padding: 16px; font-weight: bold; color: #475569;">Special Instructions</td>
                  <td style="padding: 16px; color: #b45309; font-weight: 600;">${escapeHtml(customNotes)}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Documents to carry -->
              <div style="background-color: #eff6ff; border-radius: 10px; padding: 16px 20px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #1e3a8a; margin-bottom: 8px;">
                  Documents Required to Bring:
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #1e40af; line-height: 1.8;">
                  <li>2 Copies of your Updated Resume / CV</li>
                  <li>Original Educational Certificates (with 1 set Xerox)</li>
                  <li>Valid Government Photo ID (Aadhaar / Voter ID / Driving License)</li>
                  <li>2 Recent Passport-Size Photographs</li>
                </ul>
              </div>

              <!-- WhatsApp Confirmation CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/919640333313?text=Hello%20HR,%20I%20have%20received%20my%20Interview%20Call%20Letter%20for%20${encodeURIComponent(roles)}.%20Ref:%20${encodeURIComponent(referenceId)}.%20I%20confirm%20my%20attendance."
                       style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);">
                      💬 Confirm Your Attendance on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 6px 0; font-weight: bold; color: #334155;">Rachakonda Solutions Pvt Ltd</p>
              <p style="margin: 0;">Campus Helpline: +91 9640333313 &bull; <a href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw" style="color: #2563eb;">Open Campus in Google Maps</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sendRes = await sendEmailViaAvailableProvider({
      from: CAREERS_FROM_EMAIL,
      to: to.trim(),
      subject: `Interview Call Letter: ${roles} (Ref: ${referenceId}) - Rachakonda Solutions`,
      html: htmlContent,
    });

    if (!sendRes.success) {
      return { success: false, error: sendRes.error };
    }

    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sends a polite, respectful rejection email and keeps the candidate in the talent pool.
 */
export async function sendCandidateRejectionEmail({
  to,
  name,
  referenceId,
  roles,
}: {
  to: string;
  name: string;
  referenceId: string;
  roles: string;
}) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }
  if (!to || !to.includes('@')) return { success: false, reason: 'Invalid email' };

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <tr>
            <td style="background: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #64748b;">
              <div style="font-size: 22px; font-weight: 800; color: #ffffff;">Rachakonda <span style="color: #f59e0b;">Solutions</span></div>
              <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; margin-top: 4px;">Application Status Update</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Dear ${escapeHtml(name)},</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for taking the time to apply for <strong>${escapeHtml(roles)}</strong> (Ref: ${escapeHtml(referenceId)}) at Rachakonda Solutions.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                We received an exceptionally high volume of applications from talented candidates across Telangana and Andhra Pradesh. After careful review of all profiles, we have decided to move forward with other candidates whose experience more closely matches the immediate requirements of this specific opening.
              </p>
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border-left: 4px solid #64748b; margin: 20px 0; font-size: 13px; color: #475569;">
                <strong>Talent Pool:</strong> We have securely archived your profile in our recruitment database. Should a future opening arise that matches your skills and background, our HR panel will reach out to you directly.
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                We sincerely appreciate your interest in Rachakonda Solutions and wish you the absolute best in your career pursuits.
              </p>
              <p style="font-size: 13px; color: #0f172a; font-weight: bold; margin-top: 24px;">
                Warm regards,<br>
                Recruitment Cell<br>
                Rachakonda Solutions Pvt Ltd
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
              Prashantha Complex, Gajwel, Telangana &bull; Helpline: +91 9640333313
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sendRes = await sendEmailViaAvailableProvider({
      from: CAREERS_FROM_EMAIL,
      to: to.trim(),
      subject: `Update regarding your application for ${roles} (Ref: ${referenceId}) - Rachakonda Solutions`,
      html: htmlContent,
    });

    if (!sendRes.success) return { success: false, error: sendRes.error };
    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sends student enrollment & counseling acknowledgment email.
 */
export async function sendCounselingInquiryEmail({
  to,
  name,
  course,
  category = 'Education Guidance',
}: {
  to: string;
  name: string;
  course: string;
  category?: string;
}) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }
  if (!to || !to.includes('@')) return { success: false, reason: 'Invalid email' };

  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #0b1120; padding: 30px 15px; color: #334155;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
    <div style="background: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #3b82f6;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Rachakonda <span style="color: #f59e0b;">Solutions</span></h1>
      <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Premier Education &amp; Admissions Consultancy</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #0f172a; margin-top: 0;">Hello ${escapeHtml(name)},</h2>
      <p>Thank you for expressing interest in <strong>${escapeHtml(course)}</strong> (${escapeHtml(category)}).</p>
      <p>Our senior education counselor has received your inquiry and will connect with you shortly via phone/WhatsApp to guide you with college admissions, entrance exams, and fee structures.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="https://wa.me/919640333313?text=Hi%20Counselor,%20I%20enquired%20about%20${encodeURIComponent(course)}" style="background: #16a34a; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
          💬 Chat with Admission Counselor on WhatsApp
        </a>
      </div>
      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        Head Campus: Prashantha Complex, Beside Gajwel Bus Stand Main Road, Gajwel, Telangana 502278<br>
        Direct Helpline: +91 9640333313
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const sendRes = await sendEmailViaAvailableProvider({
      from: ADMISSIONS_FROM_EMAIL,
      to: to.trim(),
      subject: `Admissions & Counseling Inquiry: ${course} - Rachakonda Solutions`,
      html: htmlContent,
    });

    if (!sendRes.success) return { success: false, error: sendRes.error };
    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sends an official acknowledgment email to visitors submitting the Contact Us form.
 */
export async function sendContactConfirmationEmail({
  to,
  name,
  subject,
  phone,
}: {
  to: string;
  name: string;
  subject: string;
  phone: string;
}) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }
  if (!to || !to.includes('@')) return { success: false, reason: 'Invalid email' };

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Inquiry Received - Rachakonda Solutions</title></head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <div style="font-size: 24px; font-weight: 800; color: #ffffff;">
                Rachakonda <span style="color: #f59e0b;">Solutions</span>
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; font-weight: 700; margin-top: 4px;">
                ESTD 2012 &bull; Education, Admissions &amp; Career Guidance
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px 25px 30px;">
              <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                ✓ Message Received
              </span>
              <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 16px 0 8px 0;">
                Dear ${escapeHtml(name)},
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                Thank you for contacting <strong>Rachakonda Solutions</strong> regarding <strong>${escapeHtml(subject)}</strong>. We have officially recorded your request.
              </p>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
                  What Happens Next?
                </div>
                <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.5;">
                  Our expert guidance counselors will review your details and reach out to you directly via call or WhatsApp at <strong>${escapeHtml(phone)}</strong> within 24 business hours.
                </p>
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/919640333313?text=Hi%20Rachakonda%20Solutions,%20I%20submitted%20an%20inquiry%20regarding%20${encodeURIComponent(subject)}" 
                       style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);">
                      💬 Connect on WhatsApp for Instant Support
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 6px 0; font-weight: bold; color: #334155;">Rachakonda Solutions Pvt Ltd</p>
              <p style="margin: 0 0 6px 0;">Prashantha Complex, 2nd &amp; 3rd Floor, Above LIC Office, Beside Gajwel Bus Stand Main Road, Gajwel, Telangana 502278</p>
              <p style="margin: 0; color: #94a3b8;">Helpline: +91 9640333313 &bull; <a href="https://rachakondasolutions.com" style="color: #2563eb; text-decoration: none;">rachakondasolutions.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const sendRes = await sendEmailViaAvailableProvider({
      from: CONTACT_FROM_EMAIL,
      to: to.trim(),
      subject: `Inquiry Received: ${subject} - Rachakonda Solutions`,
      html: htmlContent,
    });

    if (!sendRes.success) return { success: false, error: sendRes.error };
    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sends an instant notification to internal admin/management when a new Contact Us form is submitted.
 */
export async function sendContactAdminNotificationEmail({
  name,
  phone,
  email,
  state,
  subject,
  message,
}: {
  name: string;
  phone: string;
  email?: string;
  state?: string;
  subject?: string;
  message?: string;
}) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }

  try {
    const adminHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1e293b; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #ffffff;">
    <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
      🔔 New Contact Form Inquiry: ${escapeHtml(name)}
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Full Name</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Mobile</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Subject / Topic</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(subject || 'General Inquiry')}</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">State / Location</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(state || 'Telangana')}</td>
      </tr>
      ${message ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Message</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; line-height: 1.5;">${escapeHtml(message)}</td>
      </tr>
      ` : ''}
    </table>
    <div style="margin-top: 24px; text-align: center;">
      <a href="https://rachakondasolutions.com/crm/leads" style="background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block;">
        View in Rachakonda CRM Leads &rarr;
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const sendRes = await sendEmailViaAvailableProvider({
      from: CONTACT_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `[New Inquiry] ${name} - ${subject || 'General Inquiry'}`,
      html: adminHtml,
    });

    if (!sendRes.success) return { success: false, error: sendRes.error };
    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sends an instant notification to internal admin when a student applies for a course or counseling.
 */
export async function sendEnrollmentAdminNotificationEmail({
  name,
  phone,
  email,
  course,
  category,
  state,
}: {
  name: string;
  phone: string;
  email?: string;
  course: string;
  category?: string;
  state?: string;
}) {
  if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
    return { success: false, reason: 'Email API key missing' };
  }

  try {
    const adminHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1e293b; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #ffffff;">
    <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
      🎓 New Course Enrollment: ${escapeHtml(name)}
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Student Name</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Course Selected</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${escapeHtml(course)}</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Category</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(category || 'General')}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Mobile</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : 'Not provided'}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">State</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(state || 'Telangana')}</td>
      </tr>
    </table>
    <div style="margin-top: 24px; text-align: center;">
      <a href="https://rachakondasolutions.com/crm/leads" style="background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block;">
        View in Rachakonda CRM Leads &rarr;
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const sendRes = await sendEmailViaAvailableProvider({
      from: ADMISSIONS_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `[New Student Enrollment] ${name} - ${course}`,
      html: adminHtml,
    });

    if (!sendRes.success) return { success: false, error: sendRes.error };
    return { success: true, messageId: sendRes.messageId };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

