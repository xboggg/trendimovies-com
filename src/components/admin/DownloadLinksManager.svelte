<script lang="ts">
  import { Search, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-svelte';

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
    is_active: boolean;
  }

  let searchQuery = '';
  let contentType: 'all' | 'movie' | 'episode' = 'all';
  let source: 'all' | 'telegram' | 'cinematika' | 'torrent' = 'all';
  let links: DownloadLink[] = [];
  let loading = false;
  let deleting: number | null = null;
  let error = '';
  let success = '';
  let total = 0;
  let page = 1;
  const limit = 50;

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
              <th>Clicks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each links as link}
              <tr>
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
                <td class="font-semibold">{(link.click_count || 0).toLocaleString()}</td>
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
