<script lang="ts">
  import { Play, Star } from 'lucide-svelte';

  interface MoodItem {
    id: number;
    tmdb_id?: number;
    title: string;
    poster_path: string | null;
    year: number | null;
    vote_average: number;
    type: 'movie' | 'series';
  }

  interface Mood {
    id: string;
    emoji: string;
    label: string;
    gradient: string;
    items: MoodItem[];
  }

  export let moods: Mood[] = [];

  let selectedMood: string | null = null;
  let selectedMoodData: Mood | null = null;

  function selectMood(moodId: string) {
    if (selectedMood === moodId) {
      selectedMood = null;
      selectedMoodData = null;
    } else {
      selectedMood = moodId;
      selectedMoodData = moods.find(m => m.id === moodId) || null;
    }
  }
</script>

{#if moods.length > 0}
<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">
        Pick Your Mood
      </h2>
      <p class="text-sm mt-1" style="color: var(--text-muted);">How are you feeling? We will find something perfect.</p>
    </div>

    <!-- Mood Buttons -->
    <div class="mood-grid">
      {#each moods as mood}
        <button
          class="mood-btn"
          class:active={selectedMood === mood.id}
          style="--mood-gradient: {mood.gradient}"
          on:click={() => selectMood(mood.id)}
        >
          <span class="mood-emoji">{mood.emoji}</span>
          <span class="mood-label">{mood.label}</span>
          {#if selectedMood === mood.id}
            <div class="active-indicator"></div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Results -->
    {#if selectedMoodData}
      <div class="results-container">
        <div class="results-header" style="background: {selectedMoodData.gradient}">
          <span class="results-emoji">{selectedMoodData.emoji}</span>
          <div>
            <h3 class="text-white font-bold text-lg">Feeling {selectedMoodData.label}?</h3>
            <p class="text-white/70 text-xs">Here are our picks for you</p>
          </div>
        </div>

        <div class="results-grid">
          {#each selectedMoodData.items as item, i}
            <a
              href={item.type === 'movie' ? `/movie/${item.tmdb_id || item.id}` : `/tv/${item.tmdb_id || item.id}`}
              class="result-card group"
              style="--delay: {i * 80}ms"
            >
              <div class="result-poster">
                <img
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '/images/no-poster.svg'}
                  alt={item.title}
                  class="result-img"
                  loading="lazy"
                />
                <div class="result-overlay">
                  <div class="result-play">
                    <Play size={22} fill="white" class="text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div class="result-info">
                <h4 class="font-bold text-sm line-clamp-2 group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">
                  {item.title}
                </h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs" style="color: var(--text-muted);">{item.year}</span>
                  <div class="flex items-center gap-1">
                    <Star size={10} fill="#fbbf24" class="text-amber-400" />
                    <span class="text-xs" style="color: var(--text-secondary);">{item.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <p style="color: var(--text-muted);">Tap a mood above to discover titles</p>
      </div>
    {/if}
  </div>
</section>
{/if}

<style>
  .mood-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media (min-width: 640px) {
    .mood-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  .mood-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 8px;
    border-radius: 14px;
    background: var(--bg-card);
    border: 2px solid var(--border);
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  .mood-btn:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  .mood-btn.active {
    background: var(--mood-gradient);
    border-color: transparent;
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }

  .mood-emoji {
    font-size: 32px;
    line-height: 1;
    transition: transform 0.3s;
  }
  .mood-btn:hover .mood-emoji {
    transform: scale(1.2);
  }
  .mood-btn.active .mood-emoji {
    transform: scale(1.3);
  }

  .mood-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    transition: color 0.3s;
  }
  .mood-btn.active .mood-label {
    color: white;
  }

  .active-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: white;
    border-radius: 3px 3px 0 0;
  }

  .results-container {
    margin-top: 20px;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .results-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }
  .results-emoji {
    font-size: 36px;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }
  @media (min-width: 640px) {
    .results-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .result-card {
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all 0.3s;
    text-decoration: none;
    animation: fadeIn 0.4s ease;
    animation-delay: var(--delay);
    animation-fill-mode: both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .result-card:hover {
    transform: translateY(-4px);
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
  }

  .result-poster {
    position: relative;
    aspect-ratio: 2/3;
    overflow: hidden;
  }
  .result-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  .result-card:hover .result-img {
    transform: scale(1.08);
  }

  .result-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .result-card:hover .result-overlay {
    opacity: 1;
  }

  .result-play {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
  }

  .result-info {
    padding: 10px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    font-size: 14px;
  }
</style>
