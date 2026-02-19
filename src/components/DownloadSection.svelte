<script lang="ts">
  import { Download, Magnet } from 'lucide-svelte';

  interface DownloadLink {
    id: number;
    quality: '720p' | '1080p' | '2160p';
    file_size: string | null;
    url: string;
    type: 'ddl' | 'torrent';
    variant?: 'webrip' | 'bluray' | 'webdl';
    source?: number;
  }

  export let links: DownloadLink[] = [];
  export let title: string = '';

  // Sort all DDL links by quality: 720p -> 1080p -> 2160p
  $: sortedDdlLinks = links
    .filter(l => l.type === 'ddl')
    .sort((a, b) => {
      const order: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2 };
      return (order[a.quality] ?? 3) - (order[b.quality] ?? 3);
    });

  // Torrent links sorted: 720p first, then 1080p variants
  $: torrentLinks = links.filter(l => l.type === 'torrent').sort((a, b) => {
    const order: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2 };
    if (a.quality !== b.quality) {
      return (order[a.quality] ?? 3) - (order[b.quality] ?? 3);
    }
    if (a.variant === 'webdl') return 1;
    if (b.variant === 'webdl') return -1;
    return 0;
  });

  $: hasAnyLinks = links.length > 0;

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
</script>

{#if hasAnyLinks}
  <div class="space-y-4">
    <!-- DDL Downloads -->
    {#if sortedDdlLinks.length > 0}
      <div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);">
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
          <Download size={16} class="text-green-500" />
          Download
        </h3>
        <div class="flex flex-wrap gap-2">
          {#each sortedDdlLinks as link}
            <button
              on:click={() => handleDownload(link)}
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style="background: {link.quality === '720p' ? '#22c55e' : '#3b82f6'};"
            >
              <Download size={14} />
              <span>{link.quality}</span>
              {#if link.file_size}
                <span class="opacity-75">({link.file_size})</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Torrent Downloads -->
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
            </button>
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
