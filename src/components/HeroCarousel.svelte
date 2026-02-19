<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Play, Info, Star, Clock, Calendar, Users, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-svelte';

  interface TrendingItem {
    id: number;
    title: string;
    slug: string;
    overview: string;
    backdrop_path: string | null;
    poster_path: string | null;
    vote_average: number;
    vote_count?: number;
    year: number | null;
    runtime?: number | null;
    genres: { id: number; name: string }[];
    type: 'movie' | 'series';
    tagline?: string | null;
    release_date?: string | null;
  }

  export let featured: TrendingItem | null = null;
  export let trending: TrendingItem[] = [];

  let currentIndex = 0;
  let autoSlideInterval: ReturnType<typeof setInterval>;
  let isTransitioning = false;

  $: carouselItems = trending.slice(0, 8);
  $: currentItem = carouselItems[currentIndex] || featured;

  $: backdropUrl = currentItem?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : '/images/no-backdrop.svg';

  $: posterUrl = currentItem?.poster_path
    ? `https://image.tmdb.org/t/p/w500${currentItem.poster_path}`
    : '/images/no-poster.svg';

  onMount(() => {
    autoSlideInterval = setInterval(() => {
      nextSlide();
    }, 7000);
  });

  onDestroy(() => {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
  });

  function goToSlide(index: number) {
    if (isTransitioning || index === currentIndex) return;
    isTransitioning = true;
    currentIndex = index;
    setTimeout(() => isTransitioning = false, 700);
    resetTimer();
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % carouselItems.length);
  }

  function prevSlide() {
    goToSlide(currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1);
  }

  function resetTimer() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => nextSlide(), 7000);
  }

  function getHref(item: TrendingItem): string {
    return item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  }

  function formatRuntime(minutes: number | null | undefined): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatVoteCount(count: number | undefined): string {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  function formatReleaseDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
</script>

<section class="relative h-[90vh] md:h-[95vh] overflow-hidden bg-black">
  <!-- Background Image with Ken Burns effect -->
  <div class="absolute inset-0">
    {#key currentIndex}
      <div class="absolute inset-0 animate-kenburns">
        <img
          src={backdropUrl}
          alt={currentItem?.title || 'Featured'}
          class="w-full h-full object-cover"
        />
      </div>
    {/key}

    <!-- Cinematic Overlays -->
    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-40"></div>

    <!-- Animated particles/grain effect -->
    <div class="absolute inset-0 opacity-[0.03] bg-noise"></div>

    <!-- Golden accent line at bottom -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
  </div>

  <!-- Navigation Arrows - Premium style -->
  <button
    on:click={prevSlide}
    class="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full flex items-center justify-center nav-arrow"
  >
    <ChevronLeft size={32} class="text-white" />
  </button>
  <button
    on:click={nextSlide}
    class="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full flex items-center justify-center nav-arrow"
  >
    <ChevronRight size={32} class="text-white" />
  </button>

  <div class="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
    <div class="flex h-full items-center pt-20">
      {#if currentItem}
        <div class="flex-1 flex items-center gap-12">
          <!-- Content -->
          <div class="flex-1 max-w-2xl">
            <!-- Type Badge -->
            <div class="inline-flex items-center gap-2 mb-4">
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000;">
                {currentItem.type === 'movie' ? 'Movie' : 'Series'}
              </span>
              {#if currentItem.year}
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm">
                  {currentItem.year}
                </span>
              {/if}
            </div>

            <!-- Title with golden accent -->
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight">
              {#key currentIndex}
                <span class="inline-block animate-slideUp">{currentItem.title}</span>
              {/key}
            </h1>

            <!-- Tagline -->
            {#if currentItem.tagline}
              <p class="text-lg italic text-gray-300 mb-6">"{currentItem.tagline}"</p>
            {/if}

            <!-- Stats Row -->
            <div class="flex flex-wrap items-center gap-4 mb-6">
              <!-- Rating -->
              <div class="flex items-center gap-2 px-4 py-2 rounded-xl rating-badge">
                <Star size={20} fill="#fbbf24" class="text-amber-400" />
                <span class="text-xl font-black text-white">{currentItem.vote_average.toFixed(1)}</span>
                <span class="text-sm text-gray-400">/10</span>
              </div>

              <!-- Vote Count -->
              {#if currentItem.vote_count}
                <div class="flex items-center gap-2 text-gray-300">
                  <Users size={16} />
                  <span class="text-sm">{formatVoteCount(currentItem.vote_count)} votes</span>
                </div>
              {/if}

              <!-- Runtime -->
              {#if currentItem.runtime}
                <div class="flex items-center gap-2 text-gray-300">
                  <Clock size={16} />
                  <span class="text-sm">{formatRuntime(currentItem.runtime)}</span>
                </div>
              {/if}

              <!-- Release Date -->
              {#if currentItem.release_date}
                <div class="flex items-center gap-2 text-gray-300">
                  <Calendar size={16} />
                  <span class="text-sm">{formatReleaseDate(currentItem.release_date)}</span>
                </div>
              {/if}
            </div>

            <!-- Genres -->
            {#if currentItem.genres && currentItem.genres.length > 0}
              <div class="flex flex-wrap gap-2 mb-6">
                {#each currentItem.genres.slice(0, 4) as genre}
                  <span class="px-4 py-1.5 rounded-full text-sm font-medium genre-tag">
                    {genre.name}
                  </span>
                {/each}
              </div>
            {/if}

            <!-- Overview -->
            <p class="text-gray-300 text-lg mb-8 line-clamp-3 leading-relaxed max-w-xl">
              {currentItem.overview || 'No description available.'}
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-4">
              <a href={getHref(currentItem)} class="btn-primary">
                <Play size={22} fill="white" />
                <span>Watch Now</span>
              </a>
              <a href={getHref(currentItem)} class="btn-secondary">
                <Info size={22} />
                <span>More Info</span>
              </a>
            </div>
          </div>

          <!-- Poster Card (hidden on mobile) -->
          <div class="hidden xl:block flex-shrink-0">
            {#key currentIndex}
              <div class="poster-card animate-fadeInRight">
                <img
                  src={posterUrl}
                  alt={currentItem.title}
                  class="w-72 h-auto rounded-2xl shadow-2xl"
                />
                <div class="absolute -bottom-4 -right-4 w-24 h-24 rounded-full rating-circle flex items-center justify-center flex-col">
                  <span class="text-2xl font-black text-white">{currentItem.vote_average.toFixed(1)}</span>
                  <span class="text-[10px] text-amber-400 uppercase tracking-wider">Rating</span>
                </div>
              </div>
            {/key}
          </div>
        </div>
      {/if}
    </div>

    <!-- Slide Indicators - Premium vertical style -->
    <div class="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
      {#each carouselItems as item, index}
        <button
          on:click={() => goToSlide(index)}
          class="group relative"
          aria-label="Go to slide {index + 1}"
        >
          <div class="w-1 h-8 rounded-full transition-all duration-300 {index === currentIndex ? 'bg-amber-400 h-12' : 'bg-white/30 group-hover:bg-white/50'}"></div>
          {#if index === currentIndex}
            <div class="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {item.title}
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
      {#key currentIndex}
        <div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 animate-progress"></div>
      {/key}
    </div>
  </div>
</section>

<style>
  @keyframes kenburns {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }

  .animate-kenburns {
    animation: kenburns 8s ease-out forwards;
  }

  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .animate-slideUp {
    animation: slideUp 0.6s ease-out forwards;
  }

  @keyframes fadeInRight {
    0% { opacity: 0; transform: translateX(30px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  .animate-fadeInRight {
    animation: fadeInRight 0.7s ease-out forwards;
  }

  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  .animate-progress {
    animation: progress 7s linear forwards;
  }

  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .nav-arrow {
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(251,191,36,0.3);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  .nav-arrow:hover {
    background: rgba(251,191,36,0.2);
    border-color: rgba(251,191,36,0.6);
    transform: translateY(-50%) scale(1.1);
  }

  .rating-badge {
    background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,30,30,0.8) 100%);
    border: 1px solid rgba(251,191,36,0.4);
    backdrop-filter: blur(10px);
  }

  .genre-tag {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: #e5e7eb;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }
  .genre-tag:hover {
    background: rgba(251,191,36,0.2);
    border-color: rgba(251,191,36,0.4);
    color: #fbbf24;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
    font-weight: 700;
    font-size: 1rem;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(220,38,38,0.4);
  }
  .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(220,38,38,0.5);
  }

  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  .btn-secondary:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(251,191,36,0.5);
    transform: translateY(-3px);
  }

  .poster-card {
    position: relative;
    transform: perspective(1000px) rotateY(-5deg);
    transition: transform 0.5s ease;
  }
  .poster-card:hover {
    transform: perspective(1000px) rotateY(0deg);
  }

  .rating-circle {
    background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.9) 100%);
    border: 3px solid #fbbf24;
    box-shadow: 0 0 30px rgba(251,191,36,0.3);
  }
</style>
