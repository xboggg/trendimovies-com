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
    updated_at?: string;
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
  export let topMovies: Movie[] = [];
  export let boxOffice: BoxOfficeEntry[] = [];
  export let comingSoon: Movie[] = [];
  export let latestAdditions: Movie[] = [];

  // "Just Added" card: posters + count of movies added in the last 7 days.
  $: latestPosters = latestAdditions.filter((m) => m.poster_path).slice(0, 4);
  $: newThisWeekCount = latestAdditions.filter((m) => {
    if (!m.updated_at) return false;
    const added = new Date(m.updated_at).getTime();
    return !Number.isNaN(added) && (Date.now() - added) <= 7 * 86400000;
  }).length;

  // ── "JUST DROPPED" cinematic auto-reel ──────────────────────────────────
  // Reel uses the freshest additions that have artwork (prefer a backdrop for
  // the big spotlight). No new data is fetched — reuses `latestAdditions`.
  $: reelMovies = latestAdditions
    .filter((m) => m.poster_path || m.backdrop_path)
    .slice(0, 8);
  let reelIndex = 0;
  let reelInterval: ReturnType<typeof setInterval>;
  let reelPaused = false;
  const REEL_MS = 4500;

  $: currentReel = reelMovies[reelIndex] || null;

  // True if the title was added within the last 48h → shows a "NEW" pulse.
  function isFresh(m: Movie | null): boolean {
    if (!m?.updated_at) return false;
    const t = new Date(m.updated_at).getTime();
    return !Number.isNaN(t) && (Date.now() - t) <= 2 * 86400000;
  }

  function reelNext() {
    if (reelMovies.length === 0) return;
    reelIndex = (reelIndex + 1) % reelMovies.length;
  }
  function goToReel(i: number) {
    reelIndex = i;
  }
  // Keep index valid if the data shrinks.
  $: if (reelIndex >= reelMovies.length && reelMovies.length > 0) reelIndex = 0;

  let activeTab: 'topmovies' | 'boxoffice' | 'franchise' | 'comingsoon' = 'boxoffice';
  let carouselContainer: HTMLDivElement;
  let scrollContainer: HTMLDivElement;
  let comingSoonContainer: HTMLDivElement;
  let isPaused = false;
  let isTouching = false;
  let touchStartX = 0;
  let touchStartScrollLeft = 0;
  let comingSoonIndex = 0;

  $: currentTabMovies = activeTab === 'topmovies' ? topMovies : [];

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

  function getCannesStatus() {
    const start = new Date('2026-05-13T00:00:00');
    const end   = new Date('2026-05-24T23:59:59');
    const now   = new Date();
    if (now < start) return { phase: 'upcoming' as const, dayOfFestival: 0, daysUntil: Math.ceil((start.getTime()-now.getTime())/86400000), totalDays: 12 };
    if (now > end)   return { phase: 'ended'    as const, dayOfFestival: 0, daysUntil: 0, totalDays: 12 };
    const dayOfFestival = Math.floor((now.getTime()-start.getTime())/86400000) + 1;
    return { phase: 'live' as const, dayOfFestival, daysUntil: 0, totalDays: 12 };
  }

  // Awards Calendar — major film/TV festivals & award shows.
  // AUTO-ROLLS: each event stores month/day (not a fixed year). The displayed
  // year is computed from the current date, so the calendar advances every year
  // with no manual edits. `prize` labels the top award; `winners` maps a year to
  // that year's winning film, shown inline once the event has passed.
  const _awardsRaw = [
    { emoji: "⭐", label: "Critics' Choice", month: 1,  day: 4,  prize: "Best Picture",
      winners: { 2026: "One Battle After Another" } },
    { emoji: "🏅", label: "Golden Globes",   month: 1,  day: 11, prize: "Best Drama",
      winners: { 2026: "Hamnet" } },
    { emoji: "🎿", label: "Sundance",        month: 1,  day: 22, prize: "Grand Jury",
      winners: { 2026: "Josephine" }, hideOnCard: true },
    { emoji: "🐻", label: "Berlinale",       month: 2,  day: 12, prize: "Golden Bear",
      winners: { 2026: "Yellow Letters" }, hideOnCard: true },
    { emoji: "🎭", label: "BAFTA Film",      month: 2,  day: 22, prize: "Best Film",
      winners: { 2026: "One Battle After Another" } },
    { emoji: "🎸", label: "SXSW",            month: 3,  day: 12, prize: "Narrative",
      winners: { 2026: "Wishful Thinking" }, hideOnCard: true },
    { emoji: "🏆", label: "Oscars",          month: 3,  day: 15, prize: "Best Picture",
      winners: { 2026: "One Battle After Another" } },
    { emoji: "🌴", label: "Cannes",          month: 5,  day: 12, prize: "Palme d'Or",
      winners: { 2026: "Fjord" } },
    { emoji: "🦁", label: "Venice",          month: 9,  day: 2,  prize: "Golden Lion",
      winners: {} },
    { emoji: "🍁", label: "TIFF",            month: 9,  day: 10, prize: "People's Choice",
      winners: {} },
    { emoji: "📺", label: "Primetime Emmys", month: 9,  day: 14, prize: "Best Drama Series",
      winners: {} },
  ];

  $: awardsEvents = (() => {
    const now = new Date();
    const yr = now.getFullYear();
    return _awardsRaw
      .map((e) => {
        const d = new Date(yr, e.month - 1, e.day);
        const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
        const past = days <= 0;
        const winner = past ? (e.winners as Record<number, string>)[yr] : null;
        return {
          ...e,
          name: `${e.label} ${yr}`,
          dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          days,
          past,
          winner,
          _t: d.getTime(),
        };
      })
      // upcoming first (soonest), then past events (most recent first)
      .sort((a, b) => {
        if (!a.past && !b.past) return a._t - b._t;
        if (!a.past) return -1;
        if (!b.past) return 1;
        return b._t - a._t;
      });
  })();

  // Homepage card shows a trimmed set (8) so its height matches the Oscar card
  // beside it; the events flagged `hideOnCard` (Berlinale, Sundance, SXSW) are
  // still in the data and appear in full on the /events page via "View All →".
  $: cardEvents = awardsEvents.filter((e) => !e.hideOnCard);

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

    // Auto-advance the "Just Dropped" reel (pauses on hover).
    reelInterval = setInterval(() => {
      if (!reelPaused && reelMovies.length > 1) reelNext();
    }, REEL_MS);
  });

  onDestroy(() => {
    if (comingSoonInterval) clearInterval(comingSoonInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    if (reelInterval) clearInterval(reelInterval);
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
  <div class="grid xl:grid-cols-2 gap-6">
    <!-- ── JUST DROPPED — cinematic auto-reel (moved here to top grid 2026-06-19) ─ -->
    <div class="reel-card rounded-2xl overflow-hidden relative"
         style="background: linear-gradient(135deg, #0a0a0a 0%, #1a0f00 50%, #0a0a0a 100%); border: 1px solid rgba(247,208,0,0.25);"
         on:mouseenter={() => reelPaused = true}
         on:mouseleave={() => reelPaused = false}
         role="region"
         aria-label="Just dropped on TrendiMovies">
      <!-- Top accent bar -->
      <div class="absolute top-0 left-0 right-0 h-1 z-20" style="background: linear-gradient(90deg, #F7D000, #dc2626, #F7D000);"></div>
      <!-- Ambient glow -->
      <div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(ellipse at 70% 0%, #F7D000, transparent 60%);"></div>

      <div class="relative p-5">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-4xl reel-sparkle">✨</span>
            <div>
              <p class="text-xs uppercase tracking-widest font-semibold mb-0.5" style="color: rgba(247,208,0,0.85);">Fresh on TrendiMovies</p>
              <h2 class="text-xl font-black text-white">Just Dropped</h2>
            </div>
          </div>
          {#if newThisWeekCount > 0}
            <div class="text-right reel-counter">
              <div class="text-3xl font-black leading-none" style="color: #F7D000;">{newThisWeekCount}</div>
              <div class="text-[10px] uppercase tracking-wide font-bold" style="color: #F7D000;">New this week</div>
            </div>
          {:else}
            <div class="text-right">
              <div class="text-base font-black" style="color: #F7D000;">DAILY</div>
              <div class="text-[10px] uppercase tracking-wide font-bold text-gray-400">Updated</div>
            </div>
          {/if}
        </div>

        {#if currentReel}
          <!-- Big rotating spotlight -->
          <a href={`/movie/${currentReel.id}`} class="block relative rounded-xl overflow-hidden group spotlight" style="aspect-ratio: 16/9;">
            {#key reelIndex}
              <img
                src={getBackdropUrl(currentReel.backdrop_path || currentReel.poster_path)}
                alt={currentReel.title}
                class="w-full h-full object-cover spotlight-img"
                loading="lazy"
              />
            {/key}
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>

            <!-- NEW / JUST ADDED badge -->
            <div class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider shadow-lg"
                 style="background: linear-gradient(135deg, #F7D000, #f59e0b); color:#000;">
              {#if isFresh(currentReel)}
                <span class="reel-dot"></span> JUST ADDED
              {:else}
                NEW THIS WEEK
              {/if}
            </div>

            <!-- Rating -->
            {#if currentReel.vote_average}
              <div class="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 bg-black/80 text-amber-400">
                <Star size={12} fill="currentColor" />
                <span>{currentReel.vote_average.toFixed(1)}</span>
              </div>
            {/if}

            <!-- Title + meta -->
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-lg sm:text-xl font-bold text-white leading-tight line-clamp-1">{currentReel.title}</h3>
              <div class="flex items-center gap-2 mt-1">
                {#if currentReel.year}
                  <span class="text-[11px] font-semibold text-amber-300">{currentReel.year}</span>
                {/if}
                <span class="inline-flex items-center gap-1 text-[11px] font-medium text-white/90 group-hover:text-amber-300 transition-colors">
                  <Play size={11} fill="currentColor" /> Watch now
                </span>
              </div>
            </div>

            <!-- Auto-advance progress bar -->
            {#if reelMovies.length > 1}
              {#key reelIndex}
                <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-10">
                  <div class="reel-progress h-full" class:paused={reelPaused} style="background: linear-gradient(90deg, #F7D000, #f59e0b);"></div>
                </div>
              {/key}
            {/if}
          </a>

          <!-- Clickable filmstrip of what's in rotation -->
          {#if reelMovies.length > 1}
            <div class="flex gap-2 mt-3">
              {#each reelMovies as m, i}
                <button
                  on:click={() => goToReel(i)}
                  class="relative flex-1 rounded-md overflow-hidden aspect-[2/3] film-thumb"
                  class:active={i === reelIndex}
                  title={m.title}
                  aria-label={`Show ${m.title}`}
                >
                  <img src={getPosterUrl(m.poster_path || m.backdrop_path)} alt={m.title} loading="lazy" class="w-full h-full object-cover" />
                  {#if i !== reelIndex}<div class="absolute inset-0 bg-black/45"></div>{/if}
                </button>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="flex items-center gap-2 mb-4 px-3 py-3 rounded-lg" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);">
            <span class="text-sm">🎬</span>
            <span class="text-sm text-gray-300">New movies & series added daily — with download links.</span>
          </div>
        {/if}

        <!-- CTA -->
        <a href="/movies/latest" class="cta-row flex items-center justify-between mt-4 group">
          <p class="text-xs text-gray-500">Latest releases with download links</p>
          <span class="px-4 py-2 rounded-lg text-sm font-bold text-black transition-all group-hover:scale-105 group-hover:shadow-lg" style="background: linear-gradient(135deg, #F7D000, #f59e0b);">
            Browse New →
          </span>
        </a>
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
          on:click={() => activeTab = 'topmovies'}
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          class:bg-amber-500={activeTab === 'topmovies'}
          class:text-black={activeTab === 'topmovies'}
          style={activeTab !== 'topmovies' ? 'color: var(--text-secondary); background-color: var(--bg-hover);' : ''}
        >
          Top Movies
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
          <!-- TOP MOVIES — Hero Poster + Strip Design -->
          {#if currentTabMovies.length > 0}
            {@const heroMovie = currentTabMovies[0]}
            {@const stripMovies = currentTabMovies.slice(1, 6)}
            <!-- Hero #1 -->
            <a
              href={`/movie/${heroMovie.id}`}
              class="relative block rounded-xl overflow-hidden group mb-3"
              style="aspect-ratio: 16/9;"
            >
              <img
                src={getBackdropUrl(heroMovie.backdrop_path || heroMovie.poster_path)}
                alt={heroMovie.title}
                class="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              <!-- TOP MOVIES badge (top-left) -->
              <div class="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider shadow-lg"
                   style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
                TOP MOVIES {heroMovie.year || ''}
              </div>

              <!-- IMDb score (top-right) -->
              {#if heroMovie.vote_average}
                <div class="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 bg-black/80 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span>{heroMovie.vote_average.toFixed(1)}</span>
                </div>
              {/if}

              <!-- Rank #1 + Title (bottom) -->
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold"
                        style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">1</span>
                  <span class="text-[10px] uppercase tracking-wider font-semibold text-amber-300">
                    #1 of the year
                  </span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-white leading-tight line-clamp-2">
                  {heroMovie.title}
                </h3>
              </div>
            </a>

            <!-- Strip of #2–#6 small posters -->
            {#if stripMovies.length > 0}
              <div class="grid grid-cols-5 gap-2 mb-2">
                {#each stripMovies as m, idx}
                  <a
                    href={`/movie/${m.id}`}
                    class="relative block group"
                    title={m.title}
                  >
                    <div class="aspect-[2/3] rounded-md overflow-hidden" style="background-color: var(--bg-hover);">
                      <img
                        src={getPosterUrl(m.poster_path)}
                        alt={m.title}
                        class="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <span class="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow"
                          style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">
                      {idx + 2}
                    </span>
                  </a>
                {/each}
              </div>
            {/if}
          {:else}
            <div class="text-center py-12 text-sm" style="color: var(--text-muted);">
              No top movies available
            </div>
          {/if}

          <a
            href="/top-movies"
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
  <div class="grid xl:grid-cols-2 gap-6">

    <!-- Left Column: Oscar Nominations (moved here from top grid on 2026-06-19) -->
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

        <div class="space-y-2.5">
          {#each cardEvents as event}
            <div class="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-hover)]">
              <span class="text-xl w-8 text-center flex-shrink-0">{event.emoji}</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate" style="color: var(--text-primary);">{event.name}</p>
                {#if event.winner}
                  <p class="text-xs truncate flex items-center gap-1" style="color: #fbbf24;">
                    <Trophy size={11} class="flex-shrink-0" />
                    <span class="truncate">{event.prize}: {event.winner}</span>
                  </p>
                {:else}
                  <p class="text-xs" style="color: var(--text-muted);">{event.dateLabel}</p>
                {/if}
              </div>
              {#if !event.past}
                {#if event.days <= 30}
                  <span class="px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0" style="background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25);">{event.days}d</span>
                {:else}
                  <span class="px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0" style="background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2);">{event.days}d</span>
                {/if}
              {:else if !event.winner}
                <span class="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style="background: rgba(107,114,128,0.2); color: #9ca3af;">Past</span>
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

  /* ── JUST DROPPED reel ──────────────────────────────────────────────── */
  .reel-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .reel-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -12px rgba(247, 208, 0, 0.25);
  }

  /* Ken-Burns slow zoom on each spotlight image; {#key} remounts it per slide */
  .spotlight-img {
    animation: kenburns 5s ease-out forwards;
    transform-origin: center;
  }
  @keyframes kenburns {
    0%   { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  .spotlight:hover .spotlight-img {
    transform: scale(1.04);
    transition: transform 0.4s ease;
    animation: none;
  }

  /* Auto-advance progress bar; remounted per slide via {#key} so it restarts */
  .reel-progress {
    width: 0%;
    animation: reelfill 4.5s linear forwards;
  }
  .reel-progress.paused {
    animation-play-state: paused;
  }
  @keyframes reelfill {
    0%   { width: 0%; }
    100% { width: 100%; }
  }

  /* Pulsing "JUST ADDED" dot */
  .reel-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #dc2626;
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    animation: reelpulse 1.6s infinite;
  }
  @keyframes reelpulse {
    0%   { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6); }
    70%  { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  }

  /* Subtle sparkle wobble + glowing counter */
  .reel-sparkle {
    display: inline-block;
    animation: sparkle 3s ease-in-out infinite;
  }
  @keyframes sparkle {
    0%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }
    50%      { transform: rotate(8deg) scale(1.08); opacity: 0.85; }
  }
  .reel-counter {
    animation: countglow 2.5s ease-in-out infinite;
  }
  @keyframes countglow {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(247, 208, 0, 0)); }
    50%      { filter: drop-shadow(0 0 6px rgba(247, 208, 0, 0.5)); }
  }

  /* Filmstrip thumbnails */
  .film-thumb {
    opacity: 0.7;
    transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .film-thumb:hover { opacity: 1; transform: translateY(-2px); }
  .film-thumb.active {
    opacity: 1;
    border-color: rgba(247, 208, 0, 0.7);
    box-shadow: 0 0 0 1px rgba(247, 208, 0, 0.5), 0 4px 12px -4px rgba(247, 208, 0, 0.4);
  }

  /* Respect reduced-motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .spotlight-img, .reel-progress, .reel-dot, .reel-sparkle, .reel-counter {
      animation: none !important;
    }
  }
</style>
