<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { X } from 'lucide-svelte';
  import VideoPlayer from './VideoPlayer.svelte';

  // The movie page's Stream pop-up. The player (and the streaming provider's
  // page inside it) is created only while the pop-up is open, so nothing
  // downloads until the person taps Stream, and closing it stops the video.
  // Opened by the "tm:stream" event; #stream in the address opens it on load.
  export let tmdbId: number;
  export let imdbId: string | null = null;
  export let releaseDate: string | null = null;
  export let title: string = '';

  let open = false;
  let sheet: HTMLElement;
  let closeBtn: HTMLButtonElement;
  let lastFocus: HTMLElement | null = null;

  async function openSheet() {
    if (open) return;
    lastFocus = document.activeElement as HTMLElement | null;
    open = true;
    document.documentElement.style.overflow = 'hidden';
    if (!(history.state && history.state.tmSheet) && location.hash !== '#stream') {
      try { history.pushState({ tmSheet: 1 }, '', location.pathname + location.search + '#stream'); } catch (e) {}
    }
    await tick();
    closeBtn?.focus();
  }
  function finishClose() {
    if (!open) return;
    open = false;
    document.documentElement.style.overflow = '';
    lastFocus?.focus?.();
  }
  function closeSheet() {
    if (history.state && history.state.tmSheet) history.back();
    else {
      finishClose();
      if (location.hash === '#stream') {
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      }
    }
  }
  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      // The player's own theater mode also uses Escape; let it go first.
      if (document.fullscreenElement) return;
      e.preventDefault();
      closeSheet();
    }
  }

  onMount(() => {
    const onOpen = () => openSheet();
    const onPop = () => { if (open && !(history.state && history.state.tmSheet)) finishClose(); };
    window.addEventListener('tm:stream', onOpen);
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    if (location.hash === '#stream') openSheet();
    return () => {
      window.removeEventListener('tm:stream', onOpen);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  });
</script>

<div class="ss" class:open aria-hidden={!open}>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="scrim" on:click={closeSheet}></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ss-h" bind:this={sheet} inert={!open}>
    <div class="hd">
      <h2 id="ss-h">Stream{#if title}<small> · {title}</small>{/if}</h2>
      <button type="button" class="x" bind:this={closeBtn} on:click={closeSheet} aria-label="Close"><X size={20} /></button>
    </div>
    <div class="body">
      {#if open}
        <VideoPlayer {tmdbId} {imdbId} type="movie" {releaseDate} />
      {/if}
    </div>
  </div>
</div>

<style>
  .ss { display: none; position: fixed; inset: 0; z-index: 100; }
  .ss.open { display: flex; align-items: center; justify-content: center; padding: 12px; }
  .scrim { position: absolute; inset: 0; background: rgba(5, 7, 10, 0.78); backdrop-filter: blur(3px); animation: fade 0.2s ease-out; }
  .sheet {
    position: relative; width: 100%; max-width: 1040px; max-height: calc(100vh - 24px); max-height: calc(100dvh - 24px); display: flex; flex-direction: column;
    background: #12151d; color: #eef0f5; border: 1px solid #262c3b; border-radius: 22px;
    box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.6);     animation: up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes up { from { transform: scale(0.96) translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .sheet, .scrim { animation: none; } }
  .hd { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px 8px 20px; flex: none; }
  .hd h2 { margin: 0; font-family: 'Bricolage Grotesque', Inter, sans-serif; font-weight: 700; font-size: 20px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hd small { font-weight: 500; color: #98a1b4; font-size: 15px; margin-left: 4px; }
  .x { appearance: none; background: none; border: 0; color: #98a1b4; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none; }
  .x:hover { color: #fff; background: #1a1f2b; }
  .x:focus-visible { outline: 2px solid #f6b93b; outline-offset: 2px; }
  .body { overflow-y: auto; padding: 0 12px 14px; overscroll-behavior: contain; }
  @media (min-width: 900px) { .body { padding: 0 20px 18px; } }
</style>
