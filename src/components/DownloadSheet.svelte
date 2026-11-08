<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Download, Magnet, FileText, X, Globe, Flag, Check } from 'lucide-svelte';

  // The movie page's Download pop-up: a sheet that slides up from the bottom
  // (centred window on a big screen). Same links, sizes, language tags and
  // subtitle files as DownloadSection (which the series pages still use).
  // It is always in the page HTML, closed; the page's Download buttons open
  // it by sending the "tm:downloads" event, and #download in the address
  // opens it on load.
  interface DownloadLink {
    id: number;
    quality: string;
    file_size: string | null;
    url: string;
    source?: string | number;
    type?: string;
    variant?: string;
    language?: string;
    language_tag?: string | null;
    subtitle_burn_status?: 'hardcoded' | 'embedded_multi' | 'embedded_eng' | null;
    spec?: { source?: string; codec?: string; tenBit?: boolean; hdr?: string; audio?: string; group?: string; dual?: boolean } | null;
  }
  interface SubtitleLink {
    id: number;
    file_name: string | null;
    file_size: string | null;
    telegram_file_id: string;
  }

  export let links: DownloadLink[] = [];
  export let subtitles: SubtitleLink[] = [];
  export let originalTitle: string = '';
  // The series page shows which episode these files are for.
  export let heading: string = 'Available Downloads';
  export let subheading: string = '';
  export let hashOpen: boolean = true;
  // "movie" on the movie page, "show" on the series page (used in one sentence).
  export let noun: string = 'movie';

  const ORDER: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2, hdrip: 3 };

  const LANGUAGE_NAMES: Record<string, string> = {
    hi: 'Hindi', ml: 'Malayalam', ta: 'Tamil', ko: 'Korean', ja: 'Japanese',
    fr: 'French', zh: 'Chinese', es: 'Spanish', te: 'Telugu', it: 'Italian',
    cn: 'Chinese', tl: 'Tagalog', de: 'German', bn: 'Bengali', id: 'Indonesian',
    pa: 'Punjabi', th: 'Thai', kn: 'Kannada', ru: 'Russian', tr: 'Turkish',
    da: 'Danish', sv: 'Swedish', mr: 'Marathi', pt: 'Portuguese', pl: 'Polish',
    nl: 'Dutch', ms: 'Malay', no: 'Norwegian', ar: 'Arabic', gu: 'Gujarati',
    fa: 'Persian', ro: 'Romanian', fi: 'Finnish', el: 'Greek', hu: 'Hungarian',
    uk: 'Ukrainian', vi: 'Vietnamese', ur: 'Urdu', cs: 'Czech', he: 'Hebrew',
    or: 'Odia', si: 'Sinhala', is: 'Icelandic', zu: 'Zulu', ca: 'Catalan',
    et: 'Estonian', sr: 'Serbian', sk: 'Slovak', mn: 'Mongolian', lv: 'Latvian',
    af: 'Afrikaans', mk: 'Macedonian', yo: 'Yoruba', as: 'Assamese',
    ku: 'Kurdish', bs: 'Bosnian', hr: 'Croatian', lt: 'Lithuanian',
    ne: 'Nepali', ga: 'Irish', eu: 'Basque', xh: 'Xhosa', ka: 'Georgian',
    mt: 'Maltese', mi: 'Maori', bg: 'Bulgarian', jv: 'Javanese', kk: 'Kazakh',
    cy: 'Welsh', sq: 'Albanian', sw: 'Swahili', sl: 'Slovenian',
  };

  // Same rule as DownloadSection: the filename's own tag wins, then the
  // film's original language; an English original with no tag shows "EN".
  function languageLabel(l: DownloadLink): string {
    if (l.language_tag) return l.language_tag;
    if (l.language && l.language !== 'en') return LANGUAGE_NAMES[l.language] || l.language.toUpperCase();
    return 'EN';
  }
  function isMulti(l: DownloadLink): boolean {
    const t = l.language_tag || '';
    return (!!t && (t.includes('+') || /DUAL|MULTI/i.test(t))) || !!l.spec?.dual;
  }
  // The small grey badges: what the file is made of.
  function specChips(l: DownloadLink): string[] {
    const sp = l.spec || {};
    return [sp.source || variantLabel(l), sp.codec, sp.tenBit ? '10-bit' : '', sp.hdr, sp.audio, sp.group].filter(Boolean) as string[];
  }
  function burnLabel(l: DownloadLink): string {
    if (l.subtitle_burn_status === 'hardcoded') return 'Hardcoded subs';
    if (l.subtitle_burn_status === 'embedded_multi') return 'Multi-subs included';
    if (l.subtitle_burn_status === 'embedded_eng') return 'English subs included';
    return '';
  }
  function variantLabel(l: DownloadLink): string {
    if (l.variant === 'webdl') return 'WEB-DL';
    if (l.variant === 'webrip') return 'WEBRip';
    if (l.variant === 'bluray') return 'BluRay';
    return '';
  }
  const DELIVERY_BOTS = ['trendimovies_dl_bot', 'trendimovies_dl2_bot'];
  function telegramUrl(l: DownloadLink): string | null {
    const m = (l.url || '').match(/\/tgstream\/stream\/(\d+)/);
    if (!m) return null;
    return `https://t.me/${DELIVERY_BOTS[parseInt(m[1], 10) % DELIVERY_BOTS.length]}?start=${m[1]}`;
  }
  function parseMb(s: string | null): number {
    const m = (s || '').match(/([\d.]+)\s*(GB|MB|KB)/i);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    const u = m[2].toUpperCase();
    return u === 'GB' ? n * 1024 : u === 'KB' ? n / 1024 : n;
  }
  function subQuality(s: SubtitleLink): string {
    const m = (s.file_name || '').match(/\b(2160p|1080p|720p|480p)\b/i);
    return m ? m[1].toLowerCase() : '';
  }
  function subHref(s: SubtitleLink): string {
    return `https://trendimovies.com/tgstream/stream/${s.telegram_file_id}`;
  }

  $: rows = links
    .map(l => ({ l, torrent: l.source === 'torrent' || l.type === 'torrent', lang: languageLabel(l), mb: parseMb(l.file_size), tg: telegramUrl(l) }))
    .sort((a, b) => (ORDER[a.l.quality] ?? 4) - (ORDER[b.l.quality] ?? 4));
  $: bestId = rows.find(r => !r.torrent)?.l.id;

  // "Report a problem" on a file: one tap on a reason sends it to /api/report-file.
  const REPORT_REASONS: [string, string][] = [
    ['wont_open', "Won't open or download"],
    ['wrong_film', 'Wrong film or episode'],
    ['bad_quality', 'Bad picture or quality'],
    ['no_sound', 'No sound or wrong language'],
    ['other', 'Something else'],
  ];
  let reportFor: number | null = null;
  let reportState: Record<number, 'sending' | 'done' | 'error'> = {};
  async function sendReport(linkId: number, reason: string) {
    reportState = { ...reportState, [linkId]: 'sending' };
    try {
      const res = await fetch('/api/report-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, reason }),
      });
      const d = await res.json().catch(() => ({}));
      reportState = { ...reportState, [linkId]: d && d.success ? 'done' : 'error' };
    } catch (e) {
      reportState = { ...reportState, [linkId]: 'error' };
    }
    if (reportState[linkId] === 'done') reportFor = null;
  }

  let audio = '';
  let quality = '';
  let sort: 'best' | 'small' | 'large' = 'best';

  $: audios = (() => {
    const m = new Map<string, number>();
    rows.forEach(r => m.set(r.lang, (m.get(r.lang) || 0) + 1));
    return [...m.entries()];
  })();
  $: byAudio = audio ? rows.filter(r => r.lang === audio) : rows;
  $: qualities = (() => {
    const m = new Map<string, number>();
    byAudio.forEach(r => m.set(r.l.quality, (m.get(r.l.quality) || 0) + 1));
    return [...m.entries()].sort((a, b) => (ORDER[a[0]] ?? 4) - (ORDER[b[0]] ?? 4));
  })();
  // Open on the best quality we have (720p first), unless the person chose one.
  $: if (!qualities.some(q => q[0] === quality)) quality = qualities[0]?.[0] ?? '';
  $: shown = (() => {
    const list = byAudio.filter(r => r.l.quality === quality);
    if (sort === 'small') return [...list].sort((a, b) => a.mb - b.mb);
    if (sort === 'large') return [...list].sort((a, b) => b.mb - a.mb);
    return list;
  })();
  $: subsMatch = subtitles.filter(s => subQuality(s) === quality);
  $: subsShown = subsMatch.length ? subsMatch : subtitles;
  $: showOriginal = !!originalTitle;

  function stubSmall(q: string): string {
    return q === '2160p' ? '4K' : q === 'hdrip' ? 'HD' : q;
  }

  // The quality tiles: a colour, a short label, a plain note and the size.
  function tileKey(q: string): string {
    return q === '720p' ? 'a' : q === '1080p' ? 'b' : q === '2160p' ? 'c' : 'd';
  }
  function tileLabel(q: string): string {
    return q === '720p' ? 'HD' : q === '1080p' ? 'FULL HD' : q === '2160p' ? 'ULTRA HD' : q === '480p' ? 'SMALL' : 'OLDER';
  }
  function tileNote(q: string): string {
    return q === '720p' ? 'Small file, saves data' : q === '1080p' ? 'Sharper picture' : q === '2160p' ? 'Biggest and sharpest' : q === '480p' ? 'Smallest file, softer picture' : 'Older quality';
  }
  $: tileSizes = Object.fromEntries(qualities.map(([q]) => {
    const list = byAudio.filter(r => r.l.quality === q && r.l.file_size);
    if (!list.length) return [q, ''];
    const small = [...list].sort((a, b) => a.mb - b.mb)[0];
    return [q, list.length > 1 ? 'from ' + small.l.file_size : small.l.file_size];
  }));

  let open = false;
  let sheet: HTMLElement;
  let closeBtn: HTMLButtonElement;
  let lastFocus: HTMLElement | null = null;

  async function openSheet() {
    if (open) return;
    lastFocus = document.activeElement as HTMLElement | null;
    open = true;
    document.documentElement.style.overflow = 'hidden';
    if (!(history.state && history.state.tmSheet) && location.hash !== '#download') {
      try { history.pushState({ tmSheet: 1 }, '', location.pathname + location.search + '#download'); } catch (e) {}
    }
    await tick();
    closeBtn?.focus();
  }
  function finishClose() {
    if (!open) return;
    open = false;
    document.documentElement.style.overflow = '';
    lastFocus?.focus?.();
  }
  function closeSheet() {
    if (history.state && history.state.tmSheet) history.back();
    else {
      finishClose();
      if (location.hash === '#download') {
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      }
    }
  }
  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key !== 'Tab' || !sheet) return;
    const f = Array.from(sheet.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Move the sheet to the page root so it sits above the page and the site header
  // (inside the episode list it was trapped under the rest of the page).
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return { destroy() { node.remove(); } };
  }

  onMount(() => {
    const onOpen = () => openSheet();
    const onPop = () => { if (open && !(history.state && history.state.tmSheet)) finishClose(); };
    window.addEventListener('tm:downloads', onOpen);
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    if (hashOpen && location.hash === '#download') openSheet();
    return () => {
      window.removeEventListener('tm:downloads', onOpen);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  });
</script>

<div class="ds" class:open aria-hidden={!open} use:portal>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="scrim" on:click={closeSheet}></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ds-h" bind:this={sheet} inert={!open}>
    <div class="grab" aria-hidden="true"></div>
    <div class="hd">
      <h2 id="ds-h">{heading}{#if subheading}<small>{' · ' + subheading}</small>{/if}</h2>
      <button type="button" class="x" bind:this={closeBtn} on:click={closeSheet} aria-label="Close"><X size={20} /></button>
    </div>

    <div class="scroll">
      {#if links.length > 0 || subtitles.length > 0}
        {#if showOriginal}
          <p class="note"><Globe size={14} /><span>Original title: <b>{originalTitle}</b>. The downloaded file may use this title. It is the same {noun}.</span></p>
        {/if}

        {#if links.length > 0}
          {#if audios.length > 1}
            <div class="lbl">Audio</div>
            <div class="chips">
              {#each audios as [a, n]}
                <button type="button" class="chip" class:on={audio === a} aria-pressed={audio === a} on:click={() => (audio = audio === a ? '' : a)}>{a} <small>({n})</small></button>
              {/each}
            </div>
          {/if}

          <div class="lbl">Quality</div>
          <div class="tiles" class:odd={qualities.length % 2 === 1} class:many={qualities.length > 2}>
            {#each qualities as [q, n]}
              <button type="button" class="tile t-{tileKey(q)}" class:on={quality === q} aria-pressed={quality === q} on:click={() => (quality = q)}>
                <span class="ck" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                <span class="tlb">{tileLabel(q)}</span>
                <b>{q === 'hdrip' ? 'HDRip' : stubSmall(q)}</b>
                <span class="tsub"><small>{tileNote(q)}</small><span class="tgb">{tileSizes[q] || ''}</span></span>
              </button>
            {/each}
          </div>

          <div class="sortrow">
            <label for="ds-sort">Sort</label>
            <select id="ds-sort" bind:value={sort}>
              <option value="best">Best first</option>
              <option value="small">Smallest first</option>
              <option value="large">Largest first</option>
            </select>
          </div>

          <ul class="rows">
            {#each shown as r (r.l.id)}
              <li class="row" class:best={r.l.id === bestId}>
                <div class="l1">
                  <span class="qp">{stubSmall(r.l.quality)}</span>
                  <span class="sz">{r.l.file_size || ''}</span>
                  {#if r.torrent}<span class="vr">Torrent</span>{/if}
                </div>
                <div class="badges">
                  {#if isMulti(r.l)}
                    <span class="lg w">{r.lang}</span><span class="lg p">MULTIPLE AUDIO</span>
                  {:else}
                    <span class="lg">{r.lang}</span>
                  {/if}
                  {#if burnLabel(r.l)}<span class="lg q">{burnLabel(r.l)}</span>{/if}
                  {#each specChips(r.l) as c}<span class="sp">{c}</span>{/each}
                </div>
                <div class="go">
                  {#if r.torrent}
                    <a class="btn dl solo" href={r.l.url} target="_blank" rel="noopener"><Magnet size={15} /> Torrent</a>
                  {:else}
                    {#if r.tg}<a class="btn tg" href={r.tg} target="_blank" rel="noopener noreferrer">Get in Telegram</a>{/if}
                    <a class="btn dl" class:solo={!r.tg} href={r.l.url} download target="_blank" rel="noopener"><Download size={15} /> Direct</a>
                  {/if}
                </div>
                {#if !r.torrent}
                  <div class="rp">
                    {#if reportState[r.l.id] === 'done'}
                      <span class="rp-ok">Thanks. We will check this file.</span>
                    {:else}
                      <button type="button" class="rp-btn" on:click={() => (reportFor = r.l.id)}>
                        <Flag size={13} /> Report a problem
                      </button>
                    {/if}
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}

        {#if subtitles.length > 0}
          <div class="lbl subs">Subtitles{subsMatch.length ? ' for ' + quality : ''}</div>
          <div class="chips">
            {#each subsShown as s}
              <a class="chip link" href={subHref(s)} download><FileText size={14} /> {subQuality(s) ? subQuality(s) + ' SRT' : 'SRT'}{#if s.file_size}{' · ' + s.file_size}{/if}</a>
            {/each}
          </div>
        {:else if links.length > 0}
          <p class="nosub">No separate subtitle file for this film yet. Some files have subtitles built in (look for the subs badge).</p>
        {/if}
      {:else}
        <div class="empty"><Download size={28} /><p>Downloads coming soon</p></div>
      {/if}
    </div>
    <p class="foot">Pick a quality, then Telegram (fastest) or Direct.</p>

    {#if reportFor !== null}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="rpm-scrim" on:click|self={() => (reportFor = null)}>
        <div class="rpm" role="dialog" aria-modal="true" aria-labelledby="rpm-h">
          <h3 id="rpm-h">What is wrong with this file?</h3>
          {#each REPORT_REASONS as [code, label]}
            <button type="button" class="rp-opt" disabled={reportState[reportFor] === 'sending'} on:click={() => sendReport(reportFor ?? 0, code)}>{label}</button>
          {/each}
          {#if reportState[reportFor] === 'error'}<span class="rp-err">Could not send. Please try again.</span>{/if}
          <button type="button" class="rp-cancel" on:click={() => (reportFor = null)}>Cancel</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .ds { display: none; position: fixed; inset: 0; z-index: 100; }
  .ds.open { display: flex; align-items: flex-end; justify-content: center; }
  .scrim { position: absolute; inset: 0; background: rgba(5, 7, 10, 0.66); backdrop-filter: blur(3px); animation: fade 0.2s ease-out; }
  .sheet {
    position: relative; width: 100%; max-width: 640px; max-height: 90vh; max-height: 90dvh;
    display: flex; flex-direction: column;
    background: #12151d; color: #eef0f5; border: 1px solid #262c3b; border-bottom: 0;
    border-radius: 24px 24px 0 0; box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.6);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    animation: up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (min-width: 700px) {
    .ds.open { align-items: center; }
    .sheet { border-radius: 22px; border-bottom: 1px solid #262c3b; max-height: 86vh; }
  }
  @keyframes up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .sheet, .scrim { animation: none; } }
  .grab { width: 44px; height: 4px; border-radius: 4px; background: #3a4154; margin: 9px auto 0; flex: none; }
  .hd { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 8px; flex: none; }
  .hd h2 { margin: 0; font-family: 'Bricolage Grotesque', Inter, sans-serif; font-weight: 700; font-size: 22px; min-width: 0; }
  .hd small { font-weight: 500; color: #98a1b4; font-size: 14px; margin-left: 4px; }
  .x { appearance: none; background: none; border: 0; color: #98a1b4; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; }
  .x:hover { color: #fff; background: #1a1f2b; }
  .scroll { overflow-y: auto; padding: 0 20px 14px; overscroll-behavior: contain; }
  .lbl { margin: 14px 0 8px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #98a1b4; }
  .lbl.subs { margin-top: 20px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    appearance: none; cursor: pointer; font: inherit; font-weight: 600; font-size: 14px; color: #eef0f5; text-decoration: none;
    background: #1a1f2b; border: 1px solid #262c3b; border-radius: 999px; padding: 9px 16px; display: inline-flex; align-items: center; gap: 6px;
  }
  .chip small { color: #98a1b4; font-weight: 500; }
  .chip.on { background: #f3efe6; color: #0b0d12; border-color: #f3efe6; }
  .chip.on small { color: #4a4654; }
  .chip.link { font-weight: 500; font-size: 13px; }
  .chip:hover:not(.on) { border-color: #4a5268; }
  .chip:focus-visible, .btn:focus-visible, select:focus-visible { outline: 2px solid #f6b93b; outline-offset: 2px; }
  .sortrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 16px 0 6px; padding-top: 14px; border-top: 1px solid #262c3b; }
  .sortrow label { font-size: 13px; color: #98a1b4; }
  select { background: #1a1f2b; color: #eef0f5; border: 1px solid #262c3b; border-radius: 12px; padding: 8px 12px; font: inherit; font-size: 14px; }
  .rows { margin: 0; padding: 0; list-style: none; }
  .row { padding: 14px 0; border-top: 1px solid #1f2430; }
  .row:first-child { border-top: 0; }
  .l1 { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .qp { background: #f3efe6; color: #0b0d12; font-weight: 700; font-size: 14px; border-radius: 999px; padding: 5px 13px; }
  .sz { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 14px; background: #1a1f2b; border-radius: 999px; padding: 5px 12px; }
  .vr { font-size: 13px; color: #98a1b4; }
  .l1 em { font-style: normal; color: #f6b93b; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; margin: 9px 0 12px; }
  .lg {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.04em;
    padding: 3px 9px; border-radius: 8px; background: rgba(57, 211, 178, 0.14); color: #39d3b2; border: 1px solid rgba(57, 211, 178, 0.3);
  }
  .lg.w { background: rgba(246, 185, 59, 0.12); color: #f6b93b; border-color: rgba(246, 185, 59, 0.32); }
  .lg.q { background: #1a1f2b; color: #98a1b4; border-color: #262c3b; }
  .lg.p { background: rgba(167, 139, 250, 0.14); color: #b9a4ff; border-color: rgba(167, 139, 250, 0.34); }
  .go { display: flex; gap: 8px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; padding: 8px 16px; font-size: 14px; font-weight: 700; border-radius: 999px; text-decoration: none; }
  .btn.tg { flex: 1 1 0; background: #f6b93b; color: #0b0d12; }
  .btn.dl { flex: 1 1 0; background: #4da3ff; color: #06121f; }
  .btn.solo { flex: 1 1 0; }
  .specs { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 11px; }
  .sp { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; color: #c8cdd9; background: #1a1f2b; border: 1px solid #262c3b; border-radius: 8px; padding: 3px 9px; }
  .rp { margin-top: 8px; }
  .rp-btn { appearance: none; background: none; border: 0; cursor: pointer; font: inherit; font-size: 12.5px; color: #98a1b4; display: inline-flex; align-items: center; gap: 6px; padding: 8px 2px; min-height: 36px; }
  .rp-btn:hover { color: #eef0f5; }
  .rp-btn:focus-visible, .rp-opt:focus-visible { outline: 2px solid #f6b93b; outline-offset: 2px; }
  .rpm-scrim { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(5, 7, 10, 0.6); border-radius: inherit; }
  .rpm { width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 8px; background: #181c26; border: 1px solid #2a3142; border-radius: 20px; padding: 18px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55); }
  .rpm h3 { margin: 0 0 4px; font-family: 'Bricolage Grotesque', Inter, sans-serif; font-size: 18px; font-weight: 700; }
  .rp-cancel { appearance: none; cursor: pointer; font: inherit; font-size: 13px; color: #98a1b4; background: none; border: 0; padding: 10px; min-height: 40px; }
  .rp-cancel:hover { color: #fff; }
  .rp-opt { appearance: none; cursor: pointer; font: inherit; font-size: 14px; text-align: left; color: #eef0f5; background: #1a1f2b; border: 1px solid #262c3b; border-radius: 14px; padding: 11px 14px; min-height: 44px; }
  .rp-opt:hover:not([disabled]) { border-color: #f6b93b; }
  .rp-opt[disabled] { opacity: 0.6; cursor: default; }
  .rp-ok { font-size: 12.5px; color: #39d3b2; }
  .rp-err { flex-basis: 100%; font-size: 12.5px; color: #ff8a7a; }
  .nosub { margin: 18px 0 0; font-size: 12.5px; color: #98a1b4; }
  .btn:hover { filter: brightness(1.08); }
  .note { display: flex; align-items: flex-start; gap: 8px; margin: 4px 0 0; padding: 9px 12px; border-radius: 12px; font-size: 12.5px; color: #c8cdd9; border: 1px solid rgba(246, 185, 59, 0.32); background: rgba(246, 185, 59, 0.06); }
  .note b { color: #eef0f5; }
  .foot { margin: 0; padding: 10px 20px 12px; text-align: center; font-size: 12px; font-style: italic; color: #98a1b4; border-top: 1px solid #1f2430; flex: none; }
  .empty { text-align: center; padding: 34px 12px; color: #98a1b4; }
  .empty p { margin: 8px 0 0; }
  /* ---- Aurora Glass look ---- */
  .sheet { background: rgba(18, 20, 34, 0.72); border-color: rgba(255, 255, 255, 0.22); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); overflow: hidden; }
  .sheet::before { content: ''; position: absolute; z-index: 0; width: 260px; height: 260px; right: -90px; top: 90px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 120, 190, 0.42), transparent 70%); filter: blur(10px); pointer-events: none; }
  .sheet::after { content: ''; position: absolute; z-index: 0; width: 240px; height: 240px; left: -90px; bottom: 30px; border-radius: 50%; background: radial-gradient(circle, rgba(70, 220, 210, 0.38), transparent 70%); filter: blur(10px); pointer-events: none; }
  .sheet > .grab, .sheet > .hd, .sheet > .scroll, .sheet > .foot { position: relative; z-index: 1; }
  .grab { background: rgba(255, 255, 255, 0.35); }
  .hd h2 { color: #fff; }
  .x { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.18); color: #d6dcf2; }
  .lbl { color: #b9c0da; }
  .tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0 0 4px; padding-top: 4px; }
  .tiles.odd .tile:last-child { grid-column: 1 / -1; }
  .tile {
    appearance: none; font: inherit; cursor: pointer; position: relative; overflow: hidden; text-align: left; color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.22); border-radius: 20px; padding: 14px 14px 13px; min-height: 116px;
    display: grid; align-content: space-between; opacity: 0.62; filter: saturate(0.8);
    transition: opacity 0.2s, transform 0.2s, filter 0.2s, box-shadow 0.2s;
  }
  .tile.t-a { background: linear-gradient(150deg, rgba(120, 255, 225, 0.42), rgba(60, 160, 255, 0.28)); }
  .tile.t-b { background: linear-gradient(150deg, rgba(255, 190, 110, 0.42), rgba(255, 90, 160, 0.3)); }
  .tile.t-c { background: linear-gradient(150deg, rgba(170, 130, 255, 0.45), rgba(90, 80, 255, 0.3)); }
  .tile.t-d { background: linear-gradient(150deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06)); }
  .tile.on { opacity: 1; filter: none; transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.95); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12), 0 14px 34px rgba(80, 200, 255, 0.35); }
  .tiles.many .tile { min-height: 96px; padding: 11px 12px 10px; }
  .tiles.many .tile b { font-size: 26px; }
  .tile:focus-visible { outline: 2px solid #f6b93b; outline-offset: 2px; }
  .tlb { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.12em; font-weight: 700; opacity: 0.85; }
  .tile b { font-family: 'Bricolage Grotesque', Inter, sans-serif; font-size: 32px; font-weight: 800; line-height: 1; }
  .tsub small { display: block; font-size: 12.5px; font-weight: 600; opacity: 0.85; }
  .tgb { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 700; font-size: 13.5px; }
  .ck { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: 50%; background: #fff; color: #14202e; display: none; place-items: center; }
  .tile.on .ck { display: grid; }
  .chip { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
  .sortrow { border-top-color: rgba(255, 255, 255, 0.14); }
  select { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
  .row { margin: 0 0 10px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 18px; background: rgba(255, 255, 255, 0.07); }
  .row:first-child { border-top: 1px solid rgba(255, 255, 255, 0.16); }
  .sz { background: rgba(255, 255, 255, 0.1); }
  .sp { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #e7ecff; border-radius: 999px; }
  .btn { min-height: 48px; border-radius: 18px; }
  .btn.tg { background: linear-gradient(135deg, #ffd26e, #ff9f5a); color: #2a1604; box-shadow: 0 8px 22px rgba(255, 160, 90, 0.35); }
  .btn.dl { background: rgba(255, 255, 255, 0.14); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); }
  .foot { border-top-color: rgba(255, 255, 255, 0.14); }
  @media (prefers-reduced-motion: reduce) { .tile { transition: none; } }
</style>
