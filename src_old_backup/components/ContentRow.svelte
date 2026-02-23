<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import MovieCard from './MovieCard.svelte';

  interface ContentItem {
    id: number;
    tmdb_id?: number;
    title: string;
    slug?: string;
    poster_path: string | null;
    year: number | null;
    vote_average: number;
    type: 'movie' | 'series';
    has_downloads?: boolean;
    created_at?: string;
  }

  export let title: string;
  export let items: ContentItem[] = [];
  export let seeAllLink: string = '';

  let scrollContainer: HTMLDivElement;

  function isNew(createdAt?: string): boolean {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created > sevenDaysAgo;
  }

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainer) return;
    const scrollAmount = scrollContainer.clientWidth * 0.8;
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
</script>

<section class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl md:text-2xl font-bold" style="color: var(--text-primary);">
        {title}
      </h2>
      {#if seeAllLink}
        <a
          href={seeAllLink}
          class="text-sm font-medium hover:underline"
          style="color: var(--accent);"
        >
          See All
        </a>
      {/if}
    </div>

    <!-- Carousel Container -->
    <div class="relative group">
      <!-- Left Arrow -->
      <button
        on:click={() => scroll('left')}
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);"
      >
        <ChevronLeft size={24} style="color: var(--text-primary);" />
      </button>

      <!-- Scrollable Content -->
      <div
        bind:this={scrollContainer}
        class="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
      >
        {#each items as item (item.id)}
          <div class="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
            <MovieCard {item} />
          </div>
        {/each}
      </div>

      <!-- Right Arrow -->
      <button
        on:click={() => scroll('right')}
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);"
      >
        <ChevronRight size={24} style="color: var(--text-primary);" />
      </button>

      <!-- Gradient Edges -->
      <div class="absolute left-0 top-0 bottom-4 w-8 gradient-left pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="absolute right-0 top-0 bottom-4 w-8 gradient-right pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  </div>
</section>
