import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const TMDB_IMG = 'https://image.tmdb.org/t/p';

let fontBold: ArrayBuffer;
let fontRegular: ArrayBuffer;
try {
  const b1 = readFileSync(join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'));
  const b2 = readFileSync(join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'));
  fontBold    = b1.buffer.slice(b1.byteOffset, b1.byteOffset + b1.byteLength);
  fontRegular = b2.buffer.slice(b2.byteOffset, b2.byteOffset + b2.byteLength);
} catch (e) {
  console.error('OG font load error:', e);
}

async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const buf  = await res.arrayBuffer();
    const mime = res.headers.get('content-type') || 'image/jpeg';
    return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
  } catch { return null; }
}

// KEY RULE: In Satori, every <div> with children needs display:flex.
// Only <span> can hold text without display:flex.
// Use this helper for all container divs.
const row  = (extra: object = {}) => ({ display: 'flex' as const, flexDirection: 'row'    as const, ...extra });
const col  = (extra: object = {}) => ({ display: 'flex' as const, flexDirection: 'column' as const, ...extra });

// Text wrapper using span (no display needed for spans)
function txt(content: string, style: object = {}) {
  return { type: 'span', props: { style, children: [content] } };
}

// ── Movie / Series template ───────────────────────────────────────────────────

function movieTemplate(p: {
  title: string; year: string; rating: string; genres: string;
  poster: string | null; backdrop: string | null; isSeries: boolean;
}) {
  const ratingNum  = parseFloat(p.rating) || 0;
  const label      = p.isSeries ? 'SERIES' : 'MOVIE';
  const shortTitle = p.title.length > 36 ? p.title.slice(0, 34) + '…' : p.title;
  const genreList  = p.genres ? p.genres.split(',').slice(0, 3).map(g => g.trim()).filter(Boolean) : [];

  const metaRow: any[] = [];
  if (p.year) metaRow.push(txt(p.year, { fontSize: '20px', color: '#9ca3af' }));
  if (ratingNum > 0) {
    metaRow.push({
      type: 'div', props: {
        style: row({ alignItems: 'center', gap: '6px', marginLeft: p.year ? '20px' : '0' }),
        children: [
          txt('★', { fontSize: '18px', color: '#fbbf24' }),
          txt(p.rating, { fontSize: '20px', color: '#fbbf24', fontWeight: 700 }),
        ],
      },
    });
  }

  const genrePills = genreList.map(g => ({
    type: 'div', props: {
      style: row({
        padding: '5px 12px', borderRadius: '20px', fontSize: '13px', color: '#d1d5db',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
      }),
      children: [txt(g)],
    },
  }));

  const rightContent: any[] = [
    // Logo + label
    {
      type: 'div', props: {
        style: row({ alignItems: 'center', gap: '10px', marginBottom: '6px' }),
        children: [
          txt('👑', { fontSize: '22px' }),
          txt('TrendiMovies', { fontSize: '18px', color: 'rgba(255,255,255,0.55)', fontWeight: 700 }),
          {
            type: 'div', props: {
              style: row({
                padding: '3px 10px', borderRadius: '20px', marginLeft: '6px',
                fontSize: '11px', fontWeight: 700, background: 'rgba(229,9,20,0.2)',
                color: '#e50914', border: '1px solid rgba(229,9,20,0.4)',
              }),
              children: [txt(label)],
            },
          },
        ],
      },
    },
    // Title
    { type: 'div', props: { style: row({ marginTop: '14px' }), children: [txt(shortTitle, { fontSize: p.title.length > 25 ? '40px' : '48px', fontWeight: 700, color: '#fff', lineHeight: '1.15' })] } },
    // Meta row
    metaRow.length > 0 ? { type: 'div', props: { style: row({ alignItems: 'center', marginTop: '14px' }), children: metaRow } } : null,
    // Genre pills
    genrePills.length > 0 ? { type: 'div', props: { style: row({ gap: '8px', marginTop: '14px' }), children: genrePills } } : null,
    // URL
    { type: 'div', props: { style: row({ marginTop: '18px' }), children: [txt('trendimovies.com', { fontSize: '15px', color: '#4b5563' })] } },
  ].filter(Boolean);

  return {
    type: 'div', props: {
      style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Roboto', background: '#0a0a0f', position: 'relative', overflow: 'hidden' },
      children: [
        // Backdrop
        p.backdrop
          ? { type: 'img', props: { src: p.backdrop, style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 } } }
          : { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '4px', height: '4px' } } },
        // Left bar
        { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg,#e50914,#ff6b35)' } } },
        // Content
        {
          type: 'div', props: {
            style: row({ position: 'relative', alignItems: 'center', width: '100%', height: '100%', padding: '48px 56px 48px 60px', gap: '44px' }),
            children: [
              // Poster
              p.poster
                ? { type: 'img', props: { src: p.poster, style: { width: '230px', height: '345px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 } } }
                : { type: 'div', props: { style: row({ width: '230px', height: '345px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }), children: [txt('🎬', { fontSize: '60px' })] } },
              // Right
              { type: 'div', props: { style: col({ justifyContent: 'center', flex: 1 }), children: rightContent } },
            ],
          },
        },
      ],
    },
  };
}

// ── Event template ────────────────────────────────────────────────────────────

function eventTemplate(p: {
  name: string; subtitle: string; date: string;
  backdrop: string | null; color: string; emoji: string;
}) {
  const centerContent: any[] = [
    { type: 'div', props: { style: row({ alignItems: 'center', gap: '8px', marginBottom: '12px' }), children: [txt('👑', { fontSize: '22px' }), txt('TrendiMovies', { fontSize: '18px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 })] } },
    { type: 'div', props: { style: row({ justifyContent: 'center' }), children: [txt(p.emoji, { fontSize: '72px' })] } },
    { type: 'div', props: { style: row({ justifyContent: 'center', marginTop: '10px' }), children: [txt(p.name, { fontSize: '56px', fontWeight: 700, color: '#fff' })] } },
  ];
  if (p.subtitle) centerContent.push({ type: 'div', props: { style: row({ justifyContent: 'center', marginTop: '8px' }), children: [txt(p.subtitle, { fontSize: '24px', color: p.color, fontWeight: 700 })] } });
  if (p.date)     centerContent.push({ type: 'div', props: { style: row({ justifyContent: 'center', marginTop: '6px' }),     children: [txt(p.date, { fontSize: '20px', color: '#9ca3af' })] } });

  return {
    type: 'div', props: {
      style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Roboto', background: '#0a0a0f', position: 'relative', overflow: 'hidden' },
      children: [
        p.backdrop
          ? { type: 'img', props: { src: p.backdrop, style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 } } }
          : { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '4px', height: '4px' } } },
        { type: 'div', props: { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg,${p.color},${p.color}55)` } } },
        { type: 'div', props: { style: col({ position: 'relative', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '60px' }), children: centerContent } },
      ],
    },
  };
}

// ── List template (Trending / Box Office / Top Movies / Franchises / etc.) ──────

function listTemplate(p: {
  label: string; emoji: string; titles: string[];
  backdrop: string | null; color: string;
}) {
  const accent = p.color || '#e50914';
  // up to 4 titles, joined with a dot separator
  const titleLine = p.titles.slice(0, 4).map(t => t.length > 22 ? t.slice(0, 21) + '…' : t).join('  ·  ');

  const centerContent: any[] = [
    // Label row: emoji + big label
    {
      type: 'div', props: {
        style: row({ alignItems: 'center', gap: '18px' }),
        children: [
          txt(p.emoji, { fontSize: '56px' }),
          txt(p.label.toUpperCase(), { fontSize: '58px', fontWeight: 700, color: '#fff', lineHeight: '1.05' }),
        ],
      },
    },
  ];
  // Titles line (what's actually in the list)
  if (titleLine) {
    centerContent.push({
      type: 'div', props: {
        style: row({ marginTop: '22px', maxWidth: '1000px' }),
        children: [txt(titleLine, { fontSize: '28px', color: '#d1d5db', lineHeight: '1.3' })],
      },
    });
  }
  // Branding row
  centerContent.push({
    type: 'div', props: {
      style: row({ alignItems: 'center', gap: '12px', marginTop: '40px' }),
      children: [
        txt('👑', { fontSize: '26px' }),
        txt('TrendiMovies', { fontSize: '24px', fontWeight: 700, color: '#fff' }),
        txt('trendimovies.com', { fontSize: '18px', color: '#6b7280', marginLeft: '14px' }),
      ],
    },
  });

  return {
    type: 'div', props: {
      style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Roboto', background: '#0a0a0f', position: 'relative', overflow: 'hidden' },
      children: [
        // Backdrop background (dimmed)
        p.backdrop
          ? { type: 'img', props: { src: p.backdrop, style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 } } }
          : { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '4px', height: '4px' } } },
        // dark gradient overlay for text legibility
        { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.7) 60%, rgba(10,10,15,0.5) 100%)' } } },
        // accent bar
        { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: `linear-gradient(180deg,${accent},${accent}66)` } } },
        // content
        { type: 'div', props: { style: col({ position: 'relative', justifyContent: 'center', width: '100%', height: '100%', padding: '60px 70px' }), children: centerContent } },
      ],
    },
  };
}

// ── Digital releases template (poster collage + headline) ──────────────────────

function digitalTemplate(p: {
  posters: (string | null)[];
  eyebrow?: string; eyebrowEmoji?: string; accent?: string;
  headline?: string; subtitle?: string; url?: string;
}) {
  const posters = p.posters.filter(Boolean).slice(0, 5) as string[];
  const accent = p.accent || '#f7d000';
  const eyebrow = p.eyebrow || 'HOME RELEASE CALENDAR';
  const eyebrowEmoji = p.eyebrowEmoji || '📀';
  const headline = p.headline || 'Digital & HD Release Dates 2026';
  const subtitle = p.subtitle || 'Every movie’s digital drop — month by month, with countdowns';
  const url = p.url || 'trendimovies.com/digital-releases';
  // accent as translucent bg/border for the eyebrow pill — derive from the hex so
  // ANY accent colour works (gold, purple, red, green…), not just two hardcoded ones.
  const _hex = (accent || '#f7d000').replace('#', '');
  const _r = parseInt(_hex.slice(0, 2) || 'f7', 16);
  const _g = parseInt(_hex.slice(2, 4) || 'd0', 16);
  const _b = parseInt(_hex.slice(4, 6) || '00', 16);
  const accentBg = `rgba(${_r},${_g},${_b},0.16)`;
  const accentBorder = `rgba(${_r},${_g},${_b},0.45)`;

  // Poster strip across the full canvas as the visual backdrop.
  const posterStrip = {
    type: 'div', props: {
      style: row({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }),
      children: posters.length
        ? posters.map((src) => ({
            type: 'img', props: { src, style: { width: `${100 / posters.length}%`, height: '100%', objectFit: 'cover' } },
          }))
        : [{ type: 'div', props: { style: { width: '100%', height: '100%', background: '#16161f' } } }],
    },
  };

  return {
    type: 'div', props: {
      style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Roboto', background: '#0a0a0f', position: 'relative', overflow: 'hidden' },
      children: [
        posterStrip,
        // Dark gradient bottom→top so the headline stays readable over the posters.
        { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(0deg, rgba(10,10,15,0.97) 18%, rgba(10,10,15,0.55) 55%, rgba(10,10,15,0.35) 100%)' } } },
        // Accent bar at the top.
        { type: 'div', props: { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: `linear-gradient(90deg,${accent},${accent}99)` } } },
        // Content (anchored bottom-left)
        {
          type: 'div', props: {
            style: col({ position: 'relative', justifyContent: 'flex-end', width: '100%', height: '100%', padding: '0 64px 56px 64px' }),
            children: [
              // Eyebrow pill
              {
                type: 'div', props: {
                  style: row({ alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '24px', background: accentBg, border: `1px solid ${accentBorder}`, marginBottom: '16px' }),
                  children: [txt(eyebrowEmoji, { fontSize: '20px' }), txt(eyebrow, { fontSize: '16px', fontWeight: 700, color: accent })],
                },
              },
              // Headline
              { type: 'div', props: { style: row({ maxWidth: '1010px' }), children: [txt(headline, { fontSize: '62px', fontWeight: 700, color: '#fff', lineHeight: '1.05' })] } },
              // Subtitle
              { type: 'div', props: { style: row({ marginTop: '14px', maxWidth: '920px' }), children: [txt(subtitle, { fontSize: '25px', color: '#d1d5db' })] } },
              // Branding row
              {
                type: 'div', props: {
                  style: row({ alignItems: 'center', gap: '12px', marginTop: '26px' }),
                  children: [
                    txt('👑', { fontSize: '24px' }),
                    txt('TrendiMovies', { fontSize: '24px', fontWeight: 700, color: '#fff' }),
                    txt(url, { fontSize: '18px', color: '#9ca3af', marginLeft: '12px' }),
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ── Default template ──────────────────────────────────────────────────────────

function reviewTemplate(p: {
  headline: string; movieTitle: string; poster: string | null; backdrop: string | null;
  accent: string; rt?: string; box?: string; genre?: string; year?: string;
}) {
  const accent = p.accent || '#dc2626';
  return {
    type: 'div',
    props: {
      style: { width: '1200px', height: '630px', display: 'flex', position: 'relative',
        background: '#0a0a0c', fontFamily: 'Roboto', overflow: 'hidden' },
      children: [
        // ambient blurred backdrop glow
        p.backdrop ? { type: 'img', props: { src: p.backdrop, style: {
          position: 'absolute', top: '-80px', left: '-80px', width: '1360px', height: '520px',
          objectFit: 'cover', filter: 'blur(60px) brightness(0.5) saturate(1.4)', opacity: 0.55 } } } : null,
        { type: 'div', props: { style: { position: 'absolute', inset: '0', display: 'flex',
          background: `radial-gradient(1200px 560px at 78% -8%, ${accent}44, transparent 60%)` } } },
        { type: 'div', props: { style: { position: 'absolute', inset: '0', display: 'flex',
          background: 'linear-gradient(180deg, rgba(10,10,12,0.35), #0a0a0c 78%)' } } },
        // content row
        { type: 'div', props: { style: { position: 'relative', display: 'flex', width: '100%',
          height: '100%', padding: '54px 60px', alignItems: 'center', gap: '48px' },
          children: [
            // poster
            p.poster ? { type: 'div', props: { style: { display: 'flex', flexShrink: 0,
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px ${accent}55` },
              children: [ { type: 'img', props: { src: p.poster, style: { width: '350px', height: '522px', objectFit: 'cover' } } } ] } } : null,
            // text
            { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', flex: 1 },
              children: [
                { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: '12px',
                  color: accent, fontSize: '22px', fontWeight: 800, letterSpacing: '3px', marginBottom: '20px' },
                  children: [
                    { type: 'div', props: { style: { display: 'flex', width: '12px', height: '12px', borderRadius: '50%', background: accent } } },
                    { type: 'div', props: { style: { display: 'flex' }, children: ['TRENDIMOVIES REVIEW'] } },
                  ] } },
                { type: 'div', props: { style: { display: 'flex', color: '#ffffff', fontSize: '64px',
                  fontWeight: 800, lineHeight: 1.02, letterSpacing: '-2px', marginBottom: '22px' },
                  children: [p.headline] } },
                { type: 'div', props: { style: { display: 'flex', gap: '16px', marginBottom: '30px' },
                  children: [
                    p.rt ? { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e', borderRadius: '16px', padding: '14px 22px' },
                      children: [
                        { type: 'div', props: { style: { display: 'flex', color: '#22c55e', fontSize: '34px', fontWeight: 800 }, children: [p.rt] } },
                        { type: 'div', props: { style: { display: 'flex', color: '#9ca3af', fontSize: '14px', letterSpacing: '1px' }, children: ['ROTTEN TOMATOES'] } },
                      ] } } : null,
                    p.box ? { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: 'rgba(245,158,11,0.12)', border: '2px solid #f59e0b', borderRadius: '16px', padding: '14px 22px' },
                      children: [
                        { type: 'div', props: { style: { display: 'flex', color: '#f59e0b', fontSize: '34px', fontWeight: 800 }, children: [p.box] } },
                        { type: 'div', props: { style: { display: 'flex', color: '#9ca3af', fontSize: '14px', letterSpacing: '1px' }, children: ['BOX OFFICE'] } },
                      ] } } : null,
                  ] } },
                { type: 'div', props: { style: { display: 'flex', color: '#c3c0cc', fontSize: '24px', fontWeight: 500 },
                  children: [`${p.movieTitle}${p.year ? ' (' + p.year + ')' : ''}${p.genre ? '  ·  ' + p.genre : ''}`] } },
              ] } },
          ] } },
      ].filter(Boolean),
    },
  };
}

function defaultTemplate() {
  return {
    type: 'div', props: {
      style: { display: 'flex', width: '1200px', height: '630px', fontFamily: 'Roboto', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0a0f 100%)', position: 'relative', overflow: 'hidden' },
      children: [
        { type: 'div', props: { style: { position: 'absolute', top: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(229,9,20,0.25),rgba(229,9,20,0) 70%)' } } },
        { type: 'div', props: { style: { position: 'absolute', bottom: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(229,9,20,0.12),rgba(229,9,20,0) 70%)' } } },
        {
          type: 'div', props: {
            style: col({ position: 'relative', alignItems: 'center', gap: '20px' }),
            children: [
              { type: 'div', props: { style: row({ justifyContent: 'center' }), children: [txt('👑', { fontSize: '88px' })] } },
              { type: 'div', props: { style: row({ justifyContent: 'center' }), children: [txt('TrendiMovies', { fontSize: '68px', fontWeight: 700, color: '#fff' })] } },
              { type: 'div', props: { style: row({ justifyContent: 'center' }), children: [txt('Stream the latest movies & series', { fontSize: '26px', color: '#9ca3af' })] } },
              {
                type: 'div', props: {
                  style: row({ marginTop: '8px', padding: '10px 28px', borderRadius: '28px', background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.35)', justifyContent: 'center' }),
                  children: [txt('trendimovies.com', { fontSize: '18px', color: '#e50914', fontWeight: 700 })],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ url }) => {
  const p        = url.searchParams;
  const type     = p.get('type') || 'default';
  const title    = p.get('title') || '';
  const year     = p.get('year') || '';
  const rating   = p.get('rating') || '';
  const poster   = p.get('poster') || '';
  const backdrop = p.get('backdrop') || '';
  const genres   = p.get('genres') || '';
  const name     = p.get('name') || '';
  const subtitle = p.get('subtitle') || '';
  const date     = p.get('date') || '';
  const color    = p.get('color') || '#e50914';
  const emoji    = p.get('emoji') || '🎬';
  const label    = p.get('label') || '';
  const titles   = (p.get('titles') || '').split('|').map(t => t.trim()).filter(Boolean);
  // pipe-separated TMDB poster paths (e.g. /abc.jpg|/def.jpg) for the digital collage
  const posters  = (p.get('posters') || '').split('|').map(t => t.trim()).filter(Boolean);
  // optional overrides for the digital/collage template (used by the schedule page)
  const eyebrow      = p.get('eyebrow') || '';
  const eyebrowEmoji = p.get('eyebrowEmoji') || '';
  const headline     = p.get('headline') || '';
  const ogUrl        = p.get('ogurl') || '';

  try {
    const [posterData, backdropData] = await Promise.all([
      poster   ? toDataUri(`${TMDB_IMG}/w342${poster}`)   : Promise.resolve(null),
      backdrop ? toDataUri(`${TMDB_IMG}/w780${backdrop}`) : Promise.resolve(null),
    ]);

    let node: any;
    if (type === 'movie' || type === 'series') {
      node = movieTemplate({ title, year, rating, genres, poster: posterData, backdrop: backdropData, isSeries: type === 'series' });
    } else if (type === 'event') {
      node = eventTemplate({ name, subtitle, date, color, emoji, backdrop: backdropData });
    } else if (type === 'list') {
      node = listTemplate({ label, emoji, titles, color, backdrop: backdropData });
    } else if (type === 'digital') {
      // Fetch up to 5 posters in parallel for the collage backdrop. Retry once
      // (with a longer timeout) so a single slow TMDB fetch doesn't leave the
      // OG image blank — social platforms cache the first scrape, so a blank one
      // would stick.
      const fetchPoster = async (path: string): Promise<string | null> => {
        let d = await toDataUri(`${TMDB_IMG}/w342${path}`);
        if (!d) {
          try {
            const res = await fetch(`${TMDB_IMG}/w342${path}`, { signal: AbortSignal.timeout(8000) });
            if (res.ok) {
              const buf = await res.arrayBuffer();
              const mime = res.headers.get('content-type') || 'image/jpeg';
              d = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
            }
          } catch { /* leave null */ }
        }
        return d;
      };
      const posterDatas = await Promise.all(posters.slice(0, 5).map(fetchPoster));
      node = digitalTemplate({
        posters: posterDatas,
        eyebrow: eyebrow || undefined,
        eyebrowEmoji: eyebrowEmoji || undefined,
        headline: headline || undefined,
        subtitle: subtitle || undefined,
        url: ogUrl || undefined,
        accent: p.get('accent') || undefined,
      });
    } else if (type === 'review') {
      // Fetch the review by slug from PostgREST, then render editorial OG.
      const PGRST = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
      const rslug = p.get('slug') || '';
      let rv: any = null;
      try {
        const r = await fetch(`${PGRST}/movie_reviews?slug=eq.${encodeURIComponent(rslug)}&limit=1`);
        if (r.ok) { const rows = await r.json(); rv = Array.isArray(rows) && rows.length ? rows[0] : null; }
      } catch { rv = null; }
      const rPoster = rv?.poster_path ? await toDataUri(`${TMDB_IMG}/w500${rv.poster_path}`) : null;
      const rBack = rv?.backdrop_path ? await toDataUri(`${TMDB_IMG}/w780${rv.backdrop_path}`) : null;
      node = reviewTemplate({
        headline: rv?.headline || 'Movie Review',
        movieTitle: rv?.title || '',
        poster: rPoster, backdrop: rBack,
        accent: rv?.accent || '#dc2626',
        rt: rv?.rt_score || undefined, box: rv?.box_office || undefined,
        genre: rv?.genre || undefined, year: rv?.year ? String(rv.year) : undefined,
      });
    } else {
      node = defaultTemplate();
    }

    const svg = await satori(node, {
      width: 1200, height: 630,
      fonts: [
        { name: 'Roboto', data: fontBold,    weight: 700, style: 'normal' },
        { name: 'Roboto', data: fontRegular, weight: 400, style: 'normal' },
      ],
      // Render emojis (🔥 👑 ✨ …) as Twemoji SVGs — without this satori shows tofu boxes.
      loadAdditionalAsset: async (code: string, segment: string) => {
        if (code !== 'emoji') return segment;
        try {
          const cp = Array.from(segment)
            .map((c) => c.codePointAt(0)!.toString(16))
            .filter((h) => h !== 'fe0f') // drop variation selector
            .join('-');
          const r = await fetch(`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}.svg`, { signal: AbortSignal.timeout(4000) });
          if (!r.ok) return segment;
          const svgTxt = await r.text();
          return `data:image/svg+xml;base64,${Buffer.from(svgTxt).toString('base64')}`;
        } catch { return segment; }
      },
    });

    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

    // WhatsApp won't render OG images over ~600KB and prefers JPEG. The photo-heavy
    // cards (poster collage / list with backdrop) blow past that as PNG (~0.8–1MB),
    // so re-encode those to a compact JPEG (well under the cap). The plain gradient
    // default + the smaller movie/series/event cards keep their original PNG.
    if (type === 'digital' || type === 'list' || type === 'review') {
      const jpg = await sharp(png).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
      return new Response(jpg, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: any) {
    console.error('OG image error:', err?.message || err);
    return new Response('OG image generation failed', { status: 500 });
  }
};
