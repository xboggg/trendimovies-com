import Database from 'better-sqlite3';

// File details for the movie page's Download pop-up (WEBRip / BluRay, x265,
// 10-bit, audio, release group, dual audio). Read from the real file name in
// the local catalogue, the same read-only copy telegram-catalog.ts uses.
// Anything that goes wrong returns no details, and the pop-up simply shows
// fewer badges. A fresh connection per call, for the same reason as
// telegram-catalog.ts (the file is replaced on every sync).
const CATALOG_PATH = '/opt/trendimovies/bot/database/movies.db';

export interface FileSpec {
  source?: string;   // WEBRip, WEB-DL, BluRay, BDRip, HDRip, HDTV, REMUX
  codec?: string;    // x264, x265, AV1
  tenBit?: boolean;
  hdr?: string;      // HDR, Dolby Vision
  audio?: string;    // AAC, DD+ 5.1, DTS, Atmos ...
  group?: string;    // PSA, YTS, Pahe ...
  dual?: boolean;    // dual / multi audio named in the file
}

export function parseSpec(name: string): FileSpec {
  const n = ' ' + name.replace(/_+/g, '.') + ' ';
  const spec: FileSpec = {};

  if (/[.\s-]remux[.\s-]/i.test(n)) spec.source = 'REMUX';
  else if (/[.\s-]blu-?ray[.\s-]/i.test(n)) spec.source = 'BluRay';
  else if (/[.\s-](bdrip|brrip)[.\s-]/i.test(n)) spec.source = 'BDRip';
  else if (/[.\s-]web[-.\s]?dl[.\s-]/i.test(n)) spec.source = 'WEB-DL';
  else if (/[.\s-]web[-.\s]?rip[.\s-]/i.test(n)) spec.source = 'WEBRip';
  else if (/[.\s-]hd[-.\s]?rip[.\s-]/i.test(n)) spec.source = 'HDRip';
  else if (/[.\s-]hdtv[.\s-]/i.test(n)) spec.source = 'HDTV';
  else if (/[.\s-]web[.\s-]/i.test(n)) spec.source = 'WEB';

  if (/[.\s-](x265|h[.\s]?265|hevc)[.\s-]/i.test(n)) spec.codec = 'x265';
  else if (/[.\s-](x264|h[.\s]?264|avc)[.\s-]/i.test(n)) spec.codec = 'x264';
  else if (/[.\s-]av1[.\s-]/i.test(n)) spec.codec = 'AV1';

  if (/10[-.\s]?bit/i.test(n)) spec.tenBit = true;

  if (/dolby[.\s]?vision|[.\s-](dv|dovi)[.\s-]/i.test(n)) spec.hdr = 'Dolby Vision';
  else if (/[.\s-]hdr(10\+?)?[.\s-]/i.test(n)) spec.hdr = 'HDR';

  const ch = n.match(/[.\s-]([2578])[.\s]([01])[.\s-]/);
  const chCount = n.match(/[.\s-]([268])ch[.\s-]/i);
  const channels = ch ? `${ch[1]}.${ch[2]}` : chCount ? (chCount[1] === '6' ? '5.1' : chCount[1] === '8' ? '7.1' : '2.0') : '';
  let codecName = '';
  if (/atmos/i.test(n)) codecName = 'Atmos';
  else if (/[.\s-](ddp|dd\+|eac3)/i.test(n)) codecName = 'DD+';
  else if (/[.\s-](dd|ac3)[.\s]?\d?/i.test(n)) codecName = 'DD';
  else if (/dts[-.\s]?hd|dts[-.\s]?x/i.test(n)) codecName = 'DTS-HD';
  else if (/[.\s-]dts[.\s-]/i.test(n)) codecName = 'DTS';
  else if (/[.\s-]aac[.\s\d-]/i.test(n)) codecName = 'AAC';
  else if (/[.\s-]opus[.\s-]/i.test(n)) codecName = 'Opus';
  if (codecName || channels) spec.audio = [codecName, channels].filter(Boolean).join(' ');

  const g = name.trim().match(/-([A-Za-z0-9]{2,12})(?:\[[^\]]*\])?\.(?:mkv|mp4|avi|m4v)$/i);
  if (g && !/^(x26[45]|hevc|aac|ac3|dts|mkv)$/i.test(g[1])) spec.group = g[1].toUpperCase();
  else if (/pahe/i.test(name)) spec.group = 'PAHE';
  else if (/\byts\b|yify/i.test(name)) spec.group = 'YTS';

  if (/dual[.\s-]?audio|multi[.\s-]?audio|[.\s-]multi[.\s-]/i.test(n)) spec.dual = true;
  return spec;
}

// ids are the numbers at the end of /tgstream/stream/<id> links.
export function lookupSpecs(ids: number[]): Map<number, FileSpec> {
  const out = new Map<number, FileSpec>();
  const list = [...new Set(ids.filter(n => Number.isInteger(n) && n > 0))].slice(0, 4000);
  if (list.length === 0) return out;
  let db: Database.Database | null = null;
  try {
    db = new Database(CATALOG_PATH, { readonly: true, fileMustExist: true });
    for (let i = 0; i < list.length; i += 400) {
      const part = list.slice(i, i + 400);
      const rows = db
        .prepare(`SELECT id, file_name FROM movies WHERE id IN (${part.map(() => '?').join(',')})`)
        .all(...part) as { id: number; file_name: string }[];
      for (const r of rows) if (r.file_name) out.set(r.id, parseSpec(r.file_name));
    }
  } catch (e) {
    console.error('file specs lookup failed:', (e as Error).message);
  } finally {
    try { db?.close(); } catch (e) {}
  }
  return out;
}
