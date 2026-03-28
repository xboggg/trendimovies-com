<script lang="ts">
  import { onMount } from 'svelte';
  import { Heart, Bookmark, Check } from 'lucide-svelte';

  export let contentType: 'movie' | 'series';
  export let tmdbId: number;
  export let title: string;
  export let posterPath: string;

  let isLoggedIn = false;
  let inWatchlist = false;
  let inFavorites = false;
  let loading = { watchlist: false, favorites: false };

  onMount(async () => {
    // Check if user is logged in
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      isLoggedIn = data.success && data.user;

      if (isLoggedIn) {
        // Check current status
        const [watchlistRes, favoritesRes] = await Promise.all([
          fetch('/api/user/watchlist'),
          fetch('/api/user/favorites')
        ]);

        const watchlistData = await watchlistRes.json();
        const favoritesData = await favoritesRes.json();

        if (watchlistData.success) {
          inWatchlist = watchlistData.watchlist.some(
            (item: any) => item.content_type === contentType && item.tmdb_id === tmdbId
          );
        }

        if (favoritesData.success) {
          inFavorites = favoritesData.favorites.some(
            (item: any) => item.content_type === contentType && item.tmdb_id === tmdbId
          );
        }
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    }
  });

  async function toggleWatchlist() {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    loading.watchlist = true;

    try {
      if (inWatchlist) {
        await fetch(`/api/user/watchlist?contentType=${contentType}&tmdbId=${tmdbId}`, {
          method: 'DELETE'
        });
        inWatchlist = false;
      } else {
        await fetch('/api/user/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType, tmdbId, title, posterPath })
        });
        inWatchlist = true;
      }
    } catch (err) {
      console.error('Failed to update watchlist:', err);
    }

    loading.watchlist = false;
  }

  async function toggleFavorites() {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    loading.favorites = true;

    try {
      if (inFavorites) {
        await fetch(`/api/user/favorites?contentType=${contentType}&tmdbId=${tmdbId}`, {
          method: 'DELETE'
        });
        inFavorites = false;
      } else {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType, tmdbId, title, posterPath })
        });
        inFavorites = true;
      }
    } catch (err) {
      console.error('Failed to update favorites:', err);
    }

    loading.favorites = false;
  }
</script>

<div class="flex gap-3 mt-4">
  <button
    on:click={toggleWatchlist}
    class="action-btn"
    class:active={inWatchlist}
    disabled={loading.watchlist}
    title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
  >
    {#if inWatchlist}
      <Check size={18} />
      <span>In Watchlist</span>
    {:else}
      <Bookmark size={18} />
      <span>Watchlist</span>
    {/if}
  </button>

  <button
    on:click={toggleFavorites}
    class="action-btn favorite"
    class:active={inFavorites}
    disabled={loading.favorites}
    title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
  >
    {#if inFavorites}
      <Heart size={18} fill="currentColor" />
      <span>Favorited</span>
    {:else}
      <Heart size={18} />
      <span>Favorite</span>
    {/if}
  </button>
</div>

<style>
  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--text-secondary);
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .action-btn.active {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: transparent;
    color: white;
  }

  .action-btn.favorite.active {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
</style>
