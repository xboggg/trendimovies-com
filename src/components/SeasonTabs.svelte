<script lang="ts">
  import { Play, Download, Star, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-svelte';
  import VideoPlayer from './VideoPlayer.svelte';

  interface Season {
    id: number;
    season_number: number;
    name: string | null;
    overview: string | null;
    poster_path: string | null;
    episode_count: number | null;
  }

  interface Episode {
    id: number;
    episode_number: number;
    name: string | null;
    overview: string | null;
    still_path: string | null;
    air_date: string | null;
    runtime: number | null;
    vote_average: number | null;
    has_downloads: boolean;
  }

  interface DownloadLink {
    id: number;
    content_type: string;
    content_id: number;
    source: string;
    quality: string;
    file_size: string | null;
    url: string;
    telegram_file_id: string | null;
    variant: string | null;
    is_active: boolean;
  }

  export let seriesId: number;
  export let tmdbId: number;
  export let imdbId: string | null = null;
  export let seasons: Season[] = [];
  export let episodesBySeason: Record<number, Episode[]> = {};
  export let downloadsByEpisode: Record<number, DownloadLink[]> = {};

  let activeSeason = seasons.length > 0 ? seasons[0].season_number : 1;
  let playingEpisode: { season: number; episode: number } | null = null;
  let expandedDownloads: number | null = null;
  let playerContainer: HTMLDivElement;

  $: currentEpisodes = episodesBySeason[activeSeason] || [];

  function getStillUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w300${path}` : '/images/no-still.jpg';
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function playEpisode(seasonNum: number, episodeNum: number) {
    playingEpisode = { season: seasonNum, episode: episodeNum };
    // Scroll to player after it renders
    setTimeout(() => {
      if (playerContainer) {
        playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  function closePlayer() {
    playingEpisode = null;
  }

  function toggleDownloads(episodeId: number) {
    expandedDownloads = expandedDownloads === episodeId ? null : episodeId;
  }

  function getVariantLabel(variant: string | null): string {
    switch(variant) {
      case 'bluray': return 'BluRay';
      case 'webrip': return 'WEBRip';
      case 'webdl': return 'WEB-DL';
      case 'hdtv': return 'HDTV';
      case 'hdrip': return 'HDRip';
      default: return '';
    }
  }

  function getQualityColor(quality: string): string {
    switch(quality) {
      case '720p': return 'bg-green-600 hover:bg-green-700';
      case '1080p': return 'bg-blue-600 hover:bg-blue-700';
      case '2160p': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  }

  function handleDownload(link: DownloadLink, episodeId: number) {
    window.location.href = `/download/generate?link_id=${link.id}&type=episode&id=${episodeId}`;
  }

  function getEpisodeDownloads(episodeId: number): DownloadLink[] {
    return downloadsByEpisode[episodeId] || [];
  }
</script>

<div>
  <!-- Season Selector -->
  <div class="flex items-center gap-3 mb-6">
    <label for="season-select" class="text-sm font-semibold whitespace-nowrap" style="color: var(--text-secondary);">Season:</label>
    <div class="relative flex-1 max-w-xs">
      <select
        id="season-select"
        bind:value={activeSeason}
        on:change={() => { playingEpisode = null; }}
        class="season-select w-full appearance-none px-4 py-2.5 pr-10 rounded-lg text-sm font-medium cursor-pointer"
      >
        {#each seasons as season}
          <option value={season.season_number}>
            {season.name || `Season ${season.season_number}`}
            {season.episode_count ? ` (${season.episode_count} eps)` : ''}
          </option>
        {/each}
      </select>
      <!-- Chevron icon -->
      <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style="color: var(--text-secondary);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>
    <!-- Episode count badge for active season -->
    {#if currentEpisodes.length > 0}
      <span class="text-xs px-3 py-1 rounded-full font-medium" style="background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border);">
        {currentEpisodes.length} Episode{currentEpisodes.length !== 1 ? 's' : ''}
      </span>
    {/if}
  </div>

  <!-- Video Player (when playing) -->
  {#if playingEpisode}
    <div class="mb-6" bind:this={playerContainer}>
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-semibold" style="color: var(--text-primary);">
          Now Playing: S{String(playingEpisode.season).padStart(2, '0')}E{String(playingEpisode.episode).padStart(2, '0')}
        </h3>
        <button
          on:click={closePlayer}
          class="text-sm px-3 py-1 rounded hover:bg-[var(--bg-hover)]"
          style="color: var(--text-secondary);"
        >
          Close Player
        </button>
      </div>
      {#key `${playingEpisode.season}-${playingEpisode.episode}`}
        <VideoPlayer
          {tmdbId}
          {imdbId}
          type="tv"
          season={playingEpisode.season}
          episode={playingEpisode.episode}
        />
      {/key}
    </div>
  {/if}

  <!-- Episodes List -->
  <div class="space-y-4">
    {#each currentEpisodes as episode}
      {@const epDownloads = getEpisodeDownloads(episode.id)}
      {@const hasDownloads = epDownloads.length > 0}
      <div
        class="flex flex-col sm:flex-row gap-4 p-4 rounded-lg transition-colors"
        style="background-color: var(--bg-card); border: 1px solid var(--border);"
        class:ring-2={playingEpisode?.season === activeSeason && playingEpisode?.episode === episode.episode_number}
        class:ring-[var(--accent)]={playingEpisode?.season === activeSeason && playingEpisode?.episode === episode.episode_number}
      >
        <!-- Thumbnail -->
        <div class="relative flex-shrink-0 w-full sm:w-48 aspect-video sm:aspect-[16/10] rounded overflow-hidden">
          <img
            src={getStillUrl(episode.still_path)}
            alt={episode.name || `Episode ${episode.episode_number}`}
            class="w-full h-full object-cover"
          />
          <button
            on:click={() => playEpisode(activeSeason, episode.episode_number)}
            class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--accent);">
              <Play size={24} class="text-white ml-1" fill="white" />
            </div>
          </button>
          <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white" style="background-color: var(--accent);">
            E{episode.episode_number}
          </div>
        </div>

        <!-- Episode Info -->
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold mb-1 line-clamp-1" style="color: var(--text-primary);">
            {episode.name || `Episode ${episode.episode_number}`}
          </h4>

          <div class="flex flex-wrap items-center gap-3 mb-2 text-sm" style="color: var(--text-secondary);">
            {#if episode.air_date}
              <div class="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(episode.air_date)}</span>
              </div>
            {/if}
            {#if episode.runtime}
              <div class="flex items-center gap-1">
                <Clock size={14} />
                <span>{episode.runtime} min</span>
              </div>
            {/if}
            {#if episode.vote_average}
              <div class="flex items-center gap-1">
                <Star size={14} class="text-yellow-400" fill="currentColor" />
                <span>{episode.vote_average.toFixed(1)}</span>
              </div>
            {/if}
          </div>

          <p class="text-sm line-clamp-2 mb-3" style="color: var(--text-secondary);">
            {episode.overview || 'No description available.'}
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              on:click={() => playEpisode(activeSeason, episode.episode_number)}
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style="background-color: var(--accent);"
            >
              <Play size={16} />
              Watch
            </button>
            {#if hasDownloads}
              <button
                on:click={() => toggleDownloads(episode.id)}
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style="background-color: var(--bg-hover); color: var(--text-primary);"
              >
                <Download size={16} />
                Downloads ({epDownloads.length})
                {#if expandedDownloads === episode.id}
                  <ChevronUp size={14} />
                {:else}
                  <ChevronDown size={14} />
                {/if}
              </button>
            {/if}
          </div>

          <!-- Inline Download Links (expandable) -->
          {#if hasDownloads && expandedDownloads === episode.id}
            <div class="mt-3 flex flex-wrap gap-2">
              {#each epDownloads as link}
                <button
                  on:click={() => handleDownload(link, episode.id)}
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors {getQualityColor(link.quality)}"
                >
                  <Download size={14} />
                  <span>{link.quality}</span>
                  {#if link.variant}
                    <span class="opacity-75 text-xs">{getVariantLabel(link.variant)}</span>
                  {/if}
                  {#if link.file_size}
                    <span class="opacity-75 text-xs">({link.file_size})</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if currentEpisodes.length === 0}
      <div class="text-center py-12" style="color: var(--text-secondary);">
        <p>No episodes available for this season yet.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .season-select {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-primary);
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .season-select:focus {
    outline: none;
    border-color: var(--accent);
  }
  .season-select option {
    background: #1a1a1a;
    color: #fff;
  }
</style>
