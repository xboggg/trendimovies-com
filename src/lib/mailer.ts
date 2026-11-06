// Sends the site's own emails (right now: password reset links).
//
// One mail service is used, chosen by which key is in .env:
//   BREVO_API_KEY   -> Brevo   (api.brevo.com, free: 300 emails a day)
//   RESEND_API_KEY  -> Resend  (api.resend.com, free: 100 emails a day)
// MAIL_FROM is the sender, e.g.  TrendiMovies <noreply@trendimovies.com>
// (the address has to be one the mail service has verified).
//
// With no key set, nothing is sent and sendMail() says so (returns false), so
// the caller can tell the visitor honestly instead of pretending.

const BREVO_KEY = (import.meta as any).env?.BREVO_API_KEY || process.env.BREVO_API_KEY || '';
const RESEND_KEY = (import.meta as any).env?.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
const BREVO_URL = (import.meta as any).env?.BREVO_API_URL || process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';
const FROM = (import.meta as any).env?.MAIL_FROM || process.env.MAIL_FROM || 'TrendiMovies <noreply@trendimovies.com>';

export function mailConfigured(): boolean {
  return !!(BREVO_KEY || RESEND_KEY);
}

function splitFrom(from: string): { name: string; email: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].replace(/^"|"$/g, ''), email: m[2] } : { name: 'TrendiMovies', email: from.trim() };
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  if (!mailConfigured()) {
    console.warn('[mail] no mail service key set (BREVO_API_KEY or RESEND_API_KEY): email not sent');
    return false;
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    if (BREVO_KEY) {
      const f = splitFrom(FROM);
      const res = await fetch(BREVO_URL, {
        method: 'POST',
        headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: f.name, email: f.email },
          to: [{ email: opts.to }],
          subject: opts.subject,
          htmlContent: opts.html,
          textContent: opts.text,
        }),
        signal: ctl.signal,
      });
      if (!res.ok) console.error('[mail] Brevo said', res.status, (await res.text()).slice(0, 300));
      return res.ok;
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
      signal: ctl.signal,
    });
    if (!res.ok) console.error('[mail] Resend said', res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (e) {
    console.error('[mail] send failed:', (e as Error).message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
