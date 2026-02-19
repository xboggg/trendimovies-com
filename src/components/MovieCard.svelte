<script lang="ts">
  import { Star, Play, Clock, TrendingUp } from 'lucide-svelte';

  export let item: {
    id: number;
    tmdb_id?: number;
    title: string;
    slug?: string;
    poster_path: string | null;
    year: number | null;
    vote_average: number;
    vote_count?: number;
    type: 'movie' | 'series';
    has_downloads?: boolean;
    popularity?: number;
    runtime?: number;
    release_date?: string | null;
    episode_info?: string;
  };

  // Format release date as "Feb 14, 2026"
  function formatReleaseDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  $: displayDate = item.release_date ? formatReleaseDate(item.release_date) : (item.year || 'N/A');

  $: posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/images/no-poster.svg';

  $: movieId = item.tmdb_id || item.id;
  $: href = item.type === 'movie' ? `/movie/${movieId}` : `/tv/${movieId}`;

  $: ratingColor = item.vote_average >= 7 ? '#22c55e' : item.vote_average >= 5 ? '#eab308' : '#ef4444';

  function formatRuntime(minutes: number | undefined): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
</script>

<a {href} class="group relative block rounded-xl overflow-hidden movie-card">
  <!-- Poster Image -->
  <div class="aspect-[2/3] relative overflow-hidden">
    <img
      src={posterUrl}
      alt={item.title}
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      loading="lazy"
    />

    <!-- Type Badge -->
    <div class="absolute top-2 left-2 z-10">
      <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider type-badge">
        {item.type === 'movie' ? 'Movie' : 'Series'}
      </span>
    </div>

    <!-- Episode Badge -->
    {#if item.episode_info}
      <div class="absolute top-2 right-2 z-10">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold episode-badge">
          {item.episode_info}
        </span>
      </div>
    {:else if item.has_downloads}
      <!-- Quality Badge -->
      <div class="absolute top-2 right-2 z-10">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold quality-badge">HD</span>
      </div>
    {/if}

    <!-- Rating Circle -->
    <div class="absolute bottom-2 right-2 z-10 rating-circle" style="--rating-color: {ratingColor}">
      <svg class="w-10 h-10 -rotate-90">
        <circle cx="20" cy="20" r="16" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
        <circle cx="20" cy="20" r="16" fill="none" stroke={ratingColor} stroke-width="3"
          stroke-dasharray="{(item.vote_average / 10) * 100.5} 100.5"
          stroke-linecap="round"/>
      </svg>
      <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
        {item.vote_average.toFixed(1)}
      </span>
    </div>

    <!-- Hover Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
      <div class="play-button mb-3">
        <Play size={28} class="text-white ml-1" fill="white" />
      </div>
      <h3 class="text-white font-bold text-center text-sm line-clamp-2 mb-2">{item.title}</h3>

      <!-- Quick Stats -->
      <div class="flex items-center gap-3 text-xs text-gray-300">
        {#if displayDate}
          <span>{displayDate}</span>
        {/if}
        {#if item.runtime}
          <span class="flex items-center gap-1">
            <Clock size={10} />
            {formatRuntime(item.runtime)}
          </span>
        {/if}
      </div>
    </div>

    <!-- Bottom Gradient -->
    <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
  </div>

  <!-- Info Section -->
  <div class="p-3 info-section">
    <h3 class="font-semibold text-sm line-clamp-1 mb-1.5 group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">
      {item.title}
    </h3>
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span style="color: var(--text-secondary);">{displayDate}</span>
        {#if item.popularity && item.popularity > 100}
          <span class="flex items-center gap-0.5 text-amber-400">
            <TrendingUp size={10} />
            Hot
          </span>
        {/if}
      </div>
      <div class="flex items-center gap-1">
        <Star size={12} class="text-amber-400" fill="#fbbf24" />
        <span style="color: var(--text-secondary);">{item.vote_average.toFixed(1)}</span>
      </div>
    </div>
  </div>

  <!-- Hover Border Effect -->
  <div class="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-400/50 transition-all duration-300 pointer-events-none"></div>
</a>

<style>
  .movie-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
  }
  .movie-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    border-color: rgba(251,191,36,0.4);
  }

  .type-badge {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #000;
  }

  .quality-badge {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
  }

  .episode-badge {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    letter-spacing: 0.05em;
  }

  .rating-circle {
    position: relative;
  }

  .play-button {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(220,38,38,0.5);
    transition: all 0.3s ease;
  }
  .movie-card:hover .play-button {
    transform: scale(1.1);
    box-shadow: 0 8px 30px rgba(220,38,38,0.6);
  }

  .info-section {
    background: var(--bg-card);
  }
</style>
