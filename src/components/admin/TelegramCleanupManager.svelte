<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, ChevronLeft, ChevronRight, Loader2, Trash2, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-svelte';

  interface CatalogFile {
    id: number;
    message_id: number;
    file_name: string;
    file_size: number;
    year: number | null;
    quality: string | null;
    source: string | null;
    language: string | null;
    added_date: string | null;
    is_deleted: number;
    telegram_deleted_at: string | null;
    dup_count?: number;
    assigned: boolean;
    assigned_label: string | null;
  }

  let files: CatalogFile[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  const limit = 50;
  let loading = false;

  let search = '';
  let year = '';
  let quality = '';
  let language = '';
  let source = '';
  let duplicatesOnly = false;
  let includeDeleted = false;

  let years: string[] = [];
  let qualities: string[] = [];
  let languages: string[] = [];
  let sources: string[] = [];

  let selected = new Set<number>();
  let acknowledgeAssigned = false;
  let busy = false;
  let message = '';
  let messageOk = true;

  $: selectedFiles = files.filter((f) => selected.has(f.id));
  $: selectedAssignedCount = selectedFiles.filter((f) => f.assigned).length;

  function formatSize(bytes: number): string {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(0)} MB`;
  }

  async function loadFilters() {
    const res = await fetch('/api/admin/telegram-cleanup/list?filtersOnly=true');
    const data = await res.json();
    qualities = data.qualities || [];
    languages = data.languages || [];
    sources = data.sources || [];
  }

  async function load() {
    loading = true;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search, year, quality, language, source,
      duplicates: String(duplicatesOnly),
      includeDeleted: String(includeDeleted),
    });
    try {
      const res = await fetch(`/api/admin/telegram-cleanup/list?${params}`);
      const data = await res.json();
      files = data.files || [];
      total = data.total || 0;
      totalPages = data.totalPages || 1;
    } catch (e) {
      files = [];
      total = 0;
    }
    loading = false;
  }

  function handleSearch() {
    page = 1;
    selected = new Set();
    load();
  }

  function toggleSelect(id: number) {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    selected = selected;
  }

  function toggleSelectAll() {
    if (selected.size === files.length) {
      selected = new Set();
    } else {
      selected = new Set(files.map((f) => f.id));
    }
  }

  function showMessage(text: string, ok: boolean) {
    message = text;
    messageOk = ok;
    setTimeout(() => { message = ''; }, 6000);
  }

  async function flagJunk(unmark = false) {
    if (!selected.size) return;
    busy = true;
    try {
      const res = await fetch('/api/admin/telegram-cleanup/mark-junk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), unmark }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(`${unmark ? 'Unflagged' : 'Flagged as junk'}: ${data.count} file(s)`, true);
        selected = new Set();
        acknowledgeAssigned = false;
        await load();
      } else {
        showMessage(data.error || 'Failed', false);
      }
    } catch (e) {
      showMessage('Failed to connect to server', false);
    }
    busy = false;
  }

  async function deleteFromTelegram() {
    if (!selected.size) return;
    if (selectedAssignedCount > 0 && !acknowledgeAssigned) return;
    const confirmed = confirm(
      `Permanently delete ${selected.size} file(s) from your Telegram channel?\n\nThis CANNOT be undone.` +
      (selectedAssignedCount > 0 ? `\n\n${selectedAssignedCount} of these are currently LIVE on the site.` : '')
    );
    if (!confirmed) return;

    busy = true;
    try {
      const res = await fetch('/api/admin/telegram-cleanup/delete-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(`Deleted from Telegram: ${data.deleted ?? '?'} succeeded, ${data.failed ?? 0} failed`, true);
        selected = new Set();
        acknowledgeAssigned = false;
        await load();
      } else {
        showMessage(data.error || 'Failed', false);
      }
    } catch (e) {
      showMessage('Failed to connect to server', false);
    }
    busy = false;
  }

  function prevPage() { if (page > 1) { page--; selected = new Set(); load(); } }
  function nextPage() { if (page < totalPages) { page++; selected = new Set(); load(); } }

  onMount(() => {
    loadFilters();
    load();
  });
</script>

<div class="space-y-4">
  <!-- Filters -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4 space-y-3">
    <div class="flex flex-wrap gap-3">
      <div class="flex-1 min-w-[200px] relative">
        <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input
          type="text"
          bind:value={search}
          on:keydown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search filename / title..."
          class="input pl-9 w-full"
        />
      </div>
      <input type="number" bind:value={year} placeholder="Year" class="input w-24" on:change={handleSearch} />
      <select bind:value={quality} on:change={handleSearch} class="select w-auto">
        <option value="">All qualities</option>
        {#each qualities as q}<option value={q}>{q}</option>{/each}
      </select>
      <select bind:value={language} on:change={handleSearch} class="select w-auto">
        <option value="">All languages</option>
        {#each languages as l}<option value={l}>{l}</option>{/each}
      </select>
      <select bind:value={source} on:change={handleSearch} class="select w-auto">
        <option value="">All sources</option>
        {#each sources as s}<option value={s}>{s}</option>{/each}
      </select>
      <button on:click={handleSearch} class="btn btn-primary">Search</button>
    </div>
    <div class="flex flex-wrap gap-4 text-sm">
      <label class="flex items-center gap-2 cursor-pointer text-[#ccc]">
        <input type="checkbox" bind:checked={duplicatesOnly} on:change={handleSearch} />
        Duplicates only (same title + year)
      </label>
      <label class="flex items-center gap-2 cursor-pointer text-[#ccc]">
        <input type="checkbox" bind:checked={includeDeleted} on:change={handleSearch} />
        Include already-flagged junk
      </label>
    </div>
  </div>

  {#if message}
    <div class="rounded-lg p-3 text-sm {messageOk ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}">
      {message}
    </div>
  {/if}

  <!-- Bulk action bar -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4 flex flex-wrap items-center gap-3">
    <span class="text-sm text-[#888]">{selected.size} selected of {total.toLocaleString()} matching</span>
    <div class="flex-1"></div>
    <button
      on:click={() => flagJunk(false)}
      disabled={!selected.size || busy}
      class="btn btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-40"
    >
      <XCircle size={15} /> Flag as Junk
    </button>
    <button
      on:click={() => flagJunk(true)}
      disabled={!selected.size || busy}
      class="btn btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-40"
    >
      <CheckCircle2 size={15} /> Unflag
    </button>
    {#if selectedAssignedCount > 0}
      <label class="flex items-center gap-1.5 text-xs text-amber-400">
        <input type="checkbox" bind:checked={acknowledgeAssigned} />
        {selectedAssignedCount} selected are LIVE on the site
      </label>
    {/if}
    <button
      on:click={deleteFromTelegram}
      disabled={!selected.size || busy || (selectedAssignedCount > 0 && !acknowledgeAssigned)}
      class="btn bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-1.5 disabled:opacity-40 px-3 py-1.5 rounded-lg"
    >
      {#if busy}<Loader2 size={15} class="animate-spin" />{:else}<Trash2 size={15} />{/if}
      Delete from Telegram
    </button>
  </div>

  <!-- Table -->
  <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden">
    {#if loading}
      <div class="p-8 text-center text-[#666]">
        <div class="animate-spin w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading...
      </div>
    {:else if files.length === 0}
      <div class="p-8 text-center text-[#666]">No files found</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="w-8">
                <input type="checkbox" checked={selected.size === files.length && files.length > 0} on:change={toggleSelectAll} />
              </th>
              <th>File name</th>
              <th class="w-16">Year</th>
              <th class="w-20">Quality</th>
              <th class="w-20">Language</th>
              <th class="w-24">Size</th>
              <th class="w-56">Assigned</th>
              <th class="w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each files as f}
              <tr class={f.assigned ? 'bg-green-500/5' : ''}>
                <td><input type="checkbox" checked={selected.has(f.id)} on:change={() => toggleSelect(f.id)} /></td>
                <td class="font-mono text-xs break-all max-w-md">
                  {f.file_name}
                  {#if f.dup_count && f.dup_count > 1}
                    <span class="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">DUP ×{f.dup_count}</span>
                  {/if}
                </td>
                <td>{f.year || '-'}</td>
                <td>{f.quality || '-'}</td>
                <td>{f.language || '-'}</td>
                <td>{formatSize(f.file_size)}</td>
                <td>
                  {#if f.assigned}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircle2 size={12} /> {f.assigned_label}
                    </span>
                  {:else}
                    <span class="text-[#444] text-xs">Not assigned</span>
                  {/if}
                </td>
                <td>
                  {#if f.telegram_deleted_at}
                    <span class="text-[10px] text-red-500">Deleted from TG</span>
                  {:else if f.is_deleted}
                    <span class="text-[10px] text-amber-400">Flagged junk</span>
                  {:else}
                    <span class="text-[10px] text-[#444]">Active</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between p-4 border-t border-[#2a2a2a]">
        <div class="text-sm text-[#666]">Page {page} of {totalPages} ({total.toLocaleString()} total)</div>
        <div class="flex gap-2">
          <button on:click={prevPage} disabled={page <= 1} class="btn btn-secondary"><ChevronLeft size={18} /> Previous</button>
          <button on:click={nextPage} disabled={page >= totalPages} class="btn btn-secondary">Next <ChevronRight size={18} /></button>
        </div>
      </div>
    {/if}
  </div>
</div>
