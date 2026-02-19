<script lang="ts">
  import { STREAMING_SERVERS, type ServerKey } from '../lib/streaming';

  export let tmdbId: number;
  export let imdbId: string | null = null;
  export let type: 'movie' | 'tv' = 'movie';
  export let season: number = 1;
  export let episode: number = 1;

  let activeServer: ServerKey = 'server1';

  function getStreamUrl(server: ServerKey): string | null {
    const config = STREAMING_SERVERS[server];

    if (type === 'movie') {
      if (config.idType === 'imdb') {
        if (!imdbId) return null;
        return (config.getMovieUrl as (id: string) => string)(imdbId);
      }
      return (config.getMovieUrl as (id: number) => string)(tmdbId);
    } else {
      if (config.idType === 'imdb') {
        if (!imdbId) return null;
        return (config.getTVUrl as (id: string, s: number, e: number) => string)(imdbId, season, episode);
      }
      return (config.getTVUrl as (id: number, s: number, e: number) => string)(tmdbId, season, episode);
    }
  }

  $: currentUrl = getStreamUrl(activeServer);
</script>

<div class="rounded-lg overflow-hidden" style="background-color: var(--bg-card);">
  <!-- Server Tabs -->
  <div class="flex border-b" style="border-color: var(--border);">
    {#each Object.entries(STREAMING_SERVERS) as [key, server]}
      {@const serverKey = key as ServerKey}
      {@const isDisabled = server.idType === 'imdb' && !imdbId}
      <button
        on:click={() => !isDisabled && (activeServer = serverKey)}
        disabled={isDisabled}
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        class:tab-active={activeServer === serverKey}
        class:tab-inactive={activeServer !== serverKey}
      >
        {server.name}
      </button>
    {/each}
  </div>

  <!-- Video Container -->
  <div class="video-container">
    {#if currentUrl}
      <iframe
        src={currentUrl}
        allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Video Player"
      ></iframe>
    {:else}
      <div class="absolute inset-0 flex items-center justify-center" style="background-color: var(--bg-secondary);">
        <p style="color: var(--text-secondary);">
          This server requires an IMDb ID which is not available.
        </p>
      </div>
    {/if}
  </div>

  <!-- Server Info -->
  <div class="px-4 py-2 text-xs" style="color: var(--text-muted); background-color: var(--bg-secondary);">
    <p>If the current server doesn't work, try switching to another server above.</p>
  </div>
</div>
