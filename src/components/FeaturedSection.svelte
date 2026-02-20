<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ChevronLeft, ChevronRight, Star, Trophy, TrendingUp, Calendar, Film } from 'lucide-svelte';

  interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average: number;
    year: number | null;
    release_date?: string;
    overview?: string;
  }

  interface BoxOfficeEntry {
    rank: number;
    title: string;
    weekend_gross: string;
    total_gross: string;
    tmdb_id?: number;
    poster_path?: string | null;
  }

  export let oscarMovies: Movie[] = [];
  export let top2026: Movie[] = [];
  export let top2024_25: Movie[] = [];
  export let top2020_23: Movie[] = [];
  export let boxOffice: BoxOfficeEntry[] = [];

  let activeTab: 'top2026' | 'top2024_25' | 'top2020_23' | 'boxoffice' | 'franchise' = 'boxoffice';
  let carouselContainer: HTMLDivElement;
  let scrollContainer: HTMLDivElement;
  let isPaused = false;
  let isTouching = false;
  let touchStartX = 0;
  let touchStartScrollLeft = 0;

  $: currentTabMovies = activeTab === 'top2026' ? top2026
    : activeTab === 'top2024_25' ? top2024_25
    : activeTab === 'top2020_23' ? top2020_23
    : [];

  $: featuredOscar = oscarMovies[0];

  function getPosterUrl(path: string | null): string {
    if (!path) return '/images/no-poster.svg';
    return `https://image.tmdb.org/t/p/w342${path}`;
  }

  function getBackdropUrl(path: string | null): string {
    if (!path) return '/images/no-backdrop.svg';
    return `https://image.tmdb.org/t/p/w780${path}`;
  }

  function pauseAnimation() {
    isPaused = true;
  }

  function resumeAnimation() {
    if (!isTouching) {
      isPaused = false;
    }
  }

  function handleTouchStart(e: TouchEvent) {
    isTouching = true;
    isPaused = true;
    touchStartX = e.touches[0].clientX;
    touchStartScrollLeft = scrollContainer?.scrollLeft || 0;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isTouching || !scrollContainer) return;
    const touchX = e.touches[0].clientX;
    const diff = touchStartX - touchX;
    scrollContainer.scrollLeft = touchStartScrollLeft + diff;
  }

  function handleTouchEnd() {
    isTouching = false;
    // Resume animation after a short delay
    setTimeout(() => {
      if (!isTouching) {
        isPaused = false;
      }
    }, 2000);
  }
</script>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Left Column: Oscar Nominations -->
    <div class="rounded-2xl relative overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border);">
      <!-- Golden accent gradient -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 z-10"></div>

      <!-- Featured Movie Image - Extended height -->
      {#if featuredOscar}
        <a href={`/movie/${featuredOscar.id}`} class="block relative h-[400px] overflow-hidden group">
          <img
            src={getBackdropUrl(featuredOscar.backdrop_path || featuredOscar.poster_path)}
            alt={featuredOscar.title}
            class="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-1 rounded text-xs font-bold bg-amber-500 text-black">16 Nominations</span>
              <span class="flex items-center gap-1 text-amber-400 text-sm">
                <Star size={14} fill="currentColor" />
                {featuredOscar.vote_average.toFixed(1)}
              </span>
            </div>
            <h3 class="text-2xl font-bold text-white">{featuredOscar.title}</h3>
          </div>
        </a>
      {/if}

      <!-- Carousel Section Below -->
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Trophy size={18} class="text-amber-400" />
            <h2 class="text-sm font-bold" style="color: var(--text-primary);">2026 Oscar Nominations</h2>
          </div>
          <a href="/oscars-2026" class="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
            View All →
          </a>
        </div>

        <!-- Carousel with smooth scroll and touch support -->
        <div
          class="relative overflow-x-auto hide-scrollbar"
          bind:this={scrollContainer}
          on:mouseenter={pauseAnimation}
          on:mouseleave={resumeAnimation}
          on:touchstart={handleTouchStart}
          on:touchmove={handleTouchMove}
          on:touchend={handleTouchEnd}
        >
          <div class="oscar-scroll-container flex gap-3" class:paused={isPaused}>
            {#each oscarMovies as movie, i}
              <a
                href={`/movie/${movie.id}`}
                class="flex-shrink-0 w-24 group"
              >
                <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-1">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    class="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <p class="text-[10px] font-medium line-clamp-1 text-center" style="color: var(--text-primary);">
                  {movie.title}
                </p>
              </a>
            {/each}
            <!-- Duplicate for seamless loop -->
            {#each oscarMovies as movie, i}
              <a
                href={`/movie/${movie.id}`}
                class="flex-shrink-0 w-24 group"
              >
                <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-1">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    class="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <p class="text-[10px] font-medium line-clamp-1 text-center" style="color: var(--text-primary);">
                  {movie.title}
                </p>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Tabs -->
    <div class="rounded-2xl p-5 relative overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border);">
      <!-- Tab Navigation -->
      <div class="flex flex-wrap gap-1 mb-4 pb-3" style="border-bottom: 1px solid var(--border);">
        <button
          on:click={() => activeTab = 'boxoffice'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'boxoffice'}
          class:text-black={activeTab === 'boxoffice'}
          style={activeTab !== 'boxoffice' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Box Office
        </button>
        <button
          on:click={() => activeTab = 'top2026'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'top2026'}
          class:text-black={activeTab === 'top2026'}
          style={activeTab !== 'top2026' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Top 2026
        </button>
        <button
          on:click={() => activeTab = 'top2024_25'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'top2024_25'}
          class:text-black={activeTab === 'top2024_25'}
          style={activeTab !== 'top2024_25' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          2024-25
        </button>
        <button
          on:click={() => activeTab = 'top2020_23'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'top2020_23'}
          class:text-black={activeTab === 'top2020_23'}
          style={activeTab !== 'top2020_23' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          2020-23
        </button>
        <button
          on:click={() => activeTab = 'franchise'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'franchise'}
          class:text-black={activeTab === 'franchise'}
          style={activeTab !== 'franchise' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Franchise
        </button>
      </div>

      <!-- Tab Content -->
      <div class="min-h-[280px]">
        {#if activeTab === 'boxoffice'}
          <!-- Box Office List -->
          <div class="space-y-2">
            {#each boxOffice.slice(0, 7) as entry, i}
              <a
                href={entry.tmdb_id ? `/movie/${entry.tmdb_id}` : '/box-office'}
                class="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              >
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
                  {i + 1}
                </span>
                {#if entry.poster_path}
                  <img src={getPosterUrl(entry.poster_path)} alt={entry.title} class="w-8 h-12 rounded object-cover" />
                {/if}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{entry.title}</p>
                  <p class="text-xs" style="color: var(--text-muted);">Weekend: {entry.weekend_gross}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold text-green-500">{entry.total_gross}</p>
                  <p class="text-xs" style="color: var(--text-muted);">Total</p>
                </div>
              </a>
            {/each}
          </div>
          <a href="/box-office" class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3" style="border-top: 1px solid var(--border);">
            View Full Box Office →
          </a>
        {:else if activeTab === 'franchise'}
          <!-- Franchise placeholder -->
          <div class="grid grid-cols-2 gap-3">
            {#each ['Marvel Cinematic Universe', 'DC Universe', 'Star Wars', 'Harry Potter', 'Fast & Furious', 'Jurassic World', 'James Bond 007', 'Transformers', 'Mission: Impossible', 'The Matrix'] as franchise}
              <a
                href="/franchises"
                class="p-3 rounded-lg transition-colors hover:bg-[var(--bg-hover)] text-center"
                style="border: 1px solid var(--border);"
              >
                <Film size={24} class="mx-auto mb-2 text-amber-400" />
                <p class="text-xs font-medium" style="color: var(--text-primary);">{franchise}</p>
              </a>
            {/each}
          </div>
          <a href="/franchises" class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3" style="border-top: 1px solid var(--border);">
            View All Franchises →
          </a>
        {:else}
          <!-- Movie Lists -->
          <div class="space-y-2">
            {#each currentTabMovies.slice(0, 7) as movie, i}
              <a
                href={`/movie/${movie.id}`}
                class="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              >
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
                  {i + 1}
                </span>
                <img src={getPosterUrl(movie.poster_path)} alt={movie.title} class="w-8 h-12 rounded object-cover" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{movie.title}</p>
                  <p class="text-xs" style="color: var(--text-muted);">{movie.year || 'TBA'}</p>
                </div>
                <div class="flex items-center gap-1 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span class="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
              </a>
            {/each}
          </div>
          <a
            href={activeTab === 'top2026' ? '/movies/top-2026' : activeTab === 'top2024_25' ? '/movies/top-2024-2025' : '/movies/top-2020-2023'}
            class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3"
            style="border-top: 1px solid var(--border);"
          >
            View All →
          </a>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .oscar-scroll-container {
    animation: scroll-left 30s linear infinite;
  }

  .oscar-scroll-container.paused {
    animation-play-state: paused;
  }

  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
</style>
