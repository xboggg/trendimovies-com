<script lang="ts">
  import { onMount } from 'svelte';
  import { Play, X, Clock, ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface WatchItem {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    type: 'movie' | 'series';
    href: string;
    visited_at: number;
  }

  const STORAGE_KEY = 'tm_continue_watching';

  let items: WatchItem[] = [];
  let dismissed: Set<number> = new Set();
  let loaded = false;

  onMount(() => {
    loadItems();
    loaded = true;
  });

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        items = JSON.parse(raw);
      }
    } catch {}
  }

  function dismiss(id: number) {
    dismissed.add(id);
    dismissed = dismissed;
    try {
      items = items.filter(i => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  $: visibleItems = items.filter(i => !dismissed.has(i.id));

  let scrollContainer: HTMLDivElement;

  function scroll(dir: 'left' | 'right') {
    if (!scrollContainer) return;
    scrollContainer.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  }
</script>

{#if loaded && visibleItems.length > 0}
<section class="py-6 sm:py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 sm:gap-3">
        <h2 class="text-lg sm:text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">
          Continue Watching
        </h2>
        <span class="item-count">{visibleItems.length}</span>
      </div>
      <div class="flex gap-2">
        <button on:click={() => scroll('left')} class="nav-btn"><ChevronLeft size={18} /></button>
        <button on:click={() => scroll('right')} class="nav-btn"><ChevronRight size={18} /></button>
      </div>
    </div>

    <div bind:this={scrollContainer} class="flex gap-3 overflow-x-auto hide-scrollbar pb-4 scroll-smooth snap-x snap-mandatory sm:snap-none">
      {#each visibleItems as item (item.id)}
        <a href={item.href} class="cw-card group snap-start">
          <div class="card-visual">
            <img
              src={item.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                : item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : '/images/no-poster.svg'}
              alt={item.title}
              class="visual-img"
              loading="lazy"
            />
            <div class="visual-gradient"></div>

            <button
              class="dismiss-btn"
              on:click|preventDefault|stopPropagation={() => dismiss(item.id)}
              title="Remove from list"
            >
              <X size={12} />
            </button>

            <div class="play-center">
              <div class="play-ring">
                <Play size={16} fill="white" class="text-white ml-0.5" />
              </div>
            </div>

            <div class="type-badge">{item.type === 'movie' ? 'Movie' : 'Series'}</div>

            <div class="bottom-info">
              <h3 class="font-bold text-xs sm:text-sm text-white line-clamp-1">{item.title}</h3>
            </div>
          </div>

          <div class="card-meta">
            <div class="flex items-center gap-1">
              <Clock size={10} class="text-gray-400" />
              <span class="meta-text">{timeAgo(item.visited_at)}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<style>
  .item-count {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    background: var(--bg-hover);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .nav-btn {
    width: 30px;
    height: 30px;
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
  .nav-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    color: var(--accent);
  }

  /* Mobile-first: smaller cards */
  .cw-card {
    flex-shrink: 0;
    width: 180px;
    border-radius: 10px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    text-decoration: none;
  }
  /* Tablet+ */
  @media (min-width: 640px) {
    .cw-card {
      width: 240px;
      border-radius: 12px;
    }
  }
  /* Desktop */
  @media (min-width: 1024px) {
    .cw-card {
      width: 280px;
    }
  }
  .cw-card:hover {
    transform: translateY(-4px);
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }

  .card-visual {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
  }
  .visual-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  .cw-card:hover .visual-img {
    transform: scale(1.05);
  }

  .visual-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%);
  }

  /* Dismiss: always visible on mobile, hover on desktop */
  .dismiss-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 1;
    transition: all 0.3s;
    z-index: 5;
  }
  @media (min-width: 640px) {
    .dismiss-btn {
      opacity: 0;
      width: 24px;
      height: 24px;
    }
    .cw-card:hover .dismiss-btn {
      opacity: 1;
    }
  }
  .dismiss-btn:hover {
    background: #ef4444;
  }

  .play-center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 3;
  }
  .cw-card:hover .play-center {
    opacity: 1;
  }

  .play-ring {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
    transition: transform 0.3s;
  }
  @media (min-width: 640px) {
    .play-ring {
      width: 48px;
      height: 48px;
    }
  }

  .type-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #000;
    z-index: 3;
    letter-spacing: 0.5px;
  }
  @media (min-width: 640px) {
    .type-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .bottom-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 8px;
    z-index: 2;
  }
  @media (min-width: 640px) {
    .bottom-info {
      padding: 8px 12px;
    }
  }

  .card-meta {
    display: flex;
    align-items: center;
    padding: 6px 8px;
  }
  @media (min-width: 640px) {
    .card-meta {
      padding: 8px 12px;
    }
  }
  .meta-text {
    font-size: 10px;
    color: var(--text-muted);
  }
  @media (min-width: 640px) {
    .meta-text {
      font-size: 11px;
    }
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
