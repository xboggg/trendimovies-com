<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import MovieCard from './MovieCard.svelte';

  // Home page "Just Added" row: one heading you can tap, four tabs
  // (Movie / TV Show / Indian / Asian) on the same line, and the usual swipe
  // row of posters. All four lists come from the server with the page, so
  // switching tabs is instant. A tab with nothing in it is not shown.
  interface Tab { key: string; label: string; items: any[]; }
  export let tabs: Tab[] = [];

  let active = tabs[0]?.key || '';
  let scroller: HTMLDivElement;
  let tabsEl: HTMLDivElement;
  let btns: Record<string, HTMLButtonElement> = {};
  let bar = { left: 0, width: 0, ready: false };

  $: shown = tabs.filter(t => t.items.length > 0);
  $: current = shown.find(t => t.key === active) || shown[0];
  $: seeAll = `/just-added?tab=${current ? current.key : 'movie'}`;
  $: if (current) place(current.key);

  // The underline slides under the chosen tab.
  async function place(key: string) {
    await tick();
    const b = btns[key];
    if (!b || !tabsEl) return;
    bar = { left: b.offsetLeft, width: b.offsetWidth, ready: true };
  }
  onMount(() => {
    if (current) place(current.key);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => current && place(current.key)) : null;
    if (ro && tabsEl) ro.observe(tabsEl);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => current && place(current.key));
    return () => ro?.disconnect();
  });

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

<svelte:head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap" />
</svelte:head>

{#if current}
  <section class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="ja-head">
        <a href={seeAll} class="ja-title" aria-label="Just Added: see everything we added lately">
          <span class="ja-dot" aria-hidden="true"></span>
          <h2>Just Added</h2>
          <span class="ja-chev" aria-hidden="true"><ChevronRight size={18} /></span>
        </a>

        <div class="ja-tabs" role="tablist" aria-label="Just Added sections" bind:this={tabsEl}>
          {#each shown as t (t.key)}
            <button
              type="button"
              role="tab"
              class="ja-tab"
              class:on={current.key === t.key}
              aria-selected={current.key === t.key}
              bind:this={btns[t.key]}
              on:click={() => pick(t.key)}
            >{t.label}</button>
          {/each}
          <span class="ja-bar" class:ready={bar.ready} style={`transform: translateX(${bar.left}px); width: ${bar.width}px`} aria-hidden="true"></span>
        </div>
      </div>

      <div class="relative group/row">
        <button on:click={() => nudge('left')} aria-label="Scroll left"
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity"
          style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);">
          <ChevronLeft size={24} style="color: var(--text-primary);" />
        </button>

        <div bind:this={scroller} class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth">
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
    </div>
  </section>
{/if}

<style>
  .ja-head { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; min-width: 0; }
  .ja-title { flex: none; display: inline-flex; align-items: center; gap: 5px; text-decoration: none; color: var(--text-primary); }
  .ja-title h2 { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; color: var(--text-primary); }
  @media (min-width: 768px) { .ja-title h2 { font-size: 24px; } }
  /* Quiet "tap me" hints that run on their own: a soft pulsing dot and an
     arrow that nudges right every few seconds. Off for people who ask for less motion. */
  .ja-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 0 var(--accent); animation: ja-pulse 2.2s ease-out infinite; }
  .ja-chev { display: inline-flex; color: var(--accent); animation: ja-nudge 3.4s ease-in-out infinite; }
  .ja-title:hover .ja-chev { transform: translateX(3px); animation: none; }
  @keyframes ja-pulse {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 65%, transparent); opacity: 1; }
    70% { box-shadow: 0 0 0 9px color-mix(in srgb, var(--accent) 0%, transparent); opacity: .55; }
    100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent); opacity: 1; }
  }
  @keyframes ja-nudge { 0%, 70%, 100% { transform: translateX(0); } 80% { transform: translateX(5px); } 90% { transform: translateX(0); } }
  @media (prefers-reduced-motion: reduce) { .ja-dot, .ja-chev { animation: none; } }

  /* Tabs in one rounded pill on the heading's line (mono type, like the cinema pages).
     A filled marker slides under the chosen tab. Sized so all four fit a 360px phone. */
  .ja-tabs { position: relative; flex: 0 1 auto; min-width: 0; display: flex; gap: 1px; padding: 4px; overflow-x: auto; scrollbar-width: none; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-card); }
  .ja-tabs::-webkit-scrollbar { display: none; }
  .ja-tab { position: relative; z-index: 1; flex: none; appearance: none; border: 0; background: transparent; cursor: pointer; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 500; white-space: nowrap; padding: 8px 9px; min-height: 36px; border-radius: 999px; color: var(--text-secondary); transition: color .2s; }
  @media (min-width: 768px) { .ja-tab { font-size: 14px; padding: 10px 18px; min-height: 42px; } .ja-tabs { gap: 4px; } }
  @media (max-width: 380px) { .ja-title h2 { font-size: 15px; } .ja-dot { display: none; } .ja-tab { font-size: 10.5px; padding: 8px 6px; } .ja-head { gap: 6px; } }
  .ja-tab:hover:not(.on) { color: var(--text-primary); }
  .ja-tab.on { color: #fff; font-weight: 700; }
  .ja-bar { position: absolute; z-index: 0; top: 4px; bottom: 4px; left: 0; border-radius: 999px; background: var(--accent); box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 45%, transparent); width: 0; opacity: 0; }
  .ja-bar.ready { opacity: 1; transition: transform .32s cubic-bezier(.2,.8,.2,1), width .32s cubic-bezier(.2,.8,.2,1); }
  @media (prefers-reduced-motion: reduce) { .ja-bar.ready { transition: none; } }
  .ja-tab:focus-visible, .ja-title:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 8px; }
</style>
