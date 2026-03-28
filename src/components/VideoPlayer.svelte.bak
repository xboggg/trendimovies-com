<script lang="ts">
  import { onMount } from 'svelte';
  import { STREAMING_SERVERS, type ServerKey } from '../lib/streaming';
  import { Maximize2, Minimize2, Loader2, AlertCircle, Monitor } from 'lucide-svelte';

  export let tmdbId: number;
  export let imdbId: string | null = null;
  export let type: 'movie' | 'tv' = 'movie';
  export let season: number = 1;
  export let episode: number = 1;

  let activeServer: ServerKey = 'server1';
  let isTheaterMode = false;
  let isLoading = true;
  let hasError = false;
  let iframeRef: HTMLIFrameElement;

  // Load saved server preference
  onMount(() => {
    const savedServer = localStorage.getItem('preferredServer');
    if (savedServer && savedServer in STREAMING_SERVERS) {
      activeServer = savedServer as ServerKey;
    }

    // Keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          toggleFullscreen();
        }
      }
      if (e.key === 'Escape' && isTheaterMode) {
        isTheaterMode = false;
      }
      if (e.key === 't' || e.key === 'T') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          isTheaterMode = !isTheaterMode;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

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

  function selectServer(server: ServerKey) {
    if (STREAMING_SERVERS[server].idType === 'imdb' && !imdbId) return;
    activeServer = server;
    isLoading = true;
    hasError = false;
    localStorage.setItem('preferredServer', server);
  }

  function handleIframeLoad() {
    isLoading = false;
  }

  function handleIframeError() {
    isLoading = false;
    hasError = true;
  }

  function tryNextServer() {
    const serverKeys = Object.keys(STREAMING_SERVERS) as ServerKey[];
    const currentIndex = serverKeys.indexOf(activeServer);
    for (let i = 1; i < serverKeys.length; i++) {
      const nextIndex = (currentIndex + i) % serverKeys.length;
      const nextServer = serverKeys[nextIndex];
      if (!(STREAMING_SERVERS[nextServer].idType === 'imdb' && !imdbId)) {
        selectServer(nextServer);
        return;
      }
    }
  }

  function toggleFullscreen() {
    if (!iframeRef) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      iframeRef.requestFullscreen();
    }
  }

  $: currentUrl = getStreamUrl(activeServer);
  $: if (currentUrl) {
    isLoading = true;
    hasError = false;
  }
</script>

<!-- Theater mode overlay -->
{#if isTheaterMode}
  <div
    class="fixed inset-0 bg-black/95 z-40"
    on:click={() => isTheaterMode = false}
    on:keydown={(e) => e.key === 'Escape' && (isTheaterMode = false)}
    role="button"
    tabindex="0"
  ></div>
{/if}

<div
  class="rounded-lg overflow-hidden transition-all duration-300"
  class:theater-mode={isTheaterMode}
  style="background-color: var(--bg-card);"
>
  <!-- Server Tabs -->
  <div class="flex border-b flex-wrap" style="border-color: var(--border);">
    {#each Object.entries(STREAMING_SERVERS) as [key, server]}
      {@const serverKey = key as ServerKey}
      {@const isDisabled = server.idType === 'imdb' && !imdbId}
      <button
        on:click={() => selectServer(serverKey)}
        disabled={isDisabled}
        class="flex-1 min-w-[80px] px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        class:tab-active={activeServer === serverKey}
        class:tab-inactive={activeServer !== serverKey}
      >
        <Monitor size={14} class="hidden sm:inline" />
        {server.name}
      </button>
    {/each}
  </div>

  <!-- Video Container -->
  <div class="video-container relative">
    {#if isLoading}
      <div class="absolute inset-0 flex items-center justify-center z-10" style="background-color: var(--bg-secondary);">
        <div class="flex flex-col items-center gap-3">
          <Loader2 size={40} class="animate-spin text-[#e50914]" />
          <p class="text-sm" style="color: var(--text-secondary);">Loading player...</p>
        </div>
      </div>
    {/if}

    {#if hasError}
      <div class="absolute inset-0 flex items-center justify-center z-10" style="background-color: var(--bg-secondary);">
        <div class="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle size={40} class="text-red-500" />
          <p class="text-sm" style="color: var(--text-secondary);">Server not responding</p>
          <button
            on:click={tryNextServer}
            class="px-4 py-2 bg-[#e50914] text-white rounded-lg text-sm font-medium hover:bg-[#b20710] transition-colors"
          >
            Try Next Server
          </button>
        </div>
      </div>
    {/if}

    {#if currentUrl}
      <iframe
        bind:this={iframeRef}
        src={currentUrl}
        allowfullscreen
        scrolling="no"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Video Player"
        style="overflow: hidden;"
        on:load={handleIframeLoad}
        on:error={handleIframeError}
      ></iframe>
    {:else}
      <div class="absolute inset-0 flex items-center justify-center" style="background-color: var(--bg-secondary);">
        <p style="color: var(--text-secondary);">
          This server requires an IMDb ID which is not available.
        </p>
      </div>
    {/if}
  </div>

  <!-- Controls Bar -->
  <div class="flex items-center justify-between px-3 py-2 text-xs" style="color: var(--text-muted); background-color: var(--bg-secondary);">
    <div>
      <p>If the current server doesn't work, try switching to another server above.</p>
      <p class="hidden sm:block mt-1">Press <kbd class="px-1.5 py-0.5 rounded bg-[#333] text-[#ccc] font-mono text-[10px]">T</kbd> for theater mode, <kbd class="px-1.5 py-0.5 rounded bg-[#333] text-[#ccc] font-mono text-[10px]">F</kbd> for fullscreen</p>
    </div>
    <div class="flex items-center gap-2">
      <button
        on:click={() => isTheaterMode = !isTheaterMode}
        class="p-1.5 rounded hover:bg-[#333] transition-colors"
        title={isTheaterMode ? 'Exit Theater Mode (T)' : 'Theater Mode (T)'}
      >
        {#if isTheaterMode}
          <Minimize2 size={18} />
        {:else}
          <Maximize2 size={18} />
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .theater-mode {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95vw;
    max-width: 1600px;
    z-index: 50;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  /* Fix scrollbar issue */
  :global(.video-container) {
    overflow: hidden !important;
  }

  :global(.video-container iframe) {
    overflow: hidden;
  }
</style>
