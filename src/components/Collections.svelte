<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';

  interface Collection {
    id: string;
    title: string;
    subtitle: string;
    link: string;
    gradient: string;
    posters: string[];
  }

  export let collections: Collection[] = [];
</script>

{#if collections.length > 0}
<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">
          Collections
        </h2>
        <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background: var(--bg-hover); color: var(--text-secondary);">
          Curated for you
        </span>
      </div>
    </div>

    <!-- Collections Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each collections as collection, i}
        <a href={collection.link} class="collection-card group" style="--delay: {i * 100}ms">
          <!-- Background with stacked posters -->
          <div class="card-bg" style="background: {collection.gradient}">
            <!-- Poster stack -->
            <div class="poster-stack">
              {#each collection.posters.slice(0, 4) as poster, j}
                <div class="stacked-poster" style="--offset: {j * 28}px; --rotate: {-6 + j * 4}deg; z-index: {4 - j}">
                  <img
                    src={`https://image.tmdb.org/t/p/w185${poster}`}
                    alt=""
                    class="stacked-img"
                    loading="lazy"
                  />
                </div>
              {/each}
            </div>

            <!-- Gradient overlay -->
            <div class="card-overlay"></div>
          </div>

          <!-- Content -->
          <div class="card-content">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors">
                  {collection.title}
                </h3>
                <p class="text-xs text-white/60 mt-0.5">{collection.subtitle}</p>
              </div>
              <div class="collection-arrow">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<style>
  .collection-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-decoration: none;
    transition: all 0.4s ease;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .collection-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .card-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .poster-stack {
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }

  .stacked-poster {
    position: absolute;
    right: var(--offset);
    width: 70px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    transform: rotate(var(--rotate));
    box-shadow: -4px 4px 15px rgba(0,0,0,0.4);
    border: 2px solid rgba(255,255,255,0.15);
    transition: transform 0.4s ease;
  }
  .collection-card:hover .stacked-poster {
    transform: rotate(0deg) translateX(-8px);
  }

  .stacked-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
  }

  .card-content {
    position: relative;
    z-index: 2;
    padding: 16px 20px;
  }

  .collection-arrow {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s;
    flex-shrink: 0;
  }
  .collection-card:hover .collection-arrow {
    background: #e50914;
    transform: translateX(4px);
  }
</style>
