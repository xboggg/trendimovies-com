<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ChevronRight, ChevronLeft } from 'lucide-svelte';

  interface Collection {
    id: string;
    title: string;
    subtitle: string;
    link: string;
    gradient: string;
    posters: string[];
  }

  export let collections: Collection[] = [];

  let track: HTMLDivElement;
  let paused = false;
  let autoTimer: ReturnType<typeof setInterval>;
  const AUTO_MS = 4000;

  function cardStep(): number {
    if (!track) return 0;
    const card = track.querySelector('.collection-card') as HTMLElement | null;
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || '16') || 16;
    return card.offsetWidth + gap;
  }

  function next() {
    if (!track) return;
    const step = cardStep();
    // loop back to start when we reach the end
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: step, behavior: 'smooth' });
    }
  }
  function prev() {
    if (!track) return;
    track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  }

  onMount(() => {
    autoTimer = setInterval(() => {
      if (!paused && collections.length > 1) next();
    }, AUTO_MS);
  });
  onDestroy(() => { if (autoTimer) clearInterval(autoTimer); });
</script>

{#if collections.length > 0}
<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">Collections</h2>
        <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background: var(--bg-hover); color: var(--text-secondary);">Curated for you</span>
      </div>
      <div class="flex gap-2">
        <button on:click={prev} class="nav-btn" aria-label="Previous"><ChevronLeft size={18} /></button>
        <button on:click={next} class="nav-btn" aria-label="Next"><ChevronRight size={18} /></button>
      </div>
    </div>

    <!-- Carousel track -->
    <div
      bind:this={track}
      class="carousel"
      on:mouseenter={() => paused = true}
      on:mouseleave={() => paused = false}
      on:touchstart={() => paused = true}
      on:touchend={() => setTimeout(() => paused = false, 3000)}
    >
      {#each collections as collection}
        <a href={collection.link} class="collection-card group">
          <div class="card-bg" style="background: {collection.gradient}">
            <div class="poster-stack">
              {#each collection.posters.slice(0, 4) as poster, j}
                <div class="stacked-poster" style="--offset: {j * 28}px; --rotate: {-6 + j * 4}deg; z-index: {4 - j}">
                  <img src={`https://image.tmdb.org/t/p/w185${poster}`} alt="" class="stacked-img" loading="lazy" />
                </div>
              {/each}
            </div>
            <div class="card-overlay"></div>
          </div>
          <div class="card-content">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors">{collection.title}</h3>
                <p class="text-xs text-white/60 mt-0.5">{collection.subtitle}</p>
              </div>
              <div class="collection-arrow"><ChevronRight size={18} /></div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<style>
  .nav-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);
    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
  }
  .nav-btn:hover { background: var(--bg-hover); border-color: var(--accent, #e50914); }

  /* one horizontal scroll/swipe row, snap to each card */
  .carousel {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .carousel::-webkit-scrollbar { display: none; }

  .collection-card {
    position: relative;
    flex: 0 0 100%;              /* mobile: ONE card per view */
    scroll-snap-align: start;
    border-radius: 16px;
    overflow: hidden;
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-decoration: none;
    transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    border: 1px solid rgba(255,255,255,0.05);
  }
  /* tablet: ~2 per view, desktop: ~3 per view */
  @media (min-width: 640px) { .collection-card { flex-basis: calc((100% - 16px) / 2); } }
  @media (min-width: 1024px) { .collection-card { flex-basis: calc((100% - 32px) / 3); } }

  .collection-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .card-bg { position: absolute; inset: 0; overflow: hidden; }
  .poster-stack { position: absolute; right: -10px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; }
  .stacked-poster {
    position: absolute; right: var(--offset); width: 70px; height: 100px; border-radius: 8px; overflow: hidden;
    transform: rotate(var(--rotate)); box-shadow: -4px 4px 15px rgba(0,0,0,0.4);
    border: 2px solid rgba(255,255,255,0.15); transition: transform 0.4s ease;
  }
  .collection-card:hover .stacked-poster { transform: rotate(0deg) translateX(-8px); }
  .stacked-img { width: 100%; height: 100%; object-fit: cover; }
  .card-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%); }
  .card-content { position: relative; z-index: 2; padding: 16px 20px; }
  .collection-arrow {
    width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s; flex-shrink: 0;
  }
  .collection-card:hover .collection-arrow { background: #e50914; transform: translateX(4px); }
</style>
