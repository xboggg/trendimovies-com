<script lang="ts">
  import { Search, Trash2, ExternalLink, Loader2, AlertCircle, Pencil, X } from 'lucide-svelte';

  interface DownloadLink {
    id: number;
    content_type: string;
    content_id: number;
    content_title?: string;
    source: string;
    quality: string;
    file_size: string | null;
    url: string;
    click_count: number;
    views?: number | null;
    created_at?: string | null;
    is_active: boolean;
  }

  interface SearchResult {
    id: number;
    title: string;
    year: string | null;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
  }

  interface Episode {
    id: number;
    episode_number: number;
    season_number: number;
    name: string;
  }

  interface TelegramFile {
    id: number;
    telegram_file_id: string;
    file_name: string;
    file_size: string;
    quality: string;
    year: number | null;
  }

  let searchQuery = '';
  let contentType: 'all' | 'movie' | 'episode' = 'all';
  let source: 'all' | 'telegram' | 'cinematika' | 'torrent' = 'all';
  let statusFilter: 'all' | 'active' | 'inactive' = 'all';
  let yearFilter = '';
  let links: DownloadLink[] = [];
  let loading = false;
  let deleting: number | null = null;
  let error = '';
  let success = '';
  let total = 0;
  let page = 1;
  const limit = 50;

  // Generate year options (current year down to 1950)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  // --- Edit-in-place modal state ---
  let editingLink: DownloadLink | null = null;
  let editQuality = '';
  let editSaving = false;
  let editError = '';
  let editSearchQuery = '';
  let editSearching = false;
  let editTmdbResults: SearchResult[] = [];
  let editSelectedContent: SearchResult | null = null;
  let editSelectedSeason: number | null = null;
  let editEpisodes: Episode[] = [];
  let editSelectedEpisode: Episode | null = null;
  let editLoadingEpisodes = false;
  let editFileSearchQuery = '';
  let editFileSearching = false;
  let editTelegramFiles: TelegramFile[] = [];
  let editSelectedFile: TelegramFile | null = null;

  async function searchLinks() {
    loading = true;
    error = '';

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchQuery) params.append('search', searchQuery);
      if (contentType !== 'all') params.append('content_type', contentType);
      if (source !== 'all') params.append('source', source);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (yearFilter) params.append('year', yearFilter);

      const res = await fetch(`/api/admin/downloads?${params}`);
      const data = await res.json();

      if (res.ok) {
        links = data.links || [];
        total = data.total || 0;
      } else {
        error = data.error || 'Failed to fetch links';
      }
    } catch (err) {
      error = 'Failed to connect to server';
    } finally {
      loading = false;
    }
  }

  async function deleteLink(id: number) {
    if (!confirm('Are you sure you want to delete this download link?')) return;

    deleting = id;
    error = '';
    success = '';

    try {
      const res = await fetch('/api/admin/assign/link', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();

      if (res.ok) {
        links = links.filter(l => l.id !== id);
        total--;
        success = 'Link deleted successfully';
        setTimeout(() => success = '', 3000);
      } else {
        error = data.error || 'Failed to delete link';
      }
    } catch (err) {
      error = 'Failed to connect to server';
    } finally {
      deleting = null;
    }
  }

  function openEdit(link: DownloadLink) {
    editingLink = link;
    editQuality = link.quality;
    editError = '';
    editSearchQuery = '';
    editTmdbResults = [];
    editSelectedContent = null;
    editSelectedSeason = null;
    editEpisodes = [];
    editSelectedEpisode = null;
    editFileSearchQuery = '';
    editTelegramFiles = [];
    editSelectedFile = null;
  }

  function closeEdit() {
    editingLink = null;
  }

  async function editSearchTelegram() {
    if (!editFileSearchQuery.trim()) return;
    editFileSearching = true;
    editError = '';

    try {
      const params = new URLSearchParams({ query: editFileSearchQuery });
      if (editQuality) params.append('quality', editQuality);
      const res = await fetch(`/api/admin/assign/search-telegram?${params}`, {
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json();

      if (res.ok) {
        editTelegramFiles = data.files || [];
        if (editTelegramFiles.length === 0) {
          editError = 'No Telegram files found matching your query';
        }
      } else {
        editError = data.error || 'Failed to search Telegram files';
      }
    } catch (err: any) {
      editError = err?.name === 'TimeoutError' ? 'Search timed out — try a more specific query' : 'Failed to connect to server';
    } finally {
      editFileSearching = false;
    }
  }

  function editSelectFile(file: TelegramFile) {
    editSelectedFile = file;
    editTelegramFiles = [];
    // Match the file's own quality by default — still overridable in the dropdown above.
    if (file.quality) editQuality = file.quality;
  }

  function clearEditSelection() {
    editSelectedContent = null;
    editSelectedSeason = null;
    editSelectedEpisode = null;
    editEpisodes = [];
  }

  async function editSearchTmdb() {
    if (!editSearchQuery.trim()) return;
    editSearching = true;
    editError = '';

    try {
      const movieRes = await fetch(`/api/admin/assign/search-tmdb?query=${encodeURIComponent(editSearchQuery)}&type=movie`);
      const movieData = await movieRes.json();
      const tvRes = await fetch(`/api/admin/assign/search-tmdb?query=${encodeURIComponent(editSearchQuery)}&type=tv`);
      const tvData = await tvRes.json();

      const movies = (movieData.results || []).map((r: any) => ({ ...r, media_type: 'movie' }));
      const tvShows = (tvData.results || []).map((r: any) => ({ ...r, media_type: 'tv' }));

      editTmdbResults = [...movies, ...tvShows]
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, 15);

      if (editTmdbResults.length === 0) {
        editError = 'No TMDB results found';
      }
    } catch (err) {
      editError = 'Failed to search TMDB';
    } finally {
      editSearching = false;
    }
  }

  function editSelectContent(result: SearchResult) {
    editSelectedContent = result;
    editSelectedSeason = null;
    editSelectedEpisode = null;
    editEpisodes = [];
  }

  async function editSelectSeason(season: number) {
    if (!editSelectedContent) return;
    editSelectedSeason = season;
    editSelectedEpisode = null;
    editLoadingEpisodes = true;

    try {
      const res = await fetch(`/api/admin/assign/episodes?tmdb_id=${editSelectedContent.id}&season=${season}`);
      const data = await res.json();
      editEpisodes = (data.episodes || []).map((ep: any) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        season_number: ep.season_number,
        name: ep.name
      }));
    } catch (err) {
      editError = 'Failed to load episodes';
    } finally {
      editLoadingEpisodes = false;
    }
  }

  async function saveEdit() {
    if (!editingLink) return;

    if (editSelectedContent?.media_type === 'tv' && !editSelectedEpisode) {
      editError = 'Select a specific episode to reassign to';
      return;
    }

    editSaving = true;
    editError = '';

    try {
      const payload: Record<string, any> = {
        id: editingLink.id,
        quality: editQuality,
      };

      if (editSelectedFile) {
        payload.telegram_file_id = editSelectedFile.telegram_file_id;
        payload.file_size = editSelectedFile.file_size;
      }

      if (editSelectedContent) {
        if (editSelectedContent.media_type === 'movie') {
          payload.content_type = 'movie';
          payload.content_id = editSelectedContent.id;
        } else if (editSelectedEpisode) {
          payload.content_type = 'episode';
          payload.content_id = editSelectedEpisode.id;
          payload.show_id = editSelectedContent.id;
          payload.season_number = editSelectedEpisode.season_number;
          payload.episode_number = editSelectedEpisode.episode_number;
        }
      }

      const res = await fetch('/api/admin/assign/link', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        const updatedId = editingLink.id;
        const newTitle = editSelectedContent
          ? (editSelectedEpisode
              ? `${editSelectedContent.title} S${editSelectedEpisode.season_number}E${editSelectedEpisode.episode_number}`
              : editSelectedContent.title)
          : undefined;

        links = links.map(l => l.id === updatedId ? {
          ...l,
          quality: data.link?.quality ?? editQuality,
          content_type: data.link?.content_type ?? l.content_type,
          content_id: data.link?.content_id ?? l.content_id,
          content_title: newTitle ?? l.content_title,
          url: data.link?.url ?? l.url,
          file_size: data.link?.file_size ?? l.file_size,
        } : l);

        success = 'Link updated — click count preserved';
        setTimeout(() => success = '', 3000);
        editingLink = null;
      } else {
        editError = data.error || 'Failed to update link';
      }
    } catch (err) {
      editError = 'Failed to connect to server';
    } finally {
      editSaving = false;
    }
  }

  // Load links on mount
  import { onMount } from 'svelte';
  onMount(() => {
    searchLinks();
  });
</script>

<div class="space-y-6">
  <!-- Search and Filters -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm text-[#888] mb-1">Search by Movie Title or ID</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Enter movie title (e.g. Mercy, Moana)..."
            class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-[#666] focus:border-[#e50914] focus:outline-none"
            on:keydown={(e) => e.key === 'Enter' && searchLinks()}
          />
        </div>
      </div>

      <div>
        <label class="block text-sm text-[#888] mb-1">Year</label>
        <select
          bind:value={yearFilter}
          class="bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none"
        >
          <option value="">All Years</option>
          {#each years as year}
            <option value={year.toString()}>{year}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-sm text-[#888] mb-1">Content Type</label>
        <select
          bind:value={contentType}
          class="bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="episode">Episodes</option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-[#888] mb-1">Source</label>
        <select
          bind:value={source}
          class="bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none"
        >
          <option value="all">All Sources</option>
          <option value="telegram">Telegram</option>
          <option value="cinematika">Cinematika</option>
          <option value="torrent">Torrent</option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-[#888] mb-1">Status</label>
        <select
          bind:value={statusFilter}
          class="bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive (dead) only</option>
        </select>
      </div>

      <button
        on:click={searchLinks}
        disabled={loading}
        class="px-6 py-2 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2"
      >
        {#if loading}
          <Loader2 class="w-4 h-4 animate-spin" />
        {:else}
          <Search class="w-4 h-4" />
        {/if}
        Search
      </button>
    </div>
  </div>

  <!-- Messages -->
  {#if error}
    <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
      <AlertCircle class="w-5 h-5" />
      {error}
    </div>
  {/if}

  {#if success}
    <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400">
      {success}
    </div>
  {/if}

  <!-- Results -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Download Links</h3>
      <span class="text-sm text-[#888]">{total.toLocaleString()} total</span>
    </div>

    {#if loading}
      <div class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-[#e50914]" />
      </div>
    {:else if links.length === 0}
      <p class="text-center py-12 text-[#666]">No download links found</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Title</th>
              <th>Source</th>
              <th>Quality</th>
              <th>Size</th>
              <th>Views</th>
              <th>Added</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each links as link}
              <tr class={link.is_active ? '' : 'dead-row'}>
                <td class="font-mono text-sm">{link.id}</td>
                <td>
                  <span class={`badge ${link.content_type === 'movie' ? 'badge-error' : 'badge-success'}`}>
                    {link.content_type}
                  </span>
                </td>
                <td class="max-w-[200px] truncate" title={link.content_title || `ID: ${link.content_id}`}>
                  {link.content_title || link.content_id}
                </td>
                <td class="capitalize">{link.source}</td>
                <td>
                  <span class={`badge ${
                    link.quality === '720p' ? 'badge-success' :
                    link.quality === '1080p' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {link.quality}
                  </span>
                </td>
                <td>{link.file_size || '-'}</td>
                <td class="font-semibold">{link.views == null ? '—' : link.views.toLocaleString()}</td>
                <td class="whitespace-nowrap text-sm" style="color: var(--text-secondary, #9ca3af);">{link.created_at ? new Date(link.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                <td>
                  <span class={`badge ${link.is_active ? 'badge-success' : 'badge-error'}`}>
                    {link.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-1.5 hover:bg-[#333] rounded-lg transition-colors"
                      title="Open URL"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </a>
                    <button
                      on:click={() => openEdit(link)}
                      class="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                      title="Edit (keeps click count)"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      on:click={() => deleteLink(link.id)}
                      disabled={deleting === link.id}
                      class="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {#if deleting === link.id}
                        <Loader2 class="w-4 h-4 animate-spin" />
                      {:else}
                        <Trash2 class="w-4 h-4" />
                      {/if}
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if total > limit}
        <div class="flex justify-center gap-2 mt-4">
          <button
            on:click={() => { page = Math.max(1, page - 1); searchLinks(); }}
            disabled={page === 1}
            class="px-4 py-2 bg-[#333] rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-4 py-2">Page {page} of {Math.ceil(total / limit)}</span>
          <button
            on:click={() => { page++; searchLinks(); }}
            disabled={page >= Math.ceil(total / limit)}
            class="px-4 py-2 bg-[#333] rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Edit-in-place modal -->
{#if editingLink}
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    on:click|self={closeEdit}
  >
    <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Edit Download Link #{editingLink.id}</h3>
        <button on:click={closeEdit} class="p-1 hover:bg-[#333] rounded-lg" title="Close">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="mb-4 p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
        <p class="text-sm text-[#888]">Currently assigned to</p>
        <p class="font-medium">{editingLink.content_title || `${editingLink.content_type} #${editingLink.content_id}`}</p>
        <p class="text-sm text-[#888] mt-2">Clicks so far (kept as-is when you save)</p>
        <p class="font-semibold text-lg">{editingLink.click_count.toLocaleString()}</p>
      </div>

      {#if editError}
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">{editError}</div>
      {/if}

      <div class="mb-4">
        <label class="block text-sm text-[#888] mb-1">Quality</label>
        <select
          bind:value={editQuality}
          class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          {#if editingLink.content_type !== 'episode'}
            <option value="2160p">2160p</option>
          {/if}
          <option value="hdrip">HDRip</option>
          <option value="540p">540p</option>
        </select>
      </div>

      {#if editingLink.source === 'telegram'}
        <div class="mb-4">
          <label class="block text-sm text-[#888] mb-1">Change source file (optional)</label>
          <input
            type="text"
            bind:value={editFileSearchQuery}
            placeholder="Search Telegram files by name..."
            class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#666] focus:border-[#e50914] focus:outline-none"
            on:keydown={(e) => e.key === 'Enter' && editSearchTelegram()}
          />
          <button
            on:click={editSearchTelegram}
            disabled={editFileSearching}
            class="mt-2 px-4 py-1.5 bg-[#333] rounded-lg text-sm hover:bg-[#444] disabled:opacity-50 flex items-center gap-2"
          >
            {#if editFileSearching}<Loader2 class="w-4 h-4 animate-spin" />{/if}
            Search Telegram
          </button>

          {#if editTelegramFiles.length > 0}
            <div class="mt-2 max-h-48 overflow-y-auto space-y-1">
              {#each editTelegramFiles as file}
                <button
                  on:click={() => editSelectFile(file)}
                  class="w-full text-left px-3 py-2 bg-[#0a0a0a] hover:bg-[#222] rounded-lg text-sm"
                >
                  <div class="truncate">{file.file_name}</div>
                  <div class="text-xs text-[#666]">{file.quality || 'unknown quality'} · {file.file_size}</div>
                </button>
              {/each}
            </div>
          {/if}

          {#if editSelectedFile}
            <div class="mt-2 p-3 bg-[#0a0a0a] rounded-lg border border-[#333] flex justify-between items-center">
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{editSelectedFile.file_name}</p>
                <p class="text-xs text-[#666]">{editSelectedFile.quality || 'unknown quality'} · {editSelectedFile.file_size}</p>
              </div>
              <button on:click={() => editSelectedFile = null} class="text-xs text-red-400 hover:underline shrink-0 ml-2">
                Clear
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <div class="mb-4">
        <label class="block text-sm text-[#888] mb-1">Reassign to a different movie/show (optional)</label>
        <input
          type="text"
          bind:value={editSearchQuery}
          placeholder="Search title to reassign..."
          class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder:text-[#666] focus:border-[#e50914] focus:outline-none"
          on:keydown={(e) => e.key === 'Enter' && editSearchTmdb()}
        />
        <button
          on:click={editSearchTmdb}
          disabled={editSearching}
          class="mt-2 px-4 py-1.5 bg-[#333] rounded-lg text-sm hover:bg-[#444] disabled:opacity-50 flex items-center gap-2"
        >
          {#if editSearching}<Loader2 class="w-4 h-4 animate-spin" />{/if}
          Search
        </button>

        {#if editTmdbResults.length > 0 && !editSelectedContent}
          <div class="mt-2 max-h-48 overflow-y-auto space-y-1">
            {#each editTmdbResults as result}
              <button
                on:click={() => editSelectContent(result)}
                class="w-full text-left px-3 py-2 bg-[#0a0a0a] hover:bg-[#222] rounded-lg text-sm flex justify-between"
              >
                <span>{result.title} <span class="text-[#666]">({result.year || 'N/A'})</span></span>
                <span class="text-[#666] uppercase text-xs">{result.media_type}</span>
              </button>
            {/each}
          </div>
        {/if}

        {#if editSelectedContent}
          <div class="mt-2 p-3 bg-[#0a0a0a] rounded-lg border border-[#333] flex justify-between items-center">
            <div>
              <p class="font-medium text-sm">{editSelectedContent.title} ({editSelectedContent.year || 'N/A'})</p>
              <p class="text-xs text-[#666] uppercase">{editSelectedContent.media_type}</p>
            </div>
            <button on:click={clearEditSelection} class="text-xs text-red-400 hover:underline">
              Clear
            </button>
          </div>

          {#if editSelectedContent.media_type === 'tv'}
            <div class="mt-2">
              <label class="block text-sm text-[#888] mb-1">Season</label>
              <div class="flex gap-2 flex-wrap">
                {#each Array.from({ length: 20 }, (_, i) => i + 1) as s}
                  <button
                    on:click={() => editSelectSeason(s)}
                    class={`px-3 py-1 rounded-lg text-sm ${editSelectedSeason === s ? 'bg-[#e50914]' : 'bg-[#333] hover:bg-[#444]'}`}
                  >
                    {s}
                  </button>
                {/each}
              </div>
            </div>

            {#if editLoadingEpisodes}
              <p class="text-sm text-[#666] mt-2">Loading episodes...</p>
            {:else if editEpisodes.length > 0}
              <div class="mt-2 max-h-40 overflow-y-auto space-y-1">
                {#each editEpisodes as ep}
                  <button
                    on:click={() => editSelectedEpisode = ep}
                    class={`w-full text-left px-3 py-2 rounded-lg text-sm ${editSelectedEpisode?.id === ep.id ? 'bg-[#e50914]' : 'bg-[#0a0a0a] hover:bg-[#222]'}`}
                  >
                    S{ep.season_number}E{ep.episode_number} — {ep.name}
                  </button>
                {/each}
              </div>
            {/if}
          {/if}
        {/if}
      </div>

      <div class="flex gap-3 justify-end">
        <button on:click={closeEdit} class="px-4 py-2 bg-[#333] rounded-lg hover:bg-[#444]">Cancel</button>
        <button
          on:click={saveEdit}
          disabled={editSaving}
          class="px-4 py-2 bg-[#e50914] rounded-lg hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2"
        >
          {#if editSaving}<Loader2 class="w-4 h-4 animate-spin" />{/if}
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dead-row td { background: rgba(239,68,68,0.06); }
  .dead-row:hover td { background: rgba(239,68,68,0.12); }
</style>
