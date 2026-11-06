<script lang="ts">
  import { onMount } from 'svelte';

  // "How it's rated" on the movie page: TMDB (always), IMDb and Rotten
  // Tomatoes (when we have them). The TMDB card is in the page HTML; IMDb and
  // Rotten Tomatoes are fetched after the page shows, so they never slow it.
  // Each card has a coloured ring that draws itself and a number that counts
  // up when the card comes into view.
  export let tmdbScore: number = 0;
  export let tmdbVotes: number = 0;
  export let imdbId: string | null = null;
  export let rtFallback: number | null = null; // from our own review, if there is one

  let imdb: { rating: number; votes: number } | null = null;
  let rt: number | null = rtFallback;
  let loading = !!imdbId;
  let ready = false; // flips on once the cards are on screen: the rings draw

  function fmtVotes(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }
  $: rtFresh = rt !== null && rt >= 60;

  // Svelte action: count the number up from 0 to `to`.
  function countUp(node: HTMLElement, p: { to: number; dec: number }) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
    const t0 = performance.now() + 250;
    node.textContent = (0).toFixed(p.dec);
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 1300));
      node.textContent = (p.to * (1 - Math.pow(1 - k, 3))).toFixed(p.dec);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return { destroy() { cancelAnimationFrame(raf); } };
  }

  onMount(async () => {
    requestAnimationFrame(() => requestAnimationFrame(() => (ready = true)));
    if (!imdbId) return;
    try {
      const res = await fetch('/api/ratings/' + imdbId);
      const d = await res.json();
      imdb = d.imdb || null;
      if (typeof d.rt === 'number') rt = d.rt;
    } catch (e) {}
    loading = false;
  });
</script>

{#if tmdbVotes > 0 || imdb || rt !== null || loading}
  <div class="cards">
    {#if tmdbVotes > 0}
      <div class="card tone-tmdb" style="--d:0ms">
        <div class="dial" class:go={ready} style={`--p:${Math.max(0, Math.min(10, tmdbScore)) * 10}`}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="27" /><circle class="fg" cx="32" cy="32" r="27" pathLength="100" /></svg>
          <b use:countUp={{ to: tmdbScore, dec: 1 }}>{tmdbScore.toFixed(1)}</b>
        </div>
        <div class="txt">
          <div class="src"><span class="pill tm">TMDB</span><span class="of">/ 10</span></div>
          <div class="votes">{fmtVotes(tmdbVotes)} votes</div>
        </div>
      </div>
    {/if}
    {#if imdb}
      <div class="card tone-imdb" style="--d:120ms">
        <div class="dial" class:go={ready} style={`--p:${imdb.rating * 10}`}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="27" /><circle class="fg" cx="32" cy="32" r="27" pathLength="100" /></svg>
          <b use:countUp={{ to: imdb.rating, dec: 1 }}>{imdb.rating.toFixed(1)}</b>
        </div>
        <div class="txt">
          <div class="src"><span class="pill im">IMDb</span><span class="of">/ 10</span></div>
          <div class="votes">{fmtVotes(imdb.votes)} votes</div>
        </div>
      </div>
    {:else if loading}
      <div class="card sk" aria-hidden="true"><div class="bone w1"></div><div class="bone w2"></div></div>
    {/if}
    {#if rt !== null}
      <div class="card" class:tone-fresh={rtFresh} class:tone-rotten={!rtFresh} style="--d:240ms">
        <div class="dial" class:go={ready} style={`--p:${Math.max(0, Math.min(100, rt))}`}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="27" /><circle class="fg" cx="32" cy="32" r="27" pathLength="100" /></svg>
          <b><span use:countUp={{ to: rt, dec: 0 }}>{rt}</span><i>%</i></b>
        </div>
        <div class="txt">
          <div class="src"><span class="tom" aria-hidden="true">{rtFresh ? '🍅' : '🤢'}</span><span class="rtl">Rotten Tomatoes</span></div>
          <div class="votes">{rtFresh ? 'Fresh' : 'Rotten'} with critics</div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cards { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 2px 16px 4px; scroll-snap-type: x proximity; }
  .cards::-webkit-scrollbar { display: none; }
  @media (min-width: 900px) { .cards { margin: 0; padding-inline: 0; flex-wrap: wrap; overflow: visible; } }
  .card {
    --c: #39d3b2;
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px; padding: 12px 16px 12px 12px; border-radius: 18px; scroll-snap-align: start;
    background: linear-gradient(160deg, color-mix(in srgb, var(--c) 9%, transparent), rgba(255, 255, 255, 0.015)); border: 1px solid #262c3b;
    animation: cardIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: var(--d, 0ms);
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .card:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--c) 55%, #262c3b); box-shadow: 0 10px 30px color-mix(in srgb, var(--c) 14%, transparent); }
  @keyframes cardIn { from { opacity: 0; transform: translateX(18px) scale(0.96); } to { opacity: 1; transform: none; } }
  .tone-tmdb { --c: #39d3b2; } .tone-imdb { --c: #f5c518; } .tone-fresh { --c: #3ddc84; } .tone-rotten { --c: #ff6a55; }

  .dial { position: relative; width: 66px; height: 66px; flex: none; display: grid; place-items: center; }
  .dial svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
  .dial circle { fill: none; stroke-width: 5; stroke-linecap: round; }
  .dial .bg { stroke: #1d2230; }
  .dial .fg { stroke: var(--c); stroke-dasharray: 100; stroke-dashoffset: 100; filter: drop-shadow(0 0 5px color-mix(in srgb, var(--c) 65%, transparent)); transition: stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) calc(var(--d, 0ms) + 200ms); }
  .dial.go .fg { stroke-dashoffset: calc(100 - var(--p)); }
  .dial b { position: relative; font-family: 'Bricolage Grotesque', Inter, sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.02em; color: var(--c); line-height: 1; }
  .dial b i { font-style: normal; font-size: 11px; margin-left: 1px; color: #98a1b4; }
  .dial.go .fg { animation: glow 2.6s ease-in-out 1.8s 2; }
  @keyframes glow { 50% { filter: drop-shadow(0 0 10px color-mix(in srgb, var(--c) 90%, transparent)); } }

  .txt { min-width: 0; }
  .src { display: flex; align-items: center; gap: 7px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; color: #c8cdd9; white-space: nowrap; }
  .of { color: #98a1b4; font-size: 11px; }
  .pill { font-weight: 800; padding: 2px 7px; border-radius: 6px; font-family: Inter, sans-serif; letter-spacing: 0; font-size: 12px; }
  .pill.im { background: #f5c518; color: #000; }
  .pill.tm { background: #01b4e4; color: #06121f; }
  .tom { font-size: 17px; line-height: 1; }
  .votes { margin-top: 5px; font-size: 12.5px; color: #98a1b4; }

  .sk { min-width: 150px; display: grid; gap: 10px; align-content: center; }
  .bone { height: 14px; border-radius: 6px; background: linear-gradient(90deg, #1d2230, #2a3144, #1d2230); background-size: 200% 100%; animation: sh 1.3s linear infinite; }
  .bone.w1 { width: 70%; height: 26px; } .bone.w2 { width: 50%; }
  @keyframes sh { to { background-position: -200% 0; } }
  @media (prefers-reduced-motion: reduce) {
    .bone, .card, .dial.go .fg { animation: none; }
    .dial .fg { transition: none; }
    .card { transition: none; }
  }
</style>
