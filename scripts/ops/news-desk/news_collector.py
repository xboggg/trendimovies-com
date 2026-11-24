#!/usr/bin/env python3
"""
TrendiMovies News desk collector.

What it does (every 2 hours, from cron):
  1. Reads the public web preview of a movie-news channel (leads only; nothing is copied) and a few
     film-news RSS feeds (Variety, Deadline, Hollywood Reporter, IndieWire, Collider, /Film).
  2. For each NEW lead, asks Claude to (a) find the real report of the same story in the feeds,
     (b) write a short ORIGINAL item in plain words using only facts that appear in the supplied texts.
  3. Finds the film/series in TMDB and uses TMDB pictures (never the channel's or the outlets' pictures).
  4. Saves it as a DRAFT (Edmund approves in /admin/news). Auto-publish only when the switch is ON
     and a real source was found.
  5. Pings the admin log chat when drafts are waiting.

Switch + limits: /var/lib/trendimovies/news_mode.json
  {"auto_publish": false, "max_per_run": 6, "feed_per_day": 4}

Usage:  python3 news_collector.py [--dry-run] [--limit N]
"""
import os, sys, re, json, time, html, fcntl, datetime, urllib.parse, urllib.request
import requests, psycopg2, anthropic
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
MODE_FILE = '/var/lib/trendimovies/news_mode.json'
DRY = '--dry-run' in sys.argv
LIMIT_ARG = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None

CHANNELS = ['MOVIES_ETY_G']          # public channels read through their public web preview
FEEDS = [
    ('Variety', 'https://variety.com/feed/'),
    ('Deadline', 'https://deadline.com/feed/'),
    ('The Hollywood Reporter', 'https://www.hollywoodreporter.com/feed/'),
    ('IndieWire', 'https://www.indiewire.com/feed/'),
    ('Collider', 'https://collider.com/feed/'),
    ('/Film', 'https://www.slashfilm.com/feed/'),
]
UA = {'User-Agent': 'Mozilla/5.0 (compatible; TrendiMoviesNewsBot/1.0; +https://trendimovies.com)'}
MODEL = 'claude-sonnet-4-6'
CATEGORIES = ['casting', 'trailers', 'release-dates', 'box-office', 'streaming', 'awards', 'behind-the-scenes', 'new-projects']


def log(m):
    print(f"[news {datetime.datetime.now().strftime('%H:%M:%S')}] {m}", flush=True)


def read_env(path, key):
    try:
        for line in open(path, encoding='utf-8'):
            line = line.strip()
            k, sep, v = line.partition('=')
            if sep and k.strip() == key:
                return v.strip().strip('"').strip("'")
    except Exception:
        pass
    return ''


TMDB_KEY = read_env('/var/www/trendimovies/.env', 'TMDB_API_KEY')
ANTHROPIC_KEY = read_env('/etc/trendimovies/topics.env', 'ANTHROPIC_API_KEY')
BOT_TOKEN = read_env('/opt/trendimovies-blog/.env', 'TM_BOT_TOKEN')
BOT_CHAT = read_env('/opt/trendimovies-blog/.env', 'TM_BOT_LOG_CHANNEL')
client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)


def db():
    uri = read_env('/etc/postgrest.conf', 'db-uri')
    m = re.match(r'postgres://([^:]+):([^@]+)@([^:/]+):(\d+)/(\w+)', uri)
    u, p, h, port, name = m.groups()
    return psycopg2.connect(user=u, password=urllib.parse.unquote(p), host=h, port=int(port), dbname=name)


def load_mode():
    d = {'auto_publish': False, 'max_per_run': 6, 'feed_per_day': 4}
    try:
        d.update(json.load(open(MODE_FILE)))
    except Exception:
        pass
    return d


# ---------------------------------------------------------------- leads
def clean(t, n=None):
    t = html.unescape(re.sub(r'\s+', ' ', BeautifulSoup(t or '', 'html.parser').get_text(' ')).strip())
    return t[:n] if n else t


def fetch_channel(name):
    """Public web preview of a channel: id, time, text. Pictures and links are ignored on purpose."""
    out = []
    try:
        r = requests.get(f'https://t.me/s/{name}', headers=UA, timeout=25)
        r.raise_for_status()
    except Exception as e:
        log(f'channel {name} unreachable: {e}')
        return out
    soup = BeautifulSoup(r.text, 'html.parser')
    for w in soup.select('.tgme_widget_message_wrap'):
        msg = w.select_one('.tgme_widget_message')
        if not msg or not msg.get('data-post'):
            continue
        txt_el = w.select_one('.tgme_widget_message_text')
        txt = clean(txt_el.get_text(' ') if txt_el else '')
        txt = re.sub(r'@\w+', '', txt).strip()          # drop the channel's own tags
        tm = w.select_one('time')
        when = tm.get('datetime') if tm else None
        if len(txt) < 12:
            continue
        out.append({'ref': 'ch:' + msg['data-post'], 'text': txt, 'when': when})
    return out


def fetch_feeds():
    items = []
    cutoff = time.time() - 40 * 3600
    for name, url in FEEDS:
        try:
            r = requests.get(url, headers=UA, timeout=25)
            r.raise_for_status()
            soup = BeautifulSoup(r.content, 'xml')
            for it in soup.find_all('item')[:15]:
                link = (it.find('link').get_text() if it.find('link') else '').strip()
                title = clean(it.find('title').get_text() if it.find('title') else '')
                desc = clean(it.find('description').get_text() if it.find('description') else '', 500)
                pub = it.find('pubDate').get_text() if it.find('pubDate') else ''
                try:
                    ts = datetime.datetime.strptime(pub[:25], '%a, %d %b %Y %H:%M:%S').replace(tzinfo=datetime.timezone.utc).timestamp()
                except Exception:
                    ts = time.time()
                if ts < cutoff or not link or not title:
                    continue
                items.append({'source': name, 'title': title, 'desc': desc, 'link': link, 'ts': ts})
        except Exception as e:
            log(f'feed {name} failed: {e}')
    items.sort(key=lambda x: -x['ts'])
    return items


def article_text(url, limit=3500):
    """Plain text of the first paragraphs of a report (facts only; never republished)."""
    try:
        r = requests.get(url, headers=UA, timeout=20)
        if r.status_code != 200:
            return ''
        soup = BeautifulSoup(r.text, 'html.parser')
        paras = [clean(p.get_text(' ')) for p in soup.select('article p, .entry-content p, .a-content p')]
        paras = [p for p in paras if len(p) > 50]
        return ' '.join(paras)[:limit]
    except Exception:
        return ''


# ---------------------------------------------------------------- Claude
SYSTEM = f"""You write for TrendiMovies, a film and TV information site for readers all over the world, many on phones.
You turn a news LEAD into a short ORIGINAL news item.

RULES (strict):
- Use ONLY facts that appear in the texts you are given. Never add facts from memory. Never guess.
- If a text says a thing is a rumour or "not confirmed", say so (use "reportedly" or "according to"). Never state a rumour as fact.
- Write in your own words. Do not copy sentences from the source. Simple, short, clear English that anyone can follow. No hype, no ALL CAPS, no clickbait.
- Never write sentences about what is NOT known or NOT confirmed beyond what the source itself says (no filler like "no further details are available"). If there is little to say, write a shorter body instead.
- Do not mention Telegram, channels, or where the lead came from. Do not mention downloads or streaming files.
- If the lead is not film/TV news (an advert, a meme, a quiz, a giveaway, chat), set skip=true.
- The category must be one of: {', '.join(CATEGORIES)}.
Return ONLY one JSON object, no other text."""


def ask(prompt, max_tokens=1500):
    for attempt in range(3):
        try:
            r = client.messages.create(model=MODEL, max_tokens=max_tokens, temperature=0.3, system=SYSTEM,
                                       messages=[{'role': 'user', 'content': prompt}])
            txt = ''.join(b.text for b in r.content if getattr(b, 'type', '') == 'text')
            obj, _ = json.JSONDecoder().raw_decode(txt[txt.index('{'):])
            return obj
        except Exception as e:
            log(f'claude try {attempt + 1} failed: {e}')
            time.sleep(3)
    return None


SCHEMA_HINT = """JSON fields:
{"skip": false, "skip_reason": "",
 "already_covered": false,
 "source_index": null,            // number from the REPORTS list that is about the SAME story, or null if none
 "title": "max 80 characters, plain, factual",
 "summary": "one sentence, max 170 characters",
 "points": ["3 short bullet facts, each max 90 characters, each a real fact (never a statement that something is unknown)"],
 "body": "1 to 4 short paragraphs separated by a blank line, 40-170 words in total, only as long as the facts allow",
 "category": "one of the allowed categories",
 "subject_type": "movie | tv | person | none",
 "subject_title": "exact title of the main film or series (or the person's name) as TMDB would list it, or empty",
 "subject_year": "release year of that film/series if known from the texts, else empty"}"""


def write_item(lead_text, lead_kind, reports, recent_titles, picked_report=None):
    rep_lines = '\n'.join(f"[{i}] {r['source']}: {r['title']} — {r['desc']}" for i, r in enumerate(reports)) or '(none)'
    full = ''
    if picked_report is not None:
        full = f"\nFULL TEXT OF REPORT [{picked_report['idx']}] (facts only):\n{picked_report['text']}\n"
    prompt = f"""LEAD ({lead_kind}):
{lead_text}

REPORTS FROM FILM-NEWS OUTLETS (last 40 hours):
{rep_lines}
{full}
ALREADY PUBLISHED OR DRAFTED RECENTLY (set already_covered=true if this lead is the same story as one of these):
{chr(10).join('- ' + t for t in recent_titles) or '(none)'}

{SCHEMA_HINT}"""
    return ask(prompt)


# ---------------------------------------------------------------- TMDB
def tmdb(path, **params):
    params['api_key'] = TMDB_KEY
    r = requests.get('https://api.themoviedb.org/3' + path, params=params, timeout=20)
    r.raise_for_status()
    return r.json()


def resolve_subject(stype, title, year):
    """-> dict(related_tmdb_id, related_type, film_title, cover_image, poster_image) from TMDB, or {}."""
    if not title or stype not in ('movie', 'tv', 'person'):
        return {}
    try:
        if stype == 'person':
            return {}            # a person's news never borrows a different film's picture
        kw = {'query': title}
        if year and str(year).isdigit():
            kw['year' if stype == 'movie' else 'first_air_date_year'] = year
        res = tmdb('/search/' + stype, **kw).get('results', [])
        if not res and 'year' in kw or (not res and 'first_air_date_year' in kw):
            kw.pop('year', None); kw.pop('first_air_date_year', None)
            res = tmdb('/search/' + stype, query=title).get('results', [])
        if not res:
            return {}
        # prefer an exact (case-insensitive) title match, else the most popular hit
        def nm(x): return (x.get('title') or x.get('name') or '').strip().lower()
        exact = [x for x in res if nm(x) == title.strip().lower()]
        pick = (exact or res)[0]
        if not exact and pick.get('popularity', 0) < 3:
            return {}
        return {'related_tmdb_id': pick['id'], 'related_type': stype, 'film_title': pick.get('title') or pick.get('name'),
                'cover_image': ('https://image.tmdb.org/t/p/w1280' + pick['backdrop_path']) if pick.get('backdrop_path') else None,
                'poster_image': ('https://image.tmdb.org/t/p/w500' + pick['poster_path']) if pick.get('poster_path') else None}
    except Exception as e:
        log(f'tmdb lookup failed for {title!r}: {e}')
        return {}


# ---------------------------------------------------------------- DB
def smart_cut(t, n):
    if len(t) <= n:
        return t
    return t[:n].rsplit(' ', 1)[0].rstrip(',;:-') + '…'


def slugify(t):
    s = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:70].strip('-')
    return s or 'news'


def banned_taken_down(conn, tmdb_id):
    """Never write news that pushes a film that is on the takedown list."""
    try:
        ids = {int(x.get('tmdb_id')) for x in json.load(open('/var/lib/trendimovies/takedowns.json')) if x.get('tmdb_id')}
        return tmdb_id in ids
    except Exception:
        return False


def insert(conn, row):
    cols = list(row.keys())
    cur = conn.cursor()
    slug = row['slug']
    for n in range(0, 6):
        try:
            row['slug'] = slug if n == 0 else f'{slug}-{n + 1}'
            cur.execute(f"INSERT INTO news_items ({','.join(cols)}) VALUES ({','.join(['%s'] * len(cols))}) RETURNING id",
                        [row[c] for c in cols])
            nid = cur.fetchone()[0]
            conn.commit()
            return nid
        except psycopg2.errors.UniqueViolation as e:
            conn.rollback()
            if 'origin_ref' in str(e):
                return None
    return None


def tg(text):
    """Ping the admin alert chat through the server's existing notifier (same one the cron monitors use)."""
    if DRY or os.environ.get('NEWS_NO_PING'):
        return
    try:
        import subprocess
        subprocess.run(['/opt/trendimovies/monitor/tg_notify.sh', text], timeout=40, check=False,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        log(f'ping failed: {e}')


# ---------------------------------------------------------------- main
def main():
    lock = open('/tmp/news_collector.lock', 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        log('another run is active, leaving')
        return
    mode = load_mode()
    max_run = LIMIT_ARG or int(mode.get('max_per_run', 6))
    conn = db()
    cur = conn.cursor()
    cur.execute("SELECT origin_ref FROM news_items WHERE origin_ref IS NOT NULL")
    seen = {r[0] for r in cur.fetchall()}
    cur.execute("SELECT title FROM news_items WHERE status IN ('draft','published') ORDER BY created_at DESC LIMIT 40")
    recent = [r[0] for r in cur.fetchall()]
    cur.execute("SELECT count(*) FROM news_items WHERE origin='feed' AND created_at > now() - interval '24 hours' AND status<>'skipped'")
    feed_today = cur.fetchone()[0]

    reports = fetch_feeds()
    log(f'{len(reports)} recent outlet reports')
    leads = []
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=3)
    for ch in CHANNELS:
        for p in fetch_channel(ch):
            if p['ref'] in seen:
                continue
            try:
                if p['when'] and datetime.datetime.fromisoformat(p['when']) < cutoff:
                    continue
            except Exception:
                pass
            leads.append({'kind': 'channel', 'ref': p['ref'], 'text': p['text']})
    log(f'{len(leads)} new channel leads')

    made = []
    done = 0
    for ld in leads:
        if done >= max_run:
            break
        res = write_item(ld['text'], 'a short post from a movie-news channel', reports, recent)
        done += 1
        if not res:
            continue                                   # try again next run, nothing saved
        if res.get('skip') or res.get('already_covered'):
            if not DRY:
                insert(conn, {'slug': 'skip-' + re.sub(r'\W', '', ld['ref']).lower(), 'title': (ld['text'][:80] or 'skipped'), 'origin': 'channel',
                              'origin_ref': ld['ref'], 'origin_text': ld['text'], 'status': 'skipped',
                              'skip_reason': 'duplicate' if res.get('already_covered') else (res.get('skip_reason') or 'not news')})
            log(f"skip {ld['ref']}: {'duplicate' if res.get('already_covered') else res.get('skip_reason')}")
            continue
        src = None
        si = res.get('source_index')
        if isinstance(si, int) and 0 <= si < len(reports):
            src = reports[si]
            # second pass with the full report text so the facts are accurate
            txt = article_text(src['link'])
            if txt:
                res2 = write_item(ld['text'], 'a short post from a movie-news channel', reports, recent, {'idx': si, 'text': txt})
                if res2 and not res2.get('skip'):
                    res = res2
                    res['source_index'] = si
        made.append(finish(conn, res, src, ld, 'channel', mode, recent))

    # extra stories straight from the outlets (limited per day), only if room is left
    room = min(max_run - done, int(mode.get('feed_per_day', 4)) - feed_today)
    if room > 0 and reports:
        listing = '\n'.join(f"[{i}] {r['source']}: {r['title']}" for i, r in enumerate(reports[:60]))
        pick = ask(f"""From these film/TV news headlines pick up to {room} of the BIGGEST stories for a world-wide audience
(casting, trailers, release dates, box office, streaming, awards). Skip gossip, politics, deaths, reviews, lists, opinion, and anything
that matches these already-covered titles: {recent[:25]}.
HEADLINES:
{listing}
Return JSON: {{"picks": [numbers]}}""", 300)
        for i in (pick or {}).get('picks', [])[:room]:
            if not isinstance(i, int) or not (0 <= i < len(reports)):
                continue
            r = reports[i]
            ref = 'feed:' + r['link']
            if ref in seen:
                continue
            txt = article_text(r['link']) or r['desc']
            res = write_item(f"{r['title']} — {r['desc']}", f"a headline from {r['source']}", reports, recent, {'idx': i, 'text': txt})
            if not res or res.get('skip') or res.get('already_covered'):
                if res and not DRY:
                    insert(conn, {'slug': 'skip-' + str(abs(hash(ref)))[:10], 'title': r['title'][:80], 'origin': 'feed', 'origin_ref': ref,
                                  'status': 'skipped', 'skip_reason': 'duplicate' if res.get('already_covered') else (res.get('skip_reason') or 'not news')})
                continue
            res['source_index'] = i
            made.append(finish(conn, res, r, {'kind': 'feed', 'ref': ref, 'text': f"{r['title']} — {r['desc']}"}, 'feed', mode, recent))

    made = [m for m in made if m]
    log(f'done: {len(made)} new items')
    waiting = [m for m in made if m[1] == 'draft']
    if waiting:
        lines = '\n'.join('• ' + html.escape(t) for t, st in waiting[:8])
        tg(f"📰 <b>{len(waiting)} news draft(s) waiting for your yes</b>\n{lines}\n\nReview: https://trendimovies.com/admin/news")
    autop = [m for m in made if m[1] == 'published']
    if autop:
        tg('📰 <b>Published automatically:</b>\n' + '\n'.join('• ' + html.escape(t) for t, st in autop[:8]))


def finish(conn, res, src, ld, origin, mode, recent):
    title = clean(res.get('title') or '', 100)
    body = (res.get('body') or '').strip()
    if not title or len(body) < 100:
        log(f"too thin, not saved: {title!r}")
        return None
    cat = res.get('category') if res.get('category') in CATEGORIES else 'new-projects'
    subj = resolve_subject(res.get('subject_type'), clean(res.get('subject_title') or ''), res.get('subject_year'))
    if subj.get('related_tmdb_id') and banned_taken_down(conn, subj['related_tmdb_id']):
        log(f"film is on the takedown list, skipping: {title!r}")
        if not DRY:
            insert(conn, {'slug': 'skip-' + re.sub(r'\W', '', ld['ref']).lower()[:40], 'title': title, 'origin': origin, 'origin_ref': ld['ref'],
                          'status': 'skipped', 'skip_reason': 'film on takedown list'})
        return None
    points = [smart_cut(clean(p), 130) for p in (res.get('points') or []) if clean(p)][:4]
    conf = 'high' if src else 'low'
    status = 'published' if (mode.get('auto_publish') and src) else 'draft'
    row = {
        'slug': slugify(title) + '-' + datetime.datetime.now().strftime('%d%b').lower(),
        'title': title, 'summary': clean(res.get('summary') or '', 200), 'body': body, 'points': points,
        'category': cat, 'cover_image': subj.get('cover_image'), 'poster_image': subj.get('poster_image'),
        'related_tmdb_id': subj.get('related_tmdb_id'), 'related_type': subj.get('related_type'), 'film_title': subj.get('film_title'),
        'source_name': src['source'] if src else None, 'source_url': src['link'] if src else None,
        'origin': origin, 'origin_ref': ld['ref'], 'origin_text': ld['text'][:1500], 'confidence': conf, 'status': status,
        'published_at': datetime.datetime.now(datetime.timezone.utc) if status == 'published' else None,
    }
    if DRY:
        print(json.dumps({k: (str(v) if not isinstance(v, (str, list, type(None), int)) else v) for k, v in row.items()}, indent=1, ensure_ascii=False))
        return (title, status)
    nid = insert(conn, row)
    if not nid:
        return None
    recent.insert(0, title)
    log(f"saved #{nid} [{status}/{conf}] {title}")
    return (title, status)


if __name__ == '__main__':
    main()
