// Titles taken off the public site completely: not in search, lists or sitemaps, and the page answers "410 Gone".
// A title is hidden when its entry in the takedown list (see takedowns-store.ts) has  "hidden": true.
// Nothing is deleted. Remove that flag and the title comes back. The list is read live (no rebuild needed).
//
// A film is only matched when BOTH its TMDB number and its name (or its page slug) agree, so a series or a
// person that happens to share the number is never touched.
import { statSync } from 'fs';
import { readTakedowns, titleKey, TAKEDOWN_FILE } from './takedowns-store';

export type HiddenTitle = { id: number; key: string };

let cache: { mtime: number; list: HiddenTitle[] } = { mtime: -1, list: [] };

export function hiddenTitles(): HiddenTitle[] {
  try {
    const mtime = statSync(TAKEDOWN_FILE).mtimeMs;
    if (cache.mtime !== mtime) {
      const list = readTakedowns()
        .filter((e: any) => e.hidden === true)
        .map((e) => ({ id: Number(e.tmdb_id), key: titleKey(e.title) }))
        .filter((h) => h.id > 0 && h.key.length > 0);
      cache = { mtime, list };
    }
  } catch { /* keep the last good list */ }
  return cache.list;
}

export function isHiddenId(id: number): boolean {
  return hiddenTitles().some((h) => h.id === id);
}

// For lists that hold only a name and no TMDB number (the digital release calendar). The whole name must be the same.
export function isHiddenName(name: unknown): boolean {
  return typeof name === 'string' && hiddenTitles().some((h) => titleKey(name) === h.key);
}

function matches(item: any, h: HiddenTitle): boolean {
  if (!item || typeof item !== 'object') return false;
  if (item.media_type === 'tv') return false;
  if (Number(item.tmdb_id) !== h.id && Number(item.id) !== h.id) return false;
  if ([item.title, item.name, item.original_title].some((n) => typeof n === 'string' && titleKey(n) === h.key)) return true;
  // rows that carry only the page slug (movie sitemap): "best-pancakes-in-the-county-2026-1615596"
  return typeof item.slug === 'string' && titleKey(item.slug).startsWith(h.key + ' ') && item.slug.endsWith(String(h.id));
}

// Takes hidden titles out of every list inside the data. A single record on its own is left as it is.
export function withoutHidden<T>(data: T, list: HiddenTitle[] = hiddenTitles()): { data: T; removed: number } {
  let removed = 0;
  const walk = (v: any): any => {
    if (Array.isArray(v)) {
      const out: any[] = [];
      let changed = false;
      for (const item of v) {
        if (list.some((h) => matches(item, h) || matches(item?.movie, h) || matches(item?.movies, h))) {
          removed++;
          changed = true;
          continue;
        }
        const next = walk(item);
        if (next !== item) changed = true;
        out.push(next);
      }
      return changed ? out : v;
    }
    if (v && typeof v === 'object') {
      let copy: any = null;
      for (const k of Object.keys(v)) {
        const next = walk(v[k]);
        if (next !== v[k]) {
          copy = copy || { ...v };
          copy[k] = next;
        }
      }
      return copy || v;
    }
    return v;
  };
  if (!list.length) return { data, removed: 0 };
  const out = walk(data);
  return { data: out as T, removed };
}
