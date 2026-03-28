<script lang="ts">
  import { Download, Magnet, Globe, FileText } from 'lucide-svelte';

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

  function getButtonColor(link: DownloadLink): string {
    if (link.language_tag) return '#7c3aed'; // purple for multi-lang
    if (link.quality === '2160p') return '#f59e0b'; // amber for 4K
    if (link.quality === '1080p') return '#3b82f6'; // blue
    return '#22c55e'; // green for 720p/hdrip
  }
</script>

{#if hasAnyLinks}
  <div class="space-y-4">
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
              {#if link.language_tag}
                <span class="flex items-center gap-1 text-xs opacity-90 border-l border-white/30 pl-2 ml-1">
                  <Globe size={10} />
                  {link.language_tag}
                </span>
              {/if}
            </button>
          {/each}
        </div>
        {#if sortedDdlLinks.some(l => l.language_tag && l.language_tag.includes('+'))}
          <div class="mt-3 flex items-start gap-2 rounded-lg px-3 py-2" style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.25);">
            <Globe size={14} class="text-purple-400 mt-0.5 shrink-0" />
            <p class="text-xs" style="color: var(--text-secondary);">
              <span class="font-semibold text-purple-400">Dual Audio</span> — This file contains multiple language tracks. Use your media player's audio settings to switch between languages.
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
              {#if link.language_tag}
                <span class="flex items-center gap-1 text-xs opacity-90 border-l border-white/30 pl-2 ml-1">
                  <Globe size={10} />
                  {link.language_tag}
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
              style="background: #0891b2;"
            >
              <FileText size={14} />
              <span>SRT</span>
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
