<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Play, Info, Star, ChevronUp, ChevronDown } from 'lucide-svelte';

  interface TrendingItem {
    id: number;
    title: string;
    slug: string;
    overview: string;
    backdrop_path: string | null;
    poster_path: string | null;
    vote_average: number;
    year: number | null;
    genres: { id: number; name: string }[];
    type: 'movie' | 'series';
  }

  export let featured: TrendingItem | null = null;
  export let trending: TrendingItem[] = [];

  let currentTrendingIndex = 0;
  let autoScrollInterval: ReturnType<typeof setInterval>;

  $: backdropUrl = featured?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${featured.backdrop_path}`
    : '/images/no-backdrop.svg';

  onMount(() => {
    // Auto-scroll trending every 5 seconds
    autoScrollInterval = setInterval(() => {
      currentTrendingIndex = (currentTrendingIndex + 1) % Math.min(trending.length, 8);
    }, 5000);
  });

  onDestroy(() => {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
  });

  function scrollTrending(direction: 'up' | 'down') {
    if (direction === 'up') {
      currentTrendingIndex = currentTrendingIndex === 0 ? Math.min(trending.length, 8) - 1 : currentTrendingIndex - 1;
    } else {
      currentTrendingIndex = (currentTrendingIndex + 1) % Math.min(trending.length, 8);
    }
  }

  function getPosterUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w342${path}` : '/images/no-poster.svg';
  }

  function getHref(item: TrendingItem): string {
    return item.type === 'movie' ? `/m/${item.slug}` : `/s/${item.slug}`;
  }
</script>

<section class="relative h-[70vh] md:h-[80vh] overflow-hidden">
  <!-- Background Image -->
  <div class="absolute inset-0">
    <img
      src={backdropUrl}
      alt={featured?.title || 'Featured'}
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent"></div>
  </div>

  <div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-full">
      <!-- Featured Content (Left Side) -->
      <div class="flex-1 flex flex-col justify-center pr-8">
        {#if featured}
          <div class="max-w-xl">
            <!-- Genres -->
            {#if featured.genres && featured.genres.length > 0}
              <div class="flex flex-wrap gap-2 mb-4">
                {#each featured.genres.slice(0, 3) as genre}
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    {genre.name}
                  </span>
                {/each}
              </div>
            {/if}

            <!-- Title -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {featured.title}
            </h1>

            <!-- Meta Info -->
            <div class="flex items-center gap-4 mb-4 text-gray-300">
              {#if featured.year}
                <span>{featured.year}</span>
              {/if}
              <div class="flex items-center">
                <Star size={18} class="text-yellow-400 mr-1" fill="currentColor" />
                <span>{featured.vote_average.toFixed(1)}</span>
              </div>
              <span class="uppercase text-sm font-medium" style="color: var(--accent);">
                {featured.type === 'movie' ? 'Movie' : 'Series'}
              </span>
            </div>

            <!-- Overview -->
            <p class="text-gray-300 text-base md:text-lg mb-6 line-clamp-3">
              {featured.overview || 'No description available.'}
            </p>

            <!-- Buttons -->
            <div class="flex gap-4">
              <a
                href={getHref(featured)}
                class="btn-primary flex items-center gap-2"
              >
                <Play size={20} fill="white" />
                Watch Now
              </a>
              <a
                href={getHref(featured)}
                class="btn-secondary flex items-center gap-2"
              >
                <Info size={20} />
                More Info
              </a>
            </div>
          </div>
        {/if}
      </div>

      <!-- Trending Carousel (Right Side) -->
      <div class="hidden lg:flex flex-col justify-center w-64">
        <div class="relative">
          <!-- Up Arrow -->
          <button
            on:click={() => scrollTrending('up')}
            class="absolute -top-8 left-1/2 -translate-x-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <ChevronUp size={20} class="text-white" />
          </button>

          <!-- Trending List -->
          <div class="space-y-3 overflow-hidden">
            {#each trending.slice(0, 8) as item, index}
              <a
                href={getHref(item)}
                class="flex items-center gap-3 p-2 rounded-lg transition-all duration-300 {index === currentTrendingIndex ? 'bg-white/20 scale-105' : 'opacity-50'}"
                style={index === currentTrendingIndex ? '' : 'transform: scale(0.95);'}
              >
                <span class="text-2xl font-bold text-white/50 w-8">{index + 1}</span>
                <img
                  src={getPosterUrl(item.poster_path)}
                  alt={item.title}
                  class="w-12 h-16 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-medium text-sm line-clamp-1">{item.title}</h4>
                  <div class="flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.year || 'N/A'}</span>
                    <Star size={10} class="text-yellow-400" fill="currentColor" />
                    <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </a>
            {/each}
          </div>

          <!-- Down Arrow -->
          <button
            on:click={() => scrollTrending('down')}
            class="absolute -bottom-8 left-1/2 -translate-x-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <ChevronDown size={20} class="text-white" />
          </button>
        </div>

        <!-- Trending Label -->
        <div class="text-center mt-12">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Trending This Week
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
