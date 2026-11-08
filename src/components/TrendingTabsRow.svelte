<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { ChevronLeft, ChevronRight, Star } from 'lucide-svelte';
  import MovieCard from './MovieCard.svelte';

  // Home page "Trending & Popular" section: two tabs (Trending This Week, Popular Movies).
  // Phone: a big top-pick card, then the posters. PC: plain underline tabs, then the posters.
  // Both lists come with the page, so switching is instant. Posters slide along by themselves.
  interface Tab { key: string; label: string; note: string; color: string; link: string; items: any[]; }
  export let tabs: Tab[] = [];

  let active = tabs[0]?.key || '';
  let scroller: HTMLDivElement;

  $: shown = tabs.filter(t => t.items.length > 0);
  $: current = shown.find(t => t.key === active) || shown[0];
  $: top = current?.items[0];
  $: topImg = top
    ? (top.backdrop_path
        ? (top.backdrop_path.startsWith('/images/') ? top.backdrop_path : `https://image.tmdb.org/t/p/w780${top.backdrop_path}`)
        : (top.poster_path ? (top.poster_path.startsWith('/images/') ? top.poster_path : `https://image.tmdb.org/t/p/w500${top.poster_path}`) : ''))
    : '';
  $: topHref = top ? (top.type === 'movie' ? `/movie/${top.tmdb_id || top.id}` : `/tv/${top.tmdb_id || top.id}`) : '#';

  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The row slides along by itself. It waits while a finger or the mouse is on it,
  // and starts again a moment after.
  let frame = 0;
  let paused = false;
  let resumeTimer: ReturnType<typeof setTimeout>;
  function hold() { paused = true; clearTimeout(resumeTimer); }
  function release(wait = 2500) { clearTimeout(resumeTimer); resumeTimer = setTimeout(() => { paused = false; }, wait); }
  function pick(key: string) {
    active = key;
    hold();
    if (scroller) scroller.scrollTo({ left: 0 });
    release(1500);
  }
  function nudge(dir: 'left' | 'right') {
    if (!scroller) return;
    hold();
    scroller.scrollBy({ left: (dir === 'left' ? -1 : 1) * scroller.clientWidth * 0.8, behavior: 'smooth' });
    release(3000);
  }
  onMount(() => {
    if (reduce) return;
    // The position is kept in `pos` because a phone may round scrollLeft to whole pixels.
    let pos = 0;
    const step = () => {
      if (scroller) {
        if (paused) {
          pos = scroller.scrollLeft;
        } else {
          const max = scroller.scrollWidth - scroller.clientWidth;
          pos = pos >= max - 1 ? 0 : pos + 0.6;
          scroller.scrollLeft = pos;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  });
  onDestroy(() => { if (frame) cancelAnimationFrame(frame); clearTimeout(resumeTimer); });
</script>

{#if current}
  <section class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={`--c: ${current.color}`}>
      <div class="tt-head">
        <h2>Trending &amp; Popular</h2>
        <a href={current.link} class="tt-see tt-see-pc" aria-label={`See all ${current.label}`}>See All</a>
      </div>

      <div class="tt-tabs" role="tablist" aria-label="Trending and popular movies">
        {#each shown as t (t.key)}
          <button
            type="button"
            role="tab"
            class="tt-tab"
            class:on={current.key === t.key}
            aria-selected={current.key === t.key}
            style={`--c: ${t.color}`}
            on:click={() => pick(t.key)}
          >{t.label}</button>
        {/each}
      </div>

      <p class="tt-note">{current.note}</p>

      {#key current.key}
        {#if top}
          <div class="tt-feat" in:fly={{ y: reduce ? 0 : 10, duration: reduce ? 0 : 260 }}>
            {#if topImg}<img src={topImg} alt="" class="tt-feat-img" loading="lazy" />{/if}
            <div class="tt-feat-grad"></div>
            <a href={topHref} class="tt-feat-link" aria-label={`Open ${top.title}`}></a>
            <a href={current.link} class="tt-see tt-see-card">See all {current.label} ›</a>
            <div class="tt-feat-text">
              <small>TOP PICK · {current.key === 'trending' ? 'TRENDING' : 'POPULAR'}</small>
              <b>{top.title}</b>
              <span><Star size={13} fill="currentColor" /> {top.vote_average ? top.vote_average.toFixed(1) : '–'}{top.year ? ` · ${top.year}` : ''}</span>
            </div>
          </div>
        {/if}
      {/key}

      <div class="relative group/row">
        <button on:click={() => nudge('left')} aria-label="Scroll left"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"
          style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);">
          <ChevronLeft size={24} style="color: var(--text-primary);" />
        </button>

        <div bind:this={scroller} class="flex gap-4 overflow-x-auto tt-scroll pb-2"
          on:mouseenter={hold} on:mouseleave={() => release(800)}
          on:touchstart|passive={hold} on:touchend={() => release()} on:touchcancel={() => release()}
          on:wheel|passive={() => { hold(); release(); }}>
          {#key current.key}
            {#each current.items as item, i (current.key + ':' + item.type + ':' + item.id)}
              <div class="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]" class:tt-first={i === 0} in:fly={{ x: reduce ? 0 : 28, duration: reduce ? 0 : 320, delay: reduce ? 0 : Math.min(i, 6) * 45 }}>
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
    </div>
  </section>
{/if}

<style>
  .tt-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 10px; }
  .tt-head h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.01em; color: var(--text-primary); }
  .tt-see { font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .tt-see-pc { display: none; color: var(--accent); }
  .tt-see-pc:hover { text-decoration: underline; }

  /* Phone: two rounded tabs with a coloured line under the chosen one */
  .tt-tabs { display: flex; gap: 8px; margin: 0 0 10px; overflow-x: auto; scrollbar-width: none; }
  .tt-tabs::-webkit-scrollbar { display: none; }
  .tt-tab { appearance: none; cursor: pointer; font: inherit; flex: 1 1 0; min-width: 0; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-weight: 700; font-size: 14px; white-space: nowrap; transition: color .2s, box-shadow .2s, border-color .2s; }
  .tt-tab.on { border-color: var(--c); color: var(--text-primary); box-shadow: inset 0 -3px 0 var(--c); }
  .tt-tab:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .tt-note { display: none; margin: 0 0 14px; font-size: 14px; color: var(--text-secondary); }

  /* Phone: the big top-pick card */
  .tt-feat { position: relative; overflow: hidden; border-radius: 20px; min-height: 190px; margin: 0 0 12px; border: 1px solid var(--border); background: var(--bg-card); display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; color: #fff; }
  .tt-feat-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .tt-feat-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.88), rgba(0,0,0,.25) 60%, rgba(0,0,0,.1)); }
  .tt-feat-link { position: absolute; inset: 0; z-index: 1; }
  .tt-see-card { position: absolute; z-index: 2; top: 12px; right: 12px; padding: 6px 11px; border-radius: 999px; background: rgba(0,0,0,.55); color: #fff; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .tt-feat-text { position: relative; display: grid; gap: 3px; pointer-events: none; }
  .tt-feat-text small { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: .12em; opacity: .9; }
  .tt-feat-text b { font-size: 24px; font-weight: 800; line-height: 1.1; }
  .tt-feat-text span { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; opacity: .9; }
  .tt-first { display: none; }
  .tt-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  .tt-scroll::-webkit-scrollbar { display: none; }

  /* PC: plain underline tabs, a line of description, then the posters */
  @media (min-width: 768px) {
    .tt-head h2 { font-size: 24px; }
    .tt-head { margin-bottom: 6px; }
    .tt-see-pc { display: inline; font-size: 14px; font-weight: 600; }
    .tt-tabs { gap: 32px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
    .tt-tab { flex: none; padding: 10px 0 11px; border: 0; border-radius: 0; background: none; box-shadow: none; font-size: 17px; position: relative; }
    .tt-tab.on { box-shadow: none; }
    .tt-tab.on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; border-radius: 3px; background: var(--c); }
    .tt-note { display: block; }
    .tt-feat { display: none; }
    .tt-first { display: block; }
  }
  @media (prefers-reduced-motion: reduce) { .tt-tab { transition: none; } }
</style>
