<script lang="ts">
  import { onMount } from 'svelte';
  import { Play, TrendingUp, TrendingDown, Minus, Star } from 'lucide-svelte';

  interface Top10Item {
    id: number;
    tmdb_id?: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    year: number | null;
    vote_average: number;
    type: 'movie' | 'series';
    genres?: string[];
    movement?: 'up' | 'down' | 'new' | 'same';
    prev_rank?: number;
  }

  export let items: Top10Item[] = [];

  // Mock data if none provided
  const mockItems: Top10Item[] = [
    { id: 1, title: 'Thunderbolts*', poster_path: '/gbGHezV6yrhua0KfAgwzknWYJSf.jpg', backdrop_path: '/yDp5UQHBO2bz0vEo1F0VcDMSvnB.jpg', year: 2025, vote_average: 8.1, type: 'movie', genres: ['Action', 'Sci-Fi'], movement: 'new' },
    { id: 2, title: 'Sinners', poster_path: '/9xhm6AO1HXIY6JCYVFbOOJLPah.jpg', backdrop_path: '/1GjSaqMU5bYRnClPGhwEbBQirkp.jpg', year: 2025, vote_average: 7.9, type: 'movie', genres: ['Horror', 'Thriller'], movement: 'up', prev_rank: 5 },
    { id: 3, title: 'Daredevil: Born Again', poster_path: '/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg', backdrop_path: '/3AEoFb8OKTEOkPbd7MwJt2kzOkv.jpg', year: 2025, vote_average: 8.5, type: 'series', genres: ['Action', 'Crime'], movement: 'down', prev_rank: 1 },
    { id: 4, title: 'The Amateur', poster_path: '/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg', backdrop_path: '/dLCl4lEyrhdpICBBqMjSCYlOmcn.jpg', year: 2025, vote_average: 7.4, type: 'movie', genres: ['Thriller'], movement: 'up', prev_rank: 8 },
    { id: 5, title: 'Adolescence', poster_path: '/v9De2KqsmIxSxNMVGODuBfH5wfj.jpg', backdrop_path: '/gkyEdMzP7wRBjLFkvJdch78nmcU.jpg', year: 2025, vote_average: 9.0, type: 'series', genres: ['Drama', 'Crime'], movement: 'same' },
    { id: 6, title: 'Snow White', poster_path: '/jFmMFbMEad0fmxl0EKkSAqVjfjT.jpg', backdrop_path: '/dLCl4lEyrhdpICBBqMjSCYlOmcn.jpg', year: 2025, vote_average: 5.8, type: 'movie', genres: ['Fantasy', 'Musical'], movement: 'down', prev_rank: 3 },
    { id: 7, title: 'White Lotus S3', poster_path: '/bE2GiFLLJcOuG1bCOqnahC4bWtN.jpg', backdrop_path: null, year: 2025, vote_average: 8.2, type: 'series', genres: ['Comedy', 'Drama'], movement: 'up', prev_rank: 10 },
    { id: 8, title: 'A Minecraft Movie', poster_path: '/jQBtmKFa9Bfhw44UOGYdCbluMmZ.jpg', backdrop_path: null, year: 2025, vote_average: 6.5, type: 'movie', genres: ['Adventure', 'Comedy'], movement: 'new' },
    { id: 9, title: 'Andor S2', poster_path: '/uNMlwRCPlZQhDaJlwL0Ivbu6v4r.jpg', backdrop_path: null, year: 2025, vote_average: 8.7, type: 'series', genres: ['Sci-Fi', 'Thriller'], movement: 'same' },
    { id: 10, title: 'Mission: Impossible 8', poster_path: '/z0R3d6dJPYMixkFnbnK37qTzLRi.jpg', backdrop_path: null, year: 2025, vote_average: 7.8, type: 'movie', genres: ['Action', 'Thriller'], movement: 'down', prev_rank: 7 },
  ];

  $: displayItems = items.length > 0 ? items.slice(0, 10) : mockItems;

  let hoveredIndex = -1;
  let mounted = false;

  onMount(() => {
    setTimeout(() => { mounted = true; }, 100);
  });

  function getRatingColor(rating: number): string {
    if (rating >= 7) return '#22c55e';
    if (rating >= 5) return '#eab308';
    return '#ef4444';
  }

  function getMovementText(item: Top10Item): string {
    if (item.movement === 'new') return 'NEW';
    if (item.movement === 'up' && item.prev_rank) return `+${item.prev_rank - displayItems.indexOf(item) - 1}`;
    if (item.movement === 'down' && item.prev_rank) return `${item.prev_rank - displayItems.indexOf(item) - 1}`;
    return '—';
  }
</script>

<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="top10-badge">TOP 10</div>
      <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">
        This Week
      </h2>
      <div class="h-px flex-1 bg-gradient-to-r from-red-600/50 to-transparent"></div>
    </div>

    <!-- Top 10 Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {#each displayItems as item, i}
        {@const rank = i + 1}
        <a
          href={item.type === 'movie' ? `/movie/${item.tmdb_id || item.id}` : `/tv/${item.tmdb_id || item.id}`}
          class="top10-item group"
          class:mounted
          style="--delay: {i * 80}ms"
          on:mouseenter={() => hoveredIndex = i}
          on:mouseleave={() => hoveredIndex = -1}
        >
          <!-- Rank Number -->
          <div class="rank-number" class:rank-gold={rank <= 3}>
            <span class="rank-text">{rank}</span>
            {#if rank <= 3}
              <div class="rank-glow"></div>
            {/if}
          </div>

          <!-- Poster -->
          <div class="poster-wrapper">
            <img
              src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : '/images/no-poster.svg'}
              alt={item.title}
              class="poster-img"
              loading="lazy"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 py-2">
            <h3 class="font-bold text-sm md:text-base truncate group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">
              {item.title}
            </h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="type-tag">{item.type === 'movie' ? 'Movie' : 'Series'}</span>
              <span class="text-xs" style="color: var(--text-secondary);">{item.year}</span>
              {#if item.genres}
                <span class="text-xs hidden sm:inline" style="color: var(--text-muted);">
                  {item.genres.slice(0, 2).join(' · ')}
                </span>
              {/if}
            </div>
            <!-- Rating bar -->
            <div class="flex items-center gap-2 mt-2">
              <Star size={12} fill="#fbbf24" class="text-amber-400" />
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width: {item.vote_average * 10}%; background: {getRatingColor(item.vote_average)}"></div>
              </div>
              <span class="text-xs font-bold" style="color: {getRatingColor(item.vote_average)}">{item.vote_average.toFixed(1)}</span>
            </div>
          </div>

          <!-- Movement Indicator -->
          <div class="movement-indicator">
            {#if item.movement === 'new'}
              <span class="movement-new">NEW</span>
            {:else if item.movement === 'up'}
              <div class="movement-up">
                <TrendingUp size={14} />
              </div>
            {:else if item.movement === 'down'}
              <div class="movement-down">
                <TrendingDown size={14} />
              </div>
            {:else}
              <div class="movement-same">
                <Minus size={14} />
              </div>
            {/if}
          </div>

          <!-- Play on hover -->
          <div class="play-hover">
            <Play size={18} fill="white" class="text-white ml-0.5" />
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .top10-badge {
    background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
    color: white;
    font-weight: 900;
    font-size: 14px;
    padding: 4px 12px;
    border-radius: 4px;
    letter-spacing: 1px;
  }

  .top10-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(12px);
    text-decoration: none;
  }
  .top10-item.mounted {
    opacity: 1;
    transform: translateY(0);
    transition-delay: var(--delay);
  }
  .top10-item:hover {
    background: var(--bg-hover);
    border-color: rgba(251, 191, 36, 0.3);
    transform: translateX(4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  }

  .rank-number {
    position: relative;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rank-text {
    font-size: 32px;
    font-weight: 900;
    line-height: 1;
    color: var(--text-muted);
    font-style: italic;
    transition: color 0.3s;
  }
  .rank-gold .rank-text {
    background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3));
  }
  .rank-glow {
    position: absolute;
    inset: -4px;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  .poster-wrapper {
    width: 52px;
    height: 78px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--border);
    transition: border-color 0.3s;
  }
  .top10-item:hover .poster-wrapper {
    border-color: rgba(251, 191, 36, 0.5);
  }
  .poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }
  .top10-item:hover .poster-img {
    transform: scale(1.1);
  }

  .type-tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 3px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #000;
    letter-spacing: 0.5px;
  }

  .rating-bar-bg {
    flex: 1;
    max-width: 100px;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .rating-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 1s ease;
  }

  .movement-indicator {
    flex-shrink: 0;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .movement-new {
    font-size: 10px;
    font-weight: 800;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.15);
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }
  .movement-up {
    color: #22c55e;
  }
  .movement-down {
    color: #ef4444;
  }
  .movement-same {
    color: var(--text-muted);
  }

  .play-hover {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
  }
  .top10-item:hover .play-hover {
    opacity: 1;
    transform: scale(1);
  }
</style>
