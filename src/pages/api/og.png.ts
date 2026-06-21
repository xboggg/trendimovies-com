import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
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

// ── Default template ──────────────────────────────────────────────────────────

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
