<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ChevronLeft, ChevronRight, Star, Trophy, TrendingUp, Calendar, Film, Clock, Play } from 'lucide-svelte';

  interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    vote_average: number;
    year: number | null;
    release_date?: string;
    overview?: string;
  }

  interface BoxOfficeEntry {
    rank: number;
    title: string;
    weekend_gross: string;
    total_gross: string;
    tmdb_id?: number;
    poster_path?: string | null;
  }

  export let oscarMovies: Movie[] = [];
  export let top2026: Movie[] = [];
  export let top2024_25: Movie[] = [];
  export let top2020_23: Movie[] = [];
  export let boxOffice: BoxOfficeEntry[] = [];
  export let comingSoon: Movie[] = [];

  let activeTab: 'top2026' | 'top2024_25' | 'top2020_23' | 'boxoffice' | 'franchise' | 'comingsoon' = 'boxoffice';
  let carouselContainer: HTMLDivElement;
  let scrollContainer: HTMLDivElement;
  let comingSoonContainer: HTMLDivElement;
  let isPaused = false;
  let isTouching = false;
  let touchStartX = 0;
  let touchStartScrollLeft = 0;
  let comingSoonIndex = 0;

  $: currentTabMovies = activeTab === 'top2026' ? top2026
    : activeTab === 'top2024_25' ? top2024_25
    : activeTab === 'top2020_23' ? top2020_23
    : [];

  $: featuredOscar = oscarMovies[0];
  $: currentComingSoon = comingSoon[comingSoonIndex] || null;

  function getPosterUrl(path: string | null): string {
    if (!path) return '/images/no-poster.svg';
    if (path.startsWith('/images/')) return path;
    return `https://image.tmdb.org/t/p/w342${path}`;
  }

  function getBackdropUrl(path: string | null): string {
    if (!path) return '/images/no-backdrop.svg';
    return `https://image.tmdb.org/t/p/w780${path}`;
  }

  function getDaysUntilRelease(dateStr: string | undefined): number | null {
    if (!dateStr) return null;
    const releaseDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    releaseDate.setHours(0, 0, 0, 0);
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  }

  function formatReleaseDate(dateStr: string | undefined): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function pauseAnimation() {
    isPaused = true;
  }

  function resumeAnimation() {
    if (!isTouching) {
      isPaused = false;
    }
  }

  function handleTouchStart(e: TouchEvent) {
    isTouching = true;
    isPaused = true;
    touchStartX = e.touches[0].clientX;
    touchStartScrollLeft = scrollContainer?.scrollLeft || 0;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isTouching || !scrollContainer) return;
    const touchX = e.touches[0].clientX;
    const diff = touchStartX - touchX;
    scrollContainer.scrollLeft = touchStartScrollLeft + diff;
  }

  function handleTouchEnd() {
    isTouching = false;
    setTimeout(() => {
      if (!isTouching) {
        isPaused = false;
      }
    }, 2000);
  }

  function nextComingSoon() {
    comingSoonIndex = (comingSoonIndex + 1) % comingSoon.length;
  }

  function prevComingSoon() {
    comingSoonIndex = (comingSoonIndex - 1 + comingSoon.length) % comingSoon.length;
  }



  // Live countdown state for Coming Soon
  let countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  function updateCountdown() {
    if (!currentComingSoon?.release_date) {
      countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }
    const releaseDate = new Date(currentComingSoon.release_date);
    releaseDate.setHours(0, 0, 0, 0);
    const now = new Date();
    const diff = releaseDate.getTime() - now.getTime();

    if (diff <= 0) {
      countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }

    countdown = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  // Update countdown every second
  let countdownInterval: ReturnType<typeof setInterval>;

  // Auto-rotate coming soon carousel
  let comingSoonInterval: ReturnType<typeof setInterval>;
  onMount(() => {
    comingSoonInterval = setInterval(() => {
      if (activeTab === 'comingsoon' && comingSoon.length > 1) {
        nextComingSoon();
      }
    }, 5000);

    // Start countdown timers
    updateCountdown();
    countdownInterval = setInterval(() => {
      updateCountdown();
      }, 1000);
  });

  onDestroy(() => {
    if (comingSoonInterval) clearInterval(comingSoonInterval);
    if (countdownInterval) clearInterval(countdownInterval);
  });

  // Update countdown when movie changes
  $: if (currentComingSoon) updateCountdown();

  // Touch swipe for Coming Soon carousel
  let comingSoonTouchStartX = 0;
  let comingSoonTouchEndX = 0;

  function handleComingSoonTouchStart(e: TouchEvent) {
    comingSoonTouchStartX = e.touches[0].clientX;
  }

  function handleComingSoonTouchMove(e: TouchEvent) {
    comingSoonTouchEndX = e.touches[0].clientX;
  }

  function handleComingSoonTouchEnd() {
    const diff = comingSoonTouchStartX - comingSoonTouchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextComingSoon();
      } else {
        prevComingSoon();
      }
    }
    comingSoonTouchStartX = 0;
    comingSoonTouchEndX = 0;
  }
</script>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Left Column: Oscar Nominations -->
    <div class="rounded-2xl relative overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border);">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 z-10"></div>

      {#if featuredOscar}
        <a href={`/movie/${featuredOscar.id}`} class="block relative h-[400px] overflow-hidden group">
          <img
            src="/images/oscars-2026.jpg"
            alt="98th Academy Awards"
            class="w-full h-full object-contain transition-transform group-hover:scale-105"
            style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-1 rounded text-xs font-bold bg-amber-500 text-black flex items-center gap-1"><Trophy size={12} /> Best Actor Winner</span>
              <span class="flex items-center gap-1 text-amber-400 text-sm">
                <Star size={14} fill="currentColor" />
                {featuredOscar.vote_average.toFixed(1)}
              </span>
            </div>
            <h3 class="text-2xl font-bold text-white">{featuredOscar.title}</h3>
          </div>

          <!-- Winners Announced Badge -->
          <div class="absolute bottom-4 right-4 z-10" on:click|preventDefault|stopPropagation={() => window.location.href = '/oscars-2026'}>
            <div class="oscar-winners-badge">
              <Trophy size={16} class="text-amber-400" />
              <div>
                <span class="oscar-winners-title">Winners Announced</span>
                <span class="oscar-winners-subtitle">98th Academy Awards</span>
              </div>
            </div>
          </div>
        </a>
      {/if}

      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Trophy size={18} class="text-amber-400" />
            <h2 class="text-sm font-bold" style="color: var(--text-primary);">2026 Oscar Winners</h2>
          </div>
          <a href="/oscars-2026" class="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
            View All →
          </a>
        </div>

        <div
          class="relative overflow-x-auto hide-scrollbar"
          bind:this={scrollContainer}
          on:mouseenter={pauseAnimation}
          on:mouseleave={resumeAnimation}
          on:touchstart={handleTouchStart}
          on:touchmove={handleTouchMove}
          on:touchend={handleTouchEnd}
        >
          <div class="oscar-scroll-container flex gap-3" class:paused={isPaused}>
            {#each oscarMovies as movie, i}
              <a href={`/movie/${movie.id}`} class="flex-shrink-0 w-24 group">
                <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-1">
                  <img src={getPosterUrl(movie.poster_path)} alt={movie.title} class="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <p class="text-[10px] font-medium line-clamp-1 text-center" style="color: var(--text-primary);">{movie.title}</p>
              </a>
            {/each}
            {#each oscarMovies as movie, i}
              <a href={`/movie/${movie.id}`} class="flex-shrink-0 w-24 group">
                <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-1">
                  <img src={getPosterUrl(movie.poster_path)} alt={movie.title} class="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <p class="text-[10px] font-medium line-clamp-1 text-center" style="color: var(--text-primary);">{movie.title}</p>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Tabs -->
    <div class="rounded-2xl p-5 relative overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border);">
      <!-- Tab Navigation -->
      <div class="flex flex-wrap gap-1 mb-4 pb-3" style="border-bottom: 1px solid var(--border);">
        <button
          on:click={() => activeTab = 'boxoffice'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'boxoffice'}
          class:text-black={activeTab === 'boxoffice'}
          style={activeTab !== 'boxoffice' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Box Office
        </button>
        <button
          on:click={() => activeTab = 'top2026'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'top2026'}
          class:text-black={activeTab === 'top2026'}
          style={activeTab !== 'top2026' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Top 2026
        </button>
        <button
          on:click={() => activeTab = 'top2024_25'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'top2024_25'}
          class:text-black={activeTab === 'top2024_25'}
          style={activeTab !== 'top2024_25' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          2024-25
        </button>
        <button
          on:click={() => activeTab = 'top2020_23'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'top2020_23'}
          class:text-black={activeTab === 'top2020_23'}
          style={activeTab !== 'top2020_23' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          2020-23
        </button>
        <button
          on:click={() => activeTab = 'franchise'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'franchise'}
          class:text-black={activeTab === 'franchise'}
          style={activeTab !== 'franchise' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Franchise
        </button>
        <button
          on:click={() => activeTab = 'comingsoon'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-purple-500={activeTab === 'comingsoon'}
          class:text-white={activeTab === 'comingsoon'}
          style={activeTab !== 'comingsoon' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Coming Soon
        </button>
      </div>

      <!-- Tab Content -->
      <div class="min-h-[280px]">
        {#if activeTab === 'comingsoon'}
          <!-- Coming Soon Carousel -->
          {#if currentComingSoon}
            <div
              class="relative h-full touch-pan-y"
              on:touchstart={handleComingSoonTouchStart}
              on:touchmove={handleComingSoonTouchMove}
              on:touchend={handleComingSoonTouchEnd}
            >
              <!-- Main Featured Card -->
              <a href={`/movie/${currentComingSoon.id}`} class="block relative rounded-xl overflow-hidden group">
                <div class="relative h-[480px]">
                  <img
                    src={getBackdropUrl(currentComingSoon.backdrop_path || currentComingSoon.poster_path)}
                    alt={currentComingSoon.title}
                    class="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                  <!-- Live Countdown Timer -->
                  {#if getDaysUntilRelease(currentComingSoon.release_date)}
                    <div class="absolute top-3 right-3 flex items-center gap-1">
                      <div class="countdown-box bg-red-600">
                        <span class="countdown-num">{String(countdown.days).padStart(2, '0')}</span>
                        <span class="countdown-label">DAYS</span>
                      </div>
                      <div class="countdown-box bg-gray-800">
                        <span class="countdown-num">{String(countdown.hours).padStart(2, '0')}</span>
                        <span class="countdown-label">HRS</span>
                      </div>
                      <div class="countdown-box bg-gray-800">
                        <span class="countdown-num">{String(countdown.minutes).padStart(2, '0')}</span>
                        <span class="countdown-label">MIN</span>
                      </div>
                      <div class="countdown-box bg-gray-800">
                        <span class="countdown-num">{String(countdown.seconds).padStart(2, '0')}</span>
                        <span class="countdown-label">SEC</span>
                      </div>
                    </div>
                  {/if}

                  <!-- Rating Badge -->
                  {#if currentComingSoon.vote_average > 0}
                    <div class="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-amber-400 text-xs font-bold flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      {currentComingSoon.vote_average.toFixed(1)}
                    </div>
                  {/if}

                  <!-- Info Overlay -->
                  <div class="absolute bottom-0 left-0 right-0 p-4">
                    <h3 class="text-xl font-bold text-white mb-1">{currentComingSoon.title}</h3>
                    <p class="text-xs text-gray-300 line-clamp-2 mb-3">{currentComingSoon.overview || 'No description available'}</p>
                    <div class="flex items-center gap-3">
                      {#if currentComingSoon.release_date}
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-medium">
                          <Calendar size={12} />
                          {formatReleaseDate(currentComingSoon.release_date)}
                        </span>
                      {/if}
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium group-hover:bg-red-600 transition-colors">
                        <Play size={12} fill="currentColor" />
                        Details
                      </span>
                    </div>
                  </div>
                </div>
              </a>

              <!-- Navigation Arrows -->
              {#if comingSoon.length > 1}
                <button
                  on:click={prevComingSoon}
                  class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  on:click={nextComingSoon}
                  class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                >
                  <ChevronRight size={18} />
                </button>
              {/if}

              <!-- Dots Indicator -->
              {#if comingSoon.length > 1}
                <div class="flex justify-center gap-1.5 mt-3">
                  {#each comingSoon.slice(0, 10) as _, i}
                    <button
                      on:click={() => comingSoonIndex = i}
                      class="w-2 h-2 rounded-full transition-all"
                      class:bg-purple-500={i === comingSoonIndex}
                      class:w-4={i === comingSoonIndex}
                      style={i !== comingSoonIndex ? 'background-color: var(--border);' : ''}
                    ></button>
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <p class="text-center py-12 text-[#666]">No upcoming movies</p>
          {/if}
          <a href="/upcoming" class="block text-center text-sm font-medium text-purple-400 hover:text-purple-300 mt-3 pt-3" style="border-top: 1px solid var(--border);">
            View All Upcoming →
          </a>
        {:else if activeTab === 'boxoffice'}
          <!-- Box Office List -->
          <div class="space-y-2">
            {#each boxOffice.slice(0, 7) as entry, i}
              <a
                href={entry.tmdb_id ? `/movie/${entry.tmdb_id}` : '/box-office'}
                class="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              >
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
                  {i + 1}
                </span>
                {#if entry.poster_path}
                  <img src={getPosterUrl(entry.poster_path)} alt={entry.title} class="w-8 h-12 rounded object-cover" loading="lazy" />
                {/if}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{entry.title}</p>
                  <p class="text-xs" style="color: var(--text-muted);">Weekend: {entry.weekend_gross}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold text-green-500">{entry.total_gross}</p>
                  <p class="text-xs" style="color: var(--text-muted);">Total</p>
                </div>
              </a>
            {/each}
          </div>
          <a href="/box-office" class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3" style="border-top: 1px solid var(--border);">
            View Full Box Office →
          </a>
        {:else if activeTab === 'franchise'}
          <!-- Franchise placeholder -->
          <div class="grid grid-cols-2 gap-3">
            {#each ['Marvel Cinematic Universe', 'DC Universe', 'Star Wars', 'Harry Potter', 'Fast & Furious', 'Jurassic World', 'James Bond 007', 'Transformers', 'Mission: Impossible', 'The Matrix'] as franchise}
              <a
                href="/franchises"
                class="p-3 rounded-lg transition-colors hover:bg-[var(--bg-hover)] text-center"
                style="border: 1px solid var(--border);"
              >
                <Film size={24} class="mx-auto mb-2 text-amber-400" />
                <p class="text-xs font-medium" style="color: var(--text-primary);">{franchise}</p>
              </a>
            {/each}
          </div>
          <a href="/franchises" class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3" style="border-top: 1px solid var(--border);">
            View All Franchises →
          </a>
        {:else}
          <!-- Movie Lists -->
          <div class="space-y-2">
            {#each currentTabMovies.slice(0, 7) as movie, i}
              <a
                href={`/movie/${movie.id}`}
                class="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              >
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
                  {i + 1}
                </span>
                <img src={getPosterUrl(movie.poster_path)} alt={movie.title} class="w-8 h-12 rounded object-cover" loading="lazy" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" style="color: var(--text-primary);">{movie.title}</p>
                  <p class="text-xs" style="color: var(--text-muted);">{movie.year || 'TBA'}</p>
                </div>
                <div class="flex items-center gap-1 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span class="text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
              </a>
            {/each}
          </div>
          <a
            href={activeTab === 'top2026' ? '/movies/top-2026' : activeTab === 'top2024_25' ? '/movies/top-2024-2025' : '/movies/top-2020-2023'}
            class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3"
            style="border-top: 1px solid var(--border);"
          >
            View All →
          </a>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- ── CANNES 2026 WIDGET ─────────────────────────────────────────────────── -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="grid lg:grid-cols-2 gap-6">

    <!-- Cannes 2026 Feature -->
    <a href="/cannes-2026" class="group block rounded-2xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
       style="background: linear-gradient(135deg, #1a0005 0%, #2d0010 50%, #1a0008 100%); border: 1px solid rgba(181,12,27,0.3);">
      <!-- Top bar -->
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #B50C1B, #F7D000, #B50C1B);"></div>

      <!-- Background glow -->
      <div class="absolute inset-0 opacity-20" style="background: radial-gradient(ellipse at 30% 50%, #B50C1B, transparent 60%);"></div>

      <div class="relative p-6">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🌴</span>
            <div>
              <p class="text-xs uppercase tracking-widest font-semibold mb-0.5" style="color: rgba(247,208,0,0.7);">Festival de Cannes</p>
              <h2 class="text-xl font-black text-white">Cannes 2026</h2>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-black" style="color: #F7D000;">29</div>
            <div class="text-xs text-gray-500 uppercase tracking-wide">days</div>
          </div>
        </div>

        <!-- Date strip -->
        <div class="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);">
          <span class="text-sm">📅</span>
          <span class="text-sm text-gray-300">May 13–24, 2026 · Cannes, France</span>
          <span class="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style="background: rgba(181,12,27,0.3); color: #ff6b7a; border: 1px solid rgba(181,12,27,0.4);">Upcoming</span>
        </div>

        <!-- Award pills -->
        <div class="flex flex-wrap gap-2 mb-5">
          {#each ["Palme d'Or", "Grand Prix", "Jury Prize", "Best Director", "Best Actor/Actress"] as award}
            <span class="px-2.5 py-1 rounded-lg text-xs font-medium" style="background: rgba(247,208,0,0.1); color: rgba(247,208,0,0.8); border: 1px solid rgba(247,208,0,0.2);">{award}</span>
          {/each}
        </div>

        <!-- CTA -->
        <div class="flex items-center justify-between">
          <p class="text-xs text-gray-500">79th Edition · Official Competition Lineup</p>
          <span class="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all group-hover:scale-105 group-hover:shadow-lg" style="background: linear-gradient(135deg, #B50C1B, #8B0011);">
            View Lineup →
          </span>
        </div>
      </div>
    </a>

    <!-- Events Calendar Summary -->
    <a href="/events" class="group block rounded-2xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
       style="background-color: var(--bg-card); border: 1px solid var(--border);">
      <!-- Top bar -->
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);"></div>

      <div class="p-6">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📅</span>
            <h2 class="font-black text-lg" style="color: var(--text-primary);">Awards Calendar</h2>
          </div>
          <span class="text-xs font-medium group-hover:text-yellow-300 transition-colors" style="color: var(--text-muted);">View All →</span>
        </div>

        <div class="space-y-3">
          {#each [
            { emoji: "🌴", name: "Cannes 2026", date: "May 13", days: 29, color: "#B50C1B", status: "upcoming" },
            { emoji: "🎬", name: "MTV Awards", date: "Jun 7", days: 54, color: "#FF0033", status: "upcoming" },
            { emoji: "🦁", name: "Venice 2026", date: "Aug 26", days: 134, color: "#8B0000", status: "upcoming" },
            { emoji: "🏆", name: "Oscars 2026", date: "Mar 15", days: -30, color: "#D4AF37", status: "past" },
          ] as event}
            <div class="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-hover)]">
              <span class="text-xl w-8 text-center flex-shrink-0">{event.emoji}</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate" style="color: var(--text-primary);">{event.name}</p>
                <p class="text-xs" style="color: var(--text-muted);">{event.date}, 2026</p>
              </div>
              {#if event.status === "past"}
                <span class="px-2 py-0.5 rounded text-[10px] font-bold" style="background: rgba(107,114,128,0.2); color: #9ca3af;">Past</span>
              {:else}
                <span class="px-2 py-1 rounded-lg text-xs font-bold" style="background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2);">{event.days}d</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </a>

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

  .oscar-scroll-container {
    animation: scroll-left 30s linear infinite;
  }

  .oscar-scroll-container.paused {
    animation-play-state: paused;
  }

  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  /* Oscar Winners Badge Styles */
  .oscar-winners-badge {
    background: rgba(0, 0, 0, 0.85);
    border: 2px solid #d4af37;
    border-radius: 12px;
    padding: 10px 14px;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .oscar-winners-title {
    display: block;
    color: #d4af37;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .oscar-winners-subtitle {
    display: block;
    color: rgba(255,255,255,0.7);
    font-size: 10px;
    font-weight: 500;
  }

  /* Coming Soon Countdown timer styles */
  .countdown-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
    border-radius: 6px;
    min-width: 40px;
  }

  .countdown-num {
    font-size: 16px;
    font-weight: 700;
    color: white;
    line-height: 1;
  }

  .countdown-label {
    font-size: 8px;
    font-weight: 600;
    color: rgba(255,255,255,0.8);
    margin-top: 2px;
  }
</style>
