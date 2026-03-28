<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Eye, TrendingUp, Play, Flame, Activity } from 'lucide-svelte';

  interface TrendingItem {
    id: number;
    tmdb_id?: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    year: number | null;
    vote_average: number;
    type: 'movie' | 'series';
    viewers?: number;
    trend_score?: number;
  }

  export let items: TrendingItem[] = [];

  const mockItems: TrendingItem[] = [
    { id: 1, title: 'Thunderbolts*', poster_path: '/gbGHezV6yrhua0KfAgwzknWYJSf.jpg', backdrop_path: '/yDp5UQHBO2bz0vEo1F0VcDMSvnB.jpg', year: 2025, vote_average: 8.1, type: 'movie', viewers: 14523, trend_score: 95 },
    { id: 2, title: 'Sinners', poster_path: '/9xhm6AO1HXIY6JCYVFbOOJLPah.jpg', year: 2025, vote_average: 7.9, type: 'movie', viewers: 12847, trend_score: 88 },
    { id: 3, title: 'Daredevil: Born Again', poster_path: '/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg', year: 2025, vote_average: 8.5, type: 'series', viewers: 11205, trend_score: 82 },
    { id: 4, title: 'Adolescence', poster_path: '/v9De2KqsmIxSxNMVGODuBfH5wfj.jpg', year: 2025, vote_average: 9.0, type: 'series', viewers: 9832, trend_score: 76 },
    { id: 5, title: 'The Amateur', poster_path: '/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg', year: 2025, vote_average: 7.4, type: 'movie', viewers: 8491, trend_score: 71 },
    { id: 6, title: 'White Lotus S3', poster_path: '/bE2GiFLLJcOuG1bCOqnahC4bWtN.jpg', year: 2025, vote_average: 8.2, type: 'series', viewers: 7644, trend_score: 65 },
    { id: 7, title: 'Snow White', poster_path: '/jFmMFbMEad0fmxl0EKkSAqVjfjT.jpg', year: 2025, vote_average: 5.8, type: 'movie', viewers: 6102, trend_score: 58 },
    { id: 8, title: 'Andor S2', poster_path: '/uNMlwRCPlZQhDaJlwL0Ivbu6v4r.jpg', year: 2025, vote_average: 8.7, type: 'series', viewers: 5480, trend_score: 52 },
  ];

  $: displayItems = items.length > 0 ? items : mockItems;

  // Simulate live viewer count fluctuation
  let liveViewers: Record<number, number> = {};
  let totalViewers = 0;
  let pulseActive = false;
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    // Initialize viewer counts
    displayItems.forEach(item => {
      liveViewers[item.id] = item.viewers || Math.floor(Math.random() * 10000 + 1000);
    });
    updateTotal();

    // Fluctuate counts every 2 seconds
    interval = setInterval(() => {
      displayItems.forEach(item => {
        const change = Math.floor(Math.random() * 200) - 80; // -80 to +120 bias upward
        liveViewers[item.id] = Math.max(100, (liveViewers[item.id] || 1000) + change);
      });
      liveViewers = liveViewers;
      updateTotal();
      // Pulse animation
      pulseActive = true;
      setTimeout(() => { pulseActive = false; }, 500);
    }, 2500);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  function updateTotal() {
    totalViewers = Object.values(liveViewers).reduce((a, b) => a + b, 0);
  }

  function formatViewers(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  }

  function getHeatColor(score: number): string {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 40) return '#eab308';
    return '#22c55e';
  }
</script>

<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="live-dot" class:pulse={pulseActive}></div>
        <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">
          Trending Right Now
        </h2>
      </div>
      <div class="total-viewers">
        <Eye size={14} />
        <span class="viewers-count">{formatViewers(totalViewers)}</span>
        <span class="viewers-label">watching</span>
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {#each displayItems as item, i}
        {@const viewers = liveViewers[item.id] || 0}
        {@const score = item.trend_score || 50}
        <a
          href={item.type === 'movie' ? `/movie/${item.tmdb_id || item.id}` : `/tv/${item.tmdb_id || item.id}`}
          class="pulse-card group"
          style="--delay: {i * 60}ms"
        >
          <!-- Poster -->
          <div class="card-poster">
            <img
              src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '/images/no-poster.svg'}
              alt={item.title}
              class="poster-img"
              loading="lazy"
            />

            <!-- Heat indicator border -->
            <div class="heat-border" style="--heat-color: {getHeatColor(score)}"></div>

            <!-- Live viewers badge -->
            <div class="live-badge">
              <div class="live-dot-small" class:pulse={pulseActive}></div>
              <Eye size={10} />
              <span>{formatViewers(viewers)}</span>
            </div>

            <!-- Trend score -->
            <div class="trend-score" style="background: {getHeatColor(score)}20; color: {getHeatColor(score)}; border-color: {getHeatColor(score)}40">
              <Flame size={10} />
              {score}
            </div>

            <!-- Hover overlay -->
            <div class="hover-overlay">
              <div class="play-circle">
                <Play size={24} fill="white" class="text-white ml-1" />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="card-info">
            <h3 class="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">
              {item.title}
            </h3>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs" style="color: var(--text-muted);">{item.year}</span>
              <!-- Heat bar -->
              <div class="heat-bar">
                <div class="heat-fill" style="width: {score}%; background: {getHeatColor(score)}"></div>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .live-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
    transition: box-shadow 0.3s;
  }
  .live-dot.pulse {
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.3);
  }

  .total-viewers {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    font-size: 13px;
  }
  .viewers-count {
    font-weight: 800;
    color: white;
    font-variant-numeric: tabular-nums;
  }
  .viewers-label {
    color: var(--text-muted);
    font-size: 11px;
  }

  .pulse-card {
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    text-decoration: none;
  }
  .pulse-card:hover {
    transform: translateY(-6px);
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
    transition: transform 0.5s;
  }
  .pulse-card:hover .poster-img {
    transform: scale(1.08);
  }

  .heat-border {
    position: absolute;
    inset: 0;
    border: 2px solid var(--heat-color);
    border-radius: 0;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .pulse-card:hover .heat-border {
    opacity: 0.6;
  }

  .live-badge {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    color: white;
    font-size: 10px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    z-index: 3;
  }
  .live-dot-small {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
  }
  .live-dot-small.pulse {
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
  }

  .trend-score {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 2px 7px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
    border: 1px solid;
    backdrop-filter: blur(4px);
    z-index: 3;
  }

  .hover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .pulse-card:hover .hover-overlay {
    opacity: 1;
  }

  .play-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
    transform: scale(0.8);
    transition: transform 0.3s;
  }
  .pulse-card:hover .play-circle {
    transform: scale(1);
  }

  .card-info {
    padding: 10px;
  }

  .heat-bar {
    width: 40px;
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .heat-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }
</style>
