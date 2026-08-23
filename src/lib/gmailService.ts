import { getCachedAccessToken } from './firebaseAuth.js';

export interface SendEmailParams {
  to: string;
  from?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}

/**
 * Creates RFC 2822 formatted email and base64url encodes it for Gmail API
 */
function createRawEmail(to: string, from: string, subject: string, htmlContent: string, plainText?: string): string {
  const boundary = `__boundary_${Date.now()}__`;
  const textBody = plainText || htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const emailLines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent,
    '',
    `--${boundary}--`,
  ];

  const raw = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email using the Gmail REST API (if user has active Gmail OAuth token)
 * Or proxies through the server if token is passed or simulated.
 */
export async function sendGmailMessage(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const token = getCachedAccessToken();
  const adminEmail = 'Asabsiddx2000@gmail.com';
  const fromEmail = params.from || adminEmail;

  if (token) {
    try {
      const raw = createRawEmail(params.to, fromEmail, params.subject, params.bodyHtml, params.bodyText);
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('Direct Gmail API call failed, falling back to server log:', errorData);
        // Fallback to server logger
        return await proxyEmailToServer(params, token);
      }

      const result = await res.json();
      
      // Also log with backend for tracking
      await fetch('/api/gmail/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.to,
          from: fromEmail,
          subject: params.subject,
          status: 'sent',
          type: params.subject.includes('Approval') ? 'admin_approval_request' : 'user_approval_confirmation',
          messagePreview: params.bodyText || params.subject,
        }),
      }).catch(() => {});

      return { success: true, messageId: result.id };
    } catch (err: any) {
      console.error('Error sending via Gmail API:', err);
      return await proxyEmailToServer(params, token);
    }
  } else {
    // If admin is not signed in to Google OAuth yet, send via server proxy / simulation logger
    return await proxyEmailToServer(params);
  }
}

async function proxyEmailToServer(params: SendEmailParams, token?: string | null) {
  try {
    const res = await fetch('/api/gmail/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to dispatch email' };
  }
}
