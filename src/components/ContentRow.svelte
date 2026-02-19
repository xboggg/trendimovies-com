<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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
    episode_info?: string;
  }

  export let title: string;
  export let items: ContentItem[] = [];
  export let seeAllLink: string = '';
  export let autoScroll: boolean = false;

  let scrollContainer: HTMLDivElement;
  let animationId: number;
  let isPaused = false;
  let scrollSpeed = 0.5; // pixels per frame (~30px/sec at 60fps)

  onMount(() => {
    if (autoScroll && scrollContainer) {
      startAutoScroll();
      // Pause on hover, resume on leave
      scrollContainer.addEventListener('mouseenter', pauseAutoScroll);
      scrollContainer.addEventListener('mouseleave', resumeAutoScroll);
    }
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (scrollContainer) {
      scrollContainer.removeEventListener('mouseenter', pauseAutoScroll);
      scrollContainer.removeEventListener('mouseleave', resumeAutoScroll);
    }
  });

  function startAutoScroll() {
    function tick() {
      if (!scrollContainer || isPaused) {
        animationId = requestAnimationFrame(tick);
        return;
      }
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      if (scrollContainer.scrollLeft >= maxScroll - 1) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollSpeed;
      }
      animationId = requestAnimationFrame(tick);
    }
    animationId = requestAnimationFrame(tick);
  }

  function pauseAutoScroll() {
    isPaused = true;
  }

  function resumeAutoScroll() {
    isPaused = false;
  }

  function isNew(createdAt?: string): boolean {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created > sevenDaysAgo;
  }

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainer) return;
    // Pause auto-scroll during manual navigation
    isPaused = true;
    const scrollAmount = scrollContainer.clientWidth * 0.8;
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    // Resume auto-scroll after the smooth scroll finishes
    if (autoScroll) {
      setTimeout(() => { isPaused = false; }, 1500);
    }
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
        class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
        class:scroll-smooth={!autoScroll}
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
</style>
