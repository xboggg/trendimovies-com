<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Filter, X } from 'lucide-svelte';
  import MovieCard from './MovieCard.svelte';

  export let initialQuery: string = '';
  export let initialType: string = 'all';
  export let initialYear: string = '';
  export let initialGenre: string = '';
  export let initialLanguage: string = '';

  let query = initialQuery;
  let type = initialType;
  let year = initialYear;
  let genre = initialGenre;
  let language = initialLanguage;

  let results: any[] = [];
  let loading = false;
  let totalResults = 0;
  let page = 1;
  let hasMore = false;
  let showFilters = false;
  let debounceTimer: ReturnType<typeof setTimeout>;

  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());
  const genres = [
    { id: '28', name: 'Action' },
    { id: '35', name: 'Comedy' },
    { id: '18', name: 'Drama' },
    { id: '27', name: 'Horror' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Sci-Fi' },
    { id: '53', name: 'Thriller' },
    { id: '16', name: 'Animation' },
    { id: '99', name: 'Documentary' },
    { id: '14', name: 'Fantasy' }
  ];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: 'Korean' },
    { code: 'ja', name: 'Japanese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'zh', name: 'Chinese' }
  ];

  onMount(() => {
    if (query) {
      search();
    }
  });

  function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      page = 1;
      search();
    }, 300);
  }

  async function search() {
    if (!query.trim()) {
      results = [];
      return;
    }

    loading = true;

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        page: page.toString()
      });

      if (year) params.set('year', year);
      if (genre) params.set('genre', genre);
      if (language) params.set('language', language);

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (page === 1) {
        results = data.results || [];
      } else {
        results = [...results, ...(data.results || [])];
      }

      totalResults = data.total || 0;
      hasMore = data.hasMore || false;

      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      if (type !== 'all') url.searchParams.set('type', type);
      else url.searchParams.delete('type');
      if (year) url.searchParams.set('year', year);
      else url.searchParams.delete('year');
      if (genre) url.searchParams.set('genre', genre);
      else url.searchParams.delete('genre');
      if (language) url.searchParams.set('language', language);
      else url.searchParams.delete('language');
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.error('Search error:', error);
      results = [];
    } finally {
      loading = false;
    }
  }

  function loadMore() {
    page++;
    search();
  }

  function clearFilters() {
    type = 'all';
    year = '';
    genre = '';
    language = '';
    page = 1;
    search();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      page = 1;
      search();
    }
  }

  $: hasFilters = type !== 'all' || year || genre || language;
</script>

<div>
  <!-- Search Input -->
  <div class="flex gap-4 mb-6">
    <div class="flex-1 relative">
      <Search size={20} class="absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--text-muted);" />
      <input
        type="text"
        bind:value={query}
        on:input={debounceSearch}
        on:keydown={handleKeydown}
        placeholder="Search movies, TV series, actors..."
        class="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-colors"
        style="background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);"
      />
    </div>
    <button
      on:click={() => showFilters = !showFilters}
      class="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors"
      style="background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);"
      class:ring-2={showFilters}
      class:ring-[var(--accent)]={showFilters}
    >
      <Filter size={20} />
      <span class="hidden sm:inline">Filters</span>
      {#if hasFilters}
        <span class="w-2 h-2 rounded-full" style="background-color: var(--accent);"></span>
      {/if}
    </button>
  </div>

  <!-- Filters -->
  {#if showFilters}
    <div class="p-4 rounded-lg mb-6" style="background-color: var(--bg-card); border: 1px solid var(--border);">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold" style="color: var(--text-primary);">Filters</h3>
        {#if hasFilters}
          <button
            on:click={clearFilters}
            class="text-sm flex items-center gap-1"
            style="color: var(--accent);"
          >
            <X size={16} />
            Clear all
          </button>
        {/if}
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Type -->
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Type</label>
          <select
            bind:value={type}
            on:change={() => { page = 1; search(); }}
            class="w-full px-3 py-2 rounded-lg outline-none"
            style="background-color: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary);"
          >
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="series">TV Series</option>
          </select>
        </div>

        <!-- Year -->
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Year</label>
          <select
            bind:value={year}
            on:change={() => { page = 1; search(); }}
            class="w-full px-3 py-2 rounded-lg outline-none"
            style="background-color: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary);"
          >
            <option value="">Any Year</option>
            {#each years as y}
              <option value={y}>{y}</option>
            {/each}
          </select>
        </div>

        <!-- Genre -->
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Genre</label>
          <select
            bind:value={genre}
            on:change={() => { page = 1; search(); }}
            class="w-full px-3 py-2 rounded-lg outline-none"
            style="background-color: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary);"
          >
            <option value="">Any Genre</option>
            {#each genres as g}
              <option value={g.id}>{g.name}</option>
            {/each}
          </select>
        </div>

        <!-- Language -->
        <div>
          <label class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Language</label>
          <select
            bind:value={language}
            on:change={() => { page = 1; search(); }}
            class="w-full px-3 py-2 rounded-lg outline-none"
            style="background-color: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary);"
          >
            <option value="">Any Language</option>
            {#each languages as l}
              <option value={l.code}>{l.name}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  {/if}

  <!-- Results Count -->
  {#if query && !loading}
    <p class="mb-4" style="color: var(--text-secondary);">
      Found {totalResults} result{totalResults !== 1 ? 's' : ''}
    </p>
  {/if}

  <!-- Loading State -->
  {#if loading && page === 1}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {#each Array(12) as _}
        <div class="aspect-[2/3] rounded-lg skeleton"></div>
      {/each}
    </div>
  {:else if results.length > 0}
    <!-- Results Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {#each results as item (item.id)}
        <MovieCard {item} />
      {/each}
    </div>

    <!-- Load More -->
    {#if hasMore}
      <div class="text-center mt-8">
        <button
          on:click={loadMore}
          disabled={loading}
          class="px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          style="background-color: var(--accent); color: white;"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    {/if}
  {:else if query && !loading}
    <!-- No Results -->
    <div class="text-center py-16">
      <p class="text-xl mb-2" style="color: var(--text-primary);">No results found</p>
      <p style="color: var(--text-secondary);">
        Try different keywords or adjust your filters
      </p>
    </div>
  {:else}
    <!-- Empty State -->
    <div class="text-center py-16">
      <Search size={64} class="mx-auto mb-4" style="color: var(--text-muted);" />
      <p class="text-xl mb-2" style="color: var(--text-primary);">Start searching</p>
      <p style="color: var(--text-secondary);">
        Enter a movie name, TV series, or actor to find content
      </p>
    </div>
  {/if}
</div>
