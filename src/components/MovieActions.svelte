<script lang="ts">
  import { onMount } from 'svelte';
  import { Bookmark, BookmarkCheck, Eye, Heart, Share2 } from 'lucide-svelte';

  // Watchlist / Like / Share row for the movie page. Same account calls as
  // UserActions (/api/user/watchlist and /api/user/favorites), new look.
  export let contentType: 'movie' | 'series' = 'movie';
  export let tmdbId: number;
  export let title: string;
  export let posterPath: string | null = null;

  let isLoggedIn = false;
  let inWatchlist = false;
  let inFavorites = false;
  let inWatched = false;
  let busy = { watchlist: false, favorites: false, watched: false };
  let note = '';
  let noteTimer: ReturnType<typeof setTimeout>;

  function say(msg: string) {
    note = msg;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => (note = ''), 2200);
  }

  onMount(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      isLoggedIn = !!(data.success && data.user);
      if (isLoggedIn) {
        const [w, f, v] = await Promise.all([fetch('/api/user/watchlist'), fetch('/api/user/favorites'), fetch('/api/user/watched')]);
        const wd = await w.json();
        const fd = await f.json();
        const vd = await v.json();
        if (wd.success) inWatchlist = wd.watchlist.some((i: any) => i.content_type === contentType && i.tmdb_id === tmdbId);
        if (vd.success) inWatched = vd.watched.some((i: any) => i.content_type === contentType && i.tmdb_id === tmdbId);
        if (fd.success) inFavorites = fd.favorites.some((i: any) => i.content_type === contentType && i.tmdb_id === tmdbId);
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    }
  });

  async function toggle(kind: 'watchlist' | 'favorites' | 'watched') {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    busy[kind] = true;
    const on = kind === 'watchlist' ? inWatchlist : kind === 'watched' ? inWatched : inFavorites;
    try {
      if (on) {
        await fetch(`/api/user/${kind}?contentType=${contentType}&tmdbId=${tmdbId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      } else {
        await fetch(`/api/user/${kind}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType, tmdbId, title, posterPath })
        });
      }
      if (kind === 'watchlist') inWatchlist = !on;
      else if (kind === 'watched') inWatched = !on;
      else inFavorites = !on;
      say(kind === 'watchlist' ? (on ? 'Removed from your watchlist' : 'Added to your watchlist') : kind === 'watched' ? (on ? 'Unmarked as watched' : 'Marked as watched') : (on ? 'Removed from your favourites' : 'Added to your favourites'));
    } catch (err) {
      console.error('Failed to update ' + kind + ':', err);
    }
    busy[kind] = false;
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch (e) {
      return; // person closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(url);
      say('Link copied');
    } catch (e) {
      say('Copy the link from the address bar');
    }
  }
</script>

<div class="acts" role="group" aria-label="Save and share">
  <button type="button" class="act" class:on={inWatchlist} disabled={busy.watchlist} aria-pressed={inWatchlist} on:click={() => toggle('watchlist')}>
    {#if inWatchlist}<BookmarkCheck size={20} />{:else}<Bookmark size={20} />{/if}
    <span>Watchlist</span>
  </button>
  <button type="button" class="act seen" class:on={inWatched} disabled={busy.watched} aria-pressed={inWatched} on:click={() => toggle('watched')}>
    <Eye size={20} />
    <span>Watched</span>
  </button>
  <button type="button" class="act like" class:on={inFavorites} disabled={busy.favorites} aria-pressed={inFavorites} on:click={() => toggle('favorites')}>
    <Heart size={20} fill={inFavorites ? 'currentColor' : 'none'} />
    <span>Like</span>
  </button>
  <button type="button" class="act" on:click={share}>
    <Share2 size={20} />
    <span>Share</span>
  </button>
</div>
<p class="note" role="status" aria-live="polite">{note}</p>

<style>
  .acts { display: flex; gap: 6px; }
  .act {
    appearance: none; flex: 1; min-width: 0; cursor: pointer; font: inherit;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 9px 4px 8px; border-radius: 12px; color: #eef0f5;
    background: rgba(20, 24, 33, 0.72); backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .act span { font-size: 11px; font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .act:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.34); }
  .act:disabled { opacity: 0.6; cursor: not-allowed; }
  .act:focus-visible { outline: 2px solid #f6b93b; outline-offset: 2px; }
  .act.on { color: #0b0d12; border-color: #f6b93b; background: #f6b93b; }
  .act.seen.on { color: #04211b; border-color: #39d3b2; background: #39d3b2; }
  .act.like.on { color: #2a0b06; border-color: #ff6a55; background: #ff6a55; }
  .note { min-height: 1.2em; margin: 6px 0 0; font-size: 12px; color: #98a1b4; text-align: center; }
</style>
