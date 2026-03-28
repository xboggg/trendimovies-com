<script lang="ts">
  import { onMount } from 'svelte';
  import { Loader2, Check, X, Trash2, Film, Tv } from 'lucide-svelte';

  interface ContentRequest {
    id: number;
    title: string;
    content_type: string;
    year: number | null;
    imdb_url: string | null;
    notes: string | null;
    status: string;
    ip_address: string;
    created_at: string;
  }

  let requests: ContentRequest[] = [];
  let loading = false;
  let statusFilter = 'pending';
  let total = 0;
  let page = 1;
  const limit = 50;
  let updating: number | null = null;
  let error = '';
  let success = '';

  async function loadRequests() {
    loading = true;
    error = '';

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/requests?${params}`);
      const data = await res.json();

      if (res.ok) {
        requests = data.requests || [];
        total = data.total || 0;
      } else {
        error = data.error || 'Failed to load requests';
      }
    } catch (err) {
      error = 'Failed to connect to server';
    } finally {
      loading = false;
    }
  }

  async function updateStatus(id: number, status: string) {
    updating = id;
    error = '';

    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        requests = requests.map(r => r.id === id ? { ...r, status } : r);
        success = `Request marked as ${status}`;
        setTimeout(() => success = '', 3000);
      } else {
        const data = await res.json();
        error = data.error || 'Failed to update';
      }
    } catch (err) {
      error = 'Failed to connect to server';
    } finally {
      updating = null;
    }
  }

  async function deleteRequest(id: number) {
    if (!confirm('Delete this request?')) return;

    updating = id;
    error = '';

    try {
      const res = await fetch('/api/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        requests = requests.filter(r => r.id !== id);
        total--;
        success = 'Request deleted';
        setTimeout(() => success = '', 3000);
      } else {
        const data = await res.json();
        error = data.error || 'Failed to delete';
      }
    } catch (err) {
      error = 'Failed to connect to server';
    } finally {
      updating = null;
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'rejected': return 'badge-error';
      default: return '';
    }
  }

  onMount(() => loadRequests());
</script>

<div class="space-y-6">
  <!-- Filters -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4">
    <div class="flex flex-wrap gap-4 items-center">
      <div>
        <label class="block text-sm text-[#888] mb-1">Status</label>
        <select
          bind:value={statusFilter}
          on:change={() => { page = 1; loadRequests(); }}
          class="bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <button
        on:click={loadRequests}
        disabled={loading}
        class="px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444] disabled:opacity-50 mt-auto"
      >
        {#if loading}
          <Loader2 class="w-4 h-4 animate-spin" />
        {:else}
          Refresh
        {/if}
      </button>

      <div class="ml-auto text-sm text-[#888]">
        {total} total requests
      </div>
    </div>
  </div>

  <!-- Messages -->
  {#if error}
    <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-400">
      {success}
    </div>
  {/if}

  <!-- Requests List -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">
    {#if loading}
      <div class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-[#e50914]" />
      </div>
    {:else if requests.length === 0}
      <p class="text-center py-12 text-[#666]">No requests found</p>
    {:else}
      <div class="space-y-4">
        {#each requests as request}
          <div class="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  {#if request.content_type === 'series'}
                    <Tv class="w-5 h-5 text-green-500" />
                  {:else}
                    <Film class="w-5 h-5 text-red-500" />
                  {/if}
                  <h3 class="font-semibold text-lg">{request.title}</h3>
                  {#if request.year}
                    <span class="text-[#888]">({request.year})</span>
                  {/if}
                  <span class={`badge ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                {#if request.imdb_url}
                  <a
                    href={request.imdb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-blue-400 hover:underline"
                  >
                    {request.imdb_url}
                  </a>
                {/if}

                {#if request.notes}
                  <p class="text-sm text-[#888] mt-2">{request.notes}</p>
                {/if}

                <div class="text-xs text-[#666] mt-2">
                  {formatDate(request.created_at)} &bull; IP: {request.ip_address}
                </div>
              </div>

              <div class="flex items-center gap-2">
                {#if request.status === 'pending'}
                  <button
                    on:click={() => updateStatus(request.id, 'approved')}
                    disabled={updating === request.id}
                    class="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Approve"
                  >
                    <Check class="w-5 h-5" />
                  </button>
                  <button
                    on:click={() => updateStatus(request.id, 'rejected')}
                    disabled={updating === request.id}
                    class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Reject"
                  >
                    <X class="w-5 h-5" />
                  </button>
                {/if}

                {#if request.status === 'approved'}
                  <button
                    on:click={() => updateStatus(request.id, 'completed')}
                    disabled={updating === request.id}
                    class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                {/if}

                <button
                  on:click={() => deleteRequest(request.id)}
                  disabled={updating === request.id}
                  class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {#if updating === request.id}
                    <Loader2 class="w-5 h-5 animate-spin" />
                  {:else}
                    <Trash2 class="w-5 h-5" />
                  {/if}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if total > limit}
        <div class="flex justify-center gap-2 mt-6">
          <button
            on:click={() => { page = Math.max(1, page - 1); loadRequests(); }}
            disabled={page === 1}
            class="px-4 py-2 bg-[#333] rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-4 py-2">Page {page} of {Math.ceil(total / limit)}</span>
          <button
            on:click={() => { page++; loadRequests(); }}
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
