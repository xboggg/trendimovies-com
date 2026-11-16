<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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

  // Duplicate so we can wrap scroll seamlessly at the halfway point.
  $: loop = collections.length ? [...collections, ...collections] : [];

  let track: HTMLDivElement;
  let raf = 0;
  let paused = false;          // hover / touch
  let resumeTimer: ReturnType<typeof setTimeout>;
  const SPEED = 0.4;           // px per frame (~24px/s) — gentle continuous glide

  function tick() {
    if (typeof requestAnimationFrame === 'undefined') return; // SSR guard
    if (track && !paused) {
      const half = track.scrollWidth / 2;
      let next = track.scrollLeft + SPEED;
      if (next >= half) next -= half;   // seamless wrap (duplicated list)
      track.scrollLeft = next;
    }
    raf = requestAnimationFrame(tick);
  }

  // Manual swipe/drag: pause auto-glide while the user interacts, resume shortly after.
  function hold() { paused = true; clearTimeout(resumeTimer); }
  function release() { clearTimeout(resumeTimer); resumeTimer = setTimeout(() => (paused = false), 2500); }

  // pointer drag-to-scroll (desktop mouse); touch scroll is native
  // A plain click must reach the card link. The old code captured the pointer on
  // mouse-down, which sent the click to the track instead of the link, so the cards
  // could not be opened with a mouse. Now the pointer is captured only once the mouse
  // has really moved (a drag), and the click that ends a drag is swallowed.
  let pressed = false, dragging = false, startX = 0, startScroll = 0, swallow = false, capId = -1;
  const DRAG_PX = 6;
  function down(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;      // touch scrolls natively
    pressed = true; dragging = false; swallow = false;
    startX = e.clientX; startScroll = track.scrollLeft;
    hold();
  }
  function move(e: PointerEvent) {
    if (!pressed) return;
    const dx = e.clientX - startX;
    if (!dragging && Math.abs(dx) > DRAG_PX) {
      dragging = true; capId = e.pointerId;
      try { track.setPointerCapture?.(e.pointerId); } catch (err) {}
    }
    if (dragging) track.scrollLeft = startScroll - dx;
  }
  function up(e?: PointerEvent) {
    if (dragging) {
      swallow = true;                                             // the click after a drag must not open a card
      setTimeout(() => { swallow = false; }, 120);
      try { if (capId >= 0) track.releasePointerCapture?.(capId); } catch (err) {}
    }
    pressed = false; dragging = false; capId = -1; release();
  }
  function onClick(e: MouseEvent) {
    if (swallow) { e.preventDefault(); e.stopPropagation(); }
  }

  onMount(() => { raf = requestAnimationFrame(tick); });
  onDestroy(() => {
    if (typeof cancelAnimationFrame !== 'undefined' && raf) cancelAnimationFrame(raf);
    clearTimeout(resumeTimer);
  });
</script>

{#if collections.length > 0}
<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">Collections</h2>
        <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background: var(--bg-hover); color: var(--text-secondary);">Curated for you</span>
      </div>
    </div>
  </div>

  <div class="marquee-viewport">
    <div
      bind:this={track}
      class="marquee-track"
      class:dragging
      on:mouseenter={hold}
      on:mouseleave={release}
      on:touchstart={hold}
      on:touchend={release}
      on:pointerdown={down}
      on:pointermove={move}
      on:pointerup={up}
      on:pointercancel={up}
      on:click|capture={onClick}
    >
      {#each loop as collection, i}
        <a href={collection.link} class="collection-card group" aria-hidden={i >= collections.length ? 'true' : undefined} draggable="false">
          <div class="card-bg" style="background: {collection.gradient}">
            <div class="poster-stack">
              {#each collection.posters.slice(0, 4) as poster, j}
                <div class="stacked-poster" style="--offset: {j * 28}px; --rotate: {-6 + j * 4}deg; z-index: {4 - j}">
                  <img src={`https://image.tmdb.org/t/p/w185${poster}`} alt="" class="stacked-img" loading="lazy" draggable="false" />
                </div>
              {/each}
            </div>
            <div class="card-overlay"></div>
          </div>
          <div class="card-content">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors">{collection.title}</h3>
                <p class="text-xs text-white/60 mt-0.5">{collection.subtitle}</p>
              </div>
              <div class="collection-arrow"><ChevronRight size={18} /></div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
{/if}

<style>
  .marquee-viewport {
    width: 100%;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 4%, #000 96%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, #000 4%, #000 96%, transparent 100%);
  }
  .marquee-track {
    display: flex;
    gap: 16px;
    padding: 4px 16px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    cursor: grab;
    touch-action: pan-x;        /* allow native horizontal swipe */
  }
  .marquee-track::-webkit-scrollbar { display: none; }
  .marquee-track.dragging { cursor: grabbing; }

  .collection-card {
    position: relative;
    flex: 0 0 86vw;             /* mobile: ~one card fills the view */
    max-width: 360px;
    border-radius: 16px;
    overflow: hidden;
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    text-decoration: none;
    transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    border: 1px solid rgba(255,255,255,0.05);
    user-select: none;
  }
  @media (min-width: 640px) { .collection-card { flex-basis: 360px; } }

  .collection-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .card-bg { position: absolute; inset: 0; overflow: hidden; }
  .poster-stack { position: absolute; right: -10px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; }
  .stacked-poster {
    position: absolute; right: var(--offset); width: 70px; height: 100px; border-radius: 8px; overflow: hidden;
    transform: rotate(var(--rotate)); box-shadow: -4px 4px 15px rgba(0,0,0,0.4);
    border: 2px solid rgba(255,255,255,0.15); transition: transform 0.4s ease;
  }
  .collection-card:hover .stacked-poster { transform: rotate(0deg) translateX(-8px); }
  .stacked-img { width: 100%; height: 100%; object-fit: cover; }
  .card-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%); }
  .card-content { position: relative; z-index: 2; padding: 16px 20px; }
  .collection-arrow {
    width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center; color: white; transition: all 0.3s; flex-shrink: 0;
  }
  .collection-card:hover .collection-arrow { background: #e50914; transform: translateX(4px); }
</style>
