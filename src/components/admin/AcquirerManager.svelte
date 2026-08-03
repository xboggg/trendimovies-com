<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface QueueItem {
    id: number;
    title: string;
    content_type: string;
    status: string;
    note: string | null;
    added_at: string;
    done_at: string | null;
  }

  let items: QueueItem[] = [];
  let text = '';
  let loading = true;
  let busy = false;
  let msg = '';
  let msgType: 'ok' | 'err' | '' = '';
  let poll: any = null;

  const API = '/api/admin/acquirer';

  async function load() {
    try {
      const r = await fetch(API, { credentials: 'include' });
      const data = await r.json();
      if (data.ok) items = data.items || [];
    } catch { /* transient — keep last */ }
    loading = false;
  }

  function flash(m: string, t: 'ok' | 'err') {
    msg = m; msgType = t;
    setTimeout(() => { if (msg === m) { msg = ''; msgType = ''; } }, 5000);
  }

  async function post(action: string, extra: any = {}) {
    busy = true;
    try {
      const r = await fetch(API, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await r.json();
      busy = false;
      if (!r.ok || data.ok === false) { flash(data.error || 'Something went wrong', 'err'); return null; }
      return data;
    } catch {
      busy = false; flash('Acquirer unreachable — try again', 'err'); return null;
    }
  }

  async function addToQueue() {
    if (!text.trim()) { flash('Paste at least one title', 'err'); return; }
    const data = await post('add', { text });
    if (data) {
      flash(`Added ${data.added ?? 0}${data.skipped ? `, skipped ${data.skipped} duplicate(s)` : ''}`, 'ok');
      text = '';
      await load();
    }
  }

  async function runNow() {
    const data = await post('run-now');
    if (data) flash(data.msg || 'Run triggered — queued items will be picked up', 'ok');
    await load();
  }

  async function del(id: number) {
    const data = await post('delete', { id });
    if (data) await load();
  }

  async function clearDone() {
    if (!confirm('Clear all finished items from the queue?')) return;
    const data = await post('clear-done');
    if (data) { flash('Cleared finished items', 'ok'); await load(); }
  }

  async function clearAll() {
    if (!confirm('Clear the ENTIRE queue (including pending)? This cannot be undone.')) return;
    const data = await post('clear-all');
    if (data) { flash('Cleared the whole queue', 'ok'); await load(); }
  }

  function statusColor(s: string): string {
    if (s === 'done' || s === 'found' || s === 'acquired') return '#22c55e';
    if (s === 'pending') return '#f59e0b';
    if (s === 'running' || s === 'processing') return '#3b82f6';
    if (s === 'not_found' || s === 'failed' || s === 'error') return '#ef4444';
    return '#6b7280';
  }

  onMount(() => {
    load();
    poll = setInterval(load, 15000); // keep the queue fresh
  });
  onDestroy(() => { if (poll) clearInterval(poll); });
</script>

<div class="space-y-6">
  <p class="text-gray-400">
    Paste episodes/movies — the acquirer finds the files on Telegram and pushes them to
    <span class="text-white font-medium">1A</span>. Episodes need <code class="text-cyan-400">SxxExx</code>
    (e.g. <code class="text-cyan-400">The Chi S03E01</code>). Movies: <code class="text-cyan-400">Title Year</code>. Auto-detected.
  </p>

  {#if msg}
    <div class="rounded-lg px-4 py-3 text-sm"
         style="background: {msgType === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};
                border: 1px solid {msgType === 'ok' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'};
                color: {msgType === 'ok' ? '#4ade80' : '#f87171'};">
      {msg}
    </div>
  {/if}

  <!-- Add to queue -->
  <div class="rounded-xl p-4" style="background: #1a1a1a; border: 1px solid #2a2a2a;">
    <h3 class="font-semibold text-white mb-3">Add to queue</h3>
    <textarea
      bind:value={text}
      rows="6"
      placeholder={"One per line, e.g.\nThe Chi S03E01\nThe Chi S04E02\nSome Movie 2024"}
      class="w-full rounded-lg p-3 text-sm font-mono resize-y"
      style="background: #0f0f0f; color: #e5e5e5; border: 1px solid #333;"
    ></textarea>
    <div class="flex flex-wrap gap-2 mt-3">
      <button on:click={addToQueue} disabled={busy}
        class="px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
        style="background: linear-gradient(135deg,#22c55e,#16a34a);">
        Add to queue
      </button>
      <button on:click={runNow} disabled={busy}
        class="px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
        style="background: linear-gradient(135deg,#f97316,#ea580c);">
        ⚡ Run now
      </button>
      <button on:click={clearDone} disabled={busy}
        class="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
        style="background: #262626; color: #d4d4d4; border: 1px solid #3a3a3a;">
        Clear finished
      </button>
      <button on:click={clearAll} disabled={busy}
        class="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
        style="background: #262626; color: #d4d4d4; border: 1px solid #3a3a3a;">
        Clear ALL
      </button>
    </div>
  </div>

  <!-- Queue -->
  <div class="rounded-xl p-4" style="background: #1a1a1a; border: 1px solid #2a2a2a;">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-white">Queue {items.length ? `(${items.length})` : ''}</h3>
      <button on:click={load} class="text-xs text-gray-400 hover:text-white">↻ Refresh</button>
    </div>

    {#if loading}
      <p class="text-gray-500 text-sm py-6 text-center">Loading queue…</p>
    {:else if items.length === 0}
      <p class="text-gray-500 text-sm py-6 text-center">Queue is empty. Paste some titles above.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b" style="border-color:#2a2a2a;">
              <th class="py-2 pr-3 font-medium">#</th>
              <th class="py-2 pr-3 font-medium">Title</th>
              <th class="py-2 pr-3 font-medium">Type</th>
              <th class="py-2 pr-3 font-medium">Status</th>
              <th class="py-2 pr-3 font-medium">Note</th>
              <th class="py-2 pr-3 font-medium">Added</th>
              <th class="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {#each items as it (it.id)}
              <tr class="border-b" style="border-color:#1f1f1f;">
                <td class="py-2 pr-3 text-gray-500">{it.id}</td>
                <td class="py-2 pr-3 text-gray-200 break-all">{it.title}</td>
                <td class="py-2 pr-3 text-gray-400">{it.content_type || '—'}</td>
                <td class="py-2 pr-3">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                        style="background:{statusColor(it.status)}22; color:{statusColor(it.status)};">
                    {it.status}
                  </span>
                </td>
                <td class="py-2 pr-3 text-gray-400 break-all">{it.note || ''}</td>
                <td class="py-2 pr-3 text-gray-500 whitespace-nowrap">{it.added_at}</td>
                <td class="py-2">
                  <button on:click={() => del(it.id)} disabled={busy}
                    class="w-6 h-6 rounded flex items-center justify-center text-white disabled:opacity-50"
                    style="background:#7f1d1d;" title="Remove">✕</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
