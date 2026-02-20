<script lang="ts">
  import { Star } from 'lucide-svelte';

  interface Movie {
    id: number;
    tmdb_id?: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average: number;
    year: number | null;
    type: 'movie' | 'series';
  }

  export let items: Movie[] = [];

  function getPosterUrl(path: string | null): string {
    if (!path) return '/images/no-poster.svg';
    return `https://image.tmdb.org/t/p/w342${path}`;
  }

  function getLink(item: Movie): string {
    return item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  }
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
  {#each items as item, index}
    <a
      href={getLink(item)}
      class="group relative rounded-lg overflow-hidden transition-transform hover:scale-105"
      style="background-color: var(--bg-card);"
    >
      <div class="aspect-[2/3] relative">
        <img
          src={getPosterUrl(item.poster_path)}
          alt={item.title}
          class="w-full h-full object-cover"
          loading={index < 12 ? 'eager' : 'lazy'}
        />

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <!-- Rank badge for top items -->
        {#if index < 10}
          <div class="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
            {index + 1}
          </div>
        {/if}

        <!-- Rating badge -->
        <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style="background-color: rgba(0,0,0,0.7); color: #fbbf24;">
          <Star size={10} fill="currentColor" />
          {item.vote_average.toFixed(1)}
        </div>

        <!-- Hover info -->
        <div class="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
          <p class="text-white text-sm font-semibold line-clamp-2">{item.title}</p>
          <p class="text-gray-400 text-xs mt-1">{item.year || 'TBA'}</p>
        </div>
      </div>

      <!-- Always visible info -->
      <div class="p-3">
        <h3 class="font-medium text-sm line-clamp-2" style="color: var(--text-primary);">
          {item.title}
        </h3>
        <p class="text-xs mt-1" style="color: var(--text-muted);">
          {item.year || 'TBA'}
        </p>
      </div>
    </a>
  {/each}
</div>

{#if items.length === 0}
  <div class="text-center py-12" style="color: var(--text-secondary);">
    <p>No items found.</p>
  </div>
{/if}
