// Tells the site owner on their private Telegram chat that a new comment arrived.
// Visitor text goes in a JSON body with NO parse mode, so it can never change who receives the message or how it is sent.
// (The shell alert script is deliberately not used here: it builds a form string, where "&" in the text would add fields.)
import { readFileSync } from 'fs';

const ENV_FILE = '/etc/trendimovies/monitor.env';
const SITE = 'https://trendimovies.com';
const MAX_PER_HOUR = 20;            // a flood of comments must not become a flood of messages
let sentAt: number[] = [];

function envValue(text: string, key: string): string {
  const m = text.match(new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

export async function alertNewComment(c: { author: string; body: string; held: boolean; kind: string; title: string; path: string }) {
  try {
    const now = Date.now();
    sentAt = sentAt.filter((t) => now - t < 3600000);
    if (sentAt.length >= MAX_PER_HOUR) return;
    const env = readFileSync(ENV_FILE, 'utf-8');
    const token = envValue(env, 'BOT_TOKEN');
    const chat = envValue(env, 'CHAT_ID');
    if (!token || !chat) return;
    sentAt.push(now);
    const text = [
      c.held ? '⏳ New comment HELD for your approval' : '💬 New comment (already showing on the site)',
      `${c.kind}: ${c.title}`.slice(0, 200),
      '',
      `${c.author}: ${c.body.length > 600 ? c.body.slice(0, 600) + '…' : c.body}`,
      '',
      `View: ${SITE}${c.path}`,
      `Approve, reply or delete: ${SITE}/admin/reviews (Comments tab)`,
    ].join('\n');
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // An alert problem must never affect posting a comment. Nothing is logged: the request address holds the bot token.
  }
}
