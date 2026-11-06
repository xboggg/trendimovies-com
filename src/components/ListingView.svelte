<script lang="ts">
  import { onMount } from 'svelte';
  import { List, LayoutGrid, Star } from 'lucide-svelte';
  import MovieCard from './MovieCard.svelte';

  // A list of films / shows with a Grid | List switch. The choice is remembered
  // in this browser and shared by every page that uses this component, so a
  // person who likes the list sees it everywhere. The page loads as a grid
  // (what search engines and the first paint see), then switches if the saved
  // choice is "list".
  interface Item {
    id: number; tmdb_id?: number; title: string; poster_path: string | null; year: number | null;
    vote_average: number; type: 'movie' | 'series'; episode_info?: string; overview?: string | null;
  }
  export let items: Item[] = [];
  // Page-specific grid size; default matches the other listing pages.
  export let gridClass: string = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4';
  export let showToggle: boolean = true;

  const KEY = 'tm-listing-view';
  let mode: 'grid' | 'list' = 'grid';

  onMount(() => {
    try { if (localStorage.getItem(KEY) === 'list') mode = 'list'; } catch (e) {}
  });
  function setMode(m: 'grid' | 'list') {
    mode = m;
    try { localStorage.setItem(KEY, m); } catch (e) {}
  }

  const poster = (p: string | null) => p ? (p.startsWith('/images/') ? p : `https://image.tmdb.org/t/p/w185${p}`) : '/images/no-poster.svg';
  const href = (i: Item) => (i.type === 'movie' ? '/movie/' : '/tv/') + (i.tmdb_id || i.id);
</script>

{#if showToggle}
  <div class="lv-bar">
    <div class="lv-toggle" role="group" aria-label="How to show the list">
      <button type="button" class="lv-btn" class:on={mode === 'grid'} aria-pressed={mode === 'grid'} aria-label="Grid view" on:click={() => setMode('grid')}><LayoutGrid size={18} /><span>Grid</span></button>
      <button type="button" class="lv-btn" class:on={mode === 'list'} aria-pressed={mode === 'list'} aria-label="List view" on:click={() => setMode('list')}><List size={18} /><span>List</span></button>
    </div>
  </div>
{/if}

{#if mode === 'grid'}
  <div class={gridClass}>
    {#each items as item}
      <MovieCard {item} />
    {/each}
  </div>
{:else}
  <ul class="lv-list">
    {#each items as item}
      <li>
        <a class="lv-row" href={href(item)}>
          <img src={poster(item.poster_path)} alt="" width="64" height="96" loading="lazy" />
          <span class="lv-main">
            <span class="lv-title">{item.title}</span>
            <span class="lv-meta">
              <span class="lv-chip">{item.type === 'movie' ? 'Movie' : 'TV Show'}</span>
              {#if item.year}<span>{item.year}</span>{/if}
              {#if Number(item.vote_average) > 0}<span class="lv-star"><Star size={13} fill="currentColor" /> {Number(item.vote_average).toFixed(1)}</span>{/if}
              {#if item.episode_info}<span class="lv-chip ep">{item.episode_info}</span>{/if}
            </span>
            {#if item.overview}<span class="lv-ov">{item.overview}</span>{/if}
          </span>
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .lv-bar { display: flex; justify-content: flex-end; margin: 0 0 14px; }
  .lv-toggle { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-card); }
  .lv-btn { appearance: none; border: 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; min-height: 36px; border-radius: 999px; color: var(--text-secondary); background: transparent; }
  .lv-btn.on { background: var(--accent); color: #111; }
  .lv-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (max-width: 380px) { .lv-btn span { display: none; } }

  .lv-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 10px; }
  @media (min-width: 900px) { .lv-list { grid-template-columns: 1fr 1fr; } }
  .lv-row { display: flex; gap: 14px; align-items: flex-start; padding: 10px; border-radius: 14px; text-decoration: none; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary); transition: border-color .15s; }
  .lv-row:hover { border-color: var(--accent); }
  .lv-row img { flex: none; width: 64px; height: 96px; object-fit: cover; border-radius: 8px; background: var(--border); }
  .lv-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .lv-title { font-size: 16px; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere; }
  .lv-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; font-size: 13px; color: var(--text-secondary); }
  .lv-chip { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border); }
  .lv-chip.ep { color: var(--accent); border-color: var(--accent); }
  .lv-star { display: inline-flex; align-items: center; gap: 4px; color: #eab308; }
  .lv-ov { font-size: 13px; line-height: 1.4; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
