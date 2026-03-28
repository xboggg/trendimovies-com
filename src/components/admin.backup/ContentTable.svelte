<script lang="ts">
  import { Search, ChevronLeft, ChevronRight, ExternalLink, Check, X } from 'lucide-svelte';

  export let type: 'movies' | 'series' = 'movies';

  let items: any[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let loading = true;
  let search = '';
  let filter: 'all' | 'with_ddl' | 'without_ddl' = 'all';

  async function fetchData() {
    loading = true;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '50',
      search,
      filter
    });

    try {
      const res = await fetch(`/api/admin/${type}?${params}`);
      const data = await res.json();
      items = data[type] || data.movies || data.series || [];
      total = data.total || 0;
      totalPages = data.totalPages || 1;
    } catch (e) {
      items = [];
      total = 0;
    }
    loading = false;
  }

  // Initial load
  fetchData();

  function handleSearch() {
    page = 1;
    fetchData();
  }

  function handleFilterChange() {
    page = 1;
    fetchData();
  }

  function prevPage() {
    if (page > 1) {
      page--;
      fetchData();
    }
  }

  function nextPage() {
    if (page < totalPages) {
      page++;
      fetchData();
    }
  }

  function getPosterUrl(path: string | null): string {
    if (!path) return '/images/no-poster.svg';
    return `https://image.tmdb.org/t/p/w92${path}`;
  }
</script>

<div>
  <!-- Filters -->
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <div class="flex-1 relative">
      <Search size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
      <input
        type="text"
        bind:value={search}
        on:keydown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search by title..."
        class="input pl-10"
      />
    </div>

    {#if type === 'movies'}
      <select bind:value={filter} on:change={handleFilterChange} class="select w-auto">
        <option value="all">All Movies</option>
        <option value="with_ddl">With DDL</option>
        <option value="without_ddl">Without DDL</option>
      </select>
    {/if}

    <button on:click={handleSearch} class="btn btn-primary">
      Search
    </button>
  </div>

  <!-- Results count -->
  <div class="text-sm text-[#666] mb-4">
    Showing {items.length} of {total.toLocaleString()} {type}
  </div>

  <!-- Table -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden">
    {#if loading}
      <div class="p-8 text-center text-[#666]">
        <div class="animate-spin w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading...
      </div>
    {:else if items.length === 0}
      <div class="p-8 text-center text-[#666]">
        No {type} found
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Title</th>
              <th>Year</th>
              {#if type === 'series'}
                <th>Seasons</th>
                <th>Episodes</th>
              {/if}
              <th>DDL</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item}
              <tr>
                <td>
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    class="w-10 h-14 rounded object-cover"
                  />
                </td>
                <td class="font-medium">{item.title}</td>
                <td>{item.year || '-'}</td>
                {#if type === 'series'}
                  <td>{item.number_of_seasons || '-'}</td>
                  <td>{item.number_of_episodes || '-'}</td>
                {/if}
                <td>
                  {#if item.has_downloads}
                    <span class="badge badge-success">
                      <Check size={12} class="mr-1" /> Yes
                    </span>
                  {:else}
                    <span class="badge badge-error">
                      <X size={12} class="mr-1" /> No
                    </span>
                  {/if}
                </td>
                <td>{(item.view_count || 0).toLocaleString()}</td>
                <td>
                  <a
                    href={type === 'movies' ? `/movie/${item.tmdb_id}` : `/s/${item.slug || item.tmdb_id}`}
                    target="_blank"
                    class="btn btn-ghost p-2"
                    title="View on site"
                  >
                    <ExternalLink size={16} />
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-[#2a2a2a]">
        <div class="text-sm text-[#666]">
          Page {page} of {totalPages}
        </div>
        <div class="flex gap-2">
          <button
            on:click={prevPage}
            disabled={page <= 1}
            class="btn btn-secondary"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <button
            on:click={nextPage}
            disabled={page >= totalPages}
            class="btn btn-secondary"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
