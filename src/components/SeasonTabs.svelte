<script lang="ts">
  import { Play, Download, Star, Clock, Calendar, FileText } from 'lucide-svelte';
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
    language?: string;
    language_tag?: string | null;
  }

  interface SubtitleLink {
    id: number;
    file_name: string | null;
    file_size: string | null;
    telegram_file_id: string;
  }

  export let seriesId: number;
  export let tmdbId: number;
  export let imdbId: string | null = null;
  export let seasons: Season[] = [];
  export let episodesBySeason: Record<number, Episode[]> = {};
  export let downloadsByEpisode: Record<number, DownloadLink[]> = {};
  export let subtitlesByEpisode: Record<number, SubtitleLink[]> = {};
  export let backdropPath: string | null = null;

  // Default to the first REAL season (>0), not Season 0/Specials, so the page
  // doesn't land on "Season 0 — No episodes available". Specials stay selectable
  // in the dropdown. Falls back to seasons[0] only if every season is 0.
  let activeSeason = (() => {
    const real = seasons.filter(s => s.season_number > 0);
    if (real.length > 0) return real[0].season_number;
    return seasons.length > 0 ? seasons[0].season_number : 1;
  })();
  let playingEpisode: { season: number; episode: number } | null = null;
  let playerContainer: HTMLDivElement;
  let episodesContainer: HTMLDivElement;
  let viewMode: 'list' | 'grid' = 'list';

  $: currentEpisodes = episodesBySeason[activeSeason] || [];
  $: activeSeasonsData = seasons.find(s => s.season_number === activeSeason);

  // Real seasons (exclude Specials/season 0) for the arc-tab strip + totals.
  $: realSeasons = seasons.filter(s => s.season_number > 0);
  $: hasSpecials = seasons.some(s => s.season_number === 0);

  // Series totals shown in the header.
  $: totalSeasons = realSeasons.length;
  $: totalEpisodes = Object.entries(episodesBySeason)
      .filter(([sn]) => Number(sn) > 0)
      .reduce((sum, [, eps]) => sum + (eps?.length || 0),
        // fall back to declared episode_count when episode rows aren't loaded
        0) || realSeasons.reduce((s, se) => s + (se.episode_count || 0), 0);
  $: totalFiles = Object.values(downloadsByEpisode).reduce((s, arr) => s + (arr?.length || 0), 0);

  // Per-season download coverage → drives the status dot on each tab.
  function seasonStatus(seasonNum: number): 'full' | 'some' | 'stream' {
    const eps = episodesBySeason[seasonNum] || [];
    if (eps.length === 0) return 'stream';
    const withFiles = eps.filter(e => (downloadsByEpisode[e.id]?.length || 0) > 0).length;
    if (withFiles === 0) return 'stream';
    if (withFiles === eps.length) return 'full';
    return 'some';
  }
  function seasonWithFiles(seasonNum: number): number {
    const eps = episodesBySeason[seasonNum] || [];
    return eps.filter(e => (downloadsByEpisode[e.id]?.length || 0) > 0).length;
  }

  // A short arc/season label: use the DB name if it isn't just "Season N".
  function seasonLabel(s: Season): string {
    const nm = (s.name || '').trim();
    if (!nm || /^season\s*\d+$/i.test(nm)) return `Season ${s.season_number}`;
    // strip a leading "SN • " prefix the sync sometimes stores
    return nm.replace(/^s\d+\s*[•·-]\s*/i, '');
  }

  function jumpToEpisode(epNum: number) {
    const el = document.getElementById(`ep-${activeSeason}-${epNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ep-flash');
      setTimeout(() => el.classList.remove('ep-flash'), 1200);
    }
  }

  function getStillUrl(path: string | null): string {
    // Real episode still if TMDB has one; otherwise fall back to the series
    // backdrop (a proper image) rather than the bland empty placeholder. Newly
    // aired seasons often have no per-episode stills on TMDB yet.
    if (path) return `https://image.tmdb.org/t/p/w300${path}`;
    if (backdropPath) return `https://image.tmdb.org/t/p/w300${backdropPath}`;
    return '/images/no-still.jpg';
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
    setTimeout(() => {
      if (playerContainer) {
        playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  function closePlayer() {
    playingEpisode = null;
  }

  function selectSeason(seasonNum: number) {
    activeSeason = seasonNum;
    playingEpisode = null;
    viewMode = 'list';
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

  function getLinkColor(link: DownloadLink): string {
    // Colour STRICTLY by quality so it's consistent site-wide (720p is always
    // green, 1080p always blue, etc). Do NOT tint by language_tag — that made a
    // 720p file with an "ENG" tag show purple while an untagged 720p showed green.
    return getQualityColor(link.quality);
  }

  function getQualityColor(quality: string): string {
    switch(quality) {
      case '720p': return 'bg-green-600 hover:bg-green-700';
      case '1080p': return 'bg-blue-600 hover:bg-blue-700';
      case '2160p': return 'bg-purple-600 hover:bg-purple-700';
      case '480p': return 'bg-green-600 hover:bg-green-700';
      case 'hdrip': return 'bg-teal-600 hover:bg-teal-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  }

  function getEpisodeDownloads(episodeId: number): DownloadLink[] {
    return downloadsByEpisode[episodeId] || [];
  }

  function getEpisodeSubtitles(episodeId: number): SubtitleLink[] {
    return subtitlesByEpisode[episodeId] || [];
  }
</script>

<div>
  <!-- Header: ONE title + series totals (no duplicate "Episodes") -->
  <div class="flex items-baseline justify-between gap-4 flex-wrap mb-4">
    <div class="flex items-center gap-2">
      <Play size={20} style="color: var(--accent);" />
      <h2 class="text-xl font-bold" style="color: var(--text-primary);">Episodes</h2>
    </div>
    <div class="flex items-center gap-2 text-xs" style="color: var(--text-secondary);">
      {#if totalSeasons}
        <span class="st-pill"><b>{totalSeasons}</b> Season{totalSeasons > 1 ? 's' : ''}</span>
      {/if}
      {#if totalEpisodes}
        <span class="st-pill"><b>{totalEpisodes}</b> Episodes</span>
      {/if}
      {#if totalFiles}
        <span class="st-pill"><b>{totalFiles}</b> files</span>
      {/if}
    </div>
  </div>

  <!-- Season selector: arc name + episode count + download-status dot -->
  <div class="season-strip flex gap-2 overflow-x-auto pb-1.5 mb-5">
    {#each seasons as season}
      {@const status = seasonStatus(season.season_number)}
      {@const eps = (episodesBySeason[season.season_number] || []).length || season.episode_count || 0}
      {@const withF = seasonWithFiles(season.season_number)}
      <button
        on:click={() => selectSeason(season.season_number)}
        class="stab flex-shrink-0 text-left rounded-xl px-3.5 py-2.5 transition-colors"
        class:stab-active={activeSeason === season.season_number}
        style="background-color: var(--bg-card); border: 1px solid var(--border);"
      >
        <div class="stab-sn text-[11px] uppercase tracking-wide" style="color: var(--text-muted);">
          {season.season_number === 0 ? 'Specials' : `Season ${season.season_number}`}
        </div>
        <div class="stab-arc text-sm font-bold whitespace-nowrap" style="color: var(--text-primary);">
          {seasonLabel(season)}
        </div>
        <div class="flex items-center gap-2 text-[11.5px] mt-1" style="color: var(--text-secondary);">
          <span class="dot dot-{status}"></span>
          <span>
            {eps} eps
            {#if status === 'full'}· all files
            {:else if status === 'some'}· {withF} with files
            {:else}· stream only{/if}
          </span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Jump-to-episode + list/grid toggle (helps long seasons) -->
  {#if currentEpisodes.length > 6}
    <div class="flex items-center gap-2.5 flex-wrap mb-4">
      <span class="text-xs" style="color: var(--text-muted);">Jump to</span>
      <div class="flex gap-1.5 flex-wrap">
        {#each currentEpisodes as ep}
          <button
            on:click={() => jumpToEpisode(ep.episode_number)}
            class="epnum w-[30px] h-[30px] rounded-lg text-xs transition-colors"
            style="background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary);"
          >{ep.episode_number}</button>
        {/each}
      </div>
      <div class="ml-auto flex rounded-lg overflow-hidden" style="border: 1px solid var(--border);">
        <button on:click={() => (viewMode = 'list')} class="vt px-3 py-1.5 text-xs" class:vt-on={viewMode === 'list'} style="background-color: var(--bg-card); color: var(--text-secondary);">☰ List</button>
        <button on:click={() => (viewMode = 'grid')} class="vt px-3 py-1.5 text-xs" class:vt-on={viewMode === 'grid'} style="background-color: var(--bg-card); color: var(--text-secondary);">▦ Grid</button>
      </div>
    </div>
  {/if}

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

  <!-- Compact GRID view (toggle) -->
  {#if viewMode === 'grid' && currentEpisodes.length > 0}
    <div class="ep-grid">
      {#each currentEpisodes as episode}
        {@const epDl = getEpisodeDownloads(episode.id)}
        <button
          class="gcard text-left rounded-xl overflow-hidden transition-colors"
          style="background-color: var(--bg-card); border: 1px solid var(--border);"
          on:click={() => playEpisode(activeSeason, episode.episode_number)}
        >
          <div class="relative aspect-video">
            <img src={getStillUrl(episode.still_path)} alt={episode.name || `Episode ${episode.episode_number}`} class="w-full h-full object-cover" />
            <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: var(--accent);">E{episode.episode_number}</span>
            {#if epDl.length === 0}
              <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium text-white" style="background-color: rgba(59,130,246,.85);">STREAM</span>
            {/if}
          </div>
          <div class="p-2">
            <div class="text-xs font-semibold line-clamp-2 leading-tight" style="color: var(--text-primary);">{episode.name || `Episode ${episode.episode_number}`}</div>
            {#if episode.vote_average}
              <div class="text-[10px] mt-0.5" style="color: var(--text-muted);">★ {episode.vote_average.toFixed(1)}{#if episode.runtime} · {episode.runtime}m{/if}</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Detailed LIST view -->
  <div class="space-y-4" class:hidden={viewMode === 'grid'} bind:this={episodesContainer}>
    {#each currentEpisodes as episode}
      {@const epDownloads = getEpisodeDownloads(episode.id)}
      {@const hasDownloads = epDownloads.length > 0}
      <div
        id="ep-{activeSeason}-{episode.episode_number}"
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

          <!-- Action Buttons - Watch + Direct Download Links -->
          <div class="flex flex-wrap gap-2">
            <button
              on:click={() => playEpisode(activeSeason, episode.episode_number)}
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style="background-color: var(--accent);"
            >
              <Play size={16} />
              Watch
            </button>

            <!-- Direct Download Buttons (no dropdown, no countdown) -->
            {#each epDownloads as link}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors {getLinkColor(link)}"
              >
                <Download size={14} />
                <span>{link.quality}</span>
                {#if link.variant}
                  <span class="opacity-75 text-xs">{getVariantLabel(link.variant)}</span>
                {/if}
                {#if link.file_size}
                  <span class="opacity-75 text-xs">({link.file_size})</span>
                {/if}
                {#if link.language_tag}
                  <span class="text-xs opacity-90 border-l border-white/30 pl-2 ml-1">{link.language_tag}</span>
                {/if}
              </a>
            {/each}

            <!-- Subtitle Downloads -->
            
            {#each getEpisodeSubtitles(episode.id) as sub}
              <a
                href="https://trendimovies.com/tgstream/stream/{sub.telegram_file_id}"
                download
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors bg-cyan-600 hover:bg-cyan-700"
              >
                <FileText size={14} />
                <span>SRT</span>
                {#if sub.file_size}
                  <span class="opacity-75 text-xs">({sub.file_size})</span>
                {/if}
              </a>
            {/each}
          </div>
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
  .season-dropdown { position: relative; }

  /* header totals pills */
  .st-pill {
    background-color: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 11px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .st-pill b { color: var(--text-primary); font-weight: 700; }

  /* season arc-tabs */
  .season-strip { scrollbar-width: thin; }
  .season-strip::-webkit-scrollbar { height: 6px; }
  .season-strip::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  .stab { min-width: 150px; cursor: pointer; }
  .stab:hover { background-color: var(--bg-hover) !important; }
  .stab-active {
    border-color: var(--accent) !important;
    background: linear-gradient(180deg, rgba(229, 9, 20, 0.14), transparent) !important;
  }
  .stab-active .stab-sn { color: var(--accent) !important; }

  /* status dots */
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .dot-full { background: #2ecc71; }
  .dot-some { background: #f5a623; }
  .dot-stream { background: #3b82f6; }

  /* jump numbers + view toggle */
  .epnum { cursor: pointer; font-variant-numeric: tabular-nums; }
  .epnum:hover { border-color: var(--accent) !important; color: var(--text-primary) !important; }
  .vt { cursor: pointer; }
  .vt-on { background-color: var(--accent) !important; color: #fff !important; }

  /* grid view */
  .ep-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }
  .gcard { cursor: pointer; }
  .gcard:hover { border-color: var(--accent) !important; }

  /* jump flash highlight */
  :global(.ep-flash) { border-color: var(--accent) !important; }
</style>
