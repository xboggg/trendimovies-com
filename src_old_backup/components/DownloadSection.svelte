<script lang="ts">
  import { Download, ChevronDown, ChevronUp } from 'lucide-svelte';

  interface DownloadLink {
    id: number;
    source: 'telegram' | 'cinematika' | 'torrent';
    quality: '720p' | '1080p' | '2160p';
    file_size: string | null;
    url: string;
  }

  export let links: DownloadLink[] = [];
  export let contentId: number;
  export let contentType: 'movie' | 'episode';

  let expanded = false;

  // Group links by quality for compact display
  $: linksByQuality = links.reduce((acc, link) => {
    if (!acc[link.quality]) acc[link.quality] = [];
    acc[link.quality].push(link);
    return acc;
  }, {} as Record<string, DownloadLink[]>);

  $: qualityOrder = ['2160p', '1080p', '720p'].filter(q => linksByQuality[q]);
  $: hasAnyLinks = links.length > 0;

  // Get best link for each quality (prefer telegram, then cinematika, then torrent)
  function getBestLink(quality: string): DownloadLink | null {
    const qualityLinks = linksByQuality[quality] || [];
    return qualityLinks.find(l => l.source === 'telegram')
      || qualityLinks.find(l => l.source === 'cinematika')
      || qualityLinks[0] || null;
  }

  function handleDownload(link: DownloadLink) {
    window.location.href = `/download/generate?link_id=${link.id}&type=${contentType}&id=${contentId}`;
  }

  function getQualityLabel(quality: string): string {
    switch(quality) {
      case '2160p': return '4K';
      case '1080p': return 'FHD';
      case '720p': return 'HD';
      default: return quality;
    }
  }

  function getQualityColor(quality: string): string {
    switch(quality) {
      case '2160p': return 'bg-purple-600 hover:bg-purple-700';
      case '1080p': return 'bg-blue-600 hover:bg-blue-700';
      case '720p': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  }
</script>

{#if hasAnyLinks}
  <div class="rounded-lg overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border);">
    <!-- Compact Download Buttons -->
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold flex items-center gap-2" style="color: var(--text-primary);">
          <Download size={16} />
          Download Options
        </h3>
        {#if links.length > qualityOrder.length}
          <button
            on:click={() => expanded = !expanded}
            class="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
            style="color: var(--accent);"
          >
            {expanded ? 'Less' : 'More'}
            {#if expanded}
              <ChevronUp size={14} />
            {:else}
              <ChevronDown size={14} />
            {/if}
          </button>
        {/if}
      </div>

      <!-- Primary Download Buttons (one per quality) -->
      <div class="flex flex-wrap gap-2">
        {#each qualityOrder as quality}
          {@const link = getBestLink(quality)}
          {#if link}
            <button
              on:click={() => handleDownload(link)}
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all {getQualityColor(quality)}"
            >
              <Download size={16} />
              <span>{getQualityLabel(quality)}</span>
              {#if link.file_size}
                <span class="text-xs opacity-75">• {link.file_size}</span>
              {/if}
            </button>
          {/if}
        {/each}
      </div>

      <!-- Expanded: All download links -->
      {#if expanded}
        <div class="mt-3 pt-3 border-t" style="border-color: var(--border);">
          <p class="text-xs mb-2" style="color: var(--text-muted);">All available links:</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {#each links as link}
              <button
                on:click={() => handleDownload(link)}
                class="flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-all hover:opacity-80"
                style="background-color: var(--bg-secondary); color: var(--text-primary);"
              >
                <Download size={14} />
                <span>{link.quality}</span>
                {#if link.file_size}
                  <span class="text-xs opacity-60">{link.file_size}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Torrent Links (separate section, always visible if present) -->
    {#if links.some(l => l.source === 'torrent')}
      <div class="px-4 py-2 flex items-center gap-2 text-xs" style="background-color: var(--bg-secondary); color: var(--text-muted);">
        <span>🧲</span>
        <span>Magnet links also available</span>
        <button
          on:click={() => {
            const torrent = links.find(l => l.source === 'torrent');
            if (torrent) window.open(torrent.url, '_blank');
          }}
          class="ml-auto underline hover:no-underline"
          style="color: var(--accent);"
        >
          Get Torrent
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="rounded-lg p-4 text-center" style="background-color: var(--bg-card); border: 1px solid var(--border);">
    <p class="text-sm" style="color: var(--text-secondary);">
      Downloads coming soon
    </p>
  </div>
{/if}
