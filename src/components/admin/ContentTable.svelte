<script lang="ts">
  import { Search, ChevronLeft, ChevronRight, ExternalLink, Check, X, Film, Tv, Download, Image, Loader2 } from 'lucide-svelte';

  export let type: 'movies' | 'series' = 'movies';

  let items: any[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let loading = true;
  let search = '';
  let filter: 'all' | 'with_ddl' | 'without_ddl' = 'all';

  // Poster upload state
  let fileInputEl: HTMLInputElement;
  let uploadTargetId: number | null = null;
  let uploadingId: number | null = null;
  let uploadMessage: { id: number; text: string; ok: boolean } | null = null;

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
    if (page > 1) { page--; fetchData(); }
  }

  function nextPage() {
    if (page < totalPages) { page++; fetchData(); }
  }

  function getPosterUrl(path: string | null): string {
    if (!path) return '/images/no-poster.svg';
    if (path.startsWith('/images/')) return path;
    return `https://image.tmdb.org/t/p/w92${path}`;
  }

  function getViewLink(item: any): string {
    if (type === 'movies') return `/movie/${item.tmdb_id}`;
    return `/tv/${item.tmdb_id}`;
  }

  function getAssignLink(item: any): string {
    if (type === 'movies') return `/admin/downloads?search=${encodeURIComponent(item.title)}`;
    return `/tv/${item.tmdb_id}`;
  }

  function triggerPosterUpload(item: any) {
    uploadTargetId = item.id;
    uploadMessage = null;
    fileInputEl?.click();
  }

  // Reads a File as base64 and sends it as JSON rather than
  // multipart/form-data -- this server's reverse-proxy setup doesn't give
  // Astro's same-origin check the real request origin, which blocks
  // multipart POSTs specifically. JSON POSTs aren't affected, so this
  // sidesteps it without touching shared server config.
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handlePosterFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    const movieId = uploadTargetId;
    input.value = ''; // reset so picking the same file twice still fires change
    if (!file || movieId === null) return;

    uploadingId = movieId;
    uploadMessage = null;

    try {
      const dataBase64 = await fileToBase64(file);
      const res = await fetch('/api/admin/movie-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, fileName: file.name, contentType: file.type, dataBase64 }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        items = items.map((it) => it.id === movieId ? { ...it, poster_path: data.poster_path } : it);
        uploadMessage = { id: movieId, text: 'Poster updated', ok: true };
      } else {
        uploadMessage = { id: movieId, text: data.error || 'Upload failed', ok: false };
      }
    } catch (err) {
      uploadMessage = { id: movieId, text: 'Upload failed', ok: false };
    }

    uploadingId = null;
    uploadTargetId = null;
    setTimeout(() => { uploadMessage = null; }, 4000);
  }
</script>

<!-- Shared hidden file input for poster uploads -->
<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  bind:this={fileInputEl}
  on:change={handlePosterFileChange}
  style="display: none;"
/>

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

    <select bind:value={filter} on:change={handleFilterChange} class="select w-auto">
      <option value="all">All {type === 'movies' ? 'Movies' : 'Series'}</option>
      <option value="with_ddl">With DDL</option>
      <option value="without_ddl">Without DDL</option>
    </select>

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
              <th class="w-12">Poster</th>
              <th>Title</th>
              <th class="w-16">Year</th>
              {#if type === 'series'}
                <th class="w-20">Seasons</th>
                <th class="w-28">Episodes</th>
                <th class="w-28">Assigned</th>
                <th class="w-28">Remaining</th>
              {/if}
              {#if type === 'movies'}
                <th class="w-28">Quality</th>
              {/if}
              <th class="w-16">DDL</th>
              <th class="w-20">Views</th>
              <th class="w-24">Actions</th>
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
                  <td>
                    <span class="text-blue-400 font-medium">{item.number_of_seasons || '-'}</span>
                  </td>
                  <td>
                    <span class="text-white font-medium">{item.total_episodes_actual || item.number_of_episodes || '-'}</span>
                  </td>
                  <td>
                    {#if item.episodes_with_dl > 0}
                      <span class="text-green-400 font-medium">{item.episodes_with_dl}</span>
                    {:else}
                      <span class="text-[#666]">0</span>
                    {/if}
                  </td>
                  <td>
                    {#if item.episodes_without_dl > 0}
                      <span class="text-red-400 font-medium">{item.episodes_without_dl}</span>
                    {:else}
                      <span class="text-green-400">0</span>
                    {/if}
                  </td>
                {/if}

                {#if type === 'movies'}
                  <td>
                    <div class="flex flex-wrap gap-1">
                      {#if item.qualities && item.qualities.length > 0}
                        {#each item.qualities.sort() as q}
                          <span class="px-1.5 py-0.5 text-[10px] font-bold rounded {
                            q === '2160p' ? 'bg-purple-500/20 text-purple-400' :
                            q === '1080p' ? 'bg-blue-500/20 text-blue-400' :
                            q === '720p' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }">{q}</span>
                        {/each}
                      {:else}
                        <span class="text-[#444] text-xs">-</span>
                      {/if}
                    </div>
                  </td>
                {/if}

                <td>
                  {#if type === 'series' ? item.episodes_with_dl > 0 : item.has_downloads}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      <Check size={12} class="mr-1" /> Yes
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                      <X size={12} class="mr-1" /> No
                    </span>
                  {/if}
                </td>

                <td>
                  <span class="{(item.real_views || item.view_count || 0) > 0 ? 'text-white font-medium' : 'text-[#444]'}">
                    {(item.real_views || item.view_count || 0).toLocaleString()}
                  </span>
                </td>

                <td>
                  <div class="flex flex-col gap-1">
                    <div class="flex gap-1">
                      <a
                        href={getViewLink(item)}
                        target="_blank"
                        class="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                        title="View on site"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <a
                        href={getAssignLink(item)}
                        class="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-blue-400 transition-colors"
                        title="Assign downloads"
                      >
                        <Download size={15} />
                      </a>
                      {#if type === 'movies'}
                        <button
                          on:click={() => triggerPosterUpload(item)}
                          disabled={uploadingId === item.id}
                          class="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-amber-400 transition-colors disabled:opacity-50"
                          title="Upload/replace poster"
                        >
                          {#if uploadingId === item.id}
                            <Loader2 size={15} class="animate-spin" />
                          {:else}
                            <Image size={15} />
                          {/if}
                        </button>
                      {/if}
                    </div>
                    {#if uploadMessage && uploadMessage.id === item.id}
                      <span class="text-[10px] {uploadMessage.ok ? 'text-green-400' : 'text-red-400'}">
                        {uploadMessage.text}
                      </span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-[#2a2a2a]">
        <div class="text-sm text-[#666]">
          Page {page} of {totalPages} ({total.toLocaleString()} total)
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
