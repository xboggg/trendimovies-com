<script lang="ts">
  import { TrendingUp, Play, ChevronLeft, ChevronRight, Eye } from 'lucide-svelte';

  interface TrendingItem {
    id: number;
    tmdb_id?: number;
    title: string;
    poster_path: string | null;
    year: number | null;
    type: 'movie' | 'series';
    view_count: number;
  }

  export let items: TrendingItem[] = [];
  export let title: string = 'Trending Now';
  export let subtitle: string = 'Most watched on TrendiMovies';
  export let seeAllLink: string = '';

  let scrollContainer: HTMLDivElement;

  function scroll(dir: 'left' | 'right') {
    if (!scrollContainer) return;
    scrollContainer.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  }

  function posterUrl(path: string | null): string {
    if (!path) return '/images/no-poster.svg';
    return path.startsWith('/images/') ? path : `https://image.tmdb.org/t/p/w500${path}`;
  }

  // 21500 -> "21.5k", 980 -> "980"
  function formatViews(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function hrefFor(item: TrendingItem): string {
    const mid = item.tmdb_id || item.id;
    return item.type === 'movie' ? `/movie/${mid}` : `/tv/${mid}`;
  }
</script>

{#if items.length > 0}
<section class="py-6 sm:py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <span class="fire-badge"><TrendingUp size={18} /></span>
        <div>
          <h2 class="text-lg sm:text-2xl md:text-3xl font-extrabold leading-none" style="color: var(--text-primary);">{title}</h2>
          <p class="text-[11px] sm:text-xs mt-0.5" style="color: var(--text-muted);">{subtitle}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        {#if seeAllLink}
          <a href={seeAllLink} class="hidden sm:inline text-xs font-medium mr-1" style="color: var(--text-muted);">See All →</a>
        {/if}
        <button on:click={() => scroll('left')} class="nav-btn" aria-label="Scroll left"><ChevronLeft size={18} /></button>
        <button on:click={() => scroll('right')} class="nav-btn" aria-label="Scroll right"><ChevronRight size={18} /></button>
      </div>
    </div>

    <div bind:this={scrollContainer} class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth snap-x">
      {#each items as item, i (item.id)}
        <a href={hrefFor(item)} class="tn-card group snap-start" title={item.title}>
          <!-- Big rank number behind the poster -->
          <span class="rank-num" class:top3={i < 3}>{i + 1}</span>
          <div class="poster-wrap">
            <img src={posterUrl(item.poster_path)} alt={item.title} class="poster-img" loading="lazy" />
            <div class="poster-grad"></div>

            <!-- view count badge -->
            <div class="views-badge">
              <Eye size={11} />
              <span>{formatViews(item.view_count)}</span>
            </div>

            <!-- play on hover -->
            <div class="play-center">
              <div class="play-ring"><Play size={16} fill="white" class="text-white ml-0.5" /></div>
            </div>

            <div class="title-overlay">
              <h3 class="title-text line-clamp-2">{item.title}</h3>
              {#if item.year}<span class="year-text">{item.year}</span>{/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<style>
  .fire-badge {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
    flex-shrink: 0;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nav-btn:hover { background: var(--bg-hover); border-color: var(--accent); color: var(--accent); }

  /* Card with big rank number to the left, ranked-list style */
  .tn-card {
    position: relative;
    flex-shrink: 0;
    display: block;
    padding-left: 30px;
    text-decoration: none;
    transition: transform 0.3s ease;
  }
  @media (min-width: 640px) { .tn-card { padding-left: 42px; } }
  .tn-card:hover { transform: translateY(-4px); }

  .rank-num {
    position: absolute;
    left: -6px;
    bottom: -6px;
    font-size: 64px;
    font-weight: 900;
    line-height: 0.8;
    color: transparent;
    -webkit-text-stroke: 2px var(--border);
    z-index: 0;
    pointer-events: none;
    font-family: system-ui, sans-serif;
  }
  @media (min-width: 640px) { .rank-num { font-size: 92px; left: -8px; } }
  .rank-num.top3 {
    -webkit-text-stroke: 2px rgba(245, 158, 11, 0.55);
  }

  .poster-wrap {
    position: relative;
    width: 130px;
    aspect-ratio: 2/3;
    border-radius: 10px;
    overflow: hidden;
    z-index: 1;
    background: var(--bg-hover);
    border: 1px solid var(--border);
  }
  @media (min-width: 640px) { .poster-wrap { width: 160px; border-radius: 12px; } }

  .poster-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
  .tn-card:hover .poster-img { transform: scale(1.06); }

  .poster-grad {
    position: absolute; inset: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 45%, transparent 70%);
  }

  .views-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 6px;
    background: rgba(0,0,0,0.72);
    color: #fbbf24;
    backdrop-filter: blur(4px);
    z-index: 2;
  }

  .play-center {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.3s; z-index: 2;
  }
  .tn-card:hover .play-center { opacity: 1; }
  .play-ring {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
  }

  .title-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 8px 9px; z-index: 2;
  }
  .title-text {
    font-size: 12px; font-weight: 700; color: #fff; line-height: 1.15;
  }
  @media (min-width: 640px) { .title-text { font-size: 13px; } }
  .year-text { font-size: 10px; font-weight: 600; color: rgba(251,191,36,0.9); }

  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
</style>
