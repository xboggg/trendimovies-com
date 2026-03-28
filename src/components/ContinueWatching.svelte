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
  const MAX_ITEMS = 12;

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
    // Also remove from storage
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
    scrollContainer.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  }
</script>

{#if loaded && visibleItems.length > 0}
<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">
          Continue Watching
        </h2>
        <span class="item-count">{visibleItems.length}</span>
      </div>
      <div class="flex gap-2">
        <button on:click={() => scroll('left')} class="nav-btn"><ChevronLeft size={18} /></button>
        <button on:click={() => scroll('right')} class="nav-btn"><ChevronRight size={18} /></button>
      </div>
    </div>

    <!-- Cards -->
    <div bind:this={scrollContainer} class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth">
      {#each visibleItems as item (item.id)}
        <a href={item.href} class="cw-card group">
          <!-- Backdrop/Poster as wide card -->
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

            <!-- Gradient overlay -->
            <div class="visual-gradient"></div>

            <!-- Dismiss button -->
            <button
              class="dismiss-btn"
              on:click|preventDefault|stopPropagation={() => dismiss(item.id)}
              title="Remove from list"
            >
              <X size={14} />
            </button>

            <!-- Play button center -->
            <div class="play-center">
              <div class="play-ring">
                <Play size={20} fill="white" class="text-white ml-0.5" />
              </div>
            </div>

            <!-- Type badge -->
            <div class="type-badge">{item.type === 'movie' ? 'Movie' : 'Series'}</div>

            <!-- Bottom info overlay -->
            <div class="bottom-info">
              <h3 class="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
            </div>
          </div>

          <!-- Meta info -->
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
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    background: var(--bg-hover);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
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
  .nav-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    color: var(--accent);
  }

  .cw-card {
    flex-shrink: 0;
    width: 280px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    text-decoration: none;
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

  .dismiss-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0,0,0,0.5);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s;
    z-index: 5;
  }
  .cw-card:hover .dismiss-btn {
    opacity: 1;
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
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
    transition: transform 0.3s;
  }
  .cw-card:hover .play-ring {
    transform: scale(1.1);
  }

  .type-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 4px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #000;
    z-index: 3;
    letter-spacing: 0.5px;
  }

  .bottom-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 12px;
    z-index: 2;
  }

  .card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
  }
  .meta-text {
    font-size: 11px;
    color: var(--text-muted);
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
