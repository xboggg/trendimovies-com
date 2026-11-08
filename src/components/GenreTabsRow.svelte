<script lang="ts">
  import { fly } from 'svelte/transition';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import MovieCard from './MovieCard.svelte';

  // Home page genre section: four tiles (Non-Stop Action, Comedy Central,
  // Midnight Romance, Thriller Movies) in one box. Tap a tile and the row of
  // posters swaps to that genre. Each tile has its own "See all" link.
  // All four lists come with the page, so switching is instant.
  interface Tab { key: string; label: string; note: string; color: string; link: string; items: any[]; }
  export let tabs: Tab[] = [];

  let active = tabs[0]?.key || '';
  let scroller: HTMLDivElement;

  $: shown = tabs.filter(t => t.items.length > 0);
  $: current = shown.find(t => t.key === active) || shown[0];

  function pick(key: string) {
    active = key;
    if (scroller) scroller.scrollTo({ left: 0 });
  }
  function nudge(dir: 'left' | 'right') {
    if (!scroller) return;
    scroller.scrollBy({ left: (dir === 'left' ? -1 : 1) * scroller.clientWidth * 0.8, behavior: 'smooth' });
  }
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

{#if current}
  <section class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="gt-box" style={`--c: ${current.color}`}>
        <div class="gt-head">
          <h2>Movies by Genre</h2>
          <a href={current.link} class="gt-see" aria-label={`See all ${current.label}`}>See All</a>
        </div>

        <div class="gt-tiles" role="tablist" aria-label="Movie genres">
          {#each shown as t (t.key)}
            <button
              type="button"
              role="tab"
              class="gt-tile"
              class:on={current.key === t.key}
              aria-selected={current.key === t.key}
              style={`--c: ${t.color}`}
              on:click={() => pick(t.key)}
            >
              <b>{t.label}</b>
              <small>{t.note}</small>
            </button>
          {/each}
        </div>

        <div class="relative group/row">
          <button on:click={() => nudge('left')} aria-label="Scroll left"
            class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"
            style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);">
            <ChevronLeft size={24} style="color: var(--text-primary);" />
          </button>

          <div bind:this={scroller} class="flex gap-4 overflow-x-auto gt-scroll pb-2 scroll-smooth">
            {#key current.key}
              {#each current.items as item, i (current.key + ':' + item.type + ':' + item.id)}
                <div class="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]" in:fly={{ x: reduce ? 0 : 28, duration: reduce ? 0 : 320, delay: reduce ? 0 : Math.min(i, 6) * 45 }}>
                  <MovieCard {item} />
                </div>
              {/each}
            {/key}
          </div>

          <button on:click={() => nudge('right')} aria-label="Scroll right"
            class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"
            style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);">
            <ChevronRight size={24} style="color: var(--text-primary);" />
          </button>
        </div>

        <a href={current.link} class="gt-all">See all {current.label} ›</a>
      </div>
    </div>
  </section>
{/if}

<style>
  .gt-box { position: relative; overflow: hidden; border-radius: 24px; padding: 14px; border: 1px solid var(--border); background: var(--bg-card); }
  /* The coloured glow in the corner follows the chosen tile. */
  .gt-box::before { content: ''; position: absolute; width: 300px; height: 300px; right: -100px; top: -120px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--c) 45%, transparent), transparent 70%); transition: background .3s; pointer-events: none; }
  .gt-box > * { position: relative; }
  .gt-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 12px; }
  .gt-head h2 { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -0.01em; color: var(--text-primary); }
  .gt-see { font-size: 13px; font-weight: 700; color: var(--text-primary); text-decoration: none; white-space: nowrap; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-card); }
  .gt-see:hover { border-color: var(--c); }
  .gt-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0 0 14px; }
  .gt-tile { appearance: none; cursor: pointer; font: inherit; text-align: left; min-width: 0; min-height: 62px; padding: 10px 12px; border-radius: 16px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-primary); opacity: .75; transition: transform .2s, opacity .2s, box-shadow .2s, border-color .2s; }
  .gt-tile b { display: block; font-size: 15px; font-weight: 800; line-height: 1.2; }
  .gt-tile small { display: block; margin-top: 2px; font-size: 11.5px; line-height: 1.3; color: var(--text-secondary); }
  .gt-tile:hover { opacity: 1; }
  .gt-tile.on { opacity: 1; transform: translateY(-2px); border-color: var(--c); background: linear-gradient(150deg, color-mix(in srgb, var(--c) 28%, var(--bg-card)), var(--bg-card)); box-shadow: 0 8px 22px color-mix(in srgb, var(--c) 28%, transparent); }
  .gt-tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .gt-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  .gt-scroll::-webkit-scrollbar { display: none; }
  .gt-all { display: flex; justify-content: center; margin-top: 10px; padding: 12px; border-radius: 14px; border: 1px solid var(--border); font-weight: 700; font-size: 14px; color: var(--text-primary); text-decoration: none; }
  .gt-all:hover { border-color: var(--c); }
  @media (min-width: 768px) {
    .gt-box { padding: 26px 28px; }
    .gt-head h2 { font-size: 24px; }
    .gt-tiles { grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .gt-tile { padding: 14px 16px; min-height: 74px; }
    .gt-tile b { font-size: 20px; }
    .gt-tile small { font-size: 12.5px; }
    .gt-all { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { .gt-tile, .gt-box::before { transition: none; } }
</style>
