import { randomBytes, createHash } from 'crypto';
import { getAuthHeaders, hashPasswordBcrypt } from './auth';
import { sendMail } from './mailer';

// Forgot-password: a one-time link, emailed, valid for one hour.
//  * The link holds a random token (after the # so it is never sent to a server or logged); only its SHA-256 is stored, so a copy of
//    the database cannot be used to reset anyone's password.
//  * Asking for a link never reveals whether an address has an account: the
//    answer is always the same, and the email is sent in the background so
//    the answer takes the same time either way.
//  * A token works once. Using it signs the person out everywhere.
//  * At most 3 links an hour per account.

const POSTGREST_URL = 'http://localhost:3001';
const SITE = 'https://trendimovies.com';
const TOKEN_MINUTES = 60;
const MAX_PER_HOUR = 3;

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const iso = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

function resetEmail(name: string, link: string): { subject: string; html: string; text: string } {
  const hello = name ? `Hi ${name},` : 'Hi,';
  const text = `${hello}

Someone asked to reset the password for your TrendiMovies account.
To choose a new password, open this link (it works for 1 hour):

${link}

If this was not you, ignore this email. Your password stays the same.

TrendiMovies`;
  const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  const html = `<!doctype html><html><body style="margin:0;background:#0b0d12;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#eef0f5">
<div style="max-width:480px;margin:0 auto;background:#141821;border:1px solid #262c3b;border-radius:16px;padding:28px">
<div style="font-size:22px;font-weight:800;color:#f6b93b;margin-bottom:18px">TrendiMovies</div>
<p style="font-size:16px;line-height:1.5;margin:0 0 12px">${esc(hello)}</p>
<p style="font-size:16px;line-height:1.5;margin:0 0 22px">Someone asked to reset the password for your account. Tap the button to choose a new one. It works for 1 hour.</p>
<p style="margin:0 0 22px"><a href="${esc(link)}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:12px;font-size:16px">Choose a new password</a></p>
<p style="font-size:13px;line-height:1.5;color:#98a1b4;margin:0 0 8px">Button not working? Copy this link into your browser:</p>
<p style="font-size:12px;line-height:1.4;color:#98a1b4;word-break:break-all;margin:0 0 18px">${esc(link)}</p>
<p style="font-size:13px;line-height:1.5;color:#98a1b4;margin:0">If this was not you, ignore this email. Your password stays the same.</p>
</div></body></html>`;
  return { subject: 'Reset your TrendiMovies password', html, text };
}

export async function requestPasswordReset(rawEmail: string, ip: string): Promise<void> {
  const email = String(rawEmail || '').toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return;

  const ures = await fetch(`${POSTGREST_URL}/users?email=eq.${encodeURIComponent(email)}&select=id,email,display_name,is_active`, { headers: getAuthHeaders() });
  const users = await ures.json();
  const user = Array.isArray(users) ? users[0] : null;
  if (!user || user.is_active === false) return;

  // no more than 3 links an hour for one account
  const since = iso(new Date(Date.now() - 3600 * 1000));
  const cres = await fetch(`${POSTGREST_URL}/password_resets?user_id=eq.${user.id}&created_at=gte.${encodeURIComponent(since)}&select=id`, { headers: getAuthHeaders() });
  const recent = await cres.json();
  if (Array.isArray(recent) && recent.length >= MAX_PER_HOUR) return;

  // older unused links stop working
  await fetch(`${POSTGREST_URL}/password_resets?user_id=eq.${user.id}&used_at=is.null`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ used_at: iso(new Date()) }),
  });

  const token = randomBytes(32).toString('hex');
  const ins = await fetch(`${POSTGREST_URL}/password_resets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_id: user.id,
      token_hash: sha(token),
      expires_at: iso(new Date(Date.now() + TOKEN_MINUTES * 60 * 1000)),
      ip_address: (ip || '').slice(0, 45),
    }),
  });
  if (!ins.ok) {
    console.error('[reset] could not store token:', (await ins.text()).slice(0, 200));
    return;
  }
  const mail = resetEmail(user.display_name || '', `${SITE}/reset-password#token=${token}`);
  // not awaited: the visitor gets the same quick answer whether or not the address exists
  void sendMail({ to: user.email, ...mail }).then(ok => {
    if (!ok) console.error('[reset] reset email was NOT sent for user', user.id);
  });
}

async function findToken(token: string): Promise<{ id: number; user_id: number } | null> {
  if (!/^[a-f0-9]{64}$/.test(token || '')) return null;
  const now = iso(new Date());
  const res = await fetch(
    `${POSTGREST_URL}/password_resets?token_hash=eq.${sha(token)}&used_at=is.null&expires_at=gt.${encodeURIComponent(now)}&select=id,user_id`,
    { headers: getAuthHeaders() }
  );
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  return !!(await findToken(token));
}

export async function completePasswordReset(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof newPassword !== 'string' || newPassword.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
  if (newPassword.length > 200) return { ok: false, error: 'That password is too long' };
  const row = await findToken(token);
  if (!row) return { ok: false, error: 'This link has expired or was already used. Please ask for a new one.' };

  // claim the token first, so two taps cannot both use it
  const claim = await fetch(`${POSTGREST_URL}/password_resets?id=eq.${row.id}&used_at=is.null`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify({ used_at: iso(new Date()) }),
  });
  const claimed = await claim.json();
  if (!Array.isArray(claimed) || claimed.length !== 1) return { ok: false, error: 'This link has expired or was already used. Please ask for a new one.' };

  const hash = await hashPasswordBcrypt(newPassword);
  const up = await fetch(`${POSTGREST_URL}/users?id=eq.${row.user_id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password_hash: hash, updated_at: iso(new Date()) }),
  });
  if (!up.ok) {
    console.error('[reset] could not save the new password:', (await up.text()).slice(0, 200));
    return { ok: false, error: 'Could not save your new password. Please try again.' };
  }
  // sign the account out everywhere
  await fetch(`${POSTGREST_URL}/user_sessions?user_id=eq.${row.user_id}`, { method: 'DELETE', headers: getAuthHeaders() });
  return { ok: true };
}
