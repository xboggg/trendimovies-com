<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bell, BellOff, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface UpcomingItem {
    id: number;
    tmdb_id?: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    release_date: string;
    vote_average: number;
    type: 'movie' | 'series';
    genres?: string[];
    overview?: string;
  }

  export let items: UpcomingItem[] = [];

  const mockItems: UpcomingItem[] = [
    { id: 1, title: 'Fantastic Four: First Steps', poster_path: '/vkDtTopxIYBqhSGBxXQaAfnCA3Q.jpg', backdrop_path: '/yDp5UQHBO2bz0vEo1F0VcDMSvnB.jpg', release_date: '2025-07-25', vote_average: 0, type: 'movie', genres: ['Action', 'Sci-Fi'], overview: 'Marvel\'s first family finally arrives in the MCU' },
    { id: 2, title: 'Superman', poster_path: '/dD7Mll7ByImz2VPmBbKqCbNIvkP.jpg', release_date: '2025-07-11', vote_average: 0, type: 'movie', genres: ['Action', 'Adventure'], overview: 'James Gunn reboots the Man of Steel for a new era' },
    { id: 3, title: 'Jurassic World Rebirth', poster_path: '/tkXD5AxzGMRsKEJarBVVaPcpJuZ.jpg', release_date: '2025-07-02', vote_average: 0, type: 'movie', genres: ['Action', 'Sci-Fi'], overview: 'Dinosaurs roam again in this epic new chapter' },
    { id: 4, title: 'The Running Man', poster_path: '/kwGo0fKRvFhn5ShGniaBWiEjfLs.jpg', release_date: '2025-11-07', vote_average: 0, type: 'movie', genres: ['Action', 'Thriller'], overview: 'A reimagining of the classic Stephen King story' },
    { id: 5, title: 'Tron: Ares', poster_path: '/xjhLjPxHqJxGnMVvEEMsaTdmhel.jpg', release_date: '2025-10-10', vote_average: 0, type: 'movie', genres: ['Sci-Fi', 'Action'], overview: 'Enter the Grid once more in this stunning sequel' },
    { id: 6, title: 'Wicked Part Two', poster_path: '/czM6cxO6djPJjimxD1pyW7GkO3L.jpg', release_date: '2025-11-21', vote_average: 0, type: 'movie', genres: ['Fantasy', 'Musical'], overview: 'The conclusion to the beloved Oz musical saga' },
  ];

  $: displayItems = items.length > 0 ? items : mockItems;

  // Countdown state
  let countdowns: Record<number, { days: number; hours: number; mins: number; secs: number }> = {};
  let interval: ReturnType<typeof setInterval>;
  let notified: Set<number> = new Set();

  function calculateCountdown(dateStr: string) {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      secs: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }

  function updateCountdowns() {
    const updated: typeof countdowns = {};
    displayItems.forEach(item => {
      updated[item.id] = calculateCountdown(item.release_date);
    });
    countdowns = updated;
  }

  onMount(() => {
    updateCountdowns();
    interval = setInterval(updateCountdowns, 1000);
    // Load notified state from localStorage
    try {
      const saved = localStorage.getItem('tm_notify_upcoming');
      if (saved) notified = new Set(JSON.parse(saved));
    } catch {}
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  function toggleNotify(id: number) {
    if (notified.has(id)) {
      notified.delete(id);
    } else {
      notified.add(id);
    }
    notified = notified; // trigger reactivity
    try {
      localStorage.setItem('tm_notify_upcoming', JSON.stringify([...notified]));
    } catch {}
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  let scrollContainer: HTMLDivElement;

  function scroll(dir: 'left' | 'right') {
    if (!scrollContainer) return;
    scrollContainer.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }
</script>

<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="coming-badge">
          <Calendar size={14} />
          COMING SOON
        </div>
        <h2 class="text-xl md:text-2xl font-extrabold" style="color: var(--text-primary);">
          Mark Your Calendar
        </h2>
      </div>
      <div class="flex gap-2">
        <button on:click={() => scroll('left')} class="nav-btn"><ChevronLeft size={18} /></button>
        <button on:click={() => scroll('right')} class="nav-btn"><ChevronRight size={18} /></button>
      </div>
    </div>

    <!-- Horizontal scroll -->
    <div bind:this={scrollContainer} class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth">
      {#each displayItems as item, i}
        {@const cd = countdowns[item.id]}
        <div class="coming-card group" style="--delay: {i * 100}ms">
          <!-- Poster -->
          <div class="card-poster">
            <img
              src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '/images/no-poster.svg'}
              alt={item.title}
              class="poster-img"
              loading="lazy"
            />
            <!-- Overlay -->
            <div class="poster-overlay">
              <div class="countdown-grid">
                {#if cd}
                  <div class="cd-unit">
                    <span class="cd-num">{cd.days}</span>
                    <span class="cd-label">DAYS</span>
                  </div>
                  <div class="cd-sep">:</div>
                  <div class="cd-unit">
                    <span class="cd-num">{String(cd.hours).padStart(2, '0')}</span>
                    <span class="cd-label">HRS</span>
                  </div>
                  <div class="cd-sep">:</div>
                  <div class="cd-unit">
                    <span class="cd-num">{String(cd.mins).padStart(2, '0')}</span>
                    <span class="cd-label">MIN</span>
                  </div>
                  <div class="cd-sep cd-blink">:</div>
                  <div class="cd-unit">
                    <span class="cd-num cd-sec">{String(cd.secs).padStart(2, '0')}</span>
                    <span class="cd-label">SEC</span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Notify button -->
            <button
              class="notify-btn"
              class:notified={notified.has(item.id)}
              on:click|preventDefault|stopPropagation={() => toggleNotify(item.id)}
              title={notified.has(item.id) ? 'Cancel notification' : 'Notify me on release'}
            >
              {#if notified.has(item.id)}
                <BellOff size={14} />
              {:else}
                <Bell size={14} />
              {/if}
            </button>
          </div>

          <!-- Info -->
          <div class="card-info">
            <h3 class="font-bold text-sm line-clamp-1 group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">
              {item.title}
            </h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="release-date">
                <Calendar size={10} />
                {formatDate(item.release_date)}
              </span>
            </div>
            {#if item.genres}
              <div class="flex flex-wrap gap-1 mt-2">
                {#each item.genres.slice(0, 2) as genre}
                  <span class="genre-tag">{genre}</span>
                {/each}
              </div>
            {/if}
            {#if item.overview}
              <p class="text-xs mt-2 line-clamp-2" style="color: var(--text-muted);">{item.overview}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .coming-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #000;
    font-weight: 800;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    letter-spacing: 1px;
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

  .coming-card {
    flex-shrink: 0;
    width: 220px;
    border-radius: 14px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
  }
  .coming-card:hover {
    transform: translateY(-6px);
    border-color: rgba(245, 158, 11, 0.4);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }

  .card-poster {
    position: relative;
    aspect-ratio: 2/3;
    overflow: hidden;
  }
  .poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s, filter 0.5s;
  }
  .coming-card:hover .poster-img {
    transform: scale(1.05);
    filter: brightness(0.4);
  }

  .poster-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    background: rgba(0,0,0,0.3);
  }
  .coming-card:hover .poster-overlay {
    opacity: 1;
  }

  .countdown-grid {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .cd-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 8px;
    padding: 6px 8px;
    min-width: 38px;
    backdrop-filter: blur(8px);
  }
  .cd-num {
    font-size: 18px;
    font-weight: 800;
    color: #fbbf24;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .cd-sec {
    color: #ef4444;
  }
  .cd-label {
    font-size: 8px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    margin-top: 2px;
    letter-spacing: 0.5px;
  }
  .cd-sep {
    font-size: 18px;
    font-weight: 800;
    color: rgba(255,255,255,0.3);
    line-height: 1;
  }
  .cd-blink {
    animation: blink 1s step-end infinite;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }

  .notify-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.15);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    backdrop-filter: blur(4px);
    z-index: 5;
  }
  .notify-btn:hover {
    background: var(--accent);
    border-color: var(--accent);
    transform: scale(1.1);
  }
  .notify-btn.notified {
    background: #f59e0b;
    border-color: #f59e0b;
    color: #000;
  }

  .card-info {
    padding: 12px;
  }

  .release-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #f59e0b;
    font-weight: 600;
  }

  .genre-tag {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(255,255,255,0.08);
    color: var(--text-secondary);
    border: 1px solid rgba(255,255,255,0.05);
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
