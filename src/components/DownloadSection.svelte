<script lang="ts">
  import { Download, Magnet, Globe, FileText, Captions } from 'lucide-svelte';

  interface DownloadLink {
    id: number;
    quality: '720p' | '1080p' | '2160p' | 'hdrip';
    file_size: string | null;
    url: string;
    source?: string;
    type?: string;
    variant?: string;
    click_count?: number;
    language?: string;
    language_tag?: string | null;
    subtitle_burn_status?: 'hardcoded' | 'embedded_multi' | 'embedded_eng' | null;
  }

  interface SubtitleLink {
    id: number;
    file_name: string | null;
    file_size: string | null;
    telegram_file_id: string;
  }

  export let links: DownloadLink[] = [];
  export let subtitles: SubtitleLink[] = [];
  export let contentId: number = 0;
  export let contentType: string = 'movie';
  export let title: string = '';
  export let originalTitle: string = '';

  // Show an "original title" note so users don't panic when the downloaded file
  // uses the (often non-English) original title instead of the localized one.
  $: showOriginalTitle =
    !!originalTitle &&
    !!title &&
    originalTitle.trim().toLowerCase() !== title.trim().toLowerCase();

  // Determine if link is a torrent (support both 'source' from DB and 'type' from old code)
  function isTorrent(l: DownloadLink): boolean {
    return l.source === 'torrent' || l.type === 'torrent';
  }

  // DDL links: telegram or cinematika sources (or type=ddl for legacy)
  $: sortedDdlLinks = links
    .filter(l => !isTorrent(l))
    .sort((a, b) => {
      const order: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2, 'hdrip': 3 };
      return (order[a.quality] ?? 4) - (order[b.quality] ?? 4);
    });

  $: torrentLinks = links.filter(l => isTorrent(l)).sort((a, b) => {
    const order: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2 };
    return (order[a.quality] ?? 3) - (order[b.quality] ?? 3);
  });

  $: hasAnyLinks = links.length > 0 || subtitles.length > 0;
  $: totalDownloads = links.reduce((sum, link) => sum + (link.click_count || 0), 0);

  function handleDownload(link: DownloadLink) {
    if (link.url) {
      window.location.href = link.url;
    }
  }

  function getVariantLabel(link: DownloadLink): string {
    if (link.variant === 'webdl') return 'WEB-DL';
    if (link.variant === 'webrip') return 'WEBRip';
    if (link.variant === 'bluray') return 'BluRay';
    return '';
  }

  // ISO 639-1 -> display name, for the catalogue's non-English originals.
  // Covers the languages actually present in download_links (2026-07 audit).
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

  // Human-readable language label for a download link. Prefers the explicit
  // language_tag (real signal from the filename, e.g. "ENG + HIN", "DUAL
  // AUDIO"). Falls back to the movie's actual original_language (link.language)
  // when the filename carried no language info at all — so a Korean film with
  // an untagged filename still shows "Korean" instead of no label (and never
  // falls back to a false "ENG" guess). Returns '' for English originals,
  // since an unlabeled button already implies standard/English audio.
  function getLanguageLabel(link: DownloadLink): string {
    if (link.language_tag) return link.language_tag;
    if (link.language && link.language !== 'en') {
      return LANGUAGE_NAMES[link.language] || link.language.toUpperCase();
    }
    return '';
  }

  // Whether subtitles are hardcoded (burned into the picture, can't be turned
  // off) or embedded as a selectable track — distinct from the separate .srt
  // files shown further down (those are downloadable on their own). Returns ''
  // when the filename gave no such signal (most files — status is unknown,
  // not "no subtitles").
  function getSubtitleBurnLabel(link: DownloadLink): string {
    if (link.subtitle_burn_status === 'hardcoded') return 'Hardcoded subs';
    if (link.subtitle_burn_status === 'embedded_multi') return 'Multi-subs included';
    if (link.subtitle_burn_status === 'embedded_eng') return 'English subs included';
    return '';
  }

  function getButtonColor(link: DownloadLink): string {
    // Colour STRICTLY by quality — consistent site-wide (720p green, 1080p blue,
    // 4K amber). Do NOT tint by language_tag; that made a tagged 720p show purple
    // while an untagged 720p showed green (inconsistent). The language is shown as
    // a separate text label on the button, not by changing its colour.
    if (link.quality === '2160p') return '#f59e0b'; // amber for 4K
    if (link.quality === '1080p') return '#3b82f6'; // blue for 1080p
    if (link.quality === 'hdrip') return '#14b8a6'; // teal for hdrip
    return '#22c55e'; // green for 720p / 480p / default
  }

  // Pull the quality (720p / 1080p / 2160p) out of a subtitle's filename so the
  // user can tell which .srt matches which download. Returns '' if none found.
  function getSubtitleQuality(sub: SubtitleLink): string {
    const m = (sub.file_name || '').match(/\b(2160p|1080p|720p|480p)\b/i);
    return m ? m[1].toLowerCase() : '';
  }

  // Colour-match the SRT button to its quality so it visually pairs with the
  // matching download button above (blue=1080p, amber=4K, green=720p).
  function getSubtitleColor(sub: SubtitleLink): string {
    const q = getSubtitleQuality(sub);
    if (q === '2160p') return '#f59e0b';
    if (q === '1080p') return '#3b82f6';
    if (q === '720p' || q === '480p') return '#22c55e';
    return '#0891b2'; // cyan fallback when quality unknown
  }
</script>

{#if hasAnyLinks}
  <div class="space-y-4">
    {#if showOriginalTitle}
      <div class="rounded-xl p-3 flex items-start gap-2 text-xs sm:text-sm"
           style="background: rgba(247,208,0,0.08); border: 1px solid rgba(247,208,0,0.25); color: var(--text-secondary);">
        <Globe size={16} class="text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          Original title: <span style="color: var(--text-primary); font-weight: 600;">{originalTitle}</span>.
          The downloaded file may use this title — it's the same movie.
        </span>
      </div>
    {/if}
    {#if sortedDdlLinks.length > 0}
      <div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold flex items-center gap-2" style="color: var(--text-primary);">
            <Download size={16} class="text-green-500" />
            Download
          </h3>
          {#if totalDownloads > 0}
            <span class="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              {totalDownloads.toLocaleString()} downloads
            </span>
          {/if}
        </div>
        <div class="flex flex-wrap gap-2">
          {#each sortedDdlLinks as link}
            <button
              on:click={() => handleDownload(link)}
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style="background: {getButtonColor(link)};"
            >
              <Download size={14} />
              <span>{link.quality}</span>
              {#if link.file_size}
                <span class="opacity-75">({link.file_size})</span>
              {/if}
              {#if getLanguageLabel(link)}
                <span class="flex items-center gap-1 text-xs opacity-90 border-l border-white/30 pl-2 ml-1">
                  <Globe size={10} />
                  {getLanguageLabel(link)}
                </span>
              {/if}
              {#if getSubtitleBurnLabel(link)}
                <span class="flex items-center gap-1 text-xs opacity-90 border-l border-white/30 pl-2 ml-1">
                  <Captions size={10} />
                  {getSubtitleBurnLabel(link)}
                </span>
              {/if}
            </button>
          {/each}
        </div>
        {#if sortedDdlLinks.some(l => l.language_tag && (l.language_tag.includes('+') || /DUAL|MULTI/i.test(l.language_tag)))}
          <div class="mt-3 flex items-start gap-2 rounded-lg px-3 py-2" style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.25);">
            <Globe size={14} class="text-purple-400 mt-0.5 shrink-0" />
            <p class="text-xs" style="color: var(--text-secondary);">
              <span class="font-semibold text-purple-400">Multiple audio tracks</span> — This file includes more than one language track (see the tag on each button, e.g. "ENG + JPN"). English is available where shown. Switch languages using your media player's audio-track setting after downloading.
            </p>
          </div>
        {/if}
      </div>
    {/if}

    {#if torrentLinks.length > 0}
      <div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);">
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
          <Magnet size={16} class="text-red-500" />
          Torrent
        </h3>
        <div class="flex flex-wrap gap-2">
          {#each torrentLinks as link}
            <button
              on:click={() => handleDownload(link)}
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style="background: #dc2626;"
            >
              <Magnet size={14} />
              <span>{link.quality}</span>
              {#if getVariantLabel(link)}
                <span class="opacity-75">{getVariantLabel(link)}</span>
              {/if}
              {#if link.file_size}
                <span class="opacity-75">({link.file_size})</span>
              {/if}
              {#if getLanguageLabel(link)}
                <span class="flex items-center gap-1 text-xs opacity-90 border-l border-white/30 pl-2 ml-1">
                  <Globe size={10} />
                  {getLanguageLabel(link)}
                </span>
              {/if}
              {#if getSubtitleBurnLabel(link)}
                <span class="flex items-center gap-1 text-xs opacity-90 border-l border-white/30 pl-2 ml-1">
                  <Captions size={10} />
                  {getSubtitleBurnLabel(link)}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if subtitles.length > 0}
      <div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);">
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
          <FileText size={16} class="text-cyan-500" />
          Subtitles
        </h3>
        <div class="flex flex-wrap gap-2">
          {#each subtitles as sub}
            <a
              href="https://trendimovies.com/tgstream/stream/{sub.telegram_file_id}"
              download
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style="background: {getSubtitleColor(sub)};"
            >
              <FileText size={14} />
              <span>{getSubtitleQuality(sub) ? getSubtitleQuality(sub) + ' SRT' : 'SRT'}</span>
              {#if sub.file_size}
                <span class="opacity-75">({sub.file_size})</span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="rounded-xl p-6 text-center" style="background: var(--bg-card); border: 1px solid var(--border);">
    <Download size={28} class="mx-auto mb-2 opacity-40" style="color: var(--text-muted);" />
    <p class="text-sm" style="color: var(--text-secondary);">Downloads coming soon</p>
  </div>
{/if}
