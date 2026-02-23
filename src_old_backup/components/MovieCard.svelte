<script lang="ts">
  import { Star, Play } from 'lucide-svelte';

  export let item: {
    id: number;
    tmdb_id?: number;
    title: string;
    slug?: string;
    poster_path: string | null;
    year: number | null;
    vote_average: number;
    type: 'movie' | 'series';
    has_downloads?: boolean;
  };

  $: posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/images/no-poster.svg';

  $: movieId = item.tmdb_id || item.id;
  $: href = item.type === 'movie' ? `/movie/${movieId}` : `/tv/${movieId}`;
</script>

<a
  {href}
  class="group relative block rounded-lg overflow-hidden card-hover"
  style="background-color: var(--bg-card);"
>
  <!-- Poster Image -->
  <div class="aspect-[2/3] relative overflow-hidden">
    <img
      src={posterUrl}
      alt={item.title}
      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      loading="lazy"
    />

    <!-- Overlay on Hover -->
    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
      <div class="w-14 h-14 rounded-full flex items-center justify-center mb-3" style="background-color: var(--accent);">
        <Play size={28} class="text-white ml-1" fill="white" />
      </div>
      <h3 class="text-white font-semibold text-center text-sm line-clamp-2">{item.title}</h3>
      {#if item.year}
        <p class="text-gray-300 text-xs mt-1">{item.year}</p>
      {/if}
      <div class="flex items-center mt-2">
        <Star size={14} class="text-yellow-400 mr-1" fill="currentColor" />
        <span class="text-white text-sm">{item.vote_average.toFixed(1)}</span>
      </div>
    </div>

    <!-- Quality Badge -->
    {#if item.has_downloads}
      <div class="absolute top-2 right-2">
        <span class="badge badge-quality text-xs">HD</span>
      </div>
    {/if}

    <!-- Gradient at bottom -->
    <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent"></div>
  </div>

  <!-- Title & Info (visible by default) -->
  <div class="p-3">
    <h3 class="font-medium text-sm line-clamp-1" style="color: var(--text-primary);">{item.title}</h3>
    <div class="flex items-center justify-between mt-1">
      <span class="text-xs" style="color: var(--text-secondary);">{item.year || 'N/A'}</span>
      <div class="flex items-center">
        <Star size={12} class="text-yellow-400 mr-1" fill="currentColor" />
        <span class="text-xs" style="color: var(--text-secondary);">{item.vote_average.toFixed(1)}</span>
      </div>
    </div>
  </div>
</a>
