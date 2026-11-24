#!/usr/bin/env python3
"""
TrendiMovies Telegram news channel poster (cron every 10 minutes).

Posts NEWLY published news stories and blog posts to the news channel: picture + headline + short summary + link to the site.
Everything is controlled from /admin/news (Telegram channel card):  /var/lib/trendimovies/tg_channel.json
  {"enabled": false, "chat": "@Name", "since": "<when it was switched on>", "daily_cap": 8, "max_age_hours": 6, "min_gap_minutes": 20}
Token: /etc/trendimovies/news-bot.env (TG_NEWS_BOT_TOKEN), written by the admin page, never shown again.

Safety rules:
  - nothing published BEFORE the switch was turned on is ever posted (no flood on day one)
  - only items published within max_age_hours (so older catch-up stories with their original dates never go out)
  - at most daily_cap posts per 24 hours and min_gap_minutes between posts, one post per run
  - picture required (TMDB / official trailer picture); source is credited in every news post
  - films on the takedown list are never posted
Usage:  python3 tg_poster.py [--dry-run]
"""
import os, sys, re, json, html, fcntl, datetime, urllib.parse
import requests, psycopg2

DRY = '--dry-run' in sys.argv
CONF = '/var/lib/trendimovies/tg_channel.json'
ENVF = '/etc/trendimovies/news-bot.env'
SITE = 'https://trendimovies.com'
CATS = {'casting': 'Casting', 'trailers': 'Trailers', 'release-dates': 'Release dates', 'box-office': 'Box office', 'streaming': 'Streaming',
        'awards': 'Awards', 'behind-the-scenes': 'Behind the scenes', 'new-projects': 'New projects'}


def log(m):
    print(f"[tgpost {datetime.datetime.now().strftime('%H:%M:%S')}] {m}", flush=True)


def read_env(path, key):
    try:
        for line in open(path, encoding='utf-8'):
            k, sep, v = line.strip().partition('=')
            if sep and k.strip() == key:
                return v.strip().strip('"').strip("'")
    except Exception:
        pass
    return ''


def db():
    uri = read_env('/etc/postgrest.conf', 'db-uri')
    m = re.match(r'postgres://([^:]+):([^@]+)@([^:/]+):(\d+)/(\w+)', uri)
    u, p, h, port, name = m.groups()
    return psycopg2.connect(user=u, password=urllib.parse.unquote(p), host=h, port=int(port), dbname=name)


def notify(text):
    if DRY:
        return
    try:
        import subprocess
        subprocess.run(['/opt/trendimovies/monitor/tg_notify.sh', text], timeout=40, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass


def taken_down():
    try:
        return {int(x.get('tmdb_id')) for x in json.load(open('/var/lib/trendimovies/takedowns.json')) if x.get('tmdb_id')}
    except Exception:
        return set()


def blog_cover(c):
    if not c:
        return ''
    return c if c.startswith('http') else 'https://image.tmdb.org/t/p/w780' + c


def esc(t):
    return html.escape(t or '', quote=False)


def cut(t, n):
    t = re.sub(r'\s+', ' ', t or '').strip()
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0].rstrip(',;:-') + '…'


def send(token, chat, photo, caption):
    base = f'https://api.telegram.org/bot{token}'
    r = requests.post(base + '/sendPhoto', data={'chat_id': chat, 'photo': photo, 'caption': caption, 'parse_mode': 'HTML'}, timeout=30)
    d = r.json()
    if d.get('ok'):
        return d['result']['message_id'], ''
    err = f"{d.get('error_code')} {d.get('description')}"
    # Telegram could not fetch the picture: send the text with a link preview instead
    desc = (d.get('description') or '').lower()
    if d.get('error_code') == 400 and ('photo' in desc or 'wrong file' in desc or 'failed to get http url content' in desc):
        r = requests.post(base + '/sendMessage', data={'chat_id': chat, 'text': caption, 'parse_mode': 'HTML'}, timeout=30)
        d = r.json()
        if d.get('ok'):
            return d['result']['message_id'], ''
        err = f"{d.get('error_code')} {d.get('description')}"
    return None, err


def main():
    try:
        conf = json.load(open(CONF))
    except Exception:
        log('not configured')
        return
    if not conf.get('enabled'):
        log('switched off')
        return
    token = read_env(ENVF, 'TG_NEWS_BOT_TOKEN')
    chat = conf.get('chat')
    if not token or not chat:
        log('no token or channel')
        return
    lock = open('/tmp/tg_poster.lock', 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        return

    cap = int(conf.get('daily_cap', 8))
    max_age = int(conf.get('max_age_hours', 6))
    gap = int(conf.get('min_gap_minutes', 20))
    now = datetime.datetime.now(datetime.timezone.utc)
    since = now - datetime.timedelta(hours=max_age)
    try:
        s = datetime.datetime.fromisoformat(conf.get('since'))
        since = max(since, s)
    except Exception:
        pass

    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM tg_posts WHERE status='sent' AND posted_at > now() - interval '24 hours'")
    if cur.fetchone()[0] >= cap:
        log('daily cap reached')
        return
    cur.execute("SELECT max(posted_at) FROM tg_posts WHERE status='sent'")
    last = cur.fetchone()[0]
    if last and (now - last).total_seconds() < gap * 60:
        log('waiting for the gap between posts')
        return

    td = taken_down()
    cands = []
    cur.execute("""SELECT n.id, n.slug, n.title, n.summary, n.cover_image, n.source_name, n.category, n.related_tmdb_id, n.published_at
                   FROM news_items n LEFT JOIN tg_posts t ON t.kind='news' AND t.item_id=n.id
                   WHERE n.status='published' AND n.published_at >= %s AND n.published_at <= now()
                     AND n.cover_image IS NOT NULL AND n.source_url IS NOT NULL
                     AND (t.item_id IS NULL OR (t.status='failed' AND t.tries < 3))""", (since,))
    for (i, slug, title, summ, cover, src, cat, tmdb_id, pub) in cur.fetchall():
        if tmdb_id and int(tmdb_id) in td:
            continue
        url = f"{SITE}/news/{slug}?utm_source=telegram&utm_medium=channel&utm_campaign=news"
        cap_txt = f"<b>{esc(cut(title, 120))}</b>\n\n{esc(cut(summ, 260))}\n\n📰 {esc(src or '')} · {esc(CATS.get(cat, 'News'))}\n👉 <a href=\"{url}\">Read more on TrendiMovies</a>"
        cands.append((pub, 'news', i, cover, cap_txt, title))
    cur.execute("""SELECT b.id, b.slug, b.title, b.deck, b.cover_image, b.published_at, b.related_tmdb_id
                   FROM blog_posts b LEFT JOIN tg_posts t ON t.kind='blog' AND t.item_id=b.id
                   WHERE b.status='published' AND b.published_at >= %s AND b.published_at <= now() AND b.cover_image IS NOT NULL
                     AND (t.item_id IS NULL OR (t.status='failed' AND t.tries < 3))""", (since,))
    for (i, slug, title, deck, cover, pub, tmdb_id) in cur.fetchall():
        if tmdb_id and int(tmdb_id) in td:
            continue
        url = f"{SITE}/blog/{slug}?utm_source=telegram&utm_medium=channel&utm_campaign=blog"
        cap_txt = f"✍️ <b>{esc(cut(title, 120))}</b>\n\n{esc(cut(deck, 260))}\n\n👉 <a href=\"{url}\">Read the full post on TrendiMovies</a>"
        cands.append((pub, 'blog', i, blog_cover(cover), cap_txt, title))

    if not cands:
        log('nothing new to post')
        return
    cands.sort(key=lambda x: x[0])                    # oldest first, one per run
    pub, kind, iid, photo, caption, title = cands[0]
    caption = caption[:1020]
    if DRY:
        log(f'WOULD POST [{kind} #{iid}] {title}')
        print(caption)
        return
    mid, err = send(token, chat, photo, caption)
    if mid:
        cur.execute("""INSERT INTO tg_posts (kind, item_id, message_id, status, tries) VALUES (%s,%s,%s,'sent',1)
                       ON CONFLICT (kind,item_id) DO UPDATE SET status='sent', message_id=EXCLUDED.message_id, error=NULL, posted_at=now(), tries=tg_posts.tries+1""",
                    (kind, iid, mid))
        conn.commit()
        log(f'posted {kind} #{iid}: {title}')
    else:
        cur.execute("""INSERT INTO tg_posts (kind, item_id, status, error, tries) VALUES (%s,%s,'failed',%s,1)
                       ON CONFLICT (kind,item_id) DO UPDATE SET status='failed', error=EXCLUDED.error, tries=tg_posts.tries+1""", (kind, iid, err))
        conn.commit()
        log(f'FAILED {kind} #{iid}: {err}')
        # a wrong token / bot removed from the channel needs the owner: tell them (at most once a day)
        mark = '/tmp/tg_poster_alert'
        if re.search(r'^(401|403|400 Bad Request: chat not found)', err) or 'not enough rights' in err.lower():
            if not os.path.exists(mark) or (datetime.datetime.now().timestamp() - os.path.getmtime(mark)) > 86400:
                open(mark, 'w').write(err)
                notify(f"⚠️ <b>Telegram news channel posting is failing:</b> {html.escape(err)}\nCheck the bot is still an admin of the channel (admin page → News → Telegram channel).")


if __name__ == '__main__':
    main()
